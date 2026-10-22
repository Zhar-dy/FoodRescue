export interface ForecastContext {
  date: string;
  time: string;
  salesSoFar: number;
}

export interface Product {
  id: string;
  merchantId: string;
  name: string;
  category: string;
  originalPrice: number;
  currentStock: number;
  forecast?: ForecastContext;
}

export interface Prediction {
  productId: string;
  predictedUnsold: number;
  confidence: number;
  isClosed?: boolean;
}

export interface Recommendation {
  productId: string;
  quantity: number;
  discountPercent: number;
  publishAt: string;
  expectedSellThrough: number;
  expectedRevenueRecovered: number;
  reasoning: string[];
}

export interface Offer {
  id: string;
  merchantId: string;
  productId: string;
  productName: string;
  originalPrice: number;
  discountedPrice: number;
  quantityRemaining: number;
  pickupDeadline: string;
}

export type ReservationStatus =
  | "reserved"
  | "collected"
  | "cancelled";

export interface Reservation {
  id: string;
  offerId: string;
  quantity: number;
  status: ReservationStatus;
}
