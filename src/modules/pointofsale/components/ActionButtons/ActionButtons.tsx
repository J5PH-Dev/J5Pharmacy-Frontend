import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Stack,
  Grid
} from '@mui/material';
import { DiscountType } from '../../types/discount';
import { CheckoutDialog } from './checkout/CheckoutDialog';
import CustomerDialog from './customer/CustomerDialog';
import DiscountDialog from './discount/DiscountDialog';
import { CartItem } from '../../types/cart';

interface ActionButtonsProps {
  onVoid: () => void;
  isCartEmpty: boolean;
  currentDiscount: DiscountType;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  discountedSubtotal: number;
  vat: number;
  total: number;
  onDiscount: (type: DiscountType, amount?: number, pointsUsed?: number) => void;
  onCheckout: (paymentDetails: any) => void;
  onCustomerSelect: (customer: any) => void;
  customerName: string;
  starPointsId: string;
  pointsBalance: number;
  isCheckoutDisabled: boolean;
  onPrescription: () => void;
  hasPrescriptionItems: boolean;
  prescriptionSaved: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onVoid,
  isCartEmpty,
  currentDiscount,
  items,
  subtotal,
  discountAmount,
  discountedSubtotal,
  vat,
  total,
  onDiscount,
  onCheckout,
  onCustomerSelect,
  customerName,
  starPointsId,
  pointsBalance,
  isCheckoutDisabled,
  onPrescription,
  hasPrescriptionItems,
  prescriptionSaved
}) => {
  const [openCheckout, setOpenCheckout] = useState(false);
  const [openCustomer, setOpenCustomer] = useState(false);
  const [openDiscount, setOpenDiscount] = useState(false);

  const handleApplyDiscount = (type: DiscountType, amount?: number, pointsUsed?: number) => {
    console.log('ActionButtons handling discount:', {
      type,
      amount,
      pointsUsed,
      currentDiscount
    });
    onDiscount(type, amount, pointsUsed);
    setOpenDiscount(false);
  };

  return (
    <Box>
      <Stack spacing={2}>
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={() => setOpenCheckout(true)}
          disabled={isCartEmpty || isCheckoutDisabled}
          sx={{ height: 80, fontSize: '1.2rem' }}
        >
          {hasPrescriptionItems && !prescriptionSaved 
            ? 'Save Prescription First (F6)' 
            : 'Checkout (F10)'}
        </Button>

        {/* Add Prescription Button */}
        {hasPrescriptionItems && (
          <Button
            variant="contained"
            color="warning"
            size="large"
            onClick={onPrescription}
            sx={{ height: 60 }}
          >
            Add Prescription (F6)
          </Button>
        )}

        {/* Customer and Discount Buttons */}
        <Box sx={{ width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                variant="contained"
                color="info"
                size="large"
                onClick={() => setOpenCustomer(true)}
                sx={{ 
                  height: 80, 
                  fontSize: '1rem',
                  width: '100%',
                  whiteSpace: 'nowrap'
                }}
              >
                Customer (F9)
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                color="warning"
                size="large"
                onClick={() => setOpenDiscount(true)}
                disabled={isCartEmpty}
                sx={{ 
                  height: 80, 
                  fontSize: '1rem',
                  width: '100%',
                  whiteSpace: 'nowrap'
                }}
              >
                Discount
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Stack>

      <CheckoutDialog
        open={openCheckout}
        onClose={() => setOpenCheckout(false)}
        items={items}
        subtotal={subtotal}
        discountType={currentDiscount}
        discountAmount={discountAmount}
        discountedSubtotal={discountedSubtotal}
        vat={vat}
        total={total}
        onCheckout={onCheckout}
        onCustomerSelect={onCustomerSelect}
        customerName={customerName}
        starPointsId={starPointsId}
        pointsBalance={pointsBalance}
      />

      <CustomerDialog
        open={openCustomer}
        onClose={() => setOpenCustomer(false)}
        onSelectCustomer={(customer) => {
          onCustomerSelect(customer);
          setOpenCustomer(false);
        }}
      />

      <DiscountDialog
        open={openDiscount}
        onClose={() => setOpenDiscount(false)}
        currentDiscount={currentDiscount}
        subtotal={subtotal}
        onApplyDiscount={handleApplyDiscount}
        pointsBalance={pointsBalance}
      />
    </Box>
  );
};

export default ActionButtons;
