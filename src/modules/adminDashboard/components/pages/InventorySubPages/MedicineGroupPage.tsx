import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack, Autocomplete, TextField, InputAdornment, Theme, useTheme, SelectChangeEvent, FormControl, InputLabel, Select, OutlinedInput, MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Alert, DialogActions, DialogContent, Dialog, DialogTitle, Checkbox, IconButton, FormHelperText } from '@mui/material';
import AddIcon from '@mui/icons-material/Add'; // Add Material UI icon
import { useLocation, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckIcon from '@mui/icons-material/Check';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';



// Define the structure of each row in the table
interface MedicineGroup {
  groupName: string;
  noOfMedicine: string; // Adjusted to string to match your data type
}
type Medicine = {
  name: string;
};


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

// Define a type for the row keys
type RowKey = 'groupName' | 'noOfMedicine';


const MedicineGroupPage = () => {
  const theme = useTheme();
  const [personName, setPersonName] = React.useState<string[]>([]);
  const [sortedRows, setSortedRows] = useState<MedicineGroup[]>([]); // Typed as MedicineGroup[]
  const [searchQuery, setSearchQuery] = useState('');
  const [medicineGroup, setMedicineGroup] = React.useState(''); // Holds input value
  const [medicineGroups, setMedicineGroups] = useState<MedicineGroup[]>([]); // Correct typing for fetched data
  const [sortConfig, setSortConfig] = useState<{ key: RowKey; direction: 'asc' | 'desc' }>({
    key: 'groupName',
    direction: 'asc',
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);

  const location = useLocation();
  const successMessageFromGroupDeletion = location.state?.successMessage;
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<string>(''); // Use string instead of string[]
  // const [existingGroups, setExistingGroups] = useState(rows);
  const [successMessage, setSuccessMessage] = useState('');
  const [modalSuccessMessage, setModalSuccessMessage] = useState(''); // Modal-specific success message
  const tableContainerRef = useRef<HTMLDivElement>(null); // Reference for the table container
  const [isNewItemAdded, setIsNewItemAdded] = useState(false); // Track if a new item is added
  const navigate = useNavigate();
  // Add this state and modal handling in your component
  const [medicineToDelete, setMedicineToDelete] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [availableMedicines, setAvailableMedicines] = useState<Medicine[]>([]); // To store fetched medicines
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);


  const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value },
    } = event;
    setPersonName(typeof value === 'string' ? value.split(',') : value);
  };

  const handleBreadcrumbClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/admin/inventory'); // Go back to the Inventory Page
  };

  const fetchMedicines = async () => {
    try {
      const response = await axios.get('/admin/inventory/view-medicines-available');
      console.log(response.data); // Log the data to check
      setAvailableMedicines(response.data); // Set the available medicines
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  useEffect(() => {
    if (isEditModalOpen) {
      console.log('Modal opened, fetching medicines...');
      fetchMedicines();
    }
  }, [isEditModalOpen]);

  useEffect(() => {
    // Fetch medicine groups from backend
    const fetchMedicineGroups = async () => {
      try {
        const response = await axios.get('/admin/inventory/view-medicines-groups'); // Replace with your API endpoint
        setMedicineGroups(response.data); // Set fetched data
        setSortedRows(response.data); // Set initial sorted rows
      } catch (error) {
        console.error('Error fetching medicine groups:', error);
      }
    };
    fetchMedicineGroups();
  }, []);

  const handleSort = (key: RowKey) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';

    const sortedData = [...sortedRows].sort((a, b) => {
      if (key === 'noOfMedicine') {
        return direction === 'asc'
          ? parseInt(a[key], 10) - parseInt(b[key], 10)
          : parseInt(b[key], 10) - parseInt(a[key], 10);
      }
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setSortConfig({ key, direction });
    setSortedRows(sortedData);
  };

  const handleModalCloseMultipleSelection = () => {
    setModalOpen(false);
    setSelectedMedicine('');
    setModalSuccessMessage(''); // Reset success message when modal closes
  };

  const handleAddMedicineGroup = () => {
    setSelectedMedicine(''); // Reset selected medicine when opening the modal
    setIsAddModalOpen(true); // Open the "Add New Group" modal
  };

  const [error, setError] = useState(false); // Track error state

  const handleSaveMedicineGroup = async () => {
    if (!selectedMedicine.trim()) {
      setError(true);
      return;
    }

    try {
      const response = await axios.post('/admin/add-medicine-group', {
        categoryName: selectedMedicine,
      });

      setSuccessMessage(response.data.message);
      setIsAddModalOpen(false);
      setSelectedMedicine(''); // Clear input after successful save

      const responseRefresh = await axios.get('/admin/inventory/view-medicines-groups'); // Replace with your API endpoint
      setMedicineGroups(responseRefresh.data); // Set fetched data
      setSortedRows(responseRefresh.data); // Set initial sorted rows
    } catch (error: any) {
      console.error('Error adding medicine group:', error);
      setModalSuccessMessage(
        error.response?.data?.message || 'Failed to add new category.'
      );
    }
  };




  // Scroll to bottom only when a new item is added

  // useEffect(() => {
  //   if (isNewItemAdded && tableContainerRef.current) {
  //     tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
  //     setIsNewItemAdded(false); // Reset the flag after scrolling
  //   }
  // }, [existingGroups, isNewItemAdded]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredRows = sortedRows.filter(row =>
    row.groupName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = () => {
    // Clear the modal success message when the user interacts
    setModalSuccessMessage('');
  };

  useEffect(() => {
    // Set timeout for hiding the success message after 3 seconds
    if (successMessage) {
      const timeout = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      return () => clearTimeout(timeout); // Cleanup the timeout when the component unmounts or the success message changes
    }

    if (successMessageFromGroupDeletion) {
      const timeout = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} }); // Clear state
      }, 3000);

      return () => clearTimeout(timeout); // Cleanup the timeout
    }
  }, [successMessage, successMessageFromGroupDeletion]);

  const handleSelectItem = (groupName: string) => {
    setSelectedItems((prev) =>
      prev.includes(groupName)
        ? prev.filter((item) => item !== groupName)
        : [...prev, groupName]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? medicineGroups.map((row) => row.groupName) : []);
  };

  const handleDeleteButtonClick = () => {
    setConfirmationModalOpen(true);
  };

  const handleConfirmDeleteCheckbox = async () => {
    try {
      // Send the selected items to the backend for deletion
      const response = await axios.post('/admin/delete-categories-multuple', { groupNames: selectedItems });

      setSuccessMessage(`Deleted successfully: ${selectedItems.join(', ')}`);
      setSelectedItems([]); // Clear selected items after deletion
      setConfirmationModalOpen(false); // Close the confirmation modal
      // Optionally, refresh the data or update the state with the new list
      const responseRefresh = await axios.get('/admin/inventory/view-medicines-groups'); // Replace with your API endpoint
      setMedicineGroups(responseRefresh.data); // Set fetched data
      setSortedRows(responseRefresh.data); // Set initial sorted rows
    } catch (error) {
      console.error('Error deleting categories:', error);
      // Handle error (display an error message)
    }
  };


  const handleModalClose = () => {
    setIsAddModalOpen(false); // Close "Add New Group" modal
    setIsEditModalOpen(false); // Close "Edit Medicine Group" modal
    setConfirmationModalOpen(false); // Close the confirmation modal
    setModalOpen(false); // Close the other modal (if necessary)
    setSelectedMedicine(''); // Reset selected medicines
    setError(false); // Reset error when modal is closed
    setModalSuccessMessage(''); // Reset success message when modal closes
  };


  const handleViewDetails = (groupName: string) => {
    navigate(`/admin/inventory/view-medicines-group/${groupName}`);
  };

  const [groupName, setGroupName] = useState(''); // Store group name
  const [noOfMedicine, setNoOfMedicine] = useState('3'); // Store no of medicines (default is 3)
  const [newMedicines, setNewMedicines] = useState<string[]>([]); // Store new medicines to be added
  const [medicineErrors, setMedicineErrors] = useState<boolean[]>([]); // Track errors for each medicine input

  // For Edit Medicine Group Modal
  const handleEditItem = (groupName: string) => {
    const row = medicineGroups.find((row) => row.groupName === groupName);
    if (row) {
      setGroupName(row.groupName);
      setNoOfMedicine(row.noOfMedicine);
      setIsEditModalOpen(true);
    }
  };


  // Add new medicine input field
  const handleAddMedicine = () => {
    setNewMedicines([...newMedicines, '']); // Add an empty string to represent a new medicine input
    setMedicineErrors([...medicineErrors, false]); // Initially no error for the new field
  };

  const handleMedicineChange = (index: number, value: string) => {
    const updatedMedicines = [...newMedicines];
    updatedMedicines[index] = value; // Update the specific medicine input
    setNewMedicines(updatedMedicines);
  };

  // Remove the medicine input field
  const handleRemoveMedicine = (index: number) => {
    const updatedMedicines = newMedicines.filter((_, i) => i !== index); // Remove by index
    const updatedErrors = medicineErrors.filter((_, i) => i !== index); // Remove corresponding error state
    setNewMedicines(updatedMedicines);
    setMedicineErrors(updatedErrors);
  };

  const categoryMap = {
    'BRANDED': 1,
    'GENERIC': 2,
    'COSMETICS': 3,
    'DIAPER': 4,
    'FACE AND BODY': 5,
    'GALENICALS': 6,
    'MILK': 7,
    'PILLS AND CONTRACEPTIVES': 8,
    'SYRUP': 9,
    'OTHERS': 10,
  };
  
  // This function should map a medicine name to its category ID
  const getCategoryForMedicine = (medicineName: string | string[]) => {
    // Replace this logic with actual logic if you have a different way to fetch category IDs
    // Example: Fetch category based on medicine name or other criteria
    if (medicineName.includes('Branded')) {
      return categoryMap['BRANDED'];
    } else if (medicineName.includes('Generic')) {
      return categoryMap['GENERIC'];
    } else if (medicineName.includes('Cosmetics')) {
      return categoryMap['COSMETICS'];
    } else {
      return categoryMap['OTHERS']; // Default category
    }
  };
  
  const handleSaveChanges = async () => {
    // Prepare the data to send to the backend
    const selectedMedicines = newMedicines.map((medicineName) => {
      const categoryId = getCategoryForMedicine(medicineName); // Get the category ID for the medicine
      return { name: medicineName, categoryId };
    });
  
    try {
      const response = await axios.post('/admin/group/save-medicine-group', {
        groupName,
        selectedMedicines,
      });
  
      if (response.status === 200) {
        setSuccessMessage('Changes saved successfully.');
        handleModalClose();
      }
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };
  


  const handleMedicineSelection = (
    e: React.ChangeEvent<HTMLInputElement>, // Type for the event parameter
    medicineName: string                     // Type for the medicineName parameter
  ) => {
    if (e.target.checked) {
      setSelectedMedicines([...selectedMedicines, medicineName]);
    } else {
      setSelectedMedicines(selectedMedicines.filter((name) => name !== medicineName));
    }
  };


  const handleDeleteItem = (medicineName: string) => {
    setMedicineToDelete(medicineName); // Set the medicine name to be deleted
    setIsDeleteModalOpen(true); // Open the confirmation modal
  };

  const handleConfirmDeleteItem = async () => {
    try {
      // Make the request to delete the category
      await axios.delete(`/admin/delete-categories/${medicineToDelete}`); // Adjust URL to match your backend route

      setSuccessMessage(`"${medicineToDelete}" has been deleted successfully.`);
      setIsDeleteModalOpen(false); // Close the modal
      // Optionally, refresh or update the table after deletion
      const responseRefresh = await axios.get('/admin/inventory/view-medicines-groups'); // Replace with your API endpoint
      setMedicineGroups(responseRefresh.data); // Set fetched data
      setSortedRows(responseRefresh.data); // Set initial sorted rows
    } catch (error) {
      console.error('Error deleting category:', error);
      // Optionally, display an error message
    }
  };

  const handleCloseDeleteModal = () => {
    setMedicineToDelete(null);
    setIsDeleteModalOpen(false);
  };

  return (
    <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>

      {/* Check if a success message exists */}
      {successMessageFromGroupDeletion && (
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
          {successMessageFromGroupDeletion}
        </Alert>
      )}

      {/* Check if a success message exists from adding a new group */}
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

      {/* Modal for Adding Medicine Group */}
      <Dialog
        open={isAddModalOpen}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            setModalOpen(false);
          }
        }}
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            padding: 2,
            boxShadow: 5,
            maxWidth: "567px",
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
            Add New Medicine Group
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            Select the group(s) to which the medicines will be added
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Medicine Group"
            variant="outlined"
            fullWidth
            sx={{ marginTop: '5px' }}
            value={selectedMedicine} // Bind value to selectedMedicine state
            onChange={(e) => {
              setSelectedMedicine(e.target.value); // Update input value
              if (error) setError(false); // Clear error when user starts typing
            }}
            error={error} // Show error when needed
            helperText={error ? "This field is required" : ""} // Error message
          />

          {/* Display success or error message inside the modal */}
          {modalSuccessMessage && (
            <Typography color="error" sx={{ textAlign: 'center', mt: 2 }}>
              {modalSuccessMessage}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between', padding: 2 }}>
          <Button
            onClick={handleModalClose} // Close modal
            variant="outlined"
            color="secondary"
            sx={{ borderRadius: 2, padding: '10px 20px' }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSaveMedicineGroup} // Trigger validation before saving
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 2,
              padding: '10px 20px',
              backgroundColor: '#01A768',
              '&:hover': { backgroundColor: '#017F4A' },
            }}
          >
            Add Medicine
          </Button>
        </DialogActions>
      </Dialog>

      {/* Breadcrumbs */}
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{
          marginBottom: '16px',
          display: 'flex',
          justifyContent: { xs: 'center', sm: 'flex-start' },
        }}
      >
        <Link color="inherit" href="/" onClick={handleBreadcrumbClick}>
          Inventory
        </Link>
        <Typography color="text.primary">Medicines Categories</Typography>
      </Breadcrumbs>

      {/* Page Title and Add New Item Button Container */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Medicines Categories
          </Typography>
          <Typography variant="body1" sx={{ mt: -1 }}>
            List of medicines Categories.
          </Typography>
        </Box>

        <Box sx={{ mt: { xs: '27px', sm: 0 }, textAlign: 'center' }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#01A768',
              color: '#fff',
              fontWeight: 'medium',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#017F4A' },
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              justifyContent: 'center',
            }}
            onClick={handleAddMedicineGroup}
          >
            <AddIcon />
            Add New Category
          </Button>
        </Box>
      </Box>

      {/* Search Input */}
      <TextField
        label="Search Medicine Category"
        value={searchQuery}
        onChange={handleSearchChange}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        fullWidth
        sx={{
          mb: 3,
          maxWidth: { sm: '390px' },
          backgroundColor: 'white'
        }}
      />

      {/* Table Section */}
      <TableContainer component={Paper} sx={{ maxHeight: 500, overflow: 'auto' }}>
        <Table aria-label="medicine groups table">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'left',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'white',
                  zIndex: 1,
                }}>
                <Checkbox
                  checked={selectedItems.length === medicineGroups.length}
                  indeterminate={selectedItems.length > 0 && selectedItems.length < medicineGroups.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'left',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'white',
                  zIndex: 1,
                }}
                onClick={() => handleSort('groupName')}
              >
                Group Category
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'left',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'white',
                  zIndex: 1,
                }}
                onClick={() => handleSort('noOfMedicine')}
              >
                No of Medicines
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'left',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'white',
                  zIndex: 1,
                }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.groupName}>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(row.groupName)}
                    onChange={() => handleSelectItem(row.groupName)}
                  />
                </TableCell>
                <TableCell>{row.groupName}</TableCell>
                <TableCell>{row.noOfMedicine}</TableCell>
                <TableCell>
                  <IconButton onClick={() => navigate(`/admin/inventory/view-medicines-group/${row.groupName}`)} sx={{ color: '#2BA3B6', mr: 0 }}>
                    <Visibility />
                  </IconButton>
                  <IconButton onClick={() => handleEditItem(row.groupName)} sx={{ color: '#1D7DFA', mr: 0 }}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setMedicineToDelete(row.groupName);  // Store the groupName of the item to delete
                      setIsDeleteModalOpen(true);  // Open the modal
                    }} sx={{ color: '#D83049' }}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Editing Medicine Group */}
      <Dialog
        open={isEditModalOpen}
        onClose={handleModalClose}
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, padding: 2, boxShadow: 5, maxWidth: '567px' },
        }}
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
            Edit Medicine Group
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ marginBottom: 2, marginTop: 2 }}
          />
          <TextField
            label="No. of Medicines"
            value={noOfMedicine}
            disabled
            fullWidth
            variant="outlined"
            sx={{ marginBottom: 2 }}
          />
          <Button
            onClick={handleAddMedicine}
            variant="outlined"
            color="primary"
            sx={{ marginBottom: 2 }}
          >
            Add Medicine
          </Button>

          {newMedicines.map((medicine, index) => (
            <div key={index} className="flex justify-center items-center mb-2">
              {/* Select for new medicine */}
              <FormControl fullWidth error={medicineErrors[index]}>
                <InputLabel>Medicine {index + 1}</InputLabel>
                <Select
                  value={medicine}
                  onChange={(e) => handleMedicineChange(index, e.target.value)}
                  label={`Medicine ${index + 1}`}
                  variant="outlined"
                >
                  {/* Available medicines as options */}
                  {availableMedicines.map((med, i) => (
                    <MenuItem key={i} value={med.name}>
                      {med.name}
                    </MenuItem>
                  ))}
                </Select>
                {medicineErrors[index] && (
                  <FormHelperText>This field is required</FormHelperText>
                )}
              </FormControl>

              {/* IconButton to remove the medicine */}
              <IconButton
                onClick={() => handleRemoveMedicine(index)} // Remove medicine input on click
                sx={{ marginLeft: 1 }}
              >
                <ClearIcon />
              </IconButton>
            </div>
          ))}

          {modalSuccessMessage && (
            <Typography color="error" sx={{ textAlign: 'center', mt: 2 }}>
              {modalSuccessMessage}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between', padding: 2 }}>
          <Button
            onClick={handleModalClose}
            variant="outlined"
            color="secondary"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSaveChanges}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 2,
              backgroundColor: '#01A768',
              '&:hover': { backgroundColor: '#017F4A' },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>




      <Dialog
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        PaperProps={{
          sx: {
            borderRadius: 4,
            padding: 1,
            maxWidth: "400px",
          },
        }}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteModal}
            variant="outlined"
            color="secondary"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteItem}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>


      {selectedItems.length > 0 && (
        <Button
          variant="contained"
          sx={{
            marginTop: '20px',
            backgroundColor: 'white',
            color: '#F0483E',
            padding: '15px 24px',
            border: '1px solid #F0483E',
            marginBottom: '20px',
            textTransform: 'none',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#FFF5F5',
            },
          }}
          startIcon={<DeleteIcon sx={{ color: '#F0483E' }} />}
          onClick={() => setConfirmationModalOpen(true)}  // Open modal for confirmation
        >
          Delete Medicine
        </Button>
      )}

      {/* Confirmation Modal */}
      <Dialog open={isConfirmationModalOpen} onClose={handleModalClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the selected item(s)?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} color="secondary">Cancel</Button>
          <Button onClick={handleConfirmDeleteCheckbox} color="primary">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MedicineGroupPage;