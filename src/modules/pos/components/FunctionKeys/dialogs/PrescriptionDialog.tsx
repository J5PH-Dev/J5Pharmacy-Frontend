import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { CartItem } from '../../../types/cart';
import { styled } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`prescription-tabpanel-${index}`}
      aria-labelledby={`prescription-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

interface PrescriptionDialogProps {
  open: boolean;
  onClose: () => void;
  onAddToCart: (items: CartItem[]) => void;
  currentItems: CartItem[];
  onManualSearchOpen: () => void;
  setPrescriptionVerified: (verified: boolean) => void;
}

interface Prescription {
  id: string;
  doctorName: string;
  customerName: string;
  notes: string;
  items: CartItem[];
  imageData?: string;
  timestamp: string;
}

const PrescriptionDialog: React.FC<PrescriptionDialogProps> = ({
  open,
  onClose,
  onAddToCart,
  currentItems,
  onManualSearchOpen,
  setPrescriptionVerified,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [doctorName, setDoctorName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [prescribedItems, setPrescribedItems] = useState<CartItem[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [savedPrescriptions, setSavedPrescriptions] = useState<Prescription[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCameraChange = async (event: SelectChangeEvent) => {
    const deviceId = event.target.value;
    setSelectedCamera(deviceId);
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: deviceId }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const initializeCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);
      
      if (cameras.length > 0 && !selectedCamera) {
        setSelectedCamera(cameras[0].deviceId);
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: cameras[0].deviceId }
        });
        setStream(newStream);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      }
    } catch (error) {
      console.error('Error initializing camera:', error);
    }
  };

  React.useEffect(() => {
    if (open && tabValue === 1) {
      initializeCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [open, tabValue]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || !stream) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
  };

  const clearForm = () => {
    setDoctorName('');
    setCustomerName('');
    setNotes('');
    setCapturedImage(null);
    setPrescribedItems([]);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
  };

  const handleSave = () => {
    if (!doctorName || !customerName) return;

    const prescription: Prescription = {
      id: Date.now().toString(),
      doctorName,
      customerName,
      notes,
      items: currentItems.filter(item => item.requiresPrescription),
      imageData: capturedImage || undefined,
      timestamp: new Date().toISOString()
    };

    // Save to local storage
    const existingPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    const updatedPrescriptions = [...existingPrescriptions, prescription];
    localStorage.setItem('prescriptions', JSON.stringify(updatedPrescriptions));
    setSavedPrescriptions(updatedPrescriptions);

    // Add items to cart if not already there
    prescription.items.forEach(item => {
      if (!currentItems.some(currentItem => currentItem.id === item.id)) {
        onAddToCart([item]);
      }
    });

    // Set prescription as verified
    setPrescriptionVerified(true);

    // Clear form
    clearForm();
    onClose();
  };

  // Load saved prescriptions on mount
  React.useEffect(() => {
    const loadedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    setSavedPrescriptions(loadedPrescriptions);
  }, []);

  const handleAddToCart = () => {
    onAddToCart(prescribedItems);
    onClose();
  };

  const filteredPrescriptions = React.useMemo(() => {
    if (!selectedDate) return savedPrescriptions;
    
    const start = startOfDay(selectedDate);
    const end = endOfDay(selectedDate);
    
    return savedPrescriptions.filter(prescription => {
      const prescriptionDate = new Date(prescription.timestamp);
      return isWithinInterval(prescriptionDate, { start, end });
    });
  }, [savedPrescriptions, selectedDate]);

  const handlePrescriptionClick = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Prescription Management</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Prescription Book" />
          <Tab label="New Entry" />
        </Tabs>
      </Box>

      <DialogContent>
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <Typography variant="h6" gutterBottom>
                  Previous Prescriptions
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Filter by Date"
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <List
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                  maxHeight: '600px',
                  overflow: 'auto'
                }}
              >
                {filteredPrescriptions.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary="No prescriptions found"
                      secondary={selectedDate ? `for ${format(selectedDate, 'PPP')}` : ''}
                    />
                  </ListItem>
                ) : (
                  filteredPrescriptions.map((prescription) => (
                    <ListItem 
                      key={prescription.id}
                      button
                      onClick={() => handlePrescriptionClick(prescription)}
                      selected={selectedPrescription?.id === prescription.id}
                      divider
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="bold">
                            {prescription.customerName} - Dr. {prescription.doctorName}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              Date: {format(new Date(prescription.timestamp), 'PPp')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Items: {prescription.items.length}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </Grid>

            <Grid item xs={6}>
              {selectedPrescription ? (
                <Box
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    p: 2,
                    height: '600px',
                    overflow: 'auto'
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Prescription Details
                  </Typography>

                  {selectedPrescription.imageData && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Prescription Image
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          height: '200px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          bgcolor: 'black',
                          borderRadius: 1,
                          mb: 2
                        }}
                      >
                        <img
                          src={selectedPrescription.imageData}
                          alt="Prescription"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  <Typography variant="subtitle1" gutterBottom>
                    Patient Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1">
                      <strong>Customer:</strong> {selectedPrescription.customerName}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Doctor:</strong> {selectedPrescription.doctorName}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Date:</strong> {format(new Date(selectedPrescription.timestamp), 'PPp')}
                    </Typography>
                  </Box>

                  <Typography variant="subtitle1" gutterBottom>
                    Prescribed Medicines
                  </Typography>
                  <List>
                    {selectedPrescription.items.map((item) => (
                      <ListItem key={item.id}>
                        <ListItemText
                          primary={item.name}
                          secondary={`${item.dosage_amount}${item.dosage_unit} - Qty: ${item.quantity}`}
                        />
                        <Chip
                          label="Rx"
                          color="error"
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>

                  {selectedPrescription.notes && (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Notes
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedPrescription.notes}
                      </Typography>
                    </>
                  )}
                </Box>
              ) : (
                <Box
                  sx={{
                    height: '600px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography color="text.secondary">
                    Select a prescription to view details
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2} sx={{ height: '600px' }}>
            <Grid item xs={6}>
              <StyledPaper>
                <Typography variant="h6" gutterBottom>
                  Camera/Scanner
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Camera</InputLabel>
                  <Select
                    value={selectedCamera}
                    onChange={handleCameraChange}
                    label="Select Camera"
                  >
                    {availableCameras.map((camera) => (
                      <MenuItem key={camera.deviceId} value={camera.deviceId}>
                        {camera.label || `Camera ${camera.deviceId}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '300px',
                    backgroundColor: 'black',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 2,
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  {capturedImage ? (
                    <img
                      src={capturedImage}
                      alt="Captured prescription"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  )}
                  {!stream && !capturedImage && (
                    <CameraAltIcon
                      sx={{
                        position: 'absolute',
                        fontSize: '64px',
                        color: 'grey.500',
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<PhotoCameraIcon />}
                    onClick={handleCapture}
                    disabled={!stream || !!capturedImage}
                    fullWidth
                  >
                    Capture Image
                  </Button>
                  {capturedImage && (
                    <Button
                      variant="outlined"
                      onClick={() => setCapturedImage(null)}
                      fullWidth
                    >
                      Retake
                    </Button>
                  )}
                </Box>
              </StyledPaper>
            </Grid>

            <Grid item xs={6}>
              <StyledPaper>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom>
                    Prescription Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Doctor Name"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Customer Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1">
                          Prescribed Medicines
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={onManualSearchOpen}
                        >
                          Add Medicine
                        </Button>
                      </Box>
                      <Box sx={{ 
                        maxHeight: '150px', 
                        overflow: 'auto',
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'background.paper'
                      }}>
                        <List dense>
                          {currentItems.filter(item => item.requiresPrescription).map((item) => (
                            <ListItem 
                              key={item.id}
                              divider
                              secondaryAction={
                                <Chip
                                  label="Rx"
                                  color="error"
                                  size="small"
                                />
                              }
                            >
                              <ListItemText
                                primary={item.name}
                                secondary={`${item.dosage_amount}${item.dosage_unit} - Qty: ${item.quantity}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </StyledPaper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!doctorName || !customerName}
            >
              Save Prescription
            </Button>
          </Box>
        </TabPanel>
      </DialogContent>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Dialog>
  );
};

export default PrescriptionDialog; 