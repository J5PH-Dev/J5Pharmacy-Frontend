import React from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import CancelIcon from '@mui/icons-material/Cancel';
import PrintIcon from '@mui/icons-material/Print';
import DiscountIcon from '@mui/icons-material/LocalOffer';
import PersonIcon from '@mui/icons-material/Person';

interface ActionButtonsProps {
  onCheckout?: () => void;
  onVoid?: () => void;
  onPrint?: () => void;
  onDiscount?: () => void;
  onCustomerInfo?: () => void;
  isCartEmpty?: boolean;
  currentDiscount?: string;
}

const ActionButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1.5),
  fontSize: '1rem',
  fontWeight: 600,
  borderRadius: theme.shape.borderRadius,
  '& .MuiSvgIcon-root': {
    fontSize: '1.5rem',
    marginRight: theme.spacing(1),
  },
}));

const CheckoutButton = styled(ActionButton)(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.success.dark,
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.grey[500],
  },
}));

const VoidButton = styled(ActionButton)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.error.dark,
  },
}));

const PrintButton = styled(ActionButton)(({ theme }) => ({
  backgroundColor: theme.palette.info.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.info.dark,
  },
}));

const DiscountButton = styled(ActionButton)(({ theme }) => ({
  backgroundColor: theme.palette.warning.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.warning.dark,
  },
  '&.active': {
    backgroundColor: theme.palette.warning.dark,
    boxShadow: `0 0 0 2px ${theme.palette.warning.light}`,
  },
}));

const CustomerButton = styled(ActionButton)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.secondary.dark,
  },
}));

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCheckout = () => console.log('Checkout clicked'),
  onVoid = () => console.log('Void clicked'),
  onPrint = () => console.log('Print clicked'),
  onDiscount = () => console.log('Discount clicked'),
  onCustomerInfo = () => console.log('Customer Info clicked'),
  isCartEmpty = true,
  currentDiscount = 'None',
}) => {
  return (
    <Box>
      <Grid container spacing={1.5}>
        {/* Row 1 */}
        <Grid item xs={12}>
          <CheckoutButton
            variant="contained"
            startIcon={<ShoppingCartCheckoutIcon />}
            onClick={onCheckout}
            disabled={isCartEmpty}
          >
            Checkout
          </CheckoutButton>
        </Grid>

        {/* Row 2 */}
        <Grid item xs={6}>
          <VoidButton
            variant="contained"
            startIcon={<CancelIcon />}
            onClick={onVoid}
            disabled={isCartEmpty}
          >
            Void
          </VoidButton>
        </Grid>
        <Grid item xs={6}>
          <PrintButton
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={onPrint}
            disabled={isCartEmpty}
          >
            Print
          </PrintButton>
        </Grid>

        {/* Row 3 */}
        <Grid item xs={6}>
          <DiscountButton
            variant="contained"
            startIcon={<DiscountIcon />}
            onClick={onDiscount}
            disabled={isCartEmpty}
            className={currentDiscount !== 'None' ? 'active' : ''}
          >
            {currentDiscount !== 'None' ? `${currentDiscount}` : 'Discount'}
          </DiscountButton>
        </Grid>
        <Grid item xs={6}>
          <CustomerButton
            variant="contained"
            startIcon={<PersonIcon />}
            onClick={onCustomerInfo}
          >
            Customer
          </CustomerButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActionButtons;
