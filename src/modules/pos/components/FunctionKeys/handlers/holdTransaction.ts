import { FunctionHandlerProps } from '../types';

export const handleHoldTransaction = (props: FunctionHandlerProps) => {
  return () => {
    const { cartState } = props;
    
    // Check if cart is empty
    if (cartState.items.length === 0) {
      // Show error message that cart is empty
      return;
    }

    // Check if cart has prescription items but prescription is not verified
    if (cartState.prescriptionRequired && !cartState.prescriptionVerified) {
      // Show error message that prescription needs to be verified first
      return;
    }

    const timestamp = new Date().toISOString();
    
    // Create a held transaction object
    const heldTransaction = {
      id: `HOLD-${Date.now()}`,
      items: cartState.items,
      total: cartState.totals.total,
      timestamp: timestamp,
      holdTimestamp: timestamp,
      status: 'held' as const,
      prescriptionRequired: cartState.prescriptionRequired,
      prescriptionVerified: cartState.prescriptionVerified,
      customerId: undefined, // Add if available in cartState
      customerName: undefined, // Add if available in cartState
      starPointsId: undefined, // Add if available in cartState
      discountType: 'None' as const
    };

    // Add to held transactions (this should be handled by the parent component)
    props.onHoldTransaction?.(heldTransaction);
  };
}; 