import type {
  Product,
  Prediction,
  Recommendation,
} from "@/types/foodrescue";

export const demoProduct: Product = {
  id: "product-001",
  merchantId: "merchant-001",
  name: "Chocolate Bun",
  category: "Bakery",
  originalPrice: 12,
  currentStock: 18,
};

export const demoPrediction: Prediction = {
  productId: "product-001",
  predictedUnsold: 11,
  confidence: 0.84,
};

export const demoRecommendation: Recommendation = {
  productId: "product-001",
  quantity: 11,
  discountPercent: 50,
  publishAt: "20:00",
  expectedSellThrough: 0.82,
  expectedRevenueRecovered: 54,
  reasoning: [
    "High predicted surplus before closing",
    "Only 90 minutes remain before closing",
    "Similar discounted offers achieved strong sell-through",
  ],
};