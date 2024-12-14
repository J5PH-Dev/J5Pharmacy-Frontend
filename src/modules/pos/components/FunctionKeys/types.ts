import { CartItem } from '../../types/cart';
import { HeldTransaction } from '../../types/transaction';

export interface FunctionHandlerProps {
  cartState: {
    items: CartItem[];
    totals: {
      subtotal: number;
      totalDiscount: number;
      total: number;
      itemCount: number;
    };
    prescriptionRequired: boolean;
    prescriptionVerified: boolean;
  };
  onAddProduct?: (product: CartItem) => void;
  onClearCart?: () => void;
  onHoldTransaction?: () => void;
  onRecallTransaction?: (transaction: HeldTransaction) => void;
  isCheckoutOpen?: boolean;
  setSearchDialogOpen?: (open: boolean) => void;
  setRecallDialogOpen?: (open: boolean) => void;
  setHoldDialogOpen?: (open: boolean) => void;
  setReportsDialogOpen?: (open: boolean) => void;
  setConfirmationDialogOpen?: (open: boolean) => void;
  setProcessReturnDialogOpen?: (open: boolean) => void;
} 