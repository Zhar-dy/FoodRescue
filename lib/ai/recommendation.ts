import type {
  Prediction,
  Product,
  Recommendation,
} from "@/types/foodrescue";
import { getForecastContext } from "@/lib/prediction/context";

export function generateRecommendation(
  product: Product,
  prediction: Prediction
): Recommendation {
  const quantity = prediction.isClosed ? 0 : Math.max(
    0,
    Math.min(
      Math.floor(prediction.predictedUnsold),
      product.currentStock
    )
  );

  const discountPercent =
    quantity === 0 ? 0 : quantity >= product.currentStock / 2
      ? 50
      : 30;

  const discountedPrice = Number(
    (product.originalPrice * (1 - discountPercent / 100)).toFixed(2)
  );

  // Demo estimate: assume 82% of the recommended quantity sells.
  const expectedSellThrough = 0.82;

  const expectedRevenueRecovered = Number(
    (quantity * discountedPrice * expectedSellThrough).toFixed(2)
  );

  const reasoning = [
    quantity > 0
      ? `${quantity} units predicted to remain unsold`
      : "No surplus available to recommend",
    quantity === 0
      ? "No rescue offer should be published"
      : discountPercent === 50
      ? "Predicted surplus is at least half the available stock"
      : "A 30% discount is recommended for a smaller surplus",
    "Expected sell-through is a demo estimate",
  ];

  return {
    productId: product.id,
    quantity,
    discountPercent,
    publishAt: getForecastContext(product).time > "20:00" ? getForecastContext(product).time : "20:00",
    expectedSellThrough,
    expectedRevenueRecovered,
    reasoning,
  };
}
