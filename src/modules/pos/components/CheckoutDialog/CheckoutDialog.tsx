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
} from '@mui/material';
import { Close as CloseIcon, Print as PrintIcon } from '@mui/icons-material';
import { Receipt } from '../Receipt/Receipt';
import { generateTransactionId } from '../../utils/transactions';
import { PaymentQRDialog } from '../PaymentQRDialog/PaymentQRDialog';
import { CartItem } from '../../types/cart';
import { DiscountType } from '../TransactionSummary/types';

type PaymentMethod = 'CASH' | 'GCASH' | 'MAYA';

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  discountType: string;
  discountAmount: number;
  discountedSubtotal: number;
  vat: number;
  total: number;
  starPointsEarned: number;
  onCheckout: () => void;
  onClearCart: () => void;
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
  starPointsEarned,
  onCheckout,
  onClearCart,
}) => {
  const theme = useTheme();
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [starPointsId, setStarPointsId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [paymentReferenceId, setPaymentReferenceId] = useState<string | null>(null);
  const [currentTransactionId, setCurrentTransactionId] = useState<string>('');

  useEffect(() => {
    if (open) {
      setCurrentTransactionId(generateTransactionId());
    }
  }, [open]);

  const handleAmountTenderedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9.]/g, '');
    setAmountTendered(value);
  };

  const getChange = (): number => {
    const tenderedAmount = parseFloat(amountTendered) || 0;
    return Math.max(0, tenderedAmount - total);
  };

  const isAmountValid = (): boolean => {
    const tenderedAmount = parseFloat(amountTendered) || 0;
    return tenderedAmount >= total;
  };

  const handleCheckout = () => {
    if (paymentMethod === 'CASH') {
      setShowReceipt(true);
    } else {
      setShowQRDialog(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewTransaction = () => {
    onCheckout();
    onClearCart();
    setAmountTendered('');
    setShowReceipt(false);
    setCustomerName('');
    setStarPointsId('');
    setPaymentReferenceId(null);
    setPaymentMethod('CASH');
    onClose();
  };

  const handleQRDialogClose = () => {
    setShowQRDialog(false);
  };

  const handleQRDialogConfirm = (referenceId: string) => {
    setPaymentReferenceId(referenceId);
    setShowQRDialog(false);
    setShowReceipt(true);
  };

  const logReceiptData = () => {
    const receiptData = {
      transactionId: currentTransactionId,
      timestamp: new Date(),
      customerName: customerName || 'WALK-IN',
      starPointsId: starPointsId || null,
      items,
      subtotal,
      discountType,
      discountAmount,
      discountedSubtotal,
      vat,
      total,
      starPointsEarned,
      paymentMethod,
      amountTendered: paymentMethod === 'CASH' ? parseFloat(amountTendered) : undefined,
      change: paymentMethod === 'CASH' ? getChange() : undefined,
      paymentReferenceId: paymentReferenceId || undefined,
      cashierName: 'ADMIN',
      branchId: 'B001',
      branchAddress: '123 Main Street, City',
      branchContact: 'Tel: (123) 456-7890',
    };
    console.log('=== RECEIPT DATA ===');
    console.log(JSON.stringify(receiptData, null, 2));
    console.log('==================');
  };

  useEffect(() => {
    if (showReceipt) {
      logReceiptData();
    }
  }, [showReceipt]);

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            py: 2,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h5" component="div" fontWeight="bold">
            Checkout
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: theme.palette.primary.contrastText,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {!showReceipt ? (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Customer Name (Optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="StarPoints ID (Optional)"
                    value={starPointsId}
                    onChange={(e) => setStarPointsId(e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      bgcolor: theme.palette.primary.light,
                      p: 2,
                      borderRadius: 1,
                      color: theme.palette.primary.contrastText,
                    }}
                  >
                    <Typography variant="h5" fontWeight="bold" gutterBottom align="center">
                      Total Amount: ₱{total.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Method
                  </Typography>
                  <ToggleButtonGroup
                    value={paymentMethod}
                    exclusive
                    onChange={(e, value) => value && setPaymentMethod(value)}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    <ToggleButton 
                      value="CASH"
                      sx={{
                        color: '#666',
                        '&.Mui-selected': {
                          bgcolor: theme.palette.success.light,
                          color: '#FFFFFF',
                          '&:hover': {
                            bgcolor: theme.palette.success.main,
                          },
                        },
                      }}
                    >
                      CASH
                    </ToggleButton>
                    <ToggleButton 
                      value="GCASH"
                      sx={{
                        color: '#666',
                        '&.Mui-selected': {
                          bgcolor: '#007DFE',
                          color: '#FFFFFF',
                          '&:hover': {
                            bgcolor: '#0061C6',
                          },
                        },
                      }}
                    >
                      GCASH
                    </ToggleButton>
                    <ToggleButton 
                      value="MAYA"
                      sx={{
                        color: '#666',
                        '&.Mui-selected': {
                          bgcolor: '#00B0ED',
                          color: '#FFFFFF',
                          '&:hover': {
                            bgcolor: '#008BC0',
                          },
                        },
                      }}
                    >
                      MAYA
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
                {paymentMethod === 'CASH' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Amount Tendered"
                      value={amountTendered}
                      onChange={handleAmountTenderedChange}
                      error={!isAmountValid() && amountTendered !== ''}
                      helperText={
                        !isAmountValid() && amountTendered !== ''
                          ? 'Amount tendered must be greater than or equal to total amount'
                          : ''
                      }
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'background.paper',
                          fontSize: '1.2rem',
                        },
                      }}
                    />
                  </Grid>
                )}
                {paymentMethod === 'CASH' && amountTendered && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        bgcolor: theme.palette.success.light,
                        p: 2,
                        borderRadius: 1,
                        color: theme.palette.success.contrastText,
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" align="center">
                        Change: ₱{getChange().toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          ) : (
            <Box sx={{ maxHeight: '70vh', overflow: 'auto', position: 'relative' }}>
              <Box
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  bgcolor: 'background.paper',
                  p: 1,
                  borderBottom: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  sx={{
                    bgcolor: theme.palette.grey[800],
                    color: '#FFFFFF',
                    '&:hover': {
                      bgcolor: theme.palette.grey[900],
                    },
                  }}
                >
                  Print
                </Button>
              </Box>
              <Receipt
                transactionId={currentTransactionId}
                timestamp={new Date()}
                cashierName="ADMIN"
                customerName={customerName || undefined}
                starPointsId={starPointsId || undefined}
                items={items}
                subtotal={subtotal}
                discountType={discountType as any}
                discountAmount={discountAmount}
                discountedSubtotal={discountedSubtotal}
                vat={vat}
                total={total}
                starPointsEarned={starPointsEarned}
                paymentMethod={paymentMethod}
                amountTendered={paymentMethod === 'CASH' ? Number(amountTendered) : undefined}
                change={paymentMethod === 'CASH' ? getChange() : undefined}
                paymentReferenceId={paymentReferenceId || undefined}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: theme.palette.grey[50] }}>
          {!showReceipt ? (
            <Button
              variant="contained"
              onClick={handleCheckout}
              disabled={paymentMethod === 'CASH' && !isAmountValid()}
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: '#FFFFFF',
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
                },
                '&.Mui-disabled': {
                  bgcolor: theme.palette.grey[300],
                },
              }}
            >
              {paymentMethod === 'CASH' ? 'Complete Transaction' : `Pay with ${paymentMethod}`}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNewTransaction}
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: '#FFFFFF',
                bgcolor: theme.palette.success.main,
                '&:hover': {
                  bgcolor: theme.palette.success.dark,
                },
              }}
            >
              New Transaction
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <PaymentQRDialog
        open={showQRDialog}
        onClose={handleQRDialogClose}
        onConfirm={handleQRDialogConfirm}
        paymentMethod={paymentMethod === 'GCASH' ? 'GCASH' : 'MAYA'}
        amount={total}
      />
    </>
  );
};
