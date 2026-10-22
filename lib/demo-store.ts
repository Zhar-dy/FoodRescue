import { demoProduct } from "@/data/demo";
import type {
  Product,
  Offer,
  Reservation,
  Recommendation,
} from "@/types/foodrescue";

const STORAGE_KEY = "foodrescue-demo-v1";

interface DemoState {
  products: Product[];
  offers: Offer[];
  reservations: Reservation[];
}

function createInitialState(): DemoState {
  return {
    products: [{ ...demoProduct }],
    offers: [],
    reservations: [],
  };
}

function readState(): DemoState {
  if (typeof window === "undefined") {
    throw new Error("Demo storage must be accessed in the browser.");
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (saved !== null) {
    return JSON.parse(saved) as DemoState;
  }

  const initialState = createInitialState();

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(initialState)
  );

  return initialState;
}

export function getProducts(): Product[] {
  return readState().products;
}

function writeState(state: DemoState): void {
  if (typeof window === "undefined") {
    throw new Error("Demo storage must be accessed in the browser.");
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}

export function updateStock(
  productId: string,
  stock: number
): void {
  if (!Number.isSafeInteger(stock) || stock < 0) {
    throw new Error("Stock must be a nonnegative whole number.");
  }

  const state = readState();

  const product = state.products.find(
    (product) => product.id === productId
  );

  if (!product) {
    throw new Error("Product not found.");
  }

  const hasPublishedOffer = state.offers.some(
    (offer) => offer.productId === productId
  );

  if (hasPublishedOffer) {
    throw new Error("Reset the demo before editing a published product.");
  }

  product.currentStock = stock;
  writeState(state);
}

export function getOffers(): Offer[] {
  return readState().offers;
}

export function createOffer(
  product: Product,
  recommendation: Recommendation
): Offer {
  const state = readState();

  const savedProduct = state.products.find(
    (item) => item.id === product.id
  );

  if (!savedProduct) {
    throw new Error("Product not found.");
  }

  if (recommendation.productId !== savedProduct.id) {
    throw new Error("Recommendation belongs to another product.");
  }

  const existingOffer = state.offers.find(
    (offer) => offer.productId === savedProduct.id
  );

  if (existingOffer) {
    return existingOffer;
  }

  const quantity = recommendation.quantity;
  const discount = recommendation.discountPercent;

  if (
    !Number.isSafeInteger(quantity) ||
    quantity <= 0 ||
    quantity > savedProduct.currentStock
  ) {
    throw new Error("Offer quantity must be within available stock.");
  }

  if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
    throw new Error("Discount must be between 0 and 100.");
  }

  const discountedPrice = Number(
    (savedProduct.originalPrice * (1 - discount / 100)).toFixed(2)
  );

  const offer: Offer = {
    id: crypto.randomUUID(),
    merchantId: savedProduct.merchantId,
    productId: savedProduct.id,
    productName: savedProduct.name,
    originalPrice: savedProduct.originalPrice,
    discountedPrice,
    quantityRemaining: quantity,
    pickupDeadline: "21:00",
  };

  state.offers.push(offer);
  writeState(state);

  return offer;
}

export function resetDemo(): void {
  writeState(createInitialState());
}

export function getReservations(): Reservation[] {
  return readState().reservations;
}

export function reserveOffer(
  offerId: string,
  quantity: number
): Reservation {
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new Error("Reservation quantity must be a positive whole number.");
  }

  const state = readState();

  const offer = state.offers.find(
    (offer) => offer.id === offerId
  );

  if (!offer) {
    throw new Error("Offer not found.");
  }

  if (quantity > offer.quantityRemaining) {
    throw new Error("Not enough items available.");
  }

  const reservation: Reservation = {
    id: crypto.randomUUID(),
    offerId: offer.id,
    quantity,
    status: "reserved",
  };

  offer.quantityRemaining -= quantity;
  state.reservations.push(reservation);

  writeState(state);

  return reservation;
}