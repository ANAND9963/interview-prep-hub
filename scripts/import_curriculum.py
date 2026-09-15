"""Extract visible S30 curriculum sheets without third-party dependencies.
Usage: python scripts/import_curriculum.py path/to/workbook.xlsx
Original workbook stays local; only titles, topic metadata, and LeetCode URLs are exported.
"""
import json, re, sys, zipfile
from pathlib import Path
from urllib.parse import urlparse
import xml.etree.ElementTree as ET

NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

def extract(path):
    with zipfile.ZipFile(path) as z:
        strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            strings = [''.join(x.itertext()) for x in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si', NS)]
        rels = {r.get('Id'): r.get('Target').lstrip('/') for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
        result = []
        seen = set()
        for sheet in ET.fromstring(z.read('xl/workbook.xml')).findall('s:sheets/s:sheet', NS):
            if sheet.get('state', 'visible') != 'visible':
                continue
            name = sheet.get('name')
            target = rels[sheet.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')]
            target = target if target.startswith('xl/') else 'xl/' + target
            track = {'AIML': 'ai', 'DSA and OOP Design': 'dsa', 'System Design': 'system'}[name]
            for row in ET.fromstring(z.read(target)).findall('.//s:row', NS)[1:]:
                cells = {}
                for c in row.findall('s:c', NS):
                    v = c.find('s:v', NS)
                    value = v.text if v is not None else ''.join(c.find('s:is', NS).itertext()) if c.find('s:is', NS) is not None else ''
                    if c.get('t') == 's' and value:
                        value = strings[int(value)]
                    cells[re.sub(r'\d', '', c.get('r'))] = (value or '').strip()
                title = cells.get({'ai':'C', 'dsa':'B', 'system':'A'}[track], '')
                if not title:
                    continue
                ident = track + '-' + slug(title)
                if ident in seen:
                    continue
                seen.add(ident)
                link = cells.get('D', '') if track == 'dsa' else ''
                parsed = urlparse(link)
                link = link if parsed.scheme == 'https' and parsed.hostname in ('leetcode.com', 'www.leetcode.com') and parsed.path.startswith('/problems/') else ''
                result.append({'id': ident, 'title': title, 'track': track,
                    'topic': cells.get('A', '').strip() if track == 'dsa' else 'Week ' + cells.get('A', '').replace('.0', '') if track == 'ai' else 'Architecture',
                    'description': cells.get('D', '') if track == 'ai' else '',
                    'leetcode': link, 'source': name, 'sourceRow': int(row.get('r')),
                    'level': 'Unrated', 'contentStatus': 'curriculum'})
    return result

if __name__ == '__main__':
    items = extract(sys.argv[1])
    output = Path(__file__).resolve().parents[1] / 'data' / 'curriculum.json'
    output.write_text(json.dumps(items, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps({'total': len(items), 'tracks': {t: sum(i['track'] == t for i in items) for t in ('ai','dsa','system')}}))
