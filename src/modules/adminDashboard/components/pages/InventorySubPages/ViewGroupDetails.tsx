import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack, TextField, InputAdornment, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Alert, Autocomplete } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningIcon from '@mui/icons-material/Warning'; // Icon for warning
import { useParams } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import { Edit, Delete, Visibility } from '@mui/icons-material';

function createData(medicineName: string, noOfMedicine: string) {
  return { medicineName, noOfMedicine };
}

const rows = [
  createData('Paracetamol', '12'),
  createData('Ibuprofen', '04'),
  createData('Aspirin', '21'),
];

// Mock Data for the Autocomplete
const mockMedicines = [
  { label: 'Amoxicillin', noOfMedicine: '03' },
  { label: 'Ciprofloxacin', noOfMedicine: '22' },
  { label: 'Metformin', noOfMedicine: '11' },
  { label: 'Lisinopril', noOfMedicine: '14' },
  { label: 'Omeprazole', noOfMedicine: '09' },
];

const ViewGroupDetails = () => {
  const navigate = useNavigate();
  const [sortedRows, setSortedRows] = useState(rows);
  const [searchQuery, setSearchQuery] = useState('');
  const { groupName } = useParams<{ groupName: string }>();
  const [sortConfig, setSortConfig] = useState<{
    key: keyof typeof rows[0];
    direction: 'asc' | 'desc';
  }>({ key: 'medicineName', direction: 'asc' });

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'group' | 'item'>('item');
  const [alertMessage, setAlertMessage] = useState<string | null>(null); // State for the alert message
  const [showAlert, setShowAlert] = useState(false); // State to control alert visibility
  const [alertVisible, setAlertVisible] = useState(true); // State to control the alert animation
  const [openAddMedicineModal, setOpenAddMedicineModal] = useState(false); // State for modal
  const [selectedMedicine, setSelectedMedicine] = useState<string[]>([]); // Updated to an array of strings
  const [duplicateAlertMessage, setDuplicateAlertMessage] = useState<string | null>(null); // State for duplicate alert
  const [selectedRows, setSelectedRows] = useState<string[]>([]); // Store selected items
  const [openRemoveItemDialog, setOpenRemoveItemDialog] = useState(false); // State for remove item modal
  const [isEditMode, setIsEditMode] = useState(false); // New state for edit mode

  const filteredRows = sortedRows.filter((row) =>
    row.medicineName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBreadcrumbClick = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  const handleAddNewItemClick = () => {
    setOpenAddMedicineModal(true);
    console.log("Modal opened", openAddMedicineModal); // Check if state changes as expected
  };

  const handleCloseModal = () => {
    setOpenAddMedicineModal(false);
    setSelectedMedicine([]);  // Clear selection on modal close
    setDuplicateAlertMessage(null);  // Reset any error messages
  };

  // Inside your component
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  const handleAddMedicineToGroup = () => {
    if (selectedMedicine.length === 0) {
      setDuplicateAlertMessage("Please select at least one medicine.");
      return;
    }

    const existingMedicines = sortedRows.map(row => row.medicineName);
    const duplicateMedicines = selectedMedicine.filter(medicine => existingMedicines.includes(medicine));

    if (duplicateMedicines.length > 0) {
      setDuplicateAlertMessage(`Medicines "${duplicateMedicines.join(', ')}" are already in the group.`);
      return;
    }

    const newMedicines = selectedMedicine.map((medicine) => {
      const foundMedicine = mockMedicines.find(item => item.label === medicine);
      return createData(medicine, foundMedicine ? foundMedicine.noOfMedicine : '0');
    });

    setSortedRows((prevRows) => [...prevRows, ...newMedicines]);

    // Show success alert before closing the modal
    setAlertMessage(`Medicines "${selectedMedicine.join(', ')}" have been added to the group.`);
    setShowAlert(true);
    setAlertVisible(true);

    // Close modal and reset state
    setOpenAddMedicineModal(false);
    setSelectedMedicine([]);
    setDuplicateAlertMessage(null);

    // Scroll to the bottom of the table with a slight delay
    setTimeout(() => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
      }
    }, 100);  // Adjust the delay as needed
  };


  const handleSort = (key: 'medicineName' | 'noOfMedicine') => {
    const direction =
      sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';

    const sortedData = [...sortedRows].sort((a, b) => {
      if (key === 'noOfMedicine') {
        // Convert to numbers for numeric comparison
        return direction === 'asc'
          ? parseInt(a[key], 10) - parseInt(b[key], 10)
          : parseInt(b[key], 10) - parseInt(a[key], 10);
      }

      // For other string-based keys like 'medicineName'
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


  const [selectedNoOfMedicine, setSelectedNoOfMedicine] = useState<string>(''); // New state for the editable noOfMedicine

  // For Edit Medicine Group Modal
  const handleEditItem = (medicineName: string) => {
    const row = sortedRows.find((row) => row.medicineName === medicineName);

    if (row) {
      setSelectedGroupName(row.medicineName);  // Keep this state name but change the content
      setSelectedNoOfMedicine(row.noOfMedicine);
      setIsEditMode(true);
    }
  };


  const handleSaveEdit = () => {
    // Update the row with the new noOfMedicine value
    const updatedRows = sortedRows.map((row) =>
      row.medicineName === selectedGroupName
        ? { ...row, noOfMedicine: selectedNoOfMedicine }
        : row
    );

    setSortedRows(updatedRows); // Update the sorted rows with the new data
    setIsEditMode(false); // Close the modal after saving

    // Show the confirmation alert
    setAlertMessage('Changes saved successfully!');
    setShowAlert(true);
    setAlertVisible(true);

    // Hide the alert after 3 seconds
    setTimeout(() => {
      setAlertVisible(false);
    }, 3000); // Hide after 3 seconds
  };

  const handleDeleteItemTable = (groupName: string) => {
    setSelectedGroupName(groupName);
    setDeleteType('item');
    setOpenRemoveItemDialog(true); // Open remove item dialog
  };


  const handleDeleteGroup = () => {
    setDeleteType('group');
    setOpenDialog(true);
  };

  const confirmDelete = () => {
    if (deleteType === 'item' && selectedGroupName) {
      const updatedRows = sortedRows.filter((row) => row.medicineName !== selectedGroupName);
      setSortedRows(updatedRows);
      setAlertMessage(`Item "${selectedGroupName}" has been deleted.`);
    } else if (deleteType === 'group') {
      navigate('/admin/inventory/view-medicines-group', {
        state: { successMessage: 'Group deleted successfully!' },
      });
    }

    // Show the alert after deletion
    setShowAlert(true);
    setAlertVisible(true); // Ensure the alert is visible immediately

    // Reset the state to prevent multiple consecutive pop-ups without user action
    setOpenDialog(false); // Close the confirmation dialog

    // Reset the alert message after a brief delay to allow animation
    setTimeout(() => {
      setAlertMessage(null); // Clear alert message
      setShowAlert(false); // Hide the alert
      setAlertVisible(false); // Ensure alert animation completes
    }, 3500); // Time for alert message duration
  };


  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setAlertVisible(false); // Start the fade-out animation after 3 seconds
      }, 3000); // 3 seconds

      // Reset visibility after animation duration
      const resetTimer = setTimeout(() => {
        setShowAlert(false); // Hide the alert after animation
      }, 3500); // Slightly after the fade-out animation

      return () => {
        clearTimeout(timer);
        clearTimeout(resetTimer);
      };
    }
  }, [showAlert]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, groupName: string) => {
    if (event.target.checked) {
      setSelectedRows((prevSelectedRows) => [...prevSelectedRows, groupName]);
    } else {
      setSelectedRows((prevSelectedRows) => prevSelectedRows.filter((name) => name !== groupName));
    }
  };

  const handleSelectAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows(sortedRows.map((row) => row.medicineName));
    } else {
      setSelectedRows([]);
    }
  };

  const handleDeleteButtonClick = () => {
    setDeleteType('item');
    setOpenDialog(true);
  };

  const confirmDeleteMultiple = () => {
    if (deleteType === 'item' && selectedRows.length > 0) {
      const updatedRows = sortedRows.filter((row) => !selectedRows.includes(row.medicineName));
      setSortedRows(updatedRows);
      setAlertMessage(`Medicines "${selectedRows.join(', ')}" have been deleted.`);
      setSelectedRows([]); // Reset selected rows after deletion
    }

    // Show the alert after deletion
    setShowAlert(true);
    setAlertVisible(true);

    // Reset the state to prevent multiple consecutive pop-ups without user action
    setOpenDialog(false);
    setTimeout(() => {
      setAlertMessage(null); // Clear alert message
      setShowAlert(false); // Hide the alert
      setAlertVisible(false); // Ensure alert animation completes
    }, 3500); // Time for alert message duration
  };

  return (
    <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: { xs: 'center', sm: 'flex-start' },
        }}
      >
        <Link color="inherit" onClick={handleBreadcrumbClick('/admin/inventory')}>Inventory</Link>
        <Link color="inherit" onClick={handleBreadcrumbClick('/admin/inventory/view-medicines-group')}>Medicine Group</Link>
        <Typography color="text.primary">{groupName}</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{groupName}</Typography>
          <Typography variant="body1">Detailed view of a medicine group.</Typography>
        </Box>
        <Button variant="contained" onClick={handleAddNewItemClick} sx={{ backgroundColor: '#01A768', color: '#fff', '&:hover': { backgroundColor: '#017F4A' } }}>
          <AddIcon /> Add New Item
        </Button>
      </Box>

      {/* Add Medicine Modal */}
      <Dialog
        open={openAddMedicineModal}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleCloseModal()
          }
        }}
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            padding: 2,
            boxShadow: 5,
            maxWidth: "567px"
          },
        }}
        BackdropProps={{
          onClick: (event) => event.stopPropagation() // Prevent closing the modal when clicking outside
        }}
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
            Add Medicines to Group
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            Select multiple medicines from the list below to add them to the group.
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Autocomplete
              multiple
              options={mockMedicines}
              getOptionLabel={(option) => option.label}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search and Select Medicines"
                  variant="outlined"
                  fullWidth
                  sx={{ marginTop: '5px' }}
                />
              )}
              onChange={(event, value) => {
                setSelectedMedicine(value.map((item) => item.label));
                setDuplicateAlertMessage(null); // Reset alert when selection changes
              }}
            />
            {duplicateAlertMessage && (
              <Typography
                variant="body2"
                color="error"
                sx={{ textAlign: 'center', marginTop: '-10px' }} // Adjusted margin-top to reduce space
              >
                {duplicateAlertMessage}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', padding: 2 }}>
          <Button
            onClick={() => handleCloseModal()}
            variant="outlined"
            color="secondary"
            sx={{ borderRadius: 2, padding: '10px 20px' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddMedicineToGroup}
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


      {/* Search */}
      <TextField
        label="Search for Medicine"
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
          maxWidth: { sm: '400px' },
          backgroundColor: 'white'
        }}
      />

      {/* Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 500, overflow: 'auto' }} ref={tableContainerRef}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                padding="checkbox"
                sx={{
                  fontWeight: 'bold',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'white',
                  zIndex: 3, // Ensure it's above other headers
                  paddingLeft: 4,  // Add padding to the left of the checkbox
                  paddingRight: 2, // Add padding to the right of the checkbox
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedRows.length === sortedRows.length}
                  onChange={handleSelectAllChange}
                  style={{ transform: 'scale(1.5)' }} // Increase the size of the checkbox
                />
              </TableCell>
              {['Medicine Name', 'No of Medicine', 'Action'].map((header, index) => (
                <TableCell key={index} sx={{ fontWeight: 'bold', position: 'sticky', top: 0, backgroundColor: 'white' }}>
                  {header === 'Action' ? header : (
                    <Stack direction="row" alignItems="center" onClick={() => handleSort(header === 'Medicine Name' ? 'medicineName' : 'noOfMedicine')}>
                      {header}
                      {sortConfig.key === (header === 'Medicine Name' ? 'medicineName' : 'noOfMedicine') && (
                        sortConfig.direction === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
                      )}
                    </Stack>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.medicineName}>
                <TableCell padding="checkbox" sx={{ paddingLeft: 4, paddingRight: 2 }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.medicineName)}
                    onChange={(e) => handleCheckboxChange(e, row.medicineName)}
                    style={{ transform: 'scale(1.5)' }}
                  />
                </TableCell>
                <TableCell>{row.medicineName}</TableCell>
                <TableCell>{row.noOfMedicine}</TableCell>
                <TableCell>
                  <div className="flex flex-row">
                    <IconButton onClick={() => handleViewDetails(row.medicineName)} sx={{ color: '#2BA3B6', mr: 0 }}>
                      <Visibility sx={{ fontSize: 24 }} />
                    </IconButton>
                    <IconButton onClick={() => handleEditItem(row.medicineName)} sx={{ color: '#1D7DFA', mr: 0 }}>
                      <Edit sx={{ fontSize: 24 }} />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteItemTable(row.medicineName)} sx={{ color: '#D83049' }}>
                      <Delete sx={{ fontSize: 24 }} />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>

      {/* Edit Medicine Modal */}
      <Dialog
        open={isEditMode}
        onClose={() => setIsEditMode(false)}
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            padding: 2,
            boxShadow: 5,
            maxWidth: '567px'
          },
        }}
        BackdropProps={{
          onClick: (event) => event.stopPropagation() // Prevent closing modal when clicking outside
        }}
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
            Edit Medicine Group
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            Update the details of the medicine group below.
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* Group Name TextField (non-editable) */}
            <TextField
              label="Group Name"
              value={selectedGroupName}
              variant="outlined"
              disabled // Non-editable field
              fullWidth
            />

            {/* Number of Medicine TextField (editable) */}
            <TextField
              label="Number of Medicines"
              value={selectedNoOfMedicine}
              onChange={(e) => setSelectedNoOfMedicine(e.target.value)} // Handle changes
              variant="outlined"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', padding: 2 }}>
          <Button
            onClick={() => setIsEditMode(false)}
            variant="outlined"
            color="secondary"
            sx={{ borderRadius: 2, padding: '10px 20px' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit} // You need to implement handleSaveEdit function to save the changes
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 2,
              padding: '10px 20px',
              backgroundColor: '#01A768',
              '&:hover': { backgroundColor: '#017F4A' },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>


      {/* Remove Item Modal */}
      <Dialog
        open={openRemoveItemDialog}
        onClose={() => setOpenRemoveItemDialog(false)}
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            padding: 2,
            boxShadow: 5,
            maxWidth: "567px",
          },
        }}
        BackdropProps={{
          onClick: (event) => event.stopPropagation() // Prevent closing the modal when clicking outside
        }}
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'left' }}>
            Confirm Item Removal
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ textAlign: 'left', color: 'text.secondary' }}>
            Are you sure you want to remove {selectedGroupName} from the group? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            onClick={() => setOpenRemoveItemDialog(false)}
            variant="outlined"
            color="secondary"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              confirmDelete(); // Call the confirmDelete function to handle the deletion
              setOpenRemoveItemDialog(false); // Close the modal after the deletion
            }}
            variant="contained"
            color="error" // Change the color to red
            sx={{
              borderRadius: 2,
              padding: '10px 20px',
              backgroundColor: '#D32F2F', // Red color
              '&:hover': { backgroundColor: '#9A0007' }, // Darker red on hover
            }}
          >
            Remove Item
          </Button>
        </DialogActions>
      </Dialog>



      {/* Delete Button (shown only when items are selected) */}
      {selectedRows.length > 0 && (
        <Button
          variant="contained"
          sx={{
            backgroundColor: 'white',
            color: '#F0483E',
            padding: '15px 24px',
            border: '1px solid #F0483E',
            marginTop: '31px',
            marginRight: '21px',
            textTransform: 'none',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#FFF5F5',
            },
          }}
          startIcon={<DeleteOutlineIcon sx={{ color: '#F0483E' }} />}
          onClick={handleDeleteButtonClick}
        >
          Delete Medicine
        </Button>
      )}

      {/* Confirmation Dialog for Item Deletion */}
      <Dialog open={openDialog} onClose={() => { }} BackdropProps={{ onClick: (event) => event.stopPropagation() }} disableEscapeKeyDown>
        <DialogTitle>
          <WarningIcon sx={{ color: 'red', marginRight: 1 }} />
          {deleteType === 'item'
            ? (selectedRows.length === 1 ? 'Confirm Item Deletion' : 'Confirm Multiple Item Deletion')
            : 'Confirm Group Deletion'}
        </DialogTitle>

        <DialogContent>
          <Typography>
            {deleteType === 'item'
              ? (selectedRows.length === 1
                ? 'Are you sure you want to delete this medicine from the group? This action cannot be undone.'
                : `Are you sure you want to delete the selected medicines from the group? This action cannot be undone.`)
              : 'Are you sure you want to delete the entire group? This action cannot be undone.'}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">Cancel</Button>
          <Button
            onClick={deleteType === 'item'
              ? (selectedRows.length === 1
                ? confirmDelete
                : confirmDeleteMultiple)
              : confirmDelete
            }
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>



      {/* Delete Group Button */}
      <Button variant="contained" onClick={handleDeleteGroup}
        sx={{
          marginTop: '30px',
          backgroundColor: 'white',
          color: '#F0483E',
          padding: '15px 24px',
          border: '1px solid #F0483E',
          textTransform: 'none', // Optional: Disable uppercase text
          fontWeight: 'bold',
          '&:hover': {
            backgroundColor: '#FFF5F5', // Light background on hover
          },
        }}>
        <DeleteOutlineIcon sx={{ paddingRight: '5px' }} /> Delete Group
      </Button>

      {/* Confirmation Alert at Bottom Center */}
      {showAlert && alertMessage && alertVisible && (
        <Alert
          icon={<CheckIcon fontSize="inherit" />}
          severity="success"
          sx={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1201, // Ensure it's above other content
            opacity: alertVisible ? 1 : 0,
            transition: 'all 0.5s ease-out',
          }}
        >
          {alertMessage}
        </Alert>
      )}
    </Box>
  );
};

export default ViewGroupDetails;
