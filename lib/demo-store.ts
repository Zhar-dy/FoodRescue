import { demoProduct } from "@/data/demo";
import { getForecastContext, getForecastFeatures, validateForecast } from "@/lib/prediction/context";
import type {
  Product,
  Offer,
  Reservation,
  Recommendation,
  ForecastContext,
} from "@/types/foodrescue";

const STORAGE_KEY = "foodrescue-demo-v1";

interface DemoState {
  products: Product[];
  offers: Offer[];
  reservations: Reservation[];
}

function createInitialState(): DemoState {
  return {
    products: [{ ...demoProduct, forecast: getForecastContext(demoProduct) }],
    offers: [],
    reservations: [],
  };
}

function writeState(state: DemoState): void {
  if (typeof window === "undefined") {
    throw new Error("Demo storage must be accessed in the browser.");
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("foodrescue:updated"));
}

function readState(): DemoState {
  if (typeof window === "undefined") {
    throw new Error("Demo storage must be accessed in the browser.");
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (saved !== null) {
    try {
      const state = JSON.parse(saved) as DemoState;
      if (!state || !Array.isArray(state.products) || !Array.isArray(state.offers) || !Array.isArray(state.reservations)) {
        throw new Error("Invalid demo data.");
      }
      for (const product of state.products) {
        if (!Number.isSafeInteger(product.currentStock) || product.currentStock < 0) throw new Error("Invalid saved stock.");
        getForecastContext(product);
      }
      return state;
    } catch {
      throw new Error("Saved demo data cannot be read. Use Reset demo on the merchant page.");
    }
  }

  const initialState = createInitialState();
  writeState(initialState);

  return initialState;
}

// Read saved data.

export function getProducts(): Product[] {
  return readState().products;
}

export function getOffers(): Offer[] {
  return readState().offers;
}

export function getReservations(): Reservation[] {
  return readState().reservations;
}

// Edit stock before an offer is published.

export function updateStock(productId: string, stock: number): void {
  updateInventory(productId, stock);
}

// Validate and save every forecasting input together, without partial writes.
export function updateInventory(productId: string, stock: number, forecast?: ForecastContext): void {
  if (!Number.isSafeInteger(stock) || stock < 0) {
    throw new Error("Stock must be a nonnegative whole number.");
  }

  if (forecast) validateForecast(forecast);

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
  if (forecast) product.forecast = { ...forecast };
  writeState(state);
}

// Publish one offer per product.

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
  if (getForecastFeatures(getForecastContext(savedProduct))[0] === 0) {
    throw new Error("The bakery is closed at the selected demo time.");
  }
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

// Hold units for a resident. Physical stock does not change yet.

export function reserveOffer(
  offerId: string,
  quantity: number
): Reservation {
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new Error(
      "Reservation quantity must be a positive whole number."
    );
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

// Confirm pickup and subtract physical stock exactly once.

export function markCollected(reservationId: string): void {
  const state = readState();

  const reservation = state.reservations.find(
    (reservation) => reservation.id === reservationId
  );

  if (!reservation) {
    throw new Error("Reservation not found.");
  }

  if (reservation.status === "collected") {
    return;
  }

  if (reservation.status !== "reserved") {
    throw new Error("Only reserved items can be collected.");
  }

  const offer = state.offers.find(
    (offer) => offer.id === reservation.offerId
  );

  if (!offer) {
    throw new Error("Offer not found.");
  }

  const product = state.products.find(
    (product) => product.id === offer.productId
  );

  if (!product) {
    throw new Error("Product not found.");
  }

  if (product.currentStock < reservation.quantity) {
    throw new Error("Not enough physical stock to confirm pickup.");
  }

  product.currentStock -= reservation.quantity;
  reservation.status = "collected";

  writeState(state);
}

// Restore the starting demo.

export function resetDemo(): void {
  writeState(createInitialState());
}
