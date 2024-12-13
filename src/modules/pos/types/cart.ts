export interface Product {
  id: number;
  name: string;
  description?: string;
  dosage_amount: number;
  dosage_unit: 'mg' | 'ml' | 'g' | 'tablet';
  price: number;
  stock: number;
  SKU: 'Piece' | 'Box';
  category: string;
  barcode?: string;
  requiresPrescription: boolean;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: number;
  name: string;
  dosage_amount: number;
  dosage_unit: 'mg' | 'ml' | 'g' | 'tablet';
  price: number;
  quantity: number;
  SKU: 'Piece' | 'Box';
  category: string;
  barcode?: string;
  requiresPrescription: boolean;
  expiryDate: string;
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
