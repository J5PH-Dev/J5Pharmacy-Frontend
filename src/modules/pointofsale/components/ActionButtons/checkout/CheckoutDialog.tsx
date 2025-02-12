import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  IconButton,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useAuth } from '../../../../auth/contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { CartItem, CheckoutResponse } from '../../../types/cart';
import { DiscountType } from '../../../types/discount';
import axios from 'axios';
import { AxiosError } from 'axios';
import CustomerDialog from '../customer/CustomerDialog';

type PaymentMethod = 'CASH' | 'GCASH' | 'MAYA';

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  discountType: DiscountType;
  discountAmount: number;
  discountedSubtotal: number;
  vat: number;
  total: number;
  onCheckout: (details: {
    paymentMethod: string;
    amountTendered: number;
    change?: number;
    discountIdNumber?: string;
    referenceNumber?: string;
  }) => void;
  customerName?: string;
  starPointsId?: string;
  onCustomerSelect: (customer: any) => void;
  pointsBalance: number;
}

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  open,
  onClose,
  items,
  subtotal,
  discountType,
  discountAmount,
  discountedSubtotal,
  vat,
  total,
  onCheckout,
  customerName = 'Walk-in Customer',
  starPointsId = '001',
  onCustomerSelect,
  pointsBalance = 0,
}) => {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const { currentSession, user } = useAuth();
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [change, setChange] = useState<string>('');
  const [discountIdNumber, setDiscountIdNumber] = useState<string>('');

  useEffect(() => {
    if (open) {
      setPaymentMethod('CASH');
      setAmountTendered('');
      setReferenceNumber('');
      setChange('');
      setDiscountIdNumber('');
    }
  }, [open]);

  useEffect(() => {
    console.log('CheckoutDialog customer data:', { customerName, starPointsId });
  }, [customerName, starPointsId]);

  const handleAmountTenderedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9.]/g, '');
    setAmountTendered(value);
  };

  const getChange = (): number => {
    const tenderedAmount = parseFloat(amountTendered) || 0;
    return Math.max(0, tenderedAmount - total);
  };

  const isAmountValid = (): boolean => {
    if (paymentMethod !== 'CASH') return true;
    const tenderedAmount = parseFloat(amountTendered) || 0;
    return tenderedAmount >= total;
  };

  const handlePaymentMethodChange = (
    event: React.MouseEvent<HTMLElement>,
    newMethod: PaymentMethod | null
  ) => {
    if (newMethod) {
      setPaymentMethod(newMethod);
      if (newMethod !== 'CASH') {
        setAmountTendered(total.toString());
      }
    }
  };

  const handleCustomerSelect = async (customer: any) => {
    console.log('Selected customer in checkout:', customer);
    onCustomerSelect(customer);
    setOpenCustomerDialog(false);
  };

  const handlePayment = () => {
    onCheckout({
      paymentMethod: paymentMethod,
      amountTendered: parseFloat(amountTendered) || total,
      change: getChange(),
      discountIdNumber: discountIdNumber,
      referenceNumber: paymentMethod !== 'CASH' ? referenceNumber : undefined
    });
    onClose();
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Checkout</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2}>
            {/* Customer Info Section */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                {(!customerName || customerName === 'Walk-in Customer') && (!starPointsId || starPointsId === '001') ? (
                  <>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setOpenCustomerDialog(true)}
                      sx={{ mb: 1 }}
                    >
                      Add Customer
                    </Button>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Currently serving walk-in customer
                    </Typography>
                  </>
                ) : (
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Customer:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {customerName}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        StarPoints ID:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {starPointsId}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Points Balance:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {pointsBalance.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Grid>

            {/* Payment Method Toggle */}
            <Grid item xs={12}>
              <ToggleButtonGroup
                value={paymentMethod}
                exclusive
                onChange={(e, value) => {
                  if (value) {
                    setPaymentMethod(value);
                    if (value !== 'CASH') {
                      setAmountTendered(total.toString());
                    }
                  }
                }}
                fullWidth
              >
                <ToggleButton 
                value="CASH"
                sx={{
                  '&.Mui-selected': {
                    bgcolor: theme.palette.success.main,
                    color: 'white',
                    '&:hover': {
                      bgcolor: theme.palette.success.dark,
                    }
                  }
                }}
              >
                Cash
              </ToggleButton>
              <ToggleButton 
                value="GCASH"
                sx={{
                  '&.Mui-selected': {
                    bgcolor: '#007DFE',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#0061C6',
                    }
                  }
                }}
              >
                GCash
              </ToggleButton>
              <ToggleButton 
                value="MAYA"
                sx={{
                  '&.Mui-selected': {
                    bgcolor: '#00B0ED',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#008BC0',
                    }
                  }
                }}
              >
                Maya
              </ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            {/* Reference Number Field for GCASH and MAYA */}
            {paymentMethod !== 'CASH' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label={`${paymentMethod} Reference Number`}
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  error={!referenceNumber}
                  helperText={!referenceNumber ? 'Reference number is required' : ''}
                />
              </Grid>
            )}

            {paymentMethod === 'CASH' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amount Tendered"
                  value={amountTendered}
                  onChange={handleAmountTenderedChange}
                  error={!isAmountValid()}
                  helperText={!isAmountValid() ? 'Amount must be greater than or equal to total' : ''}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₱</Typography>
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ bgcolor: theme.palette.grey[100], p: 2, borderRadius: 1 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography>Subtotal:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">₱{subtotal.toFixed(2)}</Typography>
                  </Grid>

                  {discountAmount > 0 && (
                    <>
                      <Grid item xs={6}>
                        <Typography>Discount ({discountType}):</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography align="right" color="error">
                          -₱{discountAmount.toFixed(2)}
                        </Typography>
                      </Grid>
                    </>
                  )}

                  <Grid item xs={6}>
                    <Typography>VAT (12%):</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">₱{vat.toFixed(2)}</Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="h6">Total:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" align="right">
                      ₱{total.toFixed(2)}
                    </Typography>
                  </Grid>

                  {paymentMethod === 'CASH' && parseFloat(amountTendered) > 0 && (
                    <>
                      <Grid item xs={6}>
                        <Typography>Change:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography align="right">₱{getChange().toFixed(2)}</Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            </Grid>

            {/* <Grid item xs={12}>
              <Button 
                variant="contained" 
                onClick={() => setOpenCustomerDialog(true)}
                sx={{ width: '100%', mb: 1 }}
              >
                Customer (F9)
              </Button>
            </Grid> */}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            variant="contained"
            disabled={!isAmountValid() || (paymentMethod !== 'CASH' && !referenceNumber)}
            sx={{
              bgcolor: paymentMethod === 'CASH' 
                ? theme.palette.success.main
                : paymentMethod === 'GCASH'
                  ? '#007DFE'
                  : '#00B0ED',
              '&:hover': {
                bgcolor: paymentMethod === 'CASH'
                  ? theme.palette.success.dark
                  : paymentMethod === 'GCASH'
                    ? '#0061C6'
                    : '#008BC0',
              }
            }}
          >
            Complete Payment
          </Button>
        </DialogActions>
      </Dialog>

      <CustomerDialog
        open={openCustomerDialog}
        onClose={() => setOpenCustomerDialog(false)}
        onSelectCustomer={handleCustomerSelect}
      />
    </>
  );
};

export default CheckoutDialog; 