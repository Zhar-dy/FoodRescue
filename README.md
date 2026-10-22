# FoodRescue AI

An ML-powered township food-rescue prototype: inventory → trained surplus
forecast → rule-based recommendation → offer → reservation → pickup → impact.

## Run the web app

Node.js22+, then `npm ci`, `npm run dev`. Open http://localhost:3000.
For a production demo use `npm run build` and `npm start`. pnpm is also supported.
The exported trained model is included: no Python server, API key or paid AI
service is needed for deployment. Use the same browser profile and website
address for Merchant and Resident; localStorage does not synchronize devices.

## See the ML working

Reset demo on Merchant: stock18, sales-so-far72, date2026-10-22, time19:30.
Save inventory, then Predictions shows8 expected regular sales and10 leftovers.
Change sales to100: expected sales becomes7 and leftovers11. Change time to20:30:
the model estimates2 more regular sales. Outputs come from the learned tree.
At21:00 new offers are disabled. Sales outside the training range use a labelled
average-based fallback.

Default rescue flow: stock18 →10 predicted leftovers → offer10 atRM6 → reserve2
leaves8 available → collect gives stock16, rescued2, recovered offer valueRM12.

## Validate and learn

- `npm test`: prediction, Python/TypeScript parity and full storage/impact workflow.
- `node scripts/generate-synthetic-sales.mjs --check`: reproducible180-day fixture.
- `npm run lint`: FoodRescue code. `npm run lint:all` includes unused template
  examples with existing errors. Build type-checks the whole project.
- [Step-by-step ML guide](docs/ml-guide.md)
- [Model and evaluation](docs/prediction.md)
- [Recording checklist](docs/demo-checklist.md)
- [Five-minute pitch](docs/pitch-script.md)
- [Submission notes](docs/submission-notes.md)

## Evidence and limits

The decision tree is fitted on150 earlier synthetic days and tested on30 later
days. Mean absolute error:2.30 items versus2.85 for a time-average baseline on
that synthetic holdout. These are not real merchant accuracy results.
Hyperparameters are selected on a separate earlier validation period.

The180 simulated days contain2160 hourly records for one bakery product.
Half-hour snapshots require a documented synthetic allocation assumption.
Discount, timing and82% sell-through rules are assumptions, not learned
optimization. No automatic retraining, payments, real geolocation, food-safety
verification, notifications, separate resident accounts or multi-device backend.
Distance600m is illustrative; revenue totals are collected offer value.

Disclose material AI assistance. Preserve the LICENSE and the
[Shadcn Dashboard](https://shadcndashboard.dev/) template credit.
