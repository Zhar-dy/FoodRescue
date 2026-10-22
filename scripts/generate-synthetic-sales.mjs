import { readFileSync, writeFileSync } from "node:fs";

const outputPath = new URL("../data/synthetic-sales.json", import.meta.url);
const seed = 42;
const days = 180;
const startDate = "2026-04-01";
let state = seed;
function random() {
  state = (Math.imul(1664525, state) + 1013904223) >>> 0;
  return state / 2 ** 32;
}

// Assumed regular-price demand for one bakery product; not real transactions.
const hourlyDemand = [3, 5, 7, 10, 8, 6, 7, 8, 9, 6, 6, 4];
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const weekdayMultipliers = [1.1, 0.9, 0.92, 0.98, 1, 1.05, 1.18];
const openingHour = 9;
const closingHour = 21;

const dailyData = Array.from({ length: days }, (_, index) => {
  const date = new Date(`${startDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + index);
  const weekday = date.getUTCDay();
  const demandMultiplier = Number((0.85 + random() * 0.3).toFixed(3));
  const openingStock = 120 + Math.floor(random() * 31) - 15;
  let stock = openingStock;
  const hourlySales = {};
  const hourlyStock = {};
  hourlyDemand.forEach((demand, offset) => {
    const hour = String(openingHour + offset);
    const startingStock = stock;
    const hourlyVariation = Math.floor(random() * 5) - 2;
    const assumedDemand = Math.max(
      0,
      Math.round(demand * weekdayMultipliers[weekday] * demandMultiplier + hourlyVariation),
    );
    const sold = Math.min(stock, assumedDemand);
    stock -= sold;
    hourlySales[hour] = sold;
    hourlyStock[hour] = { startingStock, remainingStock: stock };
  });
  return {
    day: index + 1,
    date: date.toISOString().slice(0, 10),
    weekday: weekdays[weekday],
    demandMultiplier,
    openingStock,
    hourlySales,
    hourlyStock,
    closingStock: stock,
  };
});

const metadata = {
  productName: "Chocolate Bun",
  openingHour,
  closingHour,
  seed,
  totalDays: days,
  hourlyObservations: days * (closingHour - openingHour),
  dateRange: { start: startDate, end: dailyData.at(-1).date },
  assumptions: {
    source: "Synthetic assumptions, not observed bakery transactions",
    scope: "One hypothetical bakery and one product; dates are simulated",
    openingStock: "120 units with seeded integer variation from -15 to +15",
    hourlyDemand,
    weekdayMultipliers: Object.fromEntries(weekdays.map((day, index) => [day, weekdayMultipliers[index]])),
    dailyDemand: "Seeded multiplier between 0.85 and 1.15, rounded to three decimals",
    hourlyVariation: "Seeded integer variation from -2 to +2 units before demand is rounded",
    stockRule: "Sales are capped by available stock; remaining stock carries forward without replenishment",
    intervention: "Regular-price sales only; no rescue discounts, reservations or pickup outcomes",
    limits: "More generated rows do not establish forecast accuracy or represent real customer demand",
  },
};

const contents = `${JSON.stringify(metadata, null, 2).slice(0, -2)},\n  "dailyData": [\n${dailyData.map((day) => `    ${JSON.stringify(day)}`).join(",\n")}\n  ]\n}\n`;
if (process.argv.includes("--check")) {
  if (readFileSync(outputPath, "utf8") !== contents) {
    throw new Error("Synthetic data differs from the documented seed. Regenerate it.");
  }
  console.log(`Synthetic dataset matches seed ${seed}: ${days} days, ${metadata.hourlyObservations} hourly observations.`);
} else {
  writeFileSync(outputPath, contents);
  console.log(`Generated ${days} dated days (${metadata.hourlyObservations} hourly observations) of stock-consistent synthetic sales.`);
}
