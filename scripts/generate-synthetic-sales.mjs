import { readFileSync, writeFileSync } from "node:fs";

const outputPath = new URL("../data/synthetic-sales.json", import.meta.url);
const seed = 42;
let state = seed;
function random() {
  state = (Math.imul(1664525, state) + 1013904223) >>> 0;
  return state / 2 ** 32;
}

// Regular sales only, before any rescue offer changes customer demand.
const hourlyDemand = [3, 5, 7, 10, 8, 6, 7, 8, 9, 6, 6, 4];
const metadata = {
  productName: "Chocolate Bun",
  openingHour: 9,
  closingHour: 21,
  seed,
  assumptions: {
    source: "Synthetic assumptions, not observed bakery transactions",
    openingStock: 120,
    hourlyDemand,
    variation: "Seeded -1, 0 or +1 unit per hour",
    stockRule: "Sales are capped by available stock; remaining stock carries forward",
    intervention: "No rescue discounts or reservations in this history",
  },
};

const dailyData = Array.from({ length: 30 }, (_, index) => {
  let stock = metadata.assumptions.openingStock;
  const hourlySales = {};
  const hourlyStock = {};
  hourlyDemand.forEach((demand, offset) => {
    const hour = String(metadata.openingHour + offset);
    const startingStock = stock;
    const sold = Math.min(stock, Math.max(0, demand + Math.floor(random() * 3) - 1));
    stock -= sold;
    hourlySales[hour] = sold;
    hourlyStock[hour] = { startingStock, remainingStock: stock };
  });
  return { day: index + 1, openingStock: metadata.assumptions.openingStock, hourlySales, hourlyStock, closingStock: stock };
});

const contents = `${JSON.stringify(metadata, null, 2).slice(0, -2)},\n  "dailyData": [\n${dailyData.map((day) => `    ${JSON.stringify(day)}`).join(",\n")}\n  ]\n}\n`;
if (process.argv.includes("--check")) {
  if (readFileSync(outputPath, "utf8") !== contents) {
    throw new Error("Synthetic data differs from the documented seed. Regenerate it.");
  }
  console.log("Synthetic dataset matches seed 42.");
} else {
  writeFileSync(outputPath, contents);
  console.log("Generated 30 days of stock-consistent synthetic sales.");
}
