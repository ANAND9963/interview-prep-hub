# Release verification

## Completed

- Seven Node tests cover unique curriculum IDs, matching solution IDs, approved outbound LeetCode destinations, backup validation and round trips, unsafe object keys, diagram integrity, capacity calculations, revision rules, and manifest icon availability.
- All 35 Java implementations compiled and passed their included representative fixtures using Java 17.
- Application JavaScript syntax checks passed.
- Learning roadmap structure and HTTPS source links are validated.

## Still required in a real browser

Browser rendering and device installation could not be verified in the build environment. Chromium was unavailable and its download timed out. Do not interpret the checks above as visual, accessibility, or end-to-end certification.

After publishing, check:

1. Search and filter the DSA board. Open Min Stack and switch between solution approaches.
2. Save notes, scratchpad text, and completed status. Refresh and confirm persistence.
3. Add, move, connect, rename, and delete diagram components. Undo, refresh, and confirm saved state.
4. Export progress, then import the backup and confirm notes and diagrams survive.
5. Start, pause, and reset an interview timer. Confirm an answer draft survives refresh.
6. Check the board, solution view, and diagram toolbar on a phone-size viewport. The diagram itself intentionally scrolls horizontally.
7. Wait for the first successful service-worker installation, reload online once, then switch offline and reload again.
8. Install the PWA on a supported browser. Confirm its start page and icons.
9. Close every app tab after an update, reopen, and confirm new content appears without losing progress.
10. After Supabase configuration, verify sign-up/sign-in, RLS isolation with two users, cross-device restore, refresh-token renewal, offline edits followed by reconnect, and sign-out.

Run the repeatable core and Java tests using the commands in README.md whenever their affected code changes.
