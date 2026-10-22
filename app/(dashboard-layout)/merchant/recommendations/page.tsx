"use client";

import { useState } from "react";
import Link from "next/link";
import {
  createOffer,
  getProducts,
} from "@/lib/demo-store";
import { useDemoState } from "@/hooks/use-demo-state";
import { predictSurplus } from "@/lib/prediction";
import { generateRecommendation } from "@/lib/ai/recommendation";

export default function RecommendationsPage() {
  const { products, offers, error: loadError, refresh } = useDemoState();
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const error = actionError || loadError;
  const product = products[0] ?? null;
  const recommendation = product ? generateRecommendation(product, predictSurplus(product)) : null;
  const published = !!product && offers.some((offer) => offer.productId === product.id);

  function handlePublish() {
    setMessage("");
    setActionError("");
    try {
      // Recompute from storage at the moment of publishing, including other-tab edits.
      const currentProduct = getProducts().find((item) => item.id === product?.id);
      if (!currentProduct) throw new Error("No product found. Reset the demo from Merchant.");
      const currentRecommendation = generateRecommendation(currentProduct, predictSurplus(currentProduct));
      if (currentRecommendation.quantity <= 0) throw new Error("Cannot publish an offer with zero quantity.");
      const offer = createOffer(currentProduct, currentRecommendation);
      refresh();
      setMessage("Offer published successfully and is available to residents. Available: " + offer.quantityRemaining + ".");
    } catch (cause) {
      refresh();
      setActionError(cause instanceof Error ? cause.message : "Unable to publish the offer.");
    }
  }

  if (error && !product) {
    return (
      <div className="space-y-4">
        <Link href="/merchant" className="underline">
          ← Back to merchant
        </Link>
        <p role="alert" className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!product || !recommendation) {
    return <p>Loading recommendations...</p>;
  }

  const discountedPrice = Number(
    (product.originalPrice * (1 - recommendation.discountPercent / 100))
      .toFixed(2)
  );

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/merchant" className="underline">
        ← Back to merchant
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Rescue Recommendations</h1>
        <p className="text-muted-foreground">
          Suggested offers based on predicted unsold inventory.
        </p>
      </div>

      <section className="space-y-3 rounded-lg border p-5">
        <h2 className="text-xl font-semibold">{product.name}</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Available stock</p>
            <p className="text-lg font-semibold">{product.currentStock} units</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Predicted leftovers</p>
            <p className="text-lg font-semibold">
              {recommendation.quantity} units
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Original price</p>
            <p className="text-lg">
              RM {product.originalPrice.toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Recommended price
            </p>
            <p className="text-lg font-semibold">
              RM {discountedPrice.toFixed(2)}
              <span className="ml-2 text-sm">
                ({recommendation.discountPercent}% off)
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2 rounded-lg border p-5">
        <h2 className="text-lg font-semibold">Recommendation details</h2>

        <p>Suggested launch time: {recommendation.publishAt}</p>
        <p>
          Estimated sell-through:{" "}
          {(recommendation.expectedSellThrough * 100).toFixed(0)}%
        </p>
        <p>
          Estimated revenue recovered: RM{" "}
          {recommendation.expectedRevenueRecovered.toFixed(2)}
        </p>

        <p className="text-sm text-muted-foreground">
          Sell-through and revenue are demo estimates, not guaranteed results.
          The suggested launch time is informational.
        </p>

        <ul className="list-disc space-y-1 pl-5">
          {recommendation.reasoning.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>

        <p className="text-sm text-muted-foreground">
          The surplus prediction uses an hourly-average baseline, not a trained
          machine-learning model.
        </p>
      </section>

      {message && (
        <p role="status" className="text-green-600">{message}</p>
      )}

      {error && (
        <p role="alert" className="text-destructive">{error}</p>
      )}

      <button
        type="button"
        onClick={handlePublish}
        disabled={published || recommendation.quantity <= 0}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {published
          ? "Offer already published"
          : recommendation.quantity <= 0
            ? "No surplus to publish"
            : "Publish rescue offer"}
      </button>

      {published && (
        <p>
          <Link href="/rescue" className="underline">
            View resident offers →
          </Link>
        </p>
      )}
    </div>
  );
}
