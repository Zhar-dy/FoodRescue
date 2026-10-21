import type {
  Prediction,
  Product,
  Recommendation,
} from "@/types/foodrescue";

export function generateRecommendation(
  product: Product,
  prediction: Prediction
): Recommendation {
  // TODO: Replace with optimization logic.
  return {
    productId: product.id,
    quantity: prediction.predictedUnsold,
    discountPercent: 50,
    publishAt: "20:00",
    expectedSellThrough: 0.82,
    expectedRevenueRecovered: 54,
    reasoning: [
      "High predicted surplus before closing",
      "Limited selling time remains",
    ],
  };
}