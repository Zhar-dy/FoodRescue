"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PredictionPanel } from "@/components/foodrescue/prediction-panel";
import { getProducts } from "@/lib/demo-store";
import type { Product } from "@/types/foodrescue";

export default function PredictionsPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const savedProduct = getProducts()[0];

      if (!savedProduct) {
        throw new Error("No product found. Reset the demo from Merchant.");
      }

      setProduct(savedProduct);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Cannot load inventory."
      );
    }
  }, []);

  return (
    <div className="space-y-4">
      <Link href="/merchant" className="underline">
        ← Back to merchant
      </Link>

      {error ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : product ? (
        <PredictionPanel product={product} />
      ) : (
        <p>Loading inventory...</p>
      )}
    </div>
  );
}