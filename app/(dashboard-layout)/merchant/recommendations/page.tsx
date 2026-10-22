"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  createOffer,
  getOffers,
  getProducts,
} from "@/lib/demo-store";
import { predictSurplus } from "@/lib/prediction";
import { generateRecommendation } from "@/lib/ai/recommendation";
import type {
  Product,
  Recommendation,
} from "@/types/foodrescue";

export default function RecommendationsPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendation, setRecommendation] =
    useState<Recommendation | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    try {
      const savedProduct = getProducts()[0];

      if (!savedProduct) {
        throw new Error("No product found. Reset the demo from Merchant.");
      }

      const prediction = predictSurplus(savedProduct);
      const result = generateRecommendation(savedProduct, prediction);

      setProduct(savedProduct);
      setRecommendation(result);
      setPublished(
        getOffers().some((offer) => offer.productId === savedProduct.id)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load recommendations."
      );
    }
  }, []);

  function handlePublish() {
    setMessage("");
    setError("");

    if (!product || !recommendation) {
      setError("Recommendation is not ready.");
      return;
    }

    if (recommendation.quantity <= 0) {
      setError("Cannot publish an offer with zero quantity.");
      return;
    }

    try {
      createOffer(product, recommendation);
      setPublished(true);
      setMessage("Offer published successfully and is available to residents.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to publish the offer."
      );
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
    </div>
  );
}