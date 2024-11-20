import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  useTheme,
  TextField,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import qrPlaceholder from '../../assets/images/qr-placeholder.png';

interface PaymentQRDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (referenceId: string) => void;
  paymentMethod: 'GCASH' | 'MAYA';
  amount: number;
}

export const PaymentQRDialog: React.FC<PaymentQRDialogProps> = ({
  open,
  onClose,
  onConfirm,
  paymentMethod,
  amount,
}) => {
  const theme = useTheme();
  const [referenceId, setReferenceId] = useState('');
  const [error, setError] = useState(false);

  const handleConfirm = () => {
    if (!referenceId.trim()) {
      setError(true);
      return;
    }
    onConfirm(referenceId);
  };

  const handleClose = () => {
    setReferenceId('');
    setError(false);
    onClose();
  };

  const handleReferenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReferenceId(event.target.value);
    setError(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
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
          bgcolor: paymentMethod === 'GCASH' ? '#007DFE' : '#00B0ED',
          color: '#FFFFFF',
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h5" component="div" fontWeight="bold">
          Pay with {paymentMethod}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: '#FFFFFF',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Amount to Pay: ₱{amount.toFixed(2)}
        </Typography>
        <Box
          sx={{
            my: 3,
            p: 2,
            border: '2px solid',
            borderColor: paymentMethod === 'GCASH' ? '#007DFE' : '#00B0ED',
            borderRadius: 2,
            display: 'inline-block',
          }}
        >
          <img
            src={qrPlaceholder}
            alt={`${paymentMethod} QR Code`}
            style={{ width: 200, height: 200 }}
          />
        </Box>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Scan the QR code using your {paymentMethod} app to complete the payment
        </Typography>
        <TextField
          fullWidth
          label="Reference ID"
          value={referenceId}
          onChange={handleReferenceChange}
          error={error}
          helperText={error ? 'Please enter the reference ID' : ''}
          variant="outlined"
          placeholder={`Enter your ${paymentMethod} reference ID`}
          sx={{
            mt: 2,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
              '& fieldset': {
                borderColor: error ? 'error.main' : (paymentMethod === 'GCASH' ? '#007DFE' : '#00B0ED'),
              },
              '&:hover fieldset': {
                borderColor: error ? 'error.main' : (paymentMethod === 'GCASH' ? '#0061C6' : '#008BC0'),
              },
              '&.Mui-focused fieldset': {
                borderColor: error ? 'error.main' : (paymentMethod === 'GCASH' ? '#007DFE' : '#00B0ED'),
              },
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: theme.palette.grey[50] }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleConfirm}
          size="large"
          sx={{
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#FFFFFF',
            bgcolor: paymentMethod === 'GCASH' ? '#007DFE' : '#00B0ED',
            '&:hover': {
              bgcolor: paymentMethod === 'GCASH' ? '#0061C6' : '#008BC0',
            },
          }}
        >
          Confirm Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};
