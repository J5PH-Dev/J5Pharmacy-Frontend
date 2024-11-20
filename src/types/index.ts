// Customer Types
export interface Customer {
  id: string;
  name: string;
  starPointsId?: string;
  starPoints: number;
}

// Product Types
export interface Product {
  itemCode: string;
  productName: string;
  requiresPrescription: boolean;
  brand: string;
  category: string;
  dosage: string;
  price: number;
}

// Cart Item Type
export interface CartItem extends Product {
  quantity: number;
  amount: number;
}

// Transaction Types
export interface Transaction {
  id: string;
  customerId?: string;
  items: CartItem[];
  subtotal: number;
  discountType?: 'SENIOR' | 'PWD' | 'EMPLOYEE' | 'CUSTOM' | 'NONE';
  discountAmount: number;
  vat: number;
  total: number;
  starPointsEarned: number;
  timestamp: Date;
}

// Function Key Types
export type FunctionKeyAction = 'NEW_TRANSACTION' | 'PRICE_INQUIRY' | 'DISCOUNT_ITEM' | 
  'RETURN' | 'HOLD' | 'PRESCRIPTION' | 'REPORTS' | 'CUSTOMER_HISTORY' | 
  'NOTIFICATION' | 'LOGOUT';

export interface FunctionKey {
  key: string;
  label: string;
  action: FunctionKeyAction;
  icon?: string;
}
