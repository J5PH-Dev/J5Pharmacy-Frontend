export interface Discount {
  id: string;
  name: string;
  percentage: number;
}

export type DiscountType = 'percentage' | 'fixed';

export interface DiscountState {
  activeDiscounts: Discount[];
}