import type {
  Prediction,
  Product,
  Recommendation,
} from "@/types/foodrescue";

export function generateRecommendation(
  product: Product,
  prediction: Prediction
): Recommendation {
  const quantity = Math.max(
    0,
    Math.min(
      Math.floor(prediction.predictedUnsold),
      product.currentStock
    )
  );

  const discountPercent =
    quantity >= product.currentStock / 2 && quantity > 0
      ? 50
      : 30;

  const discountedPrice =
    product.originalPrice * (1 - discountPercent / 100);

  // Demo estimate: assume 82% of the recommended quantity sells.
  const expectedSellThrough = 0.82;

  const expectedRevenueRecovered = Math.round(
    quantity * discountedPrice * expectedSellThrough
  );

  const reasoning = [
    quantity > 0
      ? `${quantity} units predicted to remain unsold`
      : "No surplus available to recommend",
    discountPercent === 50
      ? "Predicted surplus is at least half the available stock"
      : "A 30% discount is recommended for a smaller surplus",
    "Expected sell-through is a demo estimate",
  ];

  return {
    productId: product.id,
    quantity,
    discountPercent,
    publishAt: "20:00",
    expectedSellThrough,
    expectedRevenueRecovered,
    reasoning,
  };
}