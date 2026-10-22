import type { ForecastContext, Product } from "@/types/foodrescue";

export const DEFAULT_FORECAST: ForecastContext = {
  date: "2026-10-22",
  time: "19:30",
  salesSoFar: 72,
};

export function validateForecast(context: ForecastContext): void {
  if (!context || typeof context.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(context.date)) {
    throw new Error("Enter a valid forecast date.");
  }
  const date = new Date(context.date + "T00:00:00.000Z");
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== context.date) {
    throw new Error("Enter a valid forecast date.");
  }
  if (typeof context.time !== "string" || !/^(17|18|19|20):(00|30)$|^21:00$/.test(context.time)) {
    throw new Error("Choose a half-hour demo time between 5 PM and 9 PM.");
  }
  if (!Number.isSafeInteger(context.salesSoFar) || context.salesSoFar < 0) {
    throw new Error("Sales so far must be a nonnegative whole number.");
  }
}

export function getForecastContext(product: Product): ForecastContext {
  const context = product.forecast ?? DEFAULT_FORECAST;
  validateForecast(context);
  return { ...context };
}

export function getForecastFeatures(context: ForecastContext): number[] {
  validateForecast(context);
  const [hour, minute] = context.time.split(":").map(Number);
  return [21 * 60 - hour * 60 - minute, new Date(context.date + "T00:00:00.000Z").getUTCDay(), context.salesSoFar];
}
