import assert from "node:assert/strict";
import { load } from "./test-loader.mjs";

const model = load("data/models/surplus-tree.json");
const cases = load("ml/parity-cases.json");
const { predictTree } = load("lib/prediction/tree.ts");
const { predictSurplus } = load("lib/prediction/index.ts");
const { getForecastFeatures } = load("lib/prediction/context.ts");
const { demoProduct } = load("data/demo.ts");
const { generateRecommendation } = load("lib/ai/recommendation.ts");
assert.equal(cases.length, 240);
for (const row of cases) {
  assert.ok(row.date >= model.evaluation.testDateRange[0]);
  assert.ok(Math.abs(predictTree(model, row.features) - row.pythonPrediction) < 1e-12);
}
const result = predictSurplus(demoProduct);
assert.equal(result.method, "trained-tree");
assert.equal(result.expectedRemainingSales, 8);
assert.equal(result.predictedUnsold, 10);
assert.equal(getForecastFeatures(demoProduct.forecast)[1], 4);
const changedSales = predictSurplus({ ...demoProduct, forecast: { ...demoProduct.forecast, salesSoFar: 100 } });
assert.equal(changedSales.expectedRemainingSales, 7);
const earlier = predictSurplus({ ...demoProduct, forecast: { ...demoProduct.forecast, time: "17:00" } });
assert.ok(earlier.rawExpectedRemainingSales > result.rawExpectedRemainingSales);
const closed = { ...demoProduct, forecast: { ...demoProduct.forecast, time: "21:00" } };
assert.equal(predictSurplus(closed).method, "closed");
assert.equal(generateRecommendation(closed, predictSurplus(closed)).quantity, 0);
assert.equal(generateRecommendation({ ...demoProduct, forecast: { ...demoProduct.forecast, time: "20:30" } }, result).publishAt, "20:30");
assert.equal(predictSurplus({ ...demoProduct, forecast: { ...demoProduct.forecast, salesSoFar: 0 } }).method, "baseline-fallback");
for (const forecast of [
  { ...demoProduct.forecast, date: "2026-02-30" },
  { ...demoProduct.forecast, time: "19:15" },
  { ...demoProduct.forecast, time: "22:00" },
  { ...demoProduct.forecast, salesSoFar: -1 },
  { ...demoProduct.forecast, salesSoFar: 1.5 },
]) assert.throws(() => predictSurplus({ ...demoProduct, forecast }));
assert.equal(predictSurplus({ ...demoProduct, forecast: undefined }).predictedUnsold, result.predictedUnsold);
assert.equal(result.confidence, 0);
console.log("PASS: all240 held-out Python/TypeScript predictions match; model inputs, bounds, closing, legacy defaults and labelled fallback.");
