"use client";

import { useCallback, useEffect, useState } from "react";
import { getOffers, getProducts, getReservations } from "@/lib/demo-store";
import type { Offer, Product, Reservation } from "@/types/foodrescue";

interface Snapshot { products: Product[]; offers: Offer[]; reservations: Reservation[] }

export function useDemoState() {
  const [data, setData] = useState<Snapshot>({ products: [], offers: [], reservations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = useCallback(() => {
    try {
      setData({ products: getProducts(), offers: getOffers(), reservations: getReservations() });
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Cannot load demo data.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    // Browser storage cannot be read during server rendering.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key === "foodrescue-demo-v1") refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("foodrescue:updated", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("foodrescue:updated", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
    };
  }, [refresh]);
  return { ...data, loading, error, refresh };
}
