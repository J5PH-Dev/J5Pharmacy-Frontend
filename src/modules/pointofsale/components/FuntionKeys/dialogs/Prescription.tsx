import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import { useNotification } from '../../../contexts/NotificationContext';

interface PrescriptionProps {
  open: boolean;
  onClose: () => void;
}

interface PrescriptionForm {
  patientName: string;
  age: string;
  doctorName: string;
  prcNumber: string;
  prescriptionDate: string;
  prescriptionNumber: string;
  diagnosis: string;
  notes: string;
}

const initialForm: PrescriptionForm = {
  patientName: '',
  age: '',
  doctorName: '',
  prcNumber: '',
  prescriptionDate: new Date().toISOString().split('T')[0],
  prescriptionNumber: '',
  diagnosis: '',
  notes: ''
};

const Prescription: React.FC<PrescriptionProps> = ({
  open,
  onClose
}) => {
  const { showNotification } = useNotification();
  const [form, setForm] = useState<PrescriptionForm>(initialForm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      const requiredFields = ['patientName', 'doctorName', 'prcNumber'];
      const missingFields = requiredFields.filter(field => !form[field as keyof PrescriptionForm]);
      
      if (missingFields.length > 0) {
        showNotification(`Please fill in all required fields: ${missingFields.join(', ')}`, 'error');
        return;
      }

      // Add API call to save prescription
      const response = await fetch('http://localhost:5000/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to save prescription');
      }

      showNotification('Prescription saved successfully', 'success');
      setForm(initialForm);
      onClose();
    } catch (error) {
      console.error('Error saving prescription:', error);
      showNotification('Failed to save prescription', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Prescription Details</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Patient Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      label="Patient Name"
                      name="patientName"
                      value={form.patientName}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Age"
                      name="age"
                      type="number"
                      value={form.age}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Doctor Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      label="Doctor Name"
                      name="doctorName"
                      value={form.doctorName}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="PRC Number"
                      name="prcNumber"
                      value={form.prcNumber}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Prescription Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Prescription Date"
                      name="prescriptionDate"
                      value={form.prescriptionDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Prescription Number"
                      name="prescriptionNumber"
                      value={form.prescriptionNumber}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Diagnosis"
                      name="diagnosis"
                      value={form.diagnosis}
                      onChange={handleChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes"
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Save Prescription
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Prescription;
