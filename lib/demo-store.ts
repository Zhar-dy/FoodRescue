import { demoProduct } from "@/data/demo";
import type {
  Product,
  Offer,
  Reservation,
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