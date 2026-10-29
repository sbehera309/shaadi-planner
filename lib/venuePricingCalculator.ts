import { VenueOption } from './types';

export interface VenueGuestEstimate {
  guestCount: number;
  isOverCapacity: boolean;
  maxCapacity: number;
  capacityDelta: number;
  rentalFee: number;
  cateringBuyoutFeePerGuest: number;
  cateringBuyoutTotal: number;
  subtotal: number;
  serviceChargePercent: number;
  serviceChargeAmount: number;
  taxPercent: number;
  taxAmount: number;
  estimatedTotalCost: number; // Pure Venue Contract Total
  costPerGuest: number;       // Pure Venue Cost Per Guest
  breakdownSummary: string;
}

/**
 * Calculates a realistic venue contract estimate based on the couple's anticipated guest count.
 *
 * NOTE: As requested by users, this calculation strictly computes the VENUE'S direct bill:
 * 1. Venue Rental Fee (ballroom / grounds / property fee)
 * 2. Venue Outside Catering Buyout / Kitchen Fee ($10–$25/guest for venue kitchen usage, tables/chairs, waitstaff)
 * 3. Venue Service Charge (~20–24%)
 * 4. State Sales Tax (NJ 6.625% / PA 8.0%)
 *
 * It intentionally EXCLUDES separate outside food catering vendor costs (such as Moghul, Bukhara Grill,
 * Chowpatty, etc. charging $50–$85/plate), which belong under the Food & Beverage Vendor budget category.
 */
export function calculateVenueEstimateForGuests(
  venue: VenueOption,
  guestCount: number,
  _ignoredLegacyFoodRate?: number
): VenueGuestEstimate {
  const safeGuests = Math.max(1, guestCount || 350);
  const maxCapacity = venue.desiFeatures?.maxReceptionCapacity || 500;
  const isOverCapacity = safeGuests > maxCapacity;
  const capacityDelta = Math.max(0, safeGuests - maxCapacity);

  const rentalFee = venue.pricing?.rentalFee || 15000;
  const buyoutFeePerGuest = venue.pricing?.cateringBuyoutFeePerGuest || 14;
  const cateringBuyoutTotal = Math.round(buyoutFeePerGuest * safeGuests);

  const serviceChargePercent = venue.pricing?.serviceChargePercent || 22;
  const serviceChargePct = serviceChargePercent / 100;
  const taxPercent = venue.pricing?.taxPercent || (venue.state === 'PA' ? 8.0 : 6.625);
  const taxPct = taxPercent / 100;

  // Venue charges:
  // If outside catering is allowed, the venue charges Rental + Outside Catering Buyout Total.
  // If outside catering is not allowed, the venue requires in-house F&B minimum.
  let subtotal = rentalFee + cateringBuyoutTotal;
  if (venue.desiFeatures?.allowsOutsideIndianCatering === false && venue.pricing?.foodAndBeverageMinimum) {
    subtotal = rentalFee + venue.pricing.foodAndBeverageMinimum;
  }

  const serviceChargeAmount = Math.round(subtotal * serviceChargePct);
  const taxAmount = Math.round((subtotal + serviceChargeAmount) * taxPct);
  const estimatedTotalCost = Math.round(subtotal + serviceChargeAmount + taxAmount);
  const costPerGuest = Math.round(estimatedTotalCost / safeGuests);

  const breakdownSummary = `${safeGuests} guests • ~$${costPerGuest}/guest venue fee (${rentalFee > 0 ? `rental + $${buyoutFeePerGuest}/pp buyout + ` : ''}${serviceChargePercent}% svc + ${taxPercent}% tax)`;

  return {
    guestCount: safeGuests,
    isOverCapacity,
    maxCapacity,
    capacityDelta,
    rentalFee,
    cateringBuyoutFeePerGuest: buyoutFeePerGuest,
    cateringBuyoutTotal,
    subtotal,
    serviceChargePercent,
    serviceChargeAmount,
    taxPercent,
    taxAmount,
    estimatedTotalCost,
    costPerGuest,
    breakdownSummary,
  };
}
