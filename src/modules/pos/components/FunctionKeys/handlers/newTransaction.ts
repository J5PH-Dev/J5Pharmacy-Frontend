import { FunctionHandlerProps } from '../types';

export const handleNewTransaction = (props: FunctionHandlerProps) => {
  return () => {
    if (props.cartState.items.length > 0) {
      // Open confirmation dialog if defined
      props.setConfirmationDialogOpen?.(true);
    } else {
      // No items in cart, proceed with new transaction
      props.onClearCart?.();
      console.log('New transaction started');
    }
  };
}; 