import syntheticData from "@/data/synthetic-sales.json";

export interface Product {
  id: string;
  name: string;
  stock: number;
  price?: number;
}

export interface PredictionResult {
  predictedLeftovers: number;
  expectedRemainingSales: number;
  currentStock: number;
  demoTime: string;
  explanation: string;
  isSynthetic: boolean;
}

export function predictSurplus(product: Product): PredictionResult {
  const DEMO_TIME_LABEL = "7:30 PM";
  const totalDays = syntheticData.dailyData.length;
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

  const cappedExpectedSales = Math.min(product.stock, expectedRemainingSales);
  const calculatedLeftovers = product.stock - cappedExpectedSales;
  const predictedLeftovers = Math.max(0, Math.min(product.stock, calculatedLeftovers));

  const explanation = `At ${DEMO_TIME_LABEL}, with closing time at 9:00 PM, based on a 30-day synthetic hourly average (~${remainingSales730To800.toFixed(1)} items for 7:30–8:00 PM and ~${remainingSales800To900.toFixed(1)} items for 8:00–9:00 PM), expected remaining sales are approximately ${expectedRemainingSales} unit(s)[cite: 1]. With a current stock of ${product.stock}, leftover prediction is ${predictedLeftovers} unit(s)[cite: 1].`;

  return {
    predictedLeftovers,
    expectedRemainingSales: cappedExpectedSales,
    currentStock: product.stock,
    demoTime: DEMO_TIME_LABEL,
    explanation,
    isSynthetic: true,
  };
}