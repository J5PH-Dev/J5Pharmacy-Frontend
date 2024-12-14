import { FunctionHandlerProps } from '../types';
import { HeldTransaction } from '../../../types/transaction';

export const handleRecallTransaction = (props: FunctionHandlerProps) => {
  return () => {
    const { cartState, setRecallDialogOpen } = props;
    
    // Check if current cart is not empty
    if (cartState.items.length > 0) {
      // Show warning that current cart needs to be cleared first
      return;
    }

    // Open the recall dialog
    setRecallDialogOpen?.(true);
  };
}; 