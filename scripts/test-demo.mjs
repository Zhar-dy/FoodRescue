import assert from "node:assert/strict";
import { load } from "./test-loader.mjs";

const saved = new Map();
let failWrites = false;
globalThis.window = Object.assign(new EventTarget(), {
  localStorage: {
    getItem: (key) => saved.get(key) ?? null,
    setItem: (key, value) => {
      if (failWrites) throw new Error("Storage unavailable");
      saved.set(key, value);
    },
  },
});
const store = load("lib/demo-store.ts");
const { predictSurplus } = load("lib/prediction/index.ts");
const { generateRecommendation } = load("lib/ai/recommendation.ts");
const { calculateImpact } = load("lib/analytics/metrics.ts");
const impact = () => calculateImpact(store.getOffers(), store.getReservations());
const recommendation = (product) => generateRecommendation(product, predictSurplus(product));

store.resetDemo();
const product = store.getProducts()[0];
assert.throws(() => store.updateInventory(product.id, 99, { ...product.forecast, date: "2026-02-30" }));
assert.equal(store.getProducts()[0].currentStock, 18);
store.updateInventory(product.id, 18, { ...product.forecast, salesSoFar: 100 });
assert.equal(store.getProducts()[0].forecast.salesSoFar, 100);
assert.equal(recommendation(store.getProducts()[0]).quantity, 11);
store.updateInventory(product.id, 18, { ...product.forecast, time: "21:00" });
assert.throws(() => store.createOffer(store.getProducts()[0], { ...recommendation(product), quantity: 1 }), /closed/);
store.resetDemo();
for (const invalid of [-1, 0.5, NaN, Infinity]) {
  assert.throws(() => store.updateStock(product.id, invalid), /whole number/);
}
store.updateStock(product.id, 27);
assert.equal(recommendation(store.getProducts()[0]).quantity, 19);
store.updateStock(product.id, 10);
assert.equal(recommendation(store.getProducts()[0]).quantity, 2);
assert.equal(recommendation(store.getProducts()[0]).discountPercent, 30);
store.updateStock(product.id, 0);
assert.throws(() => store.createOffer(product, recommendation(store.getProducts()[0])), /quantity/);
store.resetDemo();
const rec = recommendation(store.getProducts()[0]);
assert.equal(rec.quantity, 10);
assert.equal(rec.expectedRevenueRecovered, 49.2);
const fractional = { ...product, originalPrice: 12.99 };
assert.equal(recommendation(fractional).expectedRevenueRecovered, 53.3);
const offer = store.createOffer(product, rec);
assert.equal(offer.discountedPrice, 6);
assert.equal(store.createOffer(product, rec).id, offer.id);
assert.equal(store.getOffers().length, 1);
assert.throws(() => store.updateStock(product.id, 30), /Reset/);
assert.throws(() => store.reserveOffer(offer.id, 11), /Not enough/);
assert.throws(() => store.reserveOffer(offer.id, 1.5), /whole number/);
const reservation = store.reserveOffer(offer.id, 2);
assert.equal(store.getOffers()[0].quantityRemaining, 8);
assert.equal(store.getProducts()[0].currentStock, 18);
assert.deepEqual(impact(), { itemsRescued: 0, revenueRecovered: 0, reservedItems: 2 });
store.markCollected(reservation.id);
assert.equal(store.getProducts()[0].currentStock, 16);
assert.deepEqual(impact(), { itemsRescued: 2, revenueRecovered: 12, reservedItems: 0 });
store.markCollected(reservation.id);
assert.equal(store.getProducts()[0].currentStock, 16);
assert.equal(store.getOffers()[0].quantityRemaining, 8);
assert.deepEqual(impact(), { itemsRescued: 2, revenueRecovered: 12, reservedItems: 0 });
failWrites = true;
assert.throws(() => store.reserveOffer(offer.id, 1), /Storage unavailable/);
failWrites = false;
assert.equal(store.getOffers()[0].quantityRemaining, 8);
assert.equal(store.getReservations().length, 1);
saved.set("foodrescue-demo-v1", "{}");
assert.throws(() => store.getProducts(), /Reset demo/);
store.resetDemo();
assert.equal(store.getProducts()[0].currentStock, 18);
assert.equal(store.getOffers().length, 0);
assert.deepEqual(impact(), { itemsRescued: 0, revenueRecovered: 0, reservedItems: 0 });
console.log("PASS: inventory → forecast → recommendation → offer → reservation → pickup → impact; bounds, duplicate actions, storage failure and reset.");
