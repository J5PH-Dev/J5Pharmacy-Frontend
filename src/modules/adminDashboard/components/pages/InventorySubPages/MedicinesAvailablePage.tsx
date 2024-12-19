import React, { useState, useEffect, ChangeEvent } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack, Autocomplete, TextField, InputAdornment, Theme, useTheme, SelectChangeEvent, FormControl, InputLabel, Select, OutlinedInput, MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Alert, DialogTitle, DialogContent, Dialog, FormControlLabel, DialogActions, Checkbox, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add'; // Add Material UI icon
import { useNavigate, useParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useLocation } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';


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

interface Medicine {
  medicineID: string;
  name: string;
  barcode: string;
  category: string;
  price: number;
  stock: number;
}


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
  const [sortedRows, setSortedRows] = React.useState<any[]>([]);  // Initialize as an empty array
  const [originalRows, setOriginalRows] = useState<Medicine[]>([]);
  const [filteredRows, setFilteredRows] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set()); // To store selected row ids (medicineID)
  const [selectAll, setSelectAll] = useState<boolean>(false); // To track the "select all" checkbox state
  const location = useLocation();
  const [successMessageFromDeletion, setsuccessMessageFromDeletion] = useState(location.state?.successMessage);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<string | null>(null);
  // New state for confirmation modal
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [medicinesToDelete, setMedicinesToDelete] = useState<string[]>([]); // For multiple selected medicines
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch data from the API on component mount
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get<Medicine[]>('/admin/inventory/view-medicines-available');
        setOriginalRows(response.data); // Store the unfiltered data
        setFilteredRows(response.data);  // Set filtered rows
        setSortedRows(response.data);     // Set sorted rows from API
      } catch (error) {
        console.error('Error fetching medicines:', error);
      }
    };

    fetchMedicines();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/admin/inventory/get-categories');
        setCategories(response.data); // Assuming the API returns an array of strings
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);


  const [newMedicineData, setNewMedicineData] = useState({
    name: '',
    barcode: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    sideEffects: '',
    requiresPrescription: 0, // Add this field
  });

  const [errors, setErrors] = useState({
    medicineName: false,
    medicineID: false,
    groupName: false,
    price: false,
    stockQty: false,
    howToUse: false,
    sideEffects: false,
  });

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewMedicineData((prevData) => ({
      ...prevData,
      requiresPrescription: event.target.checked ? 1 : 0, // Set to 1 if checked, 0 if not
    }));
  };

  // Validate inputs and add data to table
  const handleSaveNewItem = async () => {
    const validationErrors = {
      medicineName: !newMedicineData.name,
      medicineID: !newMedicineData.barcode,
      groupName: !newMedicineData.category,
      stockQty: !newMedicineData.stock,
      price: !newMedicineData.price,  // Add validation for price
      howToUse: !newMedicineData.description,
      sideEffects: !newMedicineData.sideEffects,
    };

    setErrors(validationErrors);

    // Check if any validation errors exist
    const hasErrors = Object.values(validationErrors).some((error) => error);
    if (hasErrors) return;

    console.log('New Medicine Data:', newMedicineData);

    try {
      // POST request to save the new item
      await axios.post('/admin/inventory/add-medicine', newMedicineData);

      // Close the modal and reset the form
      handleModalClose();
      resetForm();
      setSuccessMessage(`${newMedicineData.name} has been added successfully!`);

      // Refresh the medicines list
      const response = await axios.get('/admin/inventory/view-medicines-available');
      setFilteredRows(response.data);  // Update table rows
      setSortedRows(response.data);    // Update sorted rows
    } catch (error) {
      console.error('Error adding new item:', error);
    }
  };


  // Handle change for modal inputs
  const handleModalInputChange = (key: string, value: string) => {
    setNewMedicineData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleChange = (event: SelectChangeEvent<string>) => {
    const { value } = event.target;

    setPersonName([value]); // Update with selected category

    // If "All" is selected, show all rows
    if (value === 'All') {
      setFilteredRows(sortedRows); // Display all rows if "All" is selected
    } else {
      // Filter rows based on the selected category
      const newFilteredRows = sortedRows.filter(row =>
        row.category === value
      );

      setFilteredRows(newFilteredRows.length > 0 ? newFilteredRows : []);
    }
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


  const handleViewDetails = (medicineName: string) => {
    navigate(`/admin/inventory/view-medicines-description/${medicineName}`);
  };

  const handleEditItem = (medicineName: string) => {
    navigate(`/admin/inventory/view-medicines-description/${medicineName}/edit-details`);
  };

  const handleDeleteItem = (barcode: string) => {
    setMedicineToDelete(barcode); // Set the medicine name to be deleted
    setIsDeleteModalOpen(true); // Open the confirmation modal
  };

  // Function to handle delete item confirmation
  const handleConfirmDeleteItem = async () => {
    if (medicineToDelete) {
      try {
        // Send DELETE request to the backend with the barcode
        const response = await axios.delete(`/admin/inventory/delete-medicine/${medicineToDelete}`);

        if (response.status === 200) {
          // Update the rows in the frontend after successful deletion
          setSortedRows((prevRows) => prevRows.filter((row) => row.barcode !== medicineToDelete));
          setFilteredRows((prevRows) => prevRows.filter((row) => row.barcode !== medicineToDelete));

          setSuccessMessage(`Successfully deleted medicine with barcode: ${medicineToDelete}`);
        } else {
          setSuccessMessage('Failed to delete medicine.');
        }

        // Reset delete state
        setMedicineToDelete(null);
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error('Error deleting item:', error);
        setSuccessMessage('An error occurred while deleting the medicine.');
      }
    }
  };


  // Function to close delete confirmation modal
  const handleDeleteModalClose = () => {
    setMedicineToDelete(null);
    setIsDeleteModalOpen(false);
  };


  const handleDeleteItemMultiple = () => {
    // Open the confirmation modal
    setIsConfirmDeleteModalOpen(true);
  };


  const handleConfirmDelete = async () => {
    // Get the list of selected medicine barcodes based on the selected rows' IDs
    const barcodesToDelete = Array.from(selectedRows).map(
      (selectedID) => filteredRows.find((row) => row.medicineID === selectedID)?.barcode
    ).filter(Boolean); // Remove any undefined values in case some IDs were invalid

    // If there are selected medicines to delete
    if (barcodesToDelete.length > 0) {
      try {
        // Send the request to the backend to delete the medicines
        await axios.post('/admin/inventory/delete-medicines', { barcodes: barcodesToDelete });

        // Remove selected medicines from sortedRows and filteredRows
        const updatedRows = sortedRows.filter(
          (row) => !barcodesToDelete.includes(row.barcode)
        );
        const updatedFilteredRows = filteredRows.filter(
          (row) => !barcodesToDelete.includes(row.barcode)
        );

        // Update the state with the new rows
        setSortedRows(updatedRows);
        setFilteredRows(updatedFilteredRows);

        // Set success message
        setSuccessMessage('Selected medicines deleted successfully!');
        setSelectedRows(new Set()); // Clear the selected rows
      } catch (error) {
        console.error('Error deleting medicines:', error);
        setSuccessMessage('Failed to delete medicines');
      }
    }

    // Close the confirmation modal after deletion
    setIsConfirmDeleteModalOpen(false);
  };


  // Function to handle cancel delete
  const cancelDelete = () => {
    setMedicinesToDelete([]); // Clear the selected medicines
    setIsConfirmDeleteModalOpen(false); // Close the modal
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);

    const filteredData = originalRows.filter(row =>
      row.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredRows(filteredData);
  };


  useEffect(() => {
    let filteredData = filteredRows;

    if (searchQuery !== '') {
      filteredData = filteredData.filter(row =>
        row.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRows(filteredData);
  }, [searchQuery, filteredRows]);


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
      name: '', // Changed from 'medicineName'
      barcode: '', // Changed from 'medicineID'
      category: '', // Changed from 'groupName'
      price: '',
      stock: '', // Changed from 'stockQty'
      description: '', // Changed from 'howToUse'
      sideEffects: '',
      requiresPrescription: 0, // Keep this field
    });

    setErrors({
      medicineName: false,
      medicineID: false,
      groupName: false,
      price: false,
      stockQty: false,
      howToUse: false,
      sideEffects: false,
    });
  };


  const handleRowSelect = (medicineID: string) => {
    const newSelectedRows = new Set(selectedRows);

    if (newSelectedRows.has(medicineID)) {
      newSelectedRows.delete(medicineID);  // Deselect the row
    } else {
      newSelectedRows.add(medicineID);  // Select the row
    }

    setSelectedRows(newSelectedRows);
    // "Select all" state should depend on whether all rows are selected or not
    setSelectAll(newSelectedRows.size === filteredRows.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());  // Unselect all rows
    } else {
      const allRowIDs = new Set(filteredRows.map((row) => row.medicineID)); // Select all rows
      setSelectedRows(allRowIDs);
    }
    setSelectAll(!selectAll);  // Toggle "select all" checkbox
  };

    // Remove the success message after 3 seconds
    useEffect(() => {
      if (successMessageFromDeletion) {
        const timer = setTimeout(() => {
          setsuccessMessageFromDeletion(null); // Remove the message after 3 seconds
        }, 3000);
  
        // Cleanup the timeout if component is unmounted or message is cleared
        return () => clearTimeout(timer);
      }
    }, [successMessageFromDeletion]);

  return (

    <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>
      <Box>
        {/* Medicine Deleted Alert Message */}
        {successMessageFromDeletion && (
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
            {successMessageFromDeletion}
          </Alert>
        )}
      </Box>
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
                value={newMedicineData.name}
                onChange={(e) => {
                  handleModalInputChange('name', e.target.value);
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
                value={newMedicineData.barcode}
                onChange={(e) => {
                  handleModalInputChange('barcode', e.target.value);
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
                  value={newMedicineData.category}
                  onChange={(e) => {
                    handleModalInputChange('category', e.target.value);
                    if (errors.groupName) {
                      setErrors((prevErrors) => ({
                        ...prevErrors,
                        groupName: false,
                      }));
                    }
                  }}
                  error={errors.groupName}
                >
                  {categories.map((name) => (
                    <MenuItem key={name} value={name} style={getStyles(name, personName, theme)}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Price"
                type="number"
                value={newMedicineData.price}
                onChange={(e) => {
                  handleModalInputChange('price', e.target.value);
                  if (errors.price) {
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      price: false,
                    }));
                  }
                }}
                variant="outlined"
                sx={{ width: 340, backgroundColor: 'white' }}
                error={errors.price}
                helperText={errors.price ? "This field is required" : ""}
              />
            </div>

            <div className="flex flex-row flex-wrap gap-5 mt-4">
              <TextField
                label="Quantity in Number"
                type="number"
                value={newMedicineData.stock}
                onChange={(e) => {
                  handleModalInputChange('stock', e.target.value);
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
                value={newMedicineData.description}
                onChange={(e) => {
                  handleModalInputChange('description', e.target.value);
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
              control={
                <Checkbox
                  checked={newMedicineData.requiresPrescription === 1} // Ensure the checkbox reflects the state
                  onChange={handleCheckboxChange} // Handle checkbox change
                />
              }
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
          <InputLabel>- Select Category -</InputLabel>
          <Select
            value={personName[0]} // Use the first (and only) selected value
            label="Filter by Category"
            onChange={handleChange}
            MenuProps={MenuProps}
            input={<OutlinedInput label="Filter by Category" />}
          >
            {/* Add "All" as the default option */}
            <MenuItem key="all" value="All" style={getStyles('All', personName, theme)}>
              All
            </MenuItem>
            {categories.map((name) => (
              <MenuItem key={name} value={name} style={getStyles(name, personName, theme)}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 500, overflow: 'auto', boxShadow: 'none' }}>
        <Table aria-label="medicines-table" stickyHeader>
          <TableHead sx={{ backgroundColor: 'white', zIndex: 1 }}>
            <TableRow>
              <TableCell
                padding="checkbox"
                sx={{
                  fontWeight: 'bold',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'white',
                  zIndex: 3, // Ensure it's above other headers
                }}
              >
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAll}
                  color="primary"
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Medicine Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Barcode</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Stock Quantity</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Check if filteredRows is empty */}
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', padding: '16px' }}>
                  No items available for the selected category.
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map(row => (
                <TableRow key={row.medicineID}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRows.has(row.medicineID)}
                      onChange={() => handleRowSelect(row.medicineID)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.barcode}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.price}</TableCell>
                  <TableCell>{row.stock}</TableCell>
                  <TableCell>
                    <div className="flex flex-row">
                      <IconButton onClick={() => handleViewDetails(row.name)} sx={{ color: '#2BA3B6', mr: 0 }}>
                        <Visibility sx={{ fontSize: 24 }} />
                      </IconButton>
                      <IconButton onClick={() => handleEditItem(row.name)} sx={{ color: '#1D7DFA', mr: 0 }}>
                        <Edit sx={{ fontSize: 24 }} />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteItem(row.barcode)} sx={{ color: '#D83049' }}>
                        <Delete sx={{ fontSize: 24 }} />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        aria-labelledby="delete-confirmation-dialog-title"
        PaperProps={{ style: { padding: '10px' } }} // Add padding to the modal
      >
        <DialogTitle id="delete-confirmation-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{medicineToDelete}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteModalClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDeleteItem} color="primary" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {selectedRows.size > 0 && (
        <Button
          variant="contained"
          sx={{
            backgroundColor: 'white',
            color: '#F0483E',
            padding: '15px 24px',
            border: '1px solid #F0483E',
            marginTop: '20px',
            textTransform: 'none', // Optional: Disable uppercase text
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#FFF5F5', // Light background on hover
            },
          }}
          onClick={handleDeleteItemMultiple}
          startIcon={<DeleteIcon sx={{ color: '#F0483E' }} />}
        >
          Delete Medicine
        </Button>
      )}

      {/* Confirmation Modal */}
      <Dialog
        open={isConfirmDeleteModalOpen}
        onClose={cancelDelete}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the following medicine(s)?
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
            {medicinesToDelete.join(', ')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleConfirmDelete} color="error">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>



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