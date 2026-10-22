"use client";

import { useEffect, useState } from "react";
import {
  getProducts,
  updateStock,
  getOffers,
  createOffer,
  resetDemo,
} from "@/lib/demo-store";
import { demoRecommendation } from "@/data/demo";
import type { Product, Offer } from "@/types/foodrescue";

export default function MerchantPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [error, setError] = useState("");

  // Load saved inventory and offers when the page opens.
  useEffect(() => {
    try {
      setProducts(getProducts());
      setOffers(getOffers());
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Cannot load demo data."
      );
    }
  }, []);

  function handleStockUpdate(
    productId: string,
    form: HTMLFormElement
  ) {
    try {
      const formData = new FormData(form);
      const value = String(formData.get("stock") ?? "").trim();

      if (value === "") {
        throw new Error("Enter a stock quantity.");
      }

      updateStock(productId, Number(value));

      setProducts(getProducts());
      setError("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Cannot update stock."
      );
    }
  }

  function handlePublishOffer(product: Product) {
    try {
      createOffer(product, demoRecommendation);

      setOffers(getOffers());
      setError("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Cannot publish offer."
      );
    }
  }

  function handleResetDemo() {
    try {
      resetDemo();

      setProducts(getProducts());
      setOffers(getOffers());
      setError("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Cannot reset demo."
      );
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Merchant Dashboard</h1>

      <button
        type="button"
        onClick={handleResetDemo}
        className="rounded-md border px-4 py-2">
        Reset demo
      </button>

      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Inventory</h2>

        {products.map((product) => (
          <div key={product.id} className="rounded-lg border p-4">
            <h3 className="font-semibold">{product.name}</h3>
            <p>Stock: {product.currentStock}</p>
            <p>Price: RM{product.originalPrice.toFixed(2)}</p>

            <form
              className="mt-3 flex flex-wrap gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                handleStockUpdate(product.id, event.currentTarget);
              }}
            >
              <input
                key={product.currentStock}
                name="stock"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={product.currentStock}
                aria-label={`Stock for ${product.name}`}
                className="w-24 rounded-md border px-3 py-2"
              />

              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
              >
                Save stock
              </button>
            </form>

            <button
              type="button"
              onClick={() => handlePublishOffer(product)}
              className="mt-3 rounded-md border px-4 py-2"
            >
              Publish demo offer
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Published offers</h2>

        {offers.length === 0 && (
          <p className="text-muted-foreground">
            No offers published yet.
          </p>
        )}

        {offers.map((offer) => (
          <div key={offer.id} className="rounded-lg border p-4">
            <h3 className="font-semibold">{offer.productName}</h3>

            <p>
              RM{offer.originalPrice.toFixed(2)} →{" "}
              RM{offer.discountedPrice.toFixed(2)}
            </p>

            <p>Available: {offer.quantityRemaining}</p>
            <p>Pickup before: {offer.pickupDeadline}</p>
          </div>
        ))}
      </section>
    </div>
  );
}