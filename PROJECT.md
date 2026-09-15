# Product constraints

- Personal learning app with no additional running budget.
- Every learning entry opens internally. A separate practice link may open the exact LeetCode destination supplied in the workbook.
- Never redirect practice buttons to S30.
- Include DSA, AI, Java/Spring, React, Angular, system design, and interview preparation.
- Keep full solutions separate from curriculum-only entries. Do not imply complete coverage.
- Explain correctness, edge cases, complexity and meaningful trade-offs. Do not invent company-specific question frequency or personal experience.
- Keep progress local-first, provide backups, support optional Supabase synchronization, and preserve installed PWA behavior.
- No paid APIs or embedded ChatGPT subscription integration.

# Current state

The first static application is implemented. Source curriculum is imported from the three visible sheets, deduplicated by track and title. Twenty DSA articles contain 35 Java implementations. Additional original lessons cover the other learning tracks. A learning library adds ordered Java, Python, AI/ML, React and Angular paths, source links, and algorithm comparisons. Light/dark themes and optional local-first Supabase synchronization are implemented. The remaining full curriculum explanations are unfinished and labeled accordingly.

# Release check

Run core tests, Java solution fixtures, and a browser check for changed interactions. Regenerate the service worker with every asset change. Check mobile layout and a real offline reload after the first successful cache installation. Publish from main/root using GitHub Pages after its settings are enabled.
