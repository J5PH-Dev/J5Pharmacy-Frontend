import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack, Autocomplete, TextField, InputAdornment, Theme, useTheme, SelectChangeEvent, FormControl, InputLabel, Select, OutlinedInput, MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Alert, DialogActions, DialogContent, Dialog, DialogTitle, Checkbox, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add'; // Add Material UI icon
import { useLocation, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckIcon from '@mui/icons-material/Check';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';

function createData(
  groupName: string,
  noOfMedicine: string
) {
  return { groupName, noOfMedicine };
}

// Mock Data for the Autocomplete
const mockMedicines = [
  { label: 'Cold and Flu Medications', noOfMedicine: '10' },
  { label: 'Heart Medications', noOfMedicine: '06' },
  { label: 'Severe Allergy Medications', noOfMedicine: '05' },
  { label: 'Sleep Aids', noOfMedicine: '07' },
  { label: 'Anticoagulants', noOfMedicine: '04' },
  { label: 'Fertility Medications', noOfMedicine: '02' },
  { label: 'Skin Care Medications', noOfMedicine: '08' },
  { label: 'Neurological Medications', noOfMedicine: '06' },
  { label: 'Anti-nausea Medications', noOfMedicine: '03' },
  { label: 'Antiviral Medications', noOfMedicine: '05' }
];

// Example data rows
const rows = [
  createData('Pain Relievers', '3'),
  createData('Antibiotics', '8'),
  createData('Anti-inflammatories', '12'),
  createData('Diabetes Medications', '6'),
  createData('Blood Pressure Medications', '7'),
  createData('Antacids', '5'),
  createData('Antihistamines', '4'),
  createData('Antidepressants', '9'),
  createData('Asthma Medications', '3'),
  createData('Vitamins and Supplements', '15'),
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

// Define a type for the row keys
type RowKey = 'groupName' | 'noOfMedicine';


const MedicineGroupPage = () => {
  const theme = useTheme();
  const [personName, setPersonName] = React.useState<string[]>([]);
  const [sortedRows, setSortedRows] = React.useState(rows);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState<{ key: RowKey; direction: 'asc' | 'desc' }>({
    key: 'groupName',
    direction: 'asc',
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);

  const location = useLocation();
  const successMessageFromGroupDeletion = location.state?.successMessage;
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<string[]>([]); // Multiple groups allowed
  const [existingGroups, setExistingGroups] = useState(rows);
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

  const handleSort = (key: RowKey) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';

    const filteredData = existingGroups.filter((row) =>
      row.groupName && row.groupName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedData = [...filteredData].sort((a, b) => {
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
    setSelectedMedicine([]);
    setModalSuccessMessage(''); // Reset success message when modal closes
  };

  const handleAddMedicineGroup = () => {
    setSelectedMedicine([]); // Reset selected medicine when opening the modal
    setIsAddModalOpen(true); // Open the "Add New Group" modal
  };

  const [error, setError] = useState(false); // Track error state

  const handleSaveMedicineGroup = () => {
    if (selectedMedicine.length === 0) {
      setError(true); // Show error if no medicine group is selected
      return; // Prevent further execution
    } else {
      setError(false); // Reset error when there is valid input
    }

    const newGroups = selectedMedicine
      .map((medicine) => {
        const selectedMedicineData = mockMedicines.find(
          (medicineData) => medicineData.label === medicine
        );

        if (selectedMedicineData) {
          return {
            groupName: selectedMedicineData.label,
            noOfMedicine: selectedMedicineData.noOfMedicine,
          };
        }
        return null;
      })
      .filter((group): group is { groupName: string; noOfMedicine: string } => group !== null);

    setExistingGroups([...existingGroups, ...newGroups]);
    setIsNewItemAdded(true); // Indicate that a new item has been added
    setIsAddModalOpen(false); // Open the "Add New Group" modal
    setSuccessMessage(`Medicines "${selectedMedicine.join(', ')}" have been added to the group.`);
  };


  // Scroll to bottom only when a new item is added
  useEffect(() => {
    if (isNewItemAdded && tableContainerRef.current) {
      tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
      setIsNewItemAdded(false); // Reset the flag after scrolling
    }
  }, [existingGroups, isNewItemAdded]);
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredRows = sortedRows.filter((row) =>
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
    setSelectedItems(checked ? rows.map((row) => row.groupName) : []);
  };

  const handleDeleteButtonClick = () => {
    setConfirmationModalOpen(true);
  };

  const handleConfirmDelete = () => {
    setExistingGroups((prev) => prev.filter((row) => !selectedItems.includes(row.groupName)));
    setSuccessMessage(`Deleted successfully: ${selectedItems.join(', ')}`);
    setSelectedItems([]);
    setConfirmationModalOpen(false);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false); // Close "Add New Group" modal
    setIsEditModalOpen(false); // Close "Edit Medicine Group" modal
    setConfirmationModalOpen(false); // Close the confirmation modal
    setModalOpen(false); // Close the other modal (if necessary)
    setSelectedMedicine([]); // Reset selected medicines
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
    const groupToEdit = existingGroups.find((group) => group.groupName === groupName);
    if (groupToEdit) {
      setGroupName(groupToEdit.groupName); // Set the selected group name
      setNoOfMedicine(groupToEdit.noOfMedicine); // Set the number of medicines
      setIsEditModalOpen(true); // Open the "Edit Medicine Group" modal
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

  const handleSaveChanges = () => {

    // Check if any medicine input is empty
    const errors = newMedicines.map((medicine) => medicine.trim() === ''); // Create an array of boolean errors
    setMedicineErrors(errors); // Set error state

    if (errors.includes(true)) {
      return; // Don't proceed if there's any error (empty field)
    }

    // Update the group with the new medicines
    const updatedGroup = {
      groupName,
      noOfMedicine: (parseInt(noOfMedicine, 10) + newMedicines.length).toString(),
    };

    const updatedGroups = existingGroups.map((group) =>
      group.groupName === groupName ? updatedGroup : group
    );
    
    setExistingGroups(updatedGroups);
    setSuccessMessage(`Changes saved for ${groupName} group.`);
    setModalOpen(false);
    handleModalClose();
    setNewMedicines([]); // Reset new medicines
  };

  const handleDeleteItem = (medicineName: string) => {
    setMedicineToDelete(medicineName); // Set the medicine name to be deleted
    setIsDeleteModalOpen(true); // Open the confirmation modal
  };

  const handleConfirmDeleteItem = () => {
    if (medicineToDelete) {
      setExistingGroups((prev) => prev.filter((row) => row.groupName !== medicineToDelete));
      setSuccessMessage(`"${medicineToDelete}" has been deleted successfully.`);
    }
    setMedicineToDelete(null); // Reset the selected medicine
    setIsDeleteModalOpen(false); // Close the modal
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
          <Autocomplete
            multiple
            value={selectedMedicine}
            onChange={(e, newValue) => {
              setSelectedMedicine(newValue);
              setError(false); // Clear the error when user interacts
            }}
            options={mockMedicines.map((medicine) => medicine.label)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Medicine Group"
                variant="outlined"
                fullWidth
                sx={{ marginTop: '5px' }}
                error={error} // Highlight the input field with error
                helperText={error ? "This field is required" : ""} // Display error message
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>{option}</li>
            )}
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
        <Typography color="text.primary">Medicines Group</Typography>
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
            Medicines Group
          </Typography>
          <Typography variant="body1" sx={{ mt: -1 }}>
            List of medicines groups.
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
            Add New Group
          </Button>
        </Box>
      </Box>

      {/* Search Input */}
      <TextField
        label="Search Medicine Groups"
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
      <TableContainer component={Paper} sx={{ maxHeight: 500, overflow: 'auto' }} ref={tableContainerRef}>
        <Table aria-label="simple table">
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
                  checked={selectedItems.length === rows.length}
                  indeterminate={
                    selectedItems.length > 0 && selectedItems.length < rows.length
                  }
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
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  onClick={() => handleSort('groupName')}
                >
                  Group Name
                  {sortConfig.key === 'groupName' && (
                    sortConfig.direction === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
                  )}
                </Stack>
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
                <Stack
                  direction="row"
                  alignItems="center"
                  onClick={() => handleSort('noOfMedicine')}
                >
                  No of Medicine
                  {sortConfig.key === 'noOfMedicine' && (
                    sortConfig.direction === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
                  )}
                </Stack>
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
              <TableRow key={row.groupName} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(row.groupName)}
                    onChange={() => handleSelectItem(row.groupName)}
                  />
                </TableCell>
                <TableCell component="th" scope="row">{row.groupName}</TableCell>
                <TableCell align="left">{row.noOfMedicine}</TableCell>
                <TableCell align="left">
                  <div className='flex flex-row'>
                    <IconButton onClick={() => handleViewDetails(row.groupName)} sx={{ color: '#2BA3B6', mr: 0 }}>
                      <Visibility sx={{ fontSize: 24 }} />
                    </IconButton>
                    <IconButton onClick={() => handleEditItem(row.groupName)} sx={{ color: '#1D7DFA', mr: 0 }}>
                      <Edit sx={{ fontSize: 24 }} />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteItem(row.groupName)} sx={{ color: '#D83049' }}>
                      <Delete sx={{ fontSize: 24 }} />
                    </IconButton>
                  </div>
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
              <TextField
                label={`Medicine ${index + 1}`}
                value={medicine}
                onChange={(e) => handleMedicineChange(index, e.target.value)}
                fullWidth
                variant="outlined"
                error={medicineErrors[index]} // Show error state
                helperText={medicineErrors[index] ? 'This field is required' : ''} // Error message
                sx={{ marginBottom: 2 }}
              />
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
          <Button onClick={handleModalClose} variant="outlined" color="secondary" sx={{ borderRadius: 2 }}>
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
            Are you sure you want to delete {medicineToDelete}?
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
          onClick={handleDeleteButtonClick}
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
          <Button onClick={handleModalClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

    </Box>

  );
};

export default MedicineGroupPage;