"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Leaf,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Store,
  TicketCheck,
  Utensils,
} from "lucide-react";
import {
  getOffers,
  getReservations,
  reserveOffer,
} from "@/lib/demo-store";
import type { Offer, Reservation } from "@/types/foodrescue";

const DEMO_DISTANCE = "600 m";
const DEMO_MERCHANT = "ABC Bakery";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(amount);
}

function formatDeadline(deadline: string) {
  if (/^\d{2}:\d{2}$/.test(deadline)) {
    const [hourText, minuteText] = deadline.split(":");
    const hour = Number(hourText);
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minuteText} ${suffix}`;
  }
  return deadline;
}

function readableStatus(status: Reservation["status"]) {
  if (status === "collected") return "Collected";
  if (status === "cancelled") return "Cancelled";
  return "Reserved";
}

export default function RescuePage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [busyOfferId, setBusyOfferId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    try {
      setOffers(getOffers());
      setReservations(getReservations());
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We couldn’t load the rescue offers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    // A merchant may confirm collection in another tab. Keep the shared
    // localStorage-backed demo view fresh without adding another data store.
    function onStorage(event: StorageEvent) {
      if (!event.key || event.key === "foodrescue-demo-v1") reload();
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [reload]);

  const reservationDetails = useMemo(
    () =>
      reservations.map((reservation) => ({
        reservation,
        offer: offers.find((offer) => offer.id === reservation.offerId),
      })),
    [offers, reservations]
  );

  function changeQuantity(offer: Offer, next: number) {
    const maximum = Math.max(1, offer.quantityRemaining);
    setQuantities((current) => ({
      ...current,
      [offer.id]: Math.min(maximum, Math.max(1, next)),
    }));
  }

  function handleReserve(offer: Offer) {
    if (busyOfferId) return;

    const quantity = quantities[offer.id] ?? 1;
    setError("");
    setNotice("");
    setBusyOfferId(offer.id);

    try {
      if (offer.quantityRemaining < 1) {
        throw new Error("This offer is sold out.");
      }
      if (!Number.isSafeInteger(quantity) || quantity < 1) {
        throw new Error("Choose a quantity of at least one item.");
      }
      if (quantity > offer.quantityRemaining) {
        throw new Error("There aren’t enough items left for that quantity.");
      }

      const reservation = reserveOffer(offer.id, quantity);
      setNotice(
        `Reservation confirmed — ${quantity} × ${offer.productName}. Your reservation is saved on this device.`
      );
      setQuantities((current) => ({ ...current, [offer.id]: 1 }));
      setReservations((current) => [...current, reservation]);
      setOffers(getOffers());
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We couldn’t complete your reservation. Please try again."
      );
      reload();
    } finally {
      setBusyOfferId(null);
    }
  }

  const availableCount = offers.reduce(
    (total, offer) => total + offer.quantityRemaining,
    0
  );
  const activeReservations = reservations.filter(
    (reservation) => reservation.status === "reserved"
  ).length;

  return (
    <main className="min-h-screen bg-[#f7f8f2] text-[#1e2b24]">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-5 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between gap-4">
          <Link href="/rescue" className="inline-flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">
            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-800 text-white">
              <Leaf className="size-5" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-bold tracking-tight">FoodRescue</span>
              <span className="block text-xs text-[#6e7a70]">Good food, rescued.</span>
            </span>
          </Link>
          <a
            href="#my-reservations"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#dce3d8] bg-white px-3 py-2 text-sm font-semibold transition hover:border-emerald-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 sm:px-4"
          >
            <TicketCheck className="size-4" aria-hidden="true" />
            <span>My reservations</span>
            {activeReservations > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-900">
                {activeReservations}
              </span>
            )}
          </a>
        </nav>

        <section className="relative mt-7 overflow-hidden rounded-[2rem] bg-[#163d2c] px-6 py-8 text-white sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-12 -top-20 size-72 rounded-full border border-white/10 sm:right-10 sm:top-[-7rem] sm:size-96" />
          <div className="pointer-events-none absolute -right-4 top-12 size-44 rounded-full border border-white/10 sm:right-24 sm:size-56" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-100">
              <Sparkles className="size-3.5" aria-hidden="true" />
              RESCUE MORE. WASTE LESS.
            </span>
            <h1 className="mt-5 max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Great food deserves
              <span className="block text-[#b9edaa]">a second chance.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-emerald-50/85 sm:text-base">
              Discover end-of-day bakery favourites at a lovely price. Reserve what you need and collect it before closing.
            </p>
            <a href="#available-offers" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#c1edae] px-5 py-3 text-sm font-bold text-[#173d2c] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              Explore offers <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
          <div className="relative mt-8 grid max-w-xl grid-cols-2 gap-3 sm:absolute sm:bottom-8 sm:right-8 sm:mt-0 sm:w-72 sm:grid-cols-1">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-emerald-100/80">Available portions</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{loading ? "—" : availableCount}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-emerald-100/80">Nearby demo store</p>
              <p className="mt-1 flex items-center gap-2 text-base font-semibold">
                <MapPin className="size-4 text-[#c1edae]" aria-hidden="true" />
                {DEMO_DISTANCE} away
              </p>
            </div>
          </div>
        </section>

        {notice && (
          <div role="status" className="mt-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden="true" />
            <div>
              <p className="font-bold">You’re all set!</p>
              <p className="mt-1 leading-5">{notice}</p>
              <a href="#my-reservations" className="mt-2 inline-flex items-center gap-1 font-semibold underline underline-offset-4">
                View my reservations <ArrowRight className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        )}
        {error && (
          <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-semibold">We couldn’t complete that action.</p>
            <p className="mt-1">{error}</p>
            <button type="button" onClick={reload} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-full border border-red-200 bg-white px-3 font-semibold hover:bg-red-100">
              <RefreshCw className="size-4" aria-hidden="true" /> Try again
            </button>
          </div>
        )}

        <section id="available-offers" className="mt-10 scroll-mt-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Fresh finds, better prices</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Available rescue offers</h2>
              <p className="mt-2 text-sm text-[#6e7a70]">Small-batch bakery picks, ready for collection.</p>
            </div>
            <button type="button" onClick={reload} disabled={loading || Boolean(busyOfferId)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#dce3d8] bg-white px-4 text-sm font-semibold transition hover:border-emerald-700 disabled:opacity-50">
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {[0, 1].map((item) => (
                <div key={item} className="animate-pulse rounded-3xl border border-[#e0e7dd] bg-white p-5">
                  <div className="h-40 rounded-2xl bg-[#edf1e9]" />
                  <div className="mt-5 h-5 w-1/2 rounded bg-[#edf1e9]" />
                  <div className="mt-3 h-4 w-2/3 rounded bg-[#edf1e9]" />
                  <div className="mt-5 h-10 rounded-xl bg-[#edf1e9]" />
                </div>
              ))}
            </div>
          ) : offers.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-[#cbd8c8] bg-white px-6 py-10 text-center sm:px-10">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#edf4e8] text-emerald-900">
                <ShoppingBag className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold">No offers just yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6e7a70]">
                The bakery hasn’t published a rescue offer. Check back shortly, or open the merchant demo to publish the sample offer.
              </p>
              <Link href="/merchant" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-900">
                Open merchant demo <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => {
                const quantity = quantities[offer.id] ?? 1;
                const soldOut = offer.quantityRemaining <= 0;
                const discount = offer.originalPrice > 0
                  ? Math.round((1 - offer.discountedPrice / offer.originalPrice) * 100)
                  : 0;
                const submitting = busyOfferId === offer.id || busyOfferId !== null;

                return (
                  <article key={offer.id} className="flex flex-col overflow-hidden rounded-3xl border border-[#e0e7dd] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="relative flex h-44 items-end justify-between overflow-hidden bg-[#eaf0df] p-5">
                      <div className="absolute -right-5 -top-8 size-40 rounded-full bg-[#d9e8c9]" />
                      <div className="absolute right-12 top-10 size-20 rounded-full border-2 border-white/60" />
                      <div className="relative flex size-16 items-center justify-center rounded-2xl bg-white/80 text-emerald-900 shadow-sm">
                        <Utensils className="size-8" aria-hidden="true" />
                      </div>
                      {discount > 0 && (
                        <span className="relative rounded-full bg-emerald-800 px-3 py-1.5 text-xs font-bold text-white">
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold leading-snug">{offer.productName}</h3>
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6e7a70]">
                            <Store className="size-4" aria-hidden="true" /> {DEMO_MERCHANT}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-[#f3f6ef] px-2.5 py-1 text-xs font-medium text-[#536458]">
                          {DEMO_DISTANCE} · demo distance
                        </span>
                      </div>

                      <div className="mt-4 flex items-end gap-2">
                        <span className="text-2xl font-bold tracking-tight text-emerald-900">{formatMoney(offer.discountedPrice)}</span>
                        <span className="pb-0.5 text-sm text-[#839087] line-through">{formatMoney(offer.originalPrice)}</span>
                        <span className="pb-1 text-xs text-[#6e7a70]">/ item</span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-[#f7f8f2] p-3">
                        <div>
                          <p className="text-xs text-[#6e7a70]">Remaining</p>
                          <p className={`mt-1 text-sm font-bold ${soldOut ? "text-red-700" : "text-[#24392c]"}`}>
                            {soldOut ? "Sold out" : `${offer.quantityRemaining} available`}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6e7a70]">Pickup before</p>
                          <p className="mt-1 flex items-center gap-1 text-sm font-bold">
                            <Clock3 className="size-3.5" aria-hidden="true" />
                            {formatDeadline(offer.pickupDeadline)}
                          </p>
                        </div>
                      </div>

                      {soldOut ? (
                        <div className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#f1f2ed] px-4 text-sm font-semibold text-[#778077]">
                          <PackageCheck className="size-4" aria-hidden="true" /> All portions reserved
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          <div>
                            <label htmlFor={`quantity-${offer.id}`} className="mb-2 block text-sm font-semibold">How many would you like?</label>
                            <div className="flex h-11 items-center justify-between rounded-xl border border-[#dce3d8] px-2">
                              <button type="button" onClick={() => changeQuantity(offer, quantity - 1)} disabled={quantity <= 1 || submitting} aria-label={`Decrease quantity for ${offer.productName}`} className="flex size-8 items-center justify-center rounded-lg transition hover:bg-[#edf4e8] disabled:opacity-40">
                                <Minus className="size-4" aria-hidden="true" />
                              </button>
                              <input
                                id={`quantity-${offer.id}`}
                                type="number"
                                inputMode="numeric"
                                min={1}
                                max={offer.quantityRemaining}
                                step={1}
                                value={quantity}
                                disabled={submitting}
                                onChange={(event) => {
                                  const value = Number(event.target.value);
                                  if (event.target.value === "") {
                                    setQuantities((current) => ({ ...current, [offer.id]: 1 }));
                                    return;
                                  }
                                  changeQuantity(offer, Number.isFinite(value) ? value : 1);
                                }}
                                className="w-14 border-0 bg-transparent text-center text-sm font-bold outline-none focus:ring-0 disabled:opacity-50"
                              />
                              <button type="button" onClick={() => changeQuantity(offer, quantity + 1)} disabled={quantity >= offer.quantityRemaining || submitting} aria-label={`Increase quantity for ${offer.productName}`} className="flex size-8 items-center justify-center rounded-lg transition hover:bg-[#edf4e8] disabled:opacity-40">
                                <Plus className="size-4" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#6e7a70]">Estimated total</span>
                            <span className="font-bold">{formatMoney(offer.discountedPrice * quantity)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleReserve(offer)}
                            disabled={submitting || quantity < 1 || quantity > offer.quantityRemaining || !Number.isSafeInteger(quantity)}
                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#b7c4b6]"
                          >
                            {submitting ? "Reserving…" : "Reserve offer"}
                            {!submitting && <ArrowRight className="size-4" aria-hidden="true" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section id="my-reservations" className="mt-14 scroll-mt-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Your saved picks</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">My reservations</h2>
              <p className="mt-2 text-sm text-[#6e7a70]">Keep your collection details handy.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#536458] ring-1 ring-[#e0e7dd]">
              <RefreshCw className="size-3.5" aria-hidden="true" /> Saved on this device
            </span>
          </div>

          {loading ? (
            <p className="mt-5 rounded-2xl border border-[#e0e7dd] bg-white p-5 text-sm text-[#6e7a70]">Loading your reservations…</p>
          ) : reservationDetails.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-[#cbd8c8] bg-white px-6 py-8 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#edf4e8] text-emerald-900">
                <TicketCheck className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 font-bold">No reservations yet</h3>
              <p className="mt-1 text-sm text-[#6e7a70]">When you reserve an offer, the details will appear here.</p>
              <a href="#available-offers" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#dce3d8] px-4 text-sm font-semibold hover:bg-[#f7f8f2]">
                Browse offers <ArrowDownRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {reservationDetails.map(({ reservation, offer }) => (
                <article key={reservation.id} className="rounded-3xl border border-[#e0e7dd] bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#edf4e8] text-emerald-900">
                        <ShoppingBag className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-bold">{offer?.productName ?? "Unavailable offer"}</h3>
                        <p className="mt-1 text-sm text-[#6e7a70]">{DEMO_MERCHANT}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${reservation.status === "collected" ? "bg-emerald-100 text-emerald-900" : reservation.status === "cancelled" ? "bg-[#f1f2ed] text-[#68736a]" : "bg-amber-50 text-amber-900"}`}>
                      {readableStatus(reservation.status)}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-[#f7f8f2] p-3">
                    <div>
                      <p className="text-xs text-[#6e7a70]">Reserved quantity</p>
                      <p className="mt-1 font-bold">{reservation.quantity} item{reservation.quantity === 1 ? "" : "s"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6e7a70]">Pickup deadline</p>
                      <p className="mt-1 font-bold">{offer ? formatDeadline(offer.pickupDeadline) : "Ask merchant"}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[#6e7a70]">
                    Reservation reference: <span className="font-mono">{reservation.id.slice(0, 8).toUpperCase()}</span>
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-12 flex flex-col justify-between gap-3 border-t border-[#e0e7dd] pt-6 text-xs text-[#778077] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} FoodRescue · Saving good food, one pickup at a time.</p>
          <div className="flex items-center gap-2">
            <Leaf className="size-4" aria-hidden="true" />
            <span>Demo resident experience · no payment required</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
