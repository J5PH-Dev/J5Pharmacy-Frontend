export interface CartItem {
  itemCode: string;
  productName: string;
  requiresPrescription: boolean;
  brand: string;
  category: string;
  dosage: string;
  price: number;
  quantity: number;
  amount: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
}
