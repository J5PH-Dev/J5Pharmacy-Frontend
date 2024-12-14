import { CartItem } from '../../types/cart';
import { HeldTransaction } from '../../types/transaction';

export interface CartState {
  items: CartItem[];
  totals: {
    subtotal: number;
    totalDiscount: number;
    total: number;
    itemCount: number;
  };
  prescriptionRequired: boolean;
  prescriptionVerified: boolean;
}

export interface FunctionHandlerProps {
  cartState: CartState;
  onAddProduct?: (product: CartItem) => void;
  onClearCart?: () => void;
  onRecallTransaction?: (transaction: HeldTransaction) => void;
  isCheckoutOpen?: boolean;
  setSearchDialogOpen?: (open: boolean) => void;
  setReportsDialogOpen?: (open: boolean) => void;
  setConfirmationDialogOpen?: (open: boolean) => void;
} 