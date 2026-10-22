# ML validation — 22 October 2026

Candidate is based on merged prototype main19bba66.
Training is reproducible with pinned Python dependencies and seed42.
The fitted tree uses150 earlier synthetic days; the last30 days are held out.
Selected hyperparameters come from a separate earlier validation period.

Synthetic test MAE:tree2.3046367452; baseline2.8490555556 items.
240 held-out Python predictions match TypeScript inference within1e-12.
Two Python tests check no future-sales input leakage and disjoint chronological dates.
JavaScript checks cover new inputs, invalid inputs, atomic writes, legacy defaults,
closed-time publication guard, labelled fallback, stock bounds and the entire
offer/reserve/pickup/impact workflow.

Canonical learned result:stock18, sales72, Thursday2026-10-22 at19:30:
expected regular sales8, leftovers10, priceRM6. Reserve2 leaves8 available;
pickup gives stock16, rescued2 and recovered offer valueRM12.

Clean npm ci, production build with TypeScript checks, scoped lint, npm test,
and reproducible Python training checks passed on this candidate.
Production browser checks passed in Chromium155: model context changes,
saved inputs, labelled fallback, closed-time publication, stock edits,
publishing, reservation, idempotent pickup, impact, refresh persistence,
cross-tab updates and all six screens at390px width. No page errors were observed.
Keep the existing one-browser limitation and disclose synthetic-only evaluation.
No external AI API, automatic retraining or Python web server is introduced.
