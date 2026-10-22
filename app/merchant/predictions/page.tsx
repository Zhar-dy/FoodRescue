"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { predictSurplus, PredictionResult, Product } from "@/lib/prediction";

export default function PredictionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("p-bun");
  const [currentStock, setCurrentStock] = useState<number>(18);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  useEffect(() => {
    // Fallback default product for Chocolate Bun
    const defaultProduct: Product = { id: "p-bun", name: "Chocolate Bun", stock: 18 };
    setProducts([defaultProduct]);
  }, []);

  useEffect(() => {
    const activeProduct = products.find((p) => p.id === selectedProductId) || {
      id: "p-bun",
      name: "Chocolate Bun",
      stock: currentStock,
    };

    const targetProduct = { ...activeProduct, stock: currentStock };
    const res = predictSurplus(targetProduct);
    setPrediction(res);
  }, [selectedProductId, currentStock, products]);

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leftover Prediction</h1>
          <p className="text-gray-500 text-sm">
            Baseline forecasting for daily surplus estimation[cite: 1].
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-amber-600 font-medium">
          Synthetic Dataset Baseline[cite: 1]
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Parameters Card */}
        <div className="p-6 border rounded-xl bg-card shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Inventory Inputs</h2>
          <p className="text-xs text-gray-500">Adjust stock to test baseline forecasting[cite: 1].</p>

          <div className="space-y-2">
            <label htmlFor="product-select" className="text-sm font-medium block">Product</label>
            <select
              id="product-select"
              className="w-full h-10 px-3 rounded-md border text-sm bg-background"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="stock-input" className="text-sm font-medium block">Current Stock</label>
            <input
              id="stock-input"
              type="number"
              min="0"
              className="w-full h-10 px-3 rounded-md border text-sm bg-background"
              value={currentStock}
              onChange={(e) => setCurrentStock(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>

          <div className="space-y-2 text-sm text-gray-500 pt-2 border-t">
            <div className="flex justify-between">
              <span>Current Time (Fixed Demo):</span>
              <span className="font-semibold text-foreground">7:30 PM[cite: 1]</span>
            </div>
            <div className="flex justify-between">
              <span>Closing Time:</span>
              <span className="font-semibold text-foreground">9:00 PM[cite: 1]</span>
            </div>
          </div>
        </div>

        {/* Prediction Output Card */}
        <div className="p-6 border rounded-xl bg-blue-50/20 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold">Prediction Summary</h2>
            <p className="text-xs text-gray-500 mb-4">Estimated leftovers before closing[cite: 1].</p>

            {prediction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-background rounded-lg border">
                    <p className="text-xs text-gray-500">Expected Remaining Sales</p>
                    <p className="text-2xl font-bold">{prediction.expectedRemainingSales}</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg border border-blue-400">
                    <p className="text-xs text-gray-500">Predicted Leftovers</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{prediction.predictedLeftovers}</p>
                  </div>
                </div>

                <div className="p-3 bg-background/80 rounded-md border text-xs space-y-1">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">Model Explanation</span>
                  <p className="text-gray-500 leading-relaxed">{prediction.explanation}</p>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/merchant/recommendations"
            className="w-full mt-4 inline-flex items-center justify-center h-10 px-4 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
          >
            View Surplus Recommendations &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}