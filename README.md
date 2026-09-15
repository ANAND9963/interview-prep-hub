# Interview Prep Hub

A personal, installable practice workspace for DSA, Java and Spring, AI/ML, React, Angular, system design, and interview rehearsal.

## Publish for free

The app is ready to serve as static files. No dependency installation, API key, database, paid AI service, or build server is required.

1. Open [this repository's Pages settings](https://github.com/ANAND9963/interview-prep-hub/settings/pages).
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Choose **main** and **/(root)**, then **Save**.
4. Wait for the Pages deployment to finish in the repository's **Actions** tab.
5. Open **https://anand9963.github.io/interview-prep-hub/** after deployment succeeds.

The URL above is the expected deployment address, not a claim that Pages has already been enabled. The GitHub connector used to create this code does not expose Pages administration.

Official instructions: [Configure a GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Install on a device

- **Chrome / Edge on desktop or Android:** open the deployed HTTPS site and use **Install app** or the browser's installation menu when offered.
- **iPhone / iPad:** open in Safari, select **Share → Add to Home Screen**.
- Wait for the first online visit to cache the app. Lessons, notes, and diagrams then work offline. External documentation and LeetCode require connectivity.
- Installation availability varies by browser. The website remains usable without installation.
- To apply an app update, close all tabs/windows of the app and reopen it. Progress is separate from the asset cache.

## What this release contains

| Content | Included |
|---|---|
| Imported visible curriculum | 320 unique entries: 209 DSA, 75 AI/ML, 36 system design |
| Complete DSA articles | 20 original articles with 35 Java implementations, examples, hints, correctness explanations, complexity and trade-offs |
| Guided lessons | Java/Spring, AI, React, Angular and system design |
| Practice tracking | Not started / practicing / completed, bookmarks, notes, scratchpad, seven-day revision queue |
| System design | Movable components, keyboard movement, directed connections, rename/delete, undo, templates, per-topic diagrams and capacity worksheet |
| Interview room | 12 general prompts, answer frameworks, follow-up questions, timer and self-review rubric |
| Device support | Responsive layout, offline PWA, export/import backups |

**Not every curriculum entry has a full solution yet.** Ready content is clearly labeled. Other entries retain a curriculum brief, original LeetCode link where supplied, and a place to save your work. No generic answer is presented as a completed solution.

This release does not execute Java, React, or Angular submissions and is not a hosted coding judge. The scratchpad saves text; execute code in your IDE or on LeetCode. Interview answers use frameworks, not fabricated employment stories or verified company-frequency claims.

## Why there is no frontend framework dependency

This first release uses native JavaScript modules, HTML, CSS and SVG. It is a small static application, so a package install and framework build are unnecessary. React and Angular are learning tracks, not runtime dependencies. This reduces maintenance and keeps the app usable with zero additional hosting cost under GitHub Pages' free public-repository limits.

There are no paid API calls. The **Copy question for ChatGPT** button copies a prompt for you to use in your own ChatGPT session. ChatGPT subscription access is not embedded into the app.

## Run locally

Install Python 3, clone the repository, then run:

    git clone https://github.com/ANAND9963/interview-prep-hub.git
    cd interview-prep-hub
    python -m http.server 5173

On systems using python3 or Windows py, substitute that executable.
Open **http://localhost:5173/**. Do not open index.html as a local file because module and JSON loading need HTTP.

Hash routes such as #/item/dsa-min-stack work on GitHub Pages without rewrite rules.

## Progress and privacy

All progress, notes, scratchpad text, diagrams, and interview drafts are stored in browser localStorage on that device and origin. They are not committed to GitHub or sent to a backend by this application.

Use **Export progress** regularly. Clearing browser data, changing browsers, or switching domains does not transfer progress. **Import progress** validates and merges a backup; matching entries are replaced after an explicit confirmation. Automatic cross-device sync is not included.

The source workbook is not published. The importer reads only visible sheets and emits curriculum metadata and approved LeetCode URLs. Duplicate titles within a track are combined. Hidden source sheets are excluded.

## Extend the content

- data/curriculum.json: imported curriculum metadata.
- scripts/import_curriculum.py: repeatable XLSX extraction, using Python's standard library.
- scripts/build_content.py: original DSA articles and Java fixtures.
- data/solutions.json: generated DSA content used by the app.
- data/lessons.js: original guided lessons.
- app.js: boards, problem workspace, and interview room.
- playground.js: diagram editor and capacity worksheet.
- state.js: persistence, backup validation, and pure calculations.

To reimport a workbook:

    python scripts/import_curriculum.py "/path/to/S30 Curriculum.xlsx"

To add a DSA article, add an entry in scripts/build_content.py matching the curriculum slug after dsa-. Include a precise statement, assumptions, example, progressive hints, meaningful approaches, Java code, complexity, trade-offs, follow-up, and executable fixture. Do not mark curriculum-only entries complete by adding generic boilerplate.

After editing content or app assets:

    python scripts/build_content.py
    python scripts/build_sw.py

Commit the generated JSON and sw.js with the source changes. The service worker's asset fingerprint changes when shipped content changes.

## Verify

With Node 18+:

    node --test tests/core.test.js

With a Java 17+ JDK and Python:

    python tests/java_solutions.py

The Java harness compiles and runs every included implementation against its own fixtures. These fixtures cover representative cases; they are not an exhaustive proof of correctness or a submission judge.

## Next content milestones

1. Add the remaining DSA solutions in focused batches, preserving the same explanation and Java-test standard.
2. Expand the AI/ML curriculum beyond the introductory ready lessons.
3. Add runnable frontend exercises with isolated execution and real framework dependencies.
4. Add more system-design reference solutions.
5. Consider optional account sync only if local export/import becomes insufficient.

Use the existing architecture and content schema for each batch rather than regenerating the application.
