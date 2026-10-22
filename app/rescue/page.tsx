"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getOffers,
  reserveOffer,
} from "@/lib/demo-store";
import type { Offer } from "@/types/foodrescue";

export default function RescuePage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  function loadOffers() {
    try {
      setOffers(getOffers());
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load available offers."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOffers();
  }, []);

  function handleReserve(offer: Offer) {
    setError("");
    setMessage("");

    try {
      reserveOffer(offer.id, 1);
      setMessage(`Successfully reserved 1 ${offer.productName}.`);
      loadOffers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reserve this offer."
      );
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <Link href="/merchant" className="underline">
        ← Back to merchant
      </Link>

      <header>
        <h1 className="text-2xl font-bold">Available Rescue Offers</h1>
        <p className="text-muted-foreground">
          Discover discounted food available for rescue.
        </p>
      </header>

      {message && (
        <p role="status" className="text-green-600">
          {message}
        </p>
      )}

      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading available offers...</p>
      ) : offers.length === 0 ? (
        <p className="text-muted-foreground">
          No rescue offers are currently available.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {offers.map((offer) => (
            <article
              key={offer.id}
              className="space-y-3 rounded-lg border p-5"
            >
              <h2 className="text-xl font-semibold">
                {offer.productName}
              </h2>

              <p className="text-sm text-muted-foreground">
                Merchant: {offer.merchantId}
              </p>

              <p>
                <span className="text-muted-foreground line-through">
                  RM{offer.originalPrice.toFixed(2)}
                </span>{" "}
                <span className="text-lg font-bold">
                  RM{offer.discountedPrice.toFixed(2)}
                </span>
              </p>

              <p>
                Available quantity: {offer.quantityRemaining}
              </p>

              <p>
                Pickup before: {offer.pickupDeadline}
              </p>

              <button
                type="button"
                onClick={() => handleReserve(offer)}
                disabled={offer.quantityRemaining < 1}
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
              >
                Reserve 1 item
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}