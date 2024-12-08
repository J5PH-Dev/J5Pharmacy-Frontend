import React, { useState, useEffect } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack, Autocomplete, TextField, InputAdornment, Theme, useTheme, SelectChangeEvent, FormControl, InputLabel, Select, OutlinedInput, MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Alert, DialogTitle, DialogContent, Dialog, FormControlLabel, DialogActions, Checkbox } from '@mui/material';
import AddIcon from '@mui/icons-material/Add'; // Add Material UI icon
import { useNavigate, useParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useLocation } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';


function createData(
  medicineName: string,
  medicineID: string,
  groupName: string,
  stockQty: number,
) {
  return { medicineName, medicineID, groupName, stockQty };
}

// Example data rows
const rows = [
  createData('Paracetamol', 'MED001', 'Pain Relievers', 150),
  createData('Amoxicillin', 'MED002', 'Antibiotics', 200),
  createData('Ibuprofen', 'MED003', 'Anti-inflammatory', 120),
  createData('Aspirin', 'MED004', 'Pain Relievers', 180),
  createData('Metformin', 'MED005', 'Diabetes', 140),
  createData('Lisinopril', 'MED006', 'Blood Pressure', 160),
  createData('Omeprazole', 'MED007', 'Antacid', 210),
  createData('Cetirizine', 'MED008', 'Antihistamine', 220),
  createData('Fluoxetine', 'MED009', 'Antidepressants', 110),
  createData('Salbutamol', 'MED010', 'Asthma', 130),
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = [
  'Pain Relievers',
  'Antibiotics',
  'Anti-inflammatories',
  'Diabetes Medications',
  'Blood Pressure Medications',
  'Antacids',
  'Antihistamines',
  'Antidepressants',
  'Asthma Medications',
  'Vitamins and Supplements',
];

// Define a type for the row keys
type RowKey = 'medicineName' | 'medicineID' | 'groupName' | 'stockQty';

function getStyles(name: string, personName: string[], theme: Theme) {
  return {
    fontWeight: personName.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

const MedicinesAvailablePage = () => {
  const theme = useTheme();
  const [personName, setPersonName] = React.useState<string[]>([]);
  const [sortedRows, setSortedRows] = React.useState(rows);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRows, setFilteredRows] = useState(rows);
  const [sortConfig, setSortConfig] = React.useState<{ key: RowKey; direction: 'asc' | 'desc' }>({
    key: 'medicineName', direction: 'asc'
  });
  const location = useLocation();
  const successMessageFromDeletion = location.state?.successMessage;
  const [successMessage, setSuccessMessage] = useState<string | null>(successMessageFromDeletion);
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [medicineNameCreate, setMedicineNameCreate] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const medicineGroups = [
    'Pain Relievers',
    'Antibiotics',
    'Anti-inflammatory',
    'Diabetes',
    // Add other groups here
  ];

  const [newMedicineData, setNewMedicineData] = useState({
    medicineName: '',
    medicineID: '',
    groupName: '',
    stockQty: '',
    howToUse: '',
    sideEffects: '',
  });
  const [errors, setErrors] = useState({
    medicineName: false,
    medicineID: false,
    groupName: false,
    stockQty: false,
    howToUse: false,
    sideEffects: false,
  });


  // Validate inputs and add data to table
  const handleSaveNewItem = () => {
    const validationErrors = {
      medicineName: !newMedicineData.medicineName,
      medicineID: !newMedicineData.medicineID,
      groupName: !newMedicineData.groupName,
      stockQty: !newMedicineData.stockQty,
      howToUse: !newMedicineData.howToUse,
      sideEffects: !newMedicineData.sideEffects,
    };

    setErrors(validationErrors);

    // Check if all required fields are valid
    const isFormValid = Object.values(validationErrors).every((isInvalid) => !isInvalid);

    if (isFormValid) {
      // Add new item to table data
      const newRow = createData(
        newMedicineData.medicineName,
        newMedicineData.medicineID,
        newMedicineData.groupName,
        Number(newMedicineData.stockQty),
      );

      // Update the rows
      setSortedRows((prevRows) => {
        const updatedRows = [...prevRows, newRow];
        setFilteredRows(updatedRows);  // Update filteredRows after adding the new row
        return updatedRows;
      });

      setModalOpen(false); // Close the modal
      setSuccessMessage("New item added successfully!");
    }
  };


  // Handle change for modal inputs
  const handleModalInputChange = (key: string, value: string) => {
    setNewMedicineData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      typeof value === 'string' ? value.split(',') : value,
    );
  };


  const handleBreadcrumbClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/admin/inventory');
  };

  const handleAddNewItemClick = () => {
    resetForm(); // Reset the form when modal closes
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    resetForm(); // Reset the form when modal closes
  };

  const handleGroupChange = (event: SelectChangeEvent<string>) => {
    setSelectedGroup(event.target.value as string);
  };


  const handleSort = (key: RowKey) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    const sortedData = [...rows].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setSortedRows(sortedData);
    setSortConfig({ key, direction });
  };

  const handleViewDetails = (medicineName: string) => {
    navigate(`/admin/inventory/view-medicines-description/${medicineName}`);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
  };

  useEffect(() => {
    let filteredData = rows;

    if (searchQuery !== '') {
      filteredData = filteredData.filter(row =>
        row.medicineName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (personName.length > 0) {
      filteredData = filteredData.filter(row => personName.includes(row.groupName));
    }

    setFilteredRows(filteredData);
  }, [searchQuery, personName]);

  useEffect(() => {
    if (successMessage) {
      const timeout = setTimeout(() => {
        setSuccessMessage(null); // Clear the message after 3 seconds
      }, 3000);

      return () => clearTimeout(timeout); // Cleanup the timeout
    }
  }, [successMessage]);

  const resetForm = () => {
    setNewMedicineData({
      medicineName: '',
      medicineID: '',
      groupName: '',
      stockQty: '',
      howToUse: '',
      sideEffects: '',
    });
    setErrors({
      medicineName: false,
      medicineID: false,
      groupName: false,
      stockQty: false,
      howToUse: false,
      sideEffects: false,
    });
  };


  return (
    <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: '16px', display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
        <Link color="inherit" href="/" onClick={handleBreadcrumbClick}>
          Inventory
        </Link>
        <Typography color="text.primary">List of Medicine</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Medicines Available
          </Typography>
          <Typography variant="body1" sx={{ mt: -1 }}>
            List of medicines available for sales.
          </Typography>
        </Box>

        <Box sx={{ mt: { xs: '27px', sm: 0 }, textAlign: 'center' }}>
          <Button variant="contained" sx={{ backgroundColor: '#01A768', color: '#fff', fontWeight: 'medium', textTransform: 'none', '&:hover': { backgroundColor: '#017F4A' }, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }} onClick={handleAddNewItemClick}>
            <AddIcon />
            Add New Item
          </Button>
        </Box>
      </Box>


      {/* Modal */}
      <Dialog
        open={isModalOpen}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            handleModalClose();
            resetForm(); // Reset the form when modal closes
          }
        }}
        fullWidth
        maxWidth="md"
      >
        <Box sx={{ p: 3 }}>
          <DialogTitle sx={{ fontSize: '25px' }}> Add New Medicine Item</DialogTitle>
          <DialogTitle sx={{ mt: '-30px', fontSize: '15px', fontWeight: 'normal' }}>
            Provide the necessary details to add a new medicine to your inventory.
          </DialogTitle>
          <DialogContent>
            <div className="flex flex-row flex-wrap gap-5 mt-1">
              <TextField
                label="Medicine Name"
                value={newMedicineData.medicineName}
                onChange={(e) => {
                  handleModalInputChange('medicineName', e.target.value);
                  if (errors.medicineName) {
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      medicineName: false,
                    }));
                  }
                }}
                variant="outlined"
                sx={{ width: 340, backgroundColor: 'white' }}
                error={errors.medicineName}
                helperText={errors.medicineName ? "This field is required" : ""}
              />
              <TextField
                label="Medicine ID"
                value={newMedicineData.medicineID}
                onChange={(e) => {
                  handleModalInputChange('medicineID', e.target.value);
                  if (errors.medicineID) {
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      medicineID: false,
                    }));
                  }
                }}
                variant="outlined"
                sx={{ width: 340, backgroundColor: 'white' }}
                error={errors.medicineID}
                helperText={errors.medicineID ? "This field is required" : ""}
              />
            </div>

            <div className="flex flex-row flex-wrap gap-5 mt-4">
              <FormControl sx={{ width: 340, backgroundColor: 'white' }}>
                <InputLabel>Medicine Group</InputLabel>
                <Select
                  value={newMedicineData.groupName}
                  onChange={(e) => {
                    handleModalInputChange('groupName', e.target.value);
                    if (errors.groupName) {
                      setErrors((prevErrors) => ({
                        ...prevErrors,
                        groupName: false,
                      }));
                    }
                  }}
                  error={errors.groupName}
                >
                  {medicineGroups.map((group) => (
                    <MenuItem key={group} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Quantity in Number"
                type="number"
                value={newMedicineData.stockQty}
                onChange={(e) => {
                  handleModalInputChange('stockQty', e.target.value);
                  if (errors.stockQty) {
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      stockQty: false,
                    }));
                  }
                }}
                variant="outlined"
                sx={{ width: 340, backgroundColor: 'white' }}
                error={errors.stockQty}
                helperText={errors.stockQty ? "This field is required" : ""}
              />
            </div>

            <div className="flex flex-col flex-wrap gap-5 mt-4">
              <TextField
                label="How to use"
                multiline
                rows={4}
                value={newMedicineData.howToUse}
                onChange={(e) => {
                  handleModalInputChange('howToUse', e.target.value);
                  if (errors.howToUse) {
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      howToUse: false,
                    }));
                  }
                }}
                sx={{ width: '100%', backgroundColor: 'white' }}
                error={errors.howToUse}
                helperText={errors.howToUse ? "This field is required" : ""}
              />
              <TextField
                label="Side Effects"
                multiline
                rows={4}
                value={newMedicineData.sideEffects}
                onChange={(e) => {
                  handleModalInputChange('sideEffects', e.target.value);
                  if (errors.sideEffects) {
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      sideEffects: false,
                    }));
                  }
                }}
                sx={{ width: '100%', backgroundColor: 'white' }}
                error={errors.sideEffects}
                helperText={errors.sideEffects ? "This field is required" : ""}
              />
            </div>

            <FormControlLabel
              control={<Checkbox />}
              label="Requires Prescription"
              sx={{ marginTop: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleModalClose} sx={{ color: '#666' }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSaveNewItem}>
              Add New
            </Button>
          </DialogActions>
        </Box>
      </Dialog>


      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 2 }}>
        <TextField
          label="Search Medicine Inventory"
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            backgroundColor: '#fff',
            borderRadius: '4px',
            width: '400px',
            boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
            flexShrink: 0,
          }}
        />

        <FormControl sx={{ width: '250px', sm: 0, backgroundColor: 'white' }}>
          <InputLabel>- Select Group -</InputLabel>
          <Select
            value={personName}
            label="Filter by Category"
            onChange={handleChange}
            MenuProps={MenuProps}
            multiple
            input={<OutlinedInput label="Filter by Category" />}
          >
            {names.map((name) => (
              <MenuItem key={name} value={name} style={getStyles(name, personName, theme)}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 500, overflow: 'auto', boxShadow: 'none' }}>
        <Table aria-label="medicines-table">
          <TableHead sx={{ backgroundColor: 'white', zIndex: 1 }}>
            <TableRow>
              <TableCell
                onClick={() => handleSort('medicineName')}
                sx={{
                  fontWeight: 'bold',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                Medicine Name
                {sortConfig.key === 'medicineName' && (
                  sortConfig.direction === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
                )}
              </TableCell>
              <TableCell
                onClick={() => handleSort('medicineID')}
                sx={{
                  fontWeight: 'bold',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                Medicine ID
                {sortConfig.key === 'medicineID' && (
                  sortConfig.direction === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
                )}
              </TableCell>
              <TableCell
                onClick={() => handleSort('groupName')}
                sx={{
                  fontWeight: 'bold',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                Category
                {sortConfig.key === 'groupName' && (
                  sortConfig.direction === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
                )}
              </TableCell>
              <TableCell
                onClick={() => handleSort('stockQty')}
                sx={{
                  fontWeight: 'bold',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                Stock Quantity
                {sortConfig.key === 'stockQty' && (
                  sortConfig.direction === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
                )}
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'white',
                  zIndex: 2,
                }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>


          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.medicineID}>
                <TableCell>{row.medicineName}</TableCell>
                <TableCell>{row.medicineID}</TableCell>
                <TableCell>{row.groupName}</TableCell>
                <TableCell>{row.stockQty}</TableCell>
                <TableCell>
                  <Button variant="text" onClick={() => handleViewDetails(row.medicineName)}>
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Medicine Deleted Alert Message */}
      <Box>
        {successMessage && (
          <Alert
            icon={<CheckIcon fontSize="inherit" />}
            severity="success"
            sx={{
              position: 'fixed',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1201, // Ensure it's above other content
            }}
          >
            {successMessage}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default MedicinesAvailablePage;