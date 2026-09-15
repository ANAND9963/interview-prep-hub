"""Compile and run fixtures for every Java implementation. Requires Java 17+ JDK."""
import json, os, shutil, subprocess, tempfile
from pathlib import Path
root=Path(__file__).resolve().parents[1]
pack=json.loads(root.joinpath('data/solutions.json').read_text())
java=shutil.which('java') or '/usr/lib/jvm/java-17-openjdk-amd64/bin/java'
javac=shutil.which('javac')
compiler=[javac] if javac else [java,'com.sun.tools.javac.Main']
fixtures='''
class ListNode {int val;ListNode next;ListNode(int v){val=v;}}
class TreeNode {int val;TreeNode left,right;TreeNode(int v){val=v;}}
'''
count=0
for slug,s in pack.items():
    for approach in s['approaches']:
        with tempfile.TemporaryDirectory() as temp:
            code=approach['code']+fixtures+'\nclass Harness {static void check(boolean value){if(!value)throw new AssertionError();} public static void main(String[] args){'+s['test']+'}}\n'
            Path(temp,'Harness.java').write_text(code)
            try:
                subprocess.run(compiler+['Harness.java'],cwd=temp,check=True,capture_output=True,text=True,timeout=30)
                subprocess.run([java,'-cp',temp,'Harness'],cwd=temp,check=True,capture_output=True,text=True,timeout=10)
            except subprocess.CalledProcessError as e:
                raise RuntimeError(slug+' / '+approach['name']+'\n'+e.stderr) from e
            count+=1
print(f'Passed {count} Java implementations across {len(pack)} problems.')
