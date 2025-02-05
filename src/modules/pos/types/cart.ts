export interface Product {
  id: number;
  name: string;
  brand_name: string;
  description: string | null;
  sideEffects: string | null;
  dosage_amount: number | null;
  dosage_unit: 'mg' | 'mcg' | 'mg/ml' | 'ml' | 'g' | 'tablet' | null;
  price: number;
  stock: number;
  pieces_per_box: number;
  category: string;
  barcode: string | null;
  requiresPrescription: boolean;
  expiryDate: string | null;
  totalPieces: number;
  is_in_branch: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  discount?: number;
}

export interface ReceiptItem extends Omit<CartItem, 'discount'> {
  subtotal: number;
  discountAmount: number;
  total: number;
}

export interface CartTotals {
  subtotal: number;
  totalDiscount: number;
  total: number;
  itemCount: number;
}

export interface CartState {
  items: CartItem[];
  totals: CartTotals;
  prescriptionRequired: boolean;
  prescriptionVerified?: boolean;
}
