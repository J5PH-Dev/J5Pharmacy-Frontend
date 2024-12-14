import { CartState } from '../../types/cart';

export interface HandlerProps {
  cartState: CartState;
  onAddProduct: (product: any) => void;
  onClearCart: () => void;
  onRecallTransaction: (transaction: any) => void;
  isCheckoutOpen: boolean;
  setSearchDialogOpen: (open: boolean) => void;
  setReportsDialogOpen: (open: boolean) => void;
  setConfirmationDialogOpen: (open: boolean) => void;
  setRecallDialogOpen: (open: boolean) => void;
  setHoldDialogOpen: (open: boolean) => void;
  setProcessReturnDialogOpen: (open: boolean) => void;
  setPrescriptionDialogOpen: (open: boolean) => void;
}

// Alias for backward compatibility
export type FunctionHandlerProps = HandlerProps; 