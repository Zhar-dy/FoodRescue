"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { predictSurplus } from "@/lib/prediction";
import type { Product } from "@/types/foodrescue";

export function PredictionPanel({
  product,
  isPreview = false,
}: {
  product: Product;
  isPreview?: boolean;
}) {
  const [previewStock, setPreviewStock] = useState(String(product.currentStock));
  const stock = isPreview
    ? previewStock.trim() === "" ? Number.NaN : Number(previewStock)
    : product.currentStock;
  const validStock = Number.isSafeInteger(stock) && stock >= 0;
  const prediction = validStock
    ? predictSurplus({ ...product, currentStock: stock })
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leftover Prediction</h1>
          <p className="text-sm text-muted-foreground">Baseline forecasting before closing.</p>
        </div>
        <Badge variant="outline">Synthetic demo data</Badge>
      </div>

      {isPreview && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
          Demo inventory preview. Changes here are not saved. Merchant inventory
          will connect when P3&apos;s shared store is ready.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Inventory inputs</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Product</p>
              <p className="font-medium">{product.name}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prediction-stock">{isPreview ? "Preview stock" : "Current stock"}</Label>
              {isPreview ? (
                <Input
                  id="prediction-stock"
                  type="number"
                  min={0}
                  step={1}
                  value={previewStock}
                  onChange={(event) => setPreviewStock(event.target.value)}
                  aria-invalid={!validStock}
                  aria-describedby={!validStock ? "stock-error" : undefined}
                />
              ) : (
                <p id="prediction-stock" className="text-2xl font-semibold">{stock}</p>
              )}
              {!validStock && <p id="stock-error" role="alert" className="text-sm text-destructive">Enter a nonnegative whole number.</p>}
            </div>
            <dl className="space-y-2 border-t pt-3 text-sm">
              <div className="flex justify-between gap-2"><dt>Fixed demo time</dt><dd>7:30 PM</dd></div>
              <div className="flex justify-between gap-2"><dt>Closing time</dt><dd>9:00 PM</dd></div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Prediction summary</CardTitle></CardHeader>
          <CardContent className="space-y-4" aria-live="polite">
            {prediction ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Expected remaining sales</p>
                    <p className="text-3xl font-bold">{prediction.expectedRemainingSales}</p>
                  </div>
                  <div className="rounded-lg border border-primary/50 p-3">
                    <p className="text-xs text-muted-foreground">Predicted leftovers</p>
                    <p className="text-3xl font-bold text-primary">{prediction.predictedUnsold}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{prediction.explanation}</p>
              </>
            ) : <p className="text-sm text-muted-foreground">Enter valid stock to see the estimate.</p>}
            <Link
              href={`/merchant/recommendations?productId=${encodeURIComponent(product.id)}`}
              className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              View recommendations →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
