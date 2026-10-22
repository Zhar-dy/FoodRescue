"use client";

import Link from "next/link";
import { PredictionPanel } from "@/components/foodrescue/prediction-panel";
import { useDemoState } from "@/hooks/use-demo-state";

export default function PredictionsPage() {
  const { products, error, loading } = useDemoState();
  return (
    <div className="space-y-4">
      <Link href="/merchant" className="underline">← Back to merchant</Link>
      {error ? <p role="alert" className="text-destructive">{error}</p>
        : loading ? <p>Loading inventory...</p>
        : products[0] ? <PredictionPanel product={products[0]} />
        : <p>No product found. Reset the demo from Merchant.</p>}
    </div>
  );
}
