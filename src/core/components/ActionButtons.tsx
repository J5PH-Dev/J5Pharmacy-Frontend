import React from 'react';
import { Button, Stack } from '@mui/material';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PersonIcon from '@mui/icons-material/Person';
import { DiscountType } from '../../modules/pos/components/TransactionSummary/types';

interface ActionButtonsProps {
  onCheckout: () => void;
  onVoid: () => void;
  onPrint: () => void;
  onDiscount: () => void;
  onCustomerInfo: () => void;
  isCartEmpty: boolean;
  currentDiscount: DiscountType;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCheckout,
  onVoid,
  onPrint,
  onDiscount,
  onCustomerInfo,
  isCartEmpty,
  currentDiscount
}) => {
  return (
    <Stack spacing={2}>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={onCheckout}
        disabled={isCartEmpty}
        startIcon={<ShoppingCartCheckoutIcon />}
        fullWidth
        sx={{ 
          height: '50px',
          fontSize: '1.1rem'
        }}
      >
        F10 Checkout
      </Button>
      
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          color="error"
          onClick={onVoid}
          disabled={isCartEmpty}
          startIcon={<DeleteIcon />}
          sx={{ flex: 1 }}
        >
          Void
        </Button>
        <Button
          variant="outlined"
          onClick={onPrint}
          disabled={isCartEmpty}
          startIcon={<PrintIcon />}
          sx={{ flex: 1 }}
        >
          Print
        </Button>
      </Stack>
      
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          color={currentDiscount !== 'None' ? 'success' : 'primary'}
          onClick={onDiscount}
          disabled={isCartEmpty}
          startIcon={<LocalOfferIcon />}
          sx={{ flex: 1 }}
        >
          Discount
        </Button>
        <Button
          variant="outlined"
          onClick={onCustomerInfo}
          disabled={isCartEmpty}
          startIcon={<PersonIcon />}
          sx={{ flex: 1 }}
        >
          Customer
        </Button>
      </Stack>
    </Stack>
  );
};

export default ActionButtons; 