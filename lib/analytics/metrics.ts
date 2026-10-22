import type { Offer, Reservation } from "@/types/foodrescue";

export interface ImpactMetrics {
  itemsRescued: number;
  revenueRecovered: number;
  reservedItems: number;
}

/** Demo outcomes come from confirmed pickups, never from forecasts. */
export function calculateImpact(
  offers: Offer[],
  reservations: Reservation[]
): ImpactMetrics {
  const offersById = new Map(offers.map((offer) => [offer.id, offer]));
  let itemsRescued = 0;
  let revenueCents = 0;
  let reservedItems = 0;

  for (const reservation of reservations) {
    const offer = offersById.get(reservation.offerId);
    if (
      !offer ||
      !Number.isSafeInteger(reservation.quantity) ||
      reservation.quantity <= 0
    ) {
      continue;
    }

    if (reservation.status === "reserved") {
      reservedItems += reservation.quantity;
    } else if (reservation.status === "collected") {
      if (
        !Number.isFinite(offer.discountedPrice) ||
        offer.discountedPrice < 0
      ) {
        continue;
      }
      itemsRescued += reservation.quantity;
      revenueCents +=
        Math.round((offer.discountedPrice + Number.EPSILON) * 100) *
        reservation.quantity;
    }
  }

  return {
    itemsRescued,
    revenueRecovered: revenueCents / 100,
    reservedItems,
  };
}
