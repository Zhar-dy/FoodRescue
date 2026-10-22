import model from "@/data/models/surplus-tree.json";
import type { Prediction, Product } from "@/types/foodrescue";
import { getForecastContext, getForecastFeatures } from "@/lib/prediction/context";
import { predictTree } from "@/lib/prediction/tree";

export interface PredictionResult extends Prediction {
  expectedRemainingSales: number;
  rawExpectedRemainingSales: number;
  baselineExpectedRemainingSales: number;
  currentStock: number;
  demoTime: string;
  explanation: string;
  isSynthetic: true;
  method: "trained-tree" | "baseline-fallback" | "closed";
  evaluation: typeof model.evaluation;
}

export function predictSurplus(product: Product): PredictionResult {
  if (!Number.isSafeInteger(product.currentStock) || product.currentStock < 0) {
    throw new Error("Stock must be a nonnegative whole number.");
  }
  if (product.id !== model.productId) throw new Error("This demo model supports Chocolate Bun only.");
  const context = getForecastContext(product);
  const features = getForecastFeatures(context);
  const [minutesLeft] = features;
  const isClosed = minutesLeft === 0;
  const baselineTable = model.baselineByMinutesLeft as Record<string, number>;
  const baseline = isClosed ? 0 : baselineTable[String(minutesLeft)];
  const salesRange = model.featureRanges.salesSoFar;
  const outsideRange = context.salesSoFar < salesRange.min || context.salesSoFar > salesRange.max;
  const method = isClosed ? "closed" : outsideRange ? "baseline-fallback" : "trained-tree";
  const raw = isClosed ? 0 : outsideRange ? baseline : predictTree(model, features);
  if (!Number.isFinite(raw) || raw < 0) throw new Error("Cannot calculate a valid demand forecast.");
  const expectedRemainingSales = Math.min(product.currentStock, Math.round(raw));
  const predictedUnsold = product.currentStock - expectedRemainingSales;
  const explanation = isClosed
    ? "The bakery is closed at the selected demo time. Remaining stock is not offered for a new reservation."
    : method === "baseline-fallback"
      ? "Sales so far is outside the training range (" + salesRange.min + "–" + salesRange.max + "). Using the training-days average as a fallback: approximately " + expectedRemainingSales + " further sales and " + predictedUnsold + " leftovers."
      : "The trained decision tree uses weekday, time until closing and sales so far. At " + context.time + ", it estimates " + expectedRemainingSales + " further regular sales and " + predictedUnsold + " leftovers from stock " + product.currentStock + ".";
  return {
    productId: product.id, predictedUnsold, confidence: 0,
    expectedRemainingSales, rawExpectedRemainingSales: raw,
    baselineExpectedRemainingSales: Math.min(product.currentStock, Math.round(baseline)),
    currentStock: product.currentStock, demoTime: context.time,
    explanation, isSynthetic: true, isClosed, method, evaluation: model.evaluation,
  };
}
