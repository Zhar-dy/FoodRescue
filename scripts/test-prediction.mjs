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
  const module = { exports: {} };
  cache.set(filename, module);
  const requireProject = (specifier) => {
    assert.ok(specifier.startsWith("@/"), `Unexpected dependency: ${specifier}`);
    const relative = specifier.slice(2);
    return load(path.extname(relative) ? relative : `${relative}.ts`);
  };
  new Function("require", "module", "exports", outputText)(requireProject, module, module.exports);
  return module.exports;
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

assert.equal(data.dailyData.length, 30);
for (const day of data.dailyData) {
  let stock = day.openingStock;
  for (let hour = data.openingHour; hour < data.closingHour; hour++) {
    const sold = day.hourlySales[String(hour)];
    const snapshot = day.hourlyStock[String(hour)];
    assert.ok(Number.isInteger(sold) && sold >= 0 && sold <= stock);
    assert.equal(snapshot.startingStock, stock);
    stock -= sold;
    assert.equal(snapshot.remainingStock, stock);
  }
  assert.equal(day.closingStock, stock);
}
console.log("PASS: shared Product → Prediction → Recommendation, stock bounds, invalid input and 30-day inventory consistency.");
