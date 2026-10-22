import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stripTypeScriptTypes } from "node:module";

const root = fileURLToPath(new URL("../", import.meta.url));
const cache = new Map();
function load(relativePath) {
  const filename = path.join(root, relativePath);
  if (filename.endsWith(".json")) return JSON.parse(readFileSync(filename, "utf8"));
  if (cache.has(filename)) return cache.get(filename).exports;
  // Execute the actual function bodies. Only erase types and resolve project imports.
  const source = stripTypeScriptTypes(readFileSync(filename, "utf8"));
  const exports = [...source.matchAll(/\bexport\s+(?:function|const)\s+(\w+)/g)].map((match) => match[1]);
  const outputText = source
    .replace(/import\s+(\w+)\s+from\s+["']([^"']+)["'];?/g, (_, name, specifier) => `const ${name} = require(${JSON.stringify(specifier)});`)
    .replace(/\bexport\s+(function|const)\s/g, "$1 ")
    + `\nmodule.exports = { ${exports.join(", ")} };`;
  const compiledModule = { exports: {} };
  cache.set(filename, compiledModule);
  const requireProject = (specifier) => {
    assert.ok(specifier.startsWith("@/"), `Unexpected dependency: ${specifier}`);
    const relative = specifier.slice(2);
    return load(path.extname(relative) ? relative : `${relative}.ts`);
  };
  new Function("require", "module", "exports", outputText)(requireProject, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}

const { predictSurplus } = load("lib/prediction/index.ts");
const { generateRecommendation } = load("lib/ai/recommendation.ts");
const { demoProduct } = load("data/demo.ts");
const data = load("data/synthetic-sales.json");

const prediction = predictSurplus(demoProduct);
assert.equal(prediction.productId, demoProduct.id);
assert.equal(prediction.expectedRemainingSales, 7);
assert.equal(prediction.predictedUnsold, 11);
assert.equal(generateRecommendation(demoProduct, prediction).quantity, 11);
assert.equal(prediction.isSynthetic, true);
assert.equal(prediction.confidence, 0); // No invented accuracy claim.

for (const stock of [0, 1, 3, 7, 18, 30]) {
  const result = predictSurplus({ ...demoProduct, currentStock: stock });
  assert.ok(Number.isInteger(result.predictedUnsold));
  assert.ok(result.predictedUnsold >= 0 && result.predictedUnsold <= stock);
  assert.equal(result.predictedUnsold + result.expectedRemainingSales, stock);
}
assert.ok(predictSurplus({ ...demoProduct, currentStock: 30 }).predictedUnsold > prediction.predictedUnsold);
for (const stock of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1]) {
  assert.throws(() => predictSurplus({ ...demoProduct, currentStock: stock }), /whole number/);
}

assert.equal(data.seed, 42);
assert.equal(data.totalDays, 180);
assert.equal(data.dailyData.length, data.totalDays);
assert.equal(data.hourlyObservations, 2160);
assert.equal(data.hourlyObservations, data.totalDays * (data.closingHour - data.openingHour));
assert.equal(data.dateRange.start, data.dailyData[0].date);
assert.equal(data.dateRange.end, data.dailyData.at(-1).date);
assert.equal(new Set(data.dailyData.map((day) => day.date)).size, data.totalDays);
assert.equal(new Set(data.dailyData.map((day) => day.weekday)).size, 7);
assert.ok(new Set(data.dailyData.map((day) => day.openingStock)).size > 1);
assert.ok(new Set(data.dailyData.map((day) => day.demandMultiplier)).size > 1);
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let observations = 0;
for (const [index, day] of data.dailyData.entries()) {
  assert.equal(day.day, index + 1);
  const expectedDate = new Date(`${data.dateRange.start}T00:00:00.000Z`);
  expectedDate.setUTCDate(expectedDate.getUTCDate() + index);
  assert.equal(day.date, expectedDate.toISOString().slice(0, 10));
  assert.equal(day.weekday, weekdays[expectedDate.getUTCDay()]);
  assert.ok(Number.isSafeInteger(day.openingStock) && day.openingStock >= 105 && day.openingStock <= 135);
  assert.ok(day.demandMultiplier >= 0.85 && day.demandMultiplier <= 1.15);
  assert.equal(Object.keys(day.hourlySales).length, data.closingHour - data.openingHour);
  let stock = day.openingStock;
  for (let hour = data.openingHour; hour < data.closingHour; hour++) {
    const sold = day.hourlySales[String(hour)];
    const snapshot = day.hourlyStock[String(hour)];
    assert.ok(Number.isInteger(sold) && sold >= 0 && sold <= stock);
    assert.equal(snapshot.startingStock, stock);
    stock -= sold;
    assert.equal(snapshot.remainingStock, stock);
    observations++;
  }
  assert.equal(day.closingStock, stock);
}
assert.equal(observations, data.hourlyObservations);
console.log("PASS: shared Product → Prediction → Recommendation, stock bounds, invalid input and 180 dated days / 2160 hourly observations with stock conservation.");
