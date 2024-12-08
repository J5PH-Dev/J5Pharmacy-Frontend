import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack, Autocomplete, TextField, InputAdornment, Theme, useTheme, SelectChangeEvent, FormControl, InputLabel, Select, OutlinedInput, MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Alert, DialogActions, DialogContent, Dialog, DialogTitle } from '@mui/material';
import AddIcon from '@mui/icons-material/Add'; // Add Material UI icon
import { useLocation, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckIcon from '@mui/icons-material/Check';


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

  const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value },
    } = event;
    setPersonName(typeof value === 'string' ? value.split(',') : value);
  };

  const handleBreadcrumbClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/manager/inventory'); // Go back to the Inventory Page
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


  const handleViewDetails = (groupName: string) => {
    navigate(`/manager/inventory/view-medicines-group/${groupName}`);
  };


  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedMedicine([]);
    setModalSuccessMessage(''); // Reset success message when modal closes
  };

  const handleAddMedicineGroup = () => {
    setSelectedMedicine([]); // Reset selected medicine when opening the modal
    setModalOpen(true);
  };

  const handleSaveMedicineGroup = () => {
    const newGroups = selectedMedicine
      .map(medicine => {
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
    setModalOpen(false); // Close the modal
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
        successMessageFromGroupDeletion('');
      }, 3000);

      return () => clearTimeout(timeout); // Cleanup the timeout
    }
  }, [successMessage, successMessageFromGroupDeletion]);


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
        open={isModalOpen}
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
            Select the group(s) to which the medicines will be added          </Typography>
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            value={selectedMedicine}
            onChange={(e, newValue) => {
              setSelectedMedicine(newValue);
              handleInputChange(); // Clear the modal success message when the user interacts
            }}
            options={mockMedicines.map((medicine) => medicine.label)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Medicine Group"
                variant="outlined"
                fullWidth
                sx={{ marginTop: '5px' }}
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
            onClick={handleModalClose}
            variant="outlined"
            color="secondary"
            sx={{ borderRadius: 2, padding: '10px 20px' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveMedicineGroup}
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
      <TableContainer component={Paper} sx={{  maxHeight: 500, overflow: 'auto' }} ref={tableContainerRef}>
        <Table  aria-label="simple table">
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
                <TableCell component="th" scope="row">{row.groupName}</TableCell>
                <TableCell align="left">{row.noOfMedicine}</TableCell>
                <TableCell align="left">
                  <Button variant="text" onClick={() => handleViewDetails(row.groupName)}>
                    View Detail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MedicineGroupPage;