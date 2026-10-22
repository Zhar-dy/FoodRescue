import type { Product } from "@/types/foodrescue";
import { DEFAULT_FORECAST } from "@/lib/prediction/context";

export const demoProduct: Product = {
  id: "product-001",
  merchantId: "merchant-001",
  name: "Chocolate Bun",
  category: "Bakery",
  originalPrice: 12,
  currentStock: 18,
  forecast: { ...DEFAULT_FORECAST },
};
