# FoodRescue AI

A township food-rescue web prototype: inventory → baseline forecast → rescue
recommendation → published offer → resident reservation → merchant pickup → impact.

## Run

Node.js 22 or newer. No database, login, API key or Python service is required.
Use `pnpm install --frozen-lockfile`, `pnpm dev`, `pnpm build`, and `pnpm start`.
The pinned pnpm version is in package.json. npm equivalents are supported by
package-lock.json: `npm ci`, `npm run dev`, `npm run build`, `npm start`.

Open http://localhost:3000. For recording, prefer a production build and `npm start`.
Merchant and Resident must use the same browser profile and origin: localStorage
is not a shared backend and will not synchronize between devices or deployments.

## Verify

- `node scripts/generate-synthetic-sales.mjs --check`
- `node scripts/test-prediction.mjs`
- `node scripts/test-demo.mjs`
- `pnpm lint`
- `pnpm build`
- Optional Python reference: `python -m unittest discover -s examples -p "test_prediction.py"`

`lint` checks the FoodRescue application and its shared code. `lint:all` also
checks retained, unused dashboard-template examples, which have existing lint
errors. The production build still type-checks the entire project.

## Demonstration

Reset on Merchant. Stock18 → forecast11 → 50% off → RM6 offer → reserve2.
Before pickup: rescued0, awaiting2. Confirm pickup: stock16, rescued2,
revenueRM12. Refresh to verify persistence.

All five pages are linked: Merchant, Predictions, Recommendations, Resident, Impact.
See [demo checklist](docs/demo-checklist.md), [pitch script](docs/pitch-script.md),
[submission notes](docs/submission-notes.md), and [data assumptions](docs/prediction.md).

## Scope and evidence

180 dated synthetic days / 2,160 hourly observations for one bakery product,
not real merchant records. Fixed demonstration clock19:30, closing21:00.
Forecasting is an hourly-average baseline; discounts and82% sell-through are
assumptions. No trained-model accuracy or real-world waste/CO2 savings are claimed.
Distance600m is illustrative. No payments, real notifications, real geolocation,
separate resident identities, food-safety verification or multi-device concurrency.

AI tools assisted development and documentation; disclose this in the submission.
Review the suggested disclosure in submission-notes.md and add other tools used by
your team. Python in examples/ is educational and not used by the live website.

## Credits

Built with Next.js, React, TypeScript, Tailwind, shadcn-style components and
[Shadcn Dashboard](https://shadcndashboard.dev/). Preserve the repository LICENSE.
