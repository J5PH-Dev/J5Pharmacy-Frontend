import { FunctionHandlerProps } from '../types';

export const handleHoldTransaction = (props: FunctionHandlerProps) => {
  console.log('Hold Transaction Handler Created with props:', props);
  
  return () => {
    console.log('Hold Transaction Handler Called');
    const { cartState, setHoldDialogOpen } = props;
    console.log('Cart State:', cartState);
    console.log('setHoldDialogOpen function:', setHoldDialogOpen);
    
    // Check if cart is empty
    if (cartState.items.length === 0) {
      console.log('Cart is empty, showing error message');
      // TODO: Show error message
      return;
    }

    // Open the hold dialog regardless of prescription status
    // The prescription verification will be handled during checkout
    console.log('Attempting to open hold dialog');
    setHoldDialogOpen?.(true);
    console.log('Hold dialog open call completed');
  };
}; 