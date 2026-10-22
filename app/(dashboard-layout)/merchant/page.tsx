"use client";

import { useState } from "react";
import Link from "next/link";
import {
  updateStock,
  markCollected,
  resetDemo,
} from "@/lib/demo-store";
import { useDemoState } from "@/hooks/use-demo-state";

export default function MerchantPage() {
  const { products, offers, reservations, error: loadError, loading, refresh } = useDemoState();
  const [error, setError] = useState("");

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

      refresh();
      setError("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Cannot update stock."
      );
    }
  }

  function handleConfirmPickup(reservationId: string) {
    try {
      markCollected(reservationId);

      refresh();
      setError("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Cannot confirm pickup."
      );
    }
  }

  function handleResetDemo() {
    try {
      resetDemo();

      refresh();
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

      <nav className="flex flex-wrap gap-4">
        <Link href="/merchant/predictions" className="underline">
          Predictions
        </Link>

        <Link href="/merchant/recommendations" className="underline">
          Recommendations
        </Link>

        <Link href="/rescue" className="underline">
          Resident view
        </Link>
      </nav>

      <button
        type="button"
        onClick={handleResetDemo}
        className="rounded-md border px-4 py-2"
      >
        Reset demo
      </button>

      {(error || loadError) && (
        <p role="alert" className="text-destructive">
          {error || loadError}
        </p>
      )}

      {loading && <p>Loading inventory...</p>}
      {/* Inventory */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Inventory</h2>

        {products.map((product) => {
          const hasPublishedOffer = offers.some(
            (offer) => offer.productId === product.id
          );

          return (
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
                  disabled={hasPublishedOffer}
                  aria-label={`Stock for ${product.name}`}
                  className="w-24 rounded-md border px-3 py-2 disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={hasPublishedOffer}
                  className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
                >
                  Save stock
                </button>
              </form>

              {hasPublishedOffer && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Stock editing is locked until Reset demo.
                </p>
              )}

              <Link href="/merchant/recommendations" className="mt-3 inline-block rounded-md border px-4 py-2">
                Review rescue recommendation →
              </Link>
              <p className="mt-2 text-sm text-muted-foreground">
                Publish from Recommendations so the offer follows the current stock and prediction.
              </p>
            </div>
          );
        })}
      </section>

      {/* Offers */}
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

            <Link href="/rescue" className="mt-3 inline-block underline">View resident offer</Link>
          </div>
        ))}
      </section>

      {/* Reservations */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Reservations</h2>

        {reservations.length === 0 && (
          <p className="text-muted-foreground">
            No reservations yet.
          </p>
        )}

        {reservations.map((reservation) => {
          const offer = offers.find(
            (offer) => offer.id === reservation.offerId
          );

          return (
            <div
              key={reservation.id}
              className="rounded-lg border p-4"
            >
              <h3 className="font-semibold">
                {offer?.productName ?? "Unknown offer"}
              </h3>

              <p>Quantity: {reservation.quantity}</p>
              <p className="capitalize">
                Status: {reservation.status}
              </p>

              <button
                type="button"
                onClick={() => handleConfirmPickup(reservation.id)}
                disabled={reservation.status !== "reserved"}
                className="mt-3 rounded-md border px-4 py-2 disabled:opacity-50"
              >
                Confirm pickup
              </button>
            </div>
          );
        })}
      </section>
    </div>
  );
}
