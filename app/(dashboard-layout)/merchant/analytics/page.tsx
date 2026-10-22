"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Coins, Leaf, PackageCheck, RefreshCw } from "lucide-react";
import { getOffers, getReservations } from "@/lib/demo-store";
import { calculateImpact, type ImpactMetrics } from "@/lib/analytics/metrics";

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [error, setError] = useState("");

  const refresh = useCallback(() => {
    try {
      setMetrics(calculateImpact(getOffers(), getReservations()));
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to load demo outcomes."
      );
    }
  }, []);

  useEffect(() => {
    // Initialize from browser-only storage after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("foodrescue:updated", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("foodrescue:updated", refresh);
    };
  }, [refresh]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            FoodRescue · Demo outcomes
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Every pickup counts</h1>
          <p className="max-w-2xl text-muted-foreground">
            Follow food collected, merchant revenue recovered, and reservations
            still waiting for pickup.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          Refresh totals
        </button>
      </header>

      {error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive">
          {error} Return to Merchant to reset the demo, or retry with Refresh totals.
        </p>
      )}

      {!metrics && !error && <p role="status">Loading demo outcomes…</p>}

      {metrics && (
        <>
          {error && <p className="text-sm text-muted-foreground">Showing the last loaded totals.</p>}
          <section aria-label="Impact totals" className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/30">
              <Leaf aria-hidden="true" className="mb-4 size-6 text-emerald-700 dark:text-emerald-400" />
              <p className="text-sm font-medium">Items rescued</p>
              <p className="mt-2 text-4xl font-bold tabular-nums">{metrics.itemsRescued}</p>
              <p className="mt-2 text-sm text-muted-foreground">Confirmed pickups only</p>
            </div>
            <div className="rounded-2xl border p-6">
              <Coins aria-hidden="true" className="mb-4 size-6 text-emerald-700 dark:text-emerald-400" />
              <p className="text-sm font-medium">Revenue recovered</p>
              <p className="mt-2 text-4xl font-bold tabular-nums">RM{metrics.revenueRecovered.toFixed(2)}</p>
              <p className="mt-2 text-sm text-muted-foreground">Collected items × rescue price</p>
            </div>
            <div className="rounded-2xl border p-6">
              <PackageCheck aria-hidden="true" className="mb-4 size-6 text-emerald-700 dark:text-emerald-400" />
              <p className="text-sm font-medium">Awaiting pickup</p>
              <p className="mt-2 text-4xl font-bold tabular-nums">{metrics.reservedItems}</p>
              <p className="mt-2 text-sm text-muted-foreground">Reserved items, not yet collected</p>
            </div>
          </section>

          {metrics.itemsRescued === 0 && metrics.reservedItems === 0 && (
            <section className="rounded-2xl border border-dashed p-6">
              <h2 className="text-lg font-semibold">Ready for the first rescue</h2>
              <p className="mt-2 text-muted-foreground">
                Publish an offer, reserve it as a resident, then confirm collection
                as the merchant. These totals will update after each step.
              </p>
              <Link href="/merchant/recommendations" className="mt-4 inline-block font-medium text-emerald-700 underline underline-offset-4 dark:text-emerald-400">
                Create a rescue offer →
              </Link>
            </section>
          )}
        </>
      )}

      <section className="rounded-2xl border p-6">
        <h2 className="text-lg font-semibold">A practical township benefit</h2>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <p><strong>Residents:</strong> discover affordable food close to home.</p>
          <p><strong>Merchants:</strong> recover some value from food likely to remain unsold.</p>
          <p><strong>Township:</strong> connect neighbours and local businesses around reducing avoidable waste.</p>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">
          These are prototype records, not measured pilot results. Revenue is an
          estimate of collected offer value; this demo does not process payments.
          Food weight, carbon savings, and real waste reduction have not been measured.
        </p>
      </section>
    </div>
  );
}
