"use client";

import { useEffect, useState } from "react";
import { getProducts, updateStock } from "@/lib/demo-store";
import type { Product } from "@/types/foodrescue";

export default function MerchantPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setProducts(getProducts());
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Cannot load products."
      );
    }
  }, []);

  function handleStockUpdate(
  productId: string,
  form: HTMLFormElement) {
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Merchant Dashboard</h1>

      {error && <p role="alert">{error}</p>}

      {products.map((product) => (
        <div key={product.id} className="rounded-lg border p-4">
            <h2 className="font-semibold">{product.name}</h2>
            <p>Stock: {product.currentStock}</p>
            <p>Price: RM{product.originalPrice.toFixed(2)}</p>

            <form
            className="mt-3 flex gap-2"
            onSubmit={(event) => {
                event.preventDefault();
                handleStockUpdate(product.id, event.currentTarget);
            }}
            >
            <input
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
        </div>
        ))}
    </div>
  );
}