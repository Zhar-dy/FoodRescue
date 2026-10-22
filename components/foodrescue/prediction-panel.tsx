"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { predictSurplus } from "@/lib/prediction";
import { getForecastContext } from "@/lib/prediction/context";
import type { Product } from "@/types/foodrescue";

export function PredictionPanel({ product }: { product: Product }) {
  const prediction = predictSurplus(product);
  const context = getForecastContext(product);
  const metrics = prediction.evaluation;
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-bold tracking-tight">Leftover Prediction</h1><p className="mt-2 text-sm text-muted-foreground">Machine-learning forecast before closing.</p></div>
        <Badge variant="outline">{prediction.method === "trained-tree" ? "Trained decision tree" : prediction.method === "closed" ? "Bakery closed" : "Baseline fallback"}</Badge>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Saved merchant inputs</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="font-semibold">{product.name}</p>
            <p>Current stock: {product.currentStock}</p>
            <p>Sales so far: {context.salesSoFar}</p>
            <p>Demo date: {context.date}</p>
            <p>Demo time: {context.time} · Closing: 21:00</p>
            <Link href="/merchant" className="inline-block font-semibold text-emerald-800 underline">Edit inventory and forecast inputs</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Prediction summary</CardTitle></CardHeader>
          <CardContent className="space-y-4" aria-live="polite">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Expected remaining sales</p><p className="text-3xl font-bold">{prediction.expectedRemainingSales}</p></div>
              <div className="rounded-lg border border-emerald-700 p-3"><p className="text-xs text-muted-foreground">Predicted leftovers</p><p className="text-3xl font-bold text-emerald-800">{prediction.predictedUnsold}</p></div>
            </div>
            <p className="text-sm leading-6">{prediction.explanation}</p>
            <p className="text-sm text-muted-foreground">Average-based comparison: {prediction.baselineExpectedRemainingSales} expected regular sales. Counts are rounded and capped by physical stock.</p>
            <Link href="/merchant/recommendations" className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-emerald-800 px-4 text-sm font-medium text-white">View recommendations →</Link>
          </CardContent>
        </Card>
      </div>
      <section className="space-y-3 rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Synthetic-data evaluation</h2>
        <p className="text-sm leading-6">Trained on {metrics.trainingDays} earlier synthetic days ({metrics.trainingSnapshots} snapshots); tested on {metrics.testDays} later days ({metrics.testSnapshots} snapshots). Dates stay separate.</p>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <p>Decision-tree mean absolute error: <strong>{metrics.modelMAE.toFixed(2)} items</strong></p>
          <p>Average-based mean absolute error: <strong>{metrics.baselineMAE.toFixed(2)} items</strong></p>
        </div>
        <p className="text-sm text-muted-foreground">Error measures remaining regular sales before rounding or stock clipping. These are simulated records for one bakery product, not measured real-world accuracy or a confidence percentage. Inputs outside the trained sales range use a labelled baseline fallback.</p>
      </section>
    </div>
  );
}
