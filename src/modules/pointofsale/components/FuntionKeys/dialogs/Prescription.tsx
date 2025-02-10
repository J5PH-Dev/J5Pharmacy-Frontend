import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  IconButton,
  Typography,
  Paper,
  Tooltip,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useNotification } from '../../../contexts/NotificationContext';
import axios from 'axios';

interface PrescriptionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  customerId: number;
  prescriptionItems: any[];
}

interface CustomerSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (customerId: number) => void;
}

const CustomerSelectionDialog: React.FC<CustomerSelectionDialogProps> = ({
  open,
  onClose,
  onSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSearch = async () => {
    if (searchTerm.length < 2) {
      showNotification('Please enter at least 2 characters', 'warning');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/pos/customers/search?query=${encodeURIComponent(searchTerm)}`,
        { withCredentials: true }
      );
      console.log('Customer search results:', response.data);
      setCustomers(response.data.data || []); // Ensure we're accessing the correct data property
    } catch (error) {
      console.error('Error searching customers:', error);
      showNotification('Error searching customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reset search when dialog opens
  useEffect(() => {
    if (open) {
      setSearchTerm('');
      setCustomers([]);
    }
  }, [open]);

  const handleCustomerSelect = (customer: any) => {
    console.log('Selected customer:', customer);
    onSelect(customer.customer_id);
    setSearchTerm('');
    setCustomers([]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Customer</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            label="Search Customer"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter customer name or phone"
            autoFocus
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
          >
            Search
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {customers.map((customer) => (
              <Paper
                key={customer.customer_id}
                sx={{
                  p: 2,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'background-color 0.2s'
                }}
                onClick={() => handleCustomerSelect(customer)}
              >
                <Typography variant="subtitle1" fontWeight={500}>
                  {customer.name}
                </Typography>
                {customer.phone && (
                  <Typography variant="body2" color="text.secondary">
                    Phone: {customer.phone}
                  </Typography>
                )}
                {customer.address && (
                  <Typography variant="body2" color="text.secondary">
                    Address: {customer.address}
                  </Typography>
                )}
              </Paper>
            ))}
            {customers.length === 0 && searchTerm && !loading && (
              <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                No customers found
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const PrescriptionDialog: React.FC<PrescriptionDialogProps> = ({
  open,
  onClose,
  onSave,
  customerId,
  prescriptionItems
}) => {
  const [doctorName, setDoctorName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [prescriptionDate, setPrescriptionDate] = useState<Date | null>(new Date());
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotification();
  const [tabValue, setTabValue] = useState(0);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [existingCustomers, setExistingCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [openCustomerSelection, setOpenCustomerSelection] = useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');

  const handleCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Implement camera capture UI
      // You might want to add a video element and capture button here
    } catch (error) {
      console.error('Camera error:', error);
      showNotification('Failed to access camera', 'error');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        showNotification('Please upload an image file (JPEG, PNG)', 'error');
      }
    }
  };

  const searchCustomers = async (searchTerm: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/pos/customers/search?query=${searchTerm}`,
        { withCredentials: true }
      );
      setExistingCustomers(response.data);
    } catch (error) {
      console.error('Error searching customers:', error);
      showNotification('Error searching customers', 'error');
    }
  };

  const handleSave = async () => {
    if (!doctorName || !prescriptionDate) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      let finalCustomerId = selectedCustomerId;

      // If new customer, create first
      if (tabValue === 1 && customerDetails.name) {
        console.log('Creating new customer:', customerDetails);
        const customerResponse = await axios.post(
          'http://localhost:5000/api/pos/customers',
          customerDetails,
          { withCredentials: true }
        );
        console.log('Customer created:', customerResponse.data);
        finalCustomerId = customerResponse.data.customerData.customer_id;
      }

      if (!finalCustomerId) {
        showNotification('Please select or create a customer', 'error');
        return;
      }

      // Format prescription items
      const formattedItems = prescriptionItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        dosage_instructions: item.dosage_instructions || null
      }));

      // Create FormData
      const formData = new FormData();
      formData.append('customerId', finalCustomerId.toString());
      formData.append('doctorName', doctorName);
      formData.append('doctorLicenseNumber', licenseNumber);
      formData.append('prescriptionDate', prescriptionDate.toISOString());
      if (expiryDate) {
        formData.append('expiryDate', expiryDate.toISOString());
      }
      formData.append('notes', notes || '');
      if (imageFile) {
        formData.append('image', imageFile);
      }
      formData.append('items', JSON.stringify(formattedItems));

      // Debug log
      console.log('Sending prescription data:', {
        customerId: finalCustomerId,
        doctorName,
        licenseNumber,
        prescriptionDate: prescriptionDate.toISOString(),
        expiryDate: expiryDate?.toISOString(),
        notes,
        hasImage: !!imageFile,
        items: formattedItems
      });

      const response = await axios.post(
        'http://localhost:5000/api/pos/prescriptions',
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        console.log('Prescription saved successfully:', response.data);
        showNotification('Prescription saved successfully', 'success');
        onSave();
        onClose();
      }
    } catch (error: any) {
      console.error('Error saving prescription:', error);
      showNotification(error.response?.data?.message || 'Failed to save prescription', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customerId: number) => {
    setSelectedCustomerId(customerId);
    // Get customer details from the API
    axios.get(`http://localhost:5000/api/pos/customers/${customerId}`, {
      withCredentials: true
    })
    .then(response => {
      const customer = response.data.data;
      console.log('Selected customer details:', customer);
      setSelectedCustomerName(`${customer.name} ${customer.phone ? `(${customer.phone})` : ''}`);
    })
    .catch(error => {
      console.error('Error fetching customer details:', error);
      showNotification('Error fetching customer details', 'error');
    });
    setOpenCustomerSelection(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Prescription</DialogTitle>
      <DialogContent>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
          <Tab label="Existing Customer" />
          <Tab label="New Customer" />
        </Tabs>

        <Grid container spacing={2}>
          {tabValue === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <TextField
                  fullWidth
                  label="Selected Customer"
                  value={selectedCustomerName}
                  InputProps={{ readOnly: true }}
                />
                <Button
                  variant="contained"
                  onClick={() => setOpenCustomerSelection(true)}
                >
                  Select Customer
                </Button>
              </Box>
            </Grid>
          ) : (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={customerDetails.address}
                  onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                  multiline
                  rows={2}
                />
              </Grid>
            </>
          )}

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Doctor's Name"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="License Number"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Prescription Date"
                value={prescriptionDate}
                onChange={(date) => setPrescriptionDate(date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Expiry Date"
                value={expiryDate}
                onChange={(date) => setExpiryDate(date)}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Prescription Image
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  {/* <Button
                    variant="outlined"
                    startIcon={<CameraAltIcon />}
                    onClick={handleCapture}
                  >
                    Capture
                  </Button> */}
                  <Button
                    variant="outlined"
                    startIcon={<FileUploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </Box>
                {imagePreview && (
                  <Box sx={{ mt: 2 }}>
                    <img 
                      src={imagePreview} 
                      alt="Prescription"
                      style={{ maxWidth: '100%', maxHeight: '300px' }}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
          </LocalizationProvider>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={loading || !doctorName || !prescriptionDate || !imageFile || 
            (tabValue === 0 && !selectedCustomerId) || 
            (tabValue === 1 && !customerDetails.name)}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Prescription'}
        </Button>
      </DialogActions>

      <CustomerSelectionDialog
        open={openCustomerSelection}
        onClose={() => setOpenCustomerSelection(false)}
        onSelect={handleCustomerSelect}
      />
    </Dialog>
  );
};

export default PrescriptionDialog;
