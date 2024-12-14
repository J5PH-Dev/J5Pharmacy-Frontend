import { HandlerProps } from '../types';

export const handleSearchProduct = (props: HandlerProps) => () => {
  if (props.isCheckoutOpen) return;
  props.setSearchDialogOpen(true);
};

export const handleNewTransaction = (props: HandlerProps) => () => {
  if (props.isCheckoutOpen) return;
  if (props.cartState.items.length > 0) {
    props.setConfirmationDialogOpen(true);
  }
};

export const handleHoldTransaction = (props: HandlerProps) => () => {
  if (props.isCheckoutOpen) return;
  if (props.cartState.items.length === 0) {
    console.log('Cannot hold an empty transaction');
    return;
  }
  props.setHoldDialogOpen(true);
};

export const handleRecallTransaction = (props: HandlerProps) => () => {
  if (props.isCheckoutOpen) return;
  props.setRecallDialogOpen(true);
};

export const handlePrescription = (props: HandlerProps) => () => {
  if (props.isCheckoutOpen) return;
  props.setPrescriptionDialogOpen(true);
};

export const handleProcessReturn = (props: HandlerProps) => () => {
  if (props.isCheckoutOpen) return;
  props.setProcessReturnDialogOpen(true);
};

export const handleViewReports = (props: HandlerProps) => () => {
  if (props.isCheckoutOpen) return;
  props.setReportsDialogOpen(true);
};

export const handleSystemSettings = (props: HandlerProps) => () => {
  if (props.isCheckoutOpen) return;
  console.log('System Settings clicked');
};

export const handleNotifications = (props: HandlerProps) => () => {
  if (props.isCheckoutOpen) return;
  console.log('Notifications clicked');
}; 