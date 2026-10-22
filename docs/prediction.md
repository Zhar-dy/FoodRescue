# Forecasting and synthetic history

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

Run `node scripts/generate-synthetic-sales.mjs` to reproduce the **180-day fixture
with 2,160 hourly observations** using seed 42. The simulated dates run from
1 April to 27 September 2026. This represents one hypothetical bakery and its
Chocolate Bun product, not six months of collected transactions.

- The bakery opens at 09:00 and closes at 21:00, giving twelve hourly records per day.
- Opening stock varies from 105 to 135 units around an assumed 120-unit level.
- The assumed hourly demand profile is `[3, 5, 7, 10, 8, 6, 7, 8, 9, 6, 6, 4]`.
- Weekday factors range from 0.90 on Monday to 1.18 on Saturday. Each day also
  receives a seeded demand multiplier from 0.85 to 1.15 and each hour a seeded
  variation from -2 to +2 units before rounding.
- Every sale is capped by available stock. The JSON records each hour's starting
  and remaining stock, plus the day's opening and closing stock. No replenishment,
  discounted rescue demand, reservation outcomes, weather or holidays are simulated.

The forecast averages the 19:00 and 20:00 sales across all days; it does not fit a
model or use weekday-specific forecasts. Its current 19:30 estimate still rounds
to seven regular sales, leaving eleven from stock eighteen. The fixture has more
variety for demonstrating and inspecting the baseline, but generated observations
are not independent evidence that it is accurate. Sales during a stockout also
cannot measure unmet demand. No holdout accuracy or confidence has been measured.

## Shared inventory connection

`/merchant/predictions` reads the saved product from `getProducts()` and passes
it into `PredictionPanel` from `@/components/foodrescue/prediction-panel`:

```tsx
<PredictionPanel product={savedProduct} />
```

The panel reads `savedProduct.currentStock` directly. Edit inventory on Merchant,
then open Predictions to see the new estimate. P2's recommendation function uses
that same product and forecast. Browser localStorage is demonstration storage;
it does not synchronize merchant and resident activity across different devices.

## Checks

The focused Node check uses Node 22.18 or newer for built-in TypeScript stripping.

- `node scripts/generate-synthetic-sales.mjs --check`
- `node scripts/test-prediction.mjs`
- `pnpm build`
- `pnpm lint`

The focused check verifies the shared contracts, stock bounds, invalid input,
dated history, varying assumptions and conservation of all 2,160 stock records.
The generator's `--check` compares the entire file against its seeded output.
