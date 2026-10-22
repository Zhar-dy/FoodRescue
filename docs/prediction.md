# P1 forecasting handoff

`predictSurplus(product)` from `@/lib/prediction` accepts the existing `Product`
from `@/types/foodrescue`. It returns a compatible `Prediction` with extra UI
fields. P2 can pass its result directly to `generateRecommendation(product, result)`.
Use `currentStock`, `productId`, and `predictedUnsold`; there is no separate
prediction-specific Product type.

This is an hourly-average baseline, not trained ML. The scenario is fixed at
7:30 PM, closing at 9 PM. It uses half of the 19:00 hourly average plus the full
20:00 average, then rounds demand and caps it by stock. The documented sample
produces approximately seven regular sales and eleven leftovers from stock 18.
The required `confidence` field is zero because confidence has not been measured;
do not present it as an accuracy statistic.

## Synthetic assumptions

Run `node scripts/generate-synthetic-sales.mjs` to reproduce the 30-day fixture
with seed 42. The JSON records opening stock, every hour's sales and remaining
stock, and closing stock. The baseline demand profile peaks at lunch and falls
to about six units at 19:00 and four at 20:00, with +/- one seeded unit of
variation. Every day starts with 120 units; no replenishment or rescue offer is
simulated. These assumptions demonstrate behaviour, not real bakery accuracy.

## P3 connection still to implement

The page currently uses the shared `demoProduct` and visibly labels unsaved
preview edits. P3 does not exist yet; this does not claim the inventory loop is
complete. When `getProducts()` is ready, load its Product in a client wrapper
and pass it into `PredictionPanel` from `@/components/foodrescue/prediction-panel`:

```tsx
<PredictionPanel product={savedProduct} />
```

Without `isPreview`, the panel reads `savedProduct.currentStock` directly and
does not create a second editable inventory. Re-read products when entering
the page or after an inventory update. Keep `/merchant/predictions` inside the
dashboard route group. Recommendations/publication remain P2's work.

## Checks

The focused Node check uses Node 22.18 or newer for built-in TypeScript stripping.

- `node scripts/generate-synthetic-sales.mjs --check`
- `node scripts/test-prediction.mjs`
- `pnpm build`
- `pnpm lint`

The existing TypeScript 7 / typescript-eslint combination currently crashes the
lint parser (`Cannot read properties of undefined (reading 'Cjs')`) before files
are checked. This change does not modify those dependencies. The production
Next.js build and its TypeScript check pass.
