import React from 'react';
import { Stack, Button, Tooltip } from '@mui/material';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import DiscountIcon from '@mui/icons-material/Discount';
import PersonIcon from '@mui/icons-material/Person';

interface ActionButtonsProps {
  onCheckout: () => void;
  onVoid: () => void;
  onPrint: () => void;
  onDiscount: () => void;
  onCustomerInfo: () => void;
  isCartEmpty: boolean;
  currentDiscount?: string;
  disabled?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCheckout,
  onVoid,
  onPrint,
  onDiscount,
  onCustomerInfo,
  isCartEmpty,
  currentDiscount,
  disabled
}) => {
  return (
    <Stack spacing={2}>
      <Tooltip 
        title={disabled ? "Please verify prescription before checkout" : ""}
        placement="top"
      >
        <span style={{ width: '100%' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ShoppingCartCheckoutIcon />}
            onClick={onCheckout}
            disabled={isCartEmpty || disabled}
            fullWidth
            sx={{ 
              height: '50px',
              fontSize: '1.1rem'
            }}
          >
            F10 Checkout
          </Button>
        </span>
      </Tooltip>

      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={onVoid}
          disabled={isCartEmpty}
          sx={{ flex: 1 }}
        >
          Void
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={onPrint}
          disabled={isCartEmpty}
          sx={{ flex: 1 }}
        >
          Print
        </Button>
      </Stack>

      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          color={currentDiscount ? 'success' : 'primary'}
          startIcon={<DiscountIcon />}
          onClick={onDiscount}
          disabled={isCartEmpty}
          sx={{ flex: 1 }}
        >
          Discount
        </Button>
        <Button
          variant="outlined"
          startIcon={<PersonIcon />}
          onClick={onCustomerInfo}
          disabled={isCartEmpty}
          sx={{ flex: 1 }}
        >
          Customer
        </Button>
      </Stack>
    </Stack>
  );
};

export default ActionButtons; 