import { VenueOption } from './types';

export interface VenueGuestEstimate {
  guestCount: number;
  isOverCapacity: boolean;
  maxCapacity: number;
  capacityDelta: number;
  rentalFee: number;
  cateringBuyoutTotal: number;
  estimatedFoodAndBeverage: number;
  serviceChargeAmount: number;
  taxAmount: number;
  estimatedTotalCost: number;
  costPerGuest: number;
  breakdownSummary: string;
}

/**
 * Calculates a realistic all-in wedding cost estimate for a venue based on
 * a couple's anticipated guest count, historical buyout rates, and state tax/service fees.
 */
export function calculateVenueEstimateForGuests(
  venue: VenueOption,
  guestCount: number,
  estimatedCateringPerGuest: number = 65
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

  // Desi Wedding Food & Beverage calculation:
  // Includes Indian catering estimate (~$65/plate standard multi-course buffet) plus venue buyout/bar spend,
  // respecting the venue's historical Food & Beverage minimum if applicable.
  const calculatedFB = (buyoutFeePerGuest + estimatedCateringPerGuest) * safeGuests;
  const fbMinimum = venue.pricing?.foodAndBeverageMinimum || 0;
  const estimatedFoodAndBeverage = Math.max(fbMinimum, calculatedFB);

  const subtotal = rentalFee + estimatedFoodAndBeverage;
  const serviceChargeAmount = Math.round(subtotal * serviceChargePct);
  const taxAmount = Math.round((subtotal + serviceChargeAmount) * taxPct);
  const estimatedTotalCost = Math.round(subtotal + serviceChargeAmount + taxAmount);
  const costPerGuest = Math.round(estimatedTotalCost / safeGuests);

  const breakdownSummary = `${safeGuests} guests • ~$${costPerGuest}/guest all-in (rental + F&B + ${serviceChargePercent}% svc + ${taxPercent}% tax)`;

  return {
    guestCount: safeGuests,
    isOverCapacity,
    maxCapacity,
    capacityDelta,
    rentalFee,
    cateringBuyoutTotal,
    estimatedFoodAndBeverage,
    serviceChargeAmount,
    taxAmount,
    estimatedTotalCost,
    costPerGuest,
    breakdownSummary,
  };
}
