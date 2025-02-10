import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tabs,
  Tab,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import { useNotification } from '../../../contexts/NotificationContext';

interface CustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: any) => void;
}

const CustomerDialog: React.FC<CustomerDialogProps> = ({ open, onClose, onSelectCustomer }) => {
  const [tabValue, setTabValue] = useState(0);
  const [cardId, setCardId] = useState('');
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    address: '',
    discountType: 'None' as 'None' | 'Senior' | 'PWD' | 'Employee',
    discountId: ''
  });
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleScanCard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/pos/customers/by-card/${cardId}`);
      console.log('Customer data received:', response.data);
      onSelectCustomer(response.data.data);
      showNotification('Customer found', 'success');
      onClose();
    } catch (error) {
      showNotification('Invalid StarPoints card', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCustomer = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/pos/customers', {
        ...customerDetails,
        cardId
      });
      onSelectCustomer(response.data);
      showNotification('Customer registered', 'success');
      onClose();
    } catch (error) {
      showNotification('Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Customer Management</DialogTitle>
      <DialogContent>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Scan Card" />
          <Tab label="New Customer" />
        </Tabs>

        <Box sx={{ mt: 2 }}>
          {tabValue === 0 ? (
            <Box>
              <TextField
                fullWidth
                label="Scan StarPoints Card"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                disabled={loading}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Scan customer's StarPoints card barcode
              </Typography>
            </Box>
          ) : (
            <Box>
              <TextField
                fullWidth
                label="Name"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={customerDetails.phone}
                onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Address"
                value={customerDetails.address}
                onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="StarPoints Card ID"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={tabValue === 0 ? handleScanCard : handleRegisterCustomer}
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : tabValue === 0 ? 'Scan Card' : 'Register'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerDialog;
