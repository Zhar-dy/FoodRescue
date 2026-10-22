import syntheticData from "@/data/synthetic-sales.json";
import type { Prediction, Product } from "@/types/foodrescue";

export interface PredictionResult extends Prediction {
  expectedRemainingSales: number;
  currentStock: number;
  demoTime: string;
  explanation: string;
  isSynthetic: true;
}

export function predictSurplus(product: Product): PredictionResult {
  if (!Number.isSafeInteger(product.currentStock) || product.currentStock < 0) {
    throw new Error("Stock must be a nonnegative whole number.");
  }

  const DEMO_TIME_LABEL = "7:30 PM";
  const totalDays = syntheticData.dailyData.length;
  if (totalDays === 0) {
    throw new Error("Synthetic sales history is missing.");
  }
  let totalHour19Sales = 0;
  let totalHour20Sales = 0;

  syntheticData.dailyData.forEach((day) => {
    totalHour19Sales += day.hourlySales["19"] || 0;
    totalHour20Sales += day.hourlySales["20"] || 0;
  });

  const avgHour19Sales = totalHour19Sales / totalDays;
  const avgHour20Sales = totalHour20Sales / totalDays;

  const remainingSales730To800 = avgHour19Sales * 0.5;
  const remainingSales800To900 = avgHour20Sales;
  
  const rawExpectedRemainingSales = remainingSales730To800 + remainingSales800To900;
  const expectedRemainingSales = Math.round(rawExpectedRemainingSales);

  const cappedExpectedSales = Math.min(product.currentStock, expectedRemainingSales);
  const predictedUnsold = product.currentStock - cappedExpectedSales;

  const explanation = `At ${DEMO_TIME_LABEL}, closing at 9:00 PM, ${totalDays} simulated days (${syntheticData.hourlyObservations.toLocaleString("en-MY")} hourly observations) suggest about ${remainingSales730To800.toFixed(1)} regular sales before 8:00 PM and ${remainingSales800To900.toFixed(1)} after that. This is approximately ${expectedRemainingSales} items of demand. With ${product.currentStock} in stock, up to ${cappedExpectedSales} may sell and ${predictedUnsold} may remain. This single-product baseline uses assumed sales patterns; more synthetic rows do not establish real-world accuracy.`;

  return {
    productId: product.id,
    predictedUnsold,
    // Unmeasured compatibility field; the UI deliberately shows no accuracy claim.
    confidence: 0,
    expectedRemainingSales: cappedExpectedSales,
    currentStock: product.currentStock,
    demoTime: DEMO_TIME_LABEL,
    explanation,
    isSynthetic: true,
  };
}
