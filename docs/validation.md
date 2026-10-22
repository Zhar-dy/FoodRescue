# Prototype validation — 22 October 2026

Validated the submission candidate built on main commit
`33f9041e0d4f9022d7e64d41badb5b9ad6ad65e1`.

## Passed

- Clean `npm ci` in a separate copy; production build and TypeScript checks.
- FoodRescue `npm run lint` and `node scripts/test-demo.mjs`.
- Seeded data regeneration check and prediction/stock-conservation checks:
  180 dated days and 2,160 hourly observations.
- All six standalone Python-reference tests.
- Actual production browser flow in Chromium 155: stock edits change predictions
  and discounts; publish once; reserve two; pending items count separately;
  collection reduces physical stock exactly once and updates impact.
- Refresh persistence, second-tab inventory updates, zero-stock publication
  disabled, negative/fractional quantities rejected.
- All six primary screens at desktop and 390px width, without horizontal overflow.
- No browser page errors during the tested flow.
- The unused source-preview endpoint returns404 instead of reading project files.
- `npm start` serves the normal production build.

Canonical outcome: stock18, forecast11, rescue priceRM6, reserve2 leaves9
available and physical stock18; collection gives stock16, rescued2,
recovered offer valueRM12, awaiting0.

`lint` covers the FoodRescue application. Retained, unused template examples
still have existing errors under `lint:all`; the build type-checks the full tree.
The compiler and lint versions are pinned for compatibility with the template.

## Still completed by the team

Merge this change, deploy or run the final build, and repeat the recording
checklist at the address judges will open. The local test origin is not a public
submission URL. Complete the real team details, review the deck and AI disclosure,
and upload the required deck plus five-minute video or live demo link and code link.

This verifies the prototype workflow, not real merchant accuracy, real waste
reduction, payment settlement, multi-device operation or organiser acceptance.
See [submission notes](submission-notes.md) and [recording checklist](demo-checklist.md).
