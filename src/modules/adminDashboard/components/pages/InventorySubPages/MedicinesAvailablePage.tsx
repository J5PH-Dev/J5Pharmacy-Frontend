import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack, Autocomplete, TextField, InputAdornment, Theme, useTheme, SelectChangeEvent, FormControl, InputLabel, Select, OutlinedInput, MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add'; // Add Material UI icon
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';


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

const topRecentSearch = [
  { title: 'Paracetamol', category: 'Pain Reliever' },
  { title: 'Amoxicillin', category: 'Antibiotic' },
  { title: 'Ibuprofen', category: 'Anti-inflammatory' },
  { title: 'Aspirin', category: 'Pain Reliever' },
  { title: 'Metformin', category: 'Diabetes' },
  { title: "Lisinopril", category: "Blood Pressure" },
  { title: 'Omeprazole', category: 'Antacid' },
  { title: 'Cetirizine', category: 'Antihistamine' },
  { title: 'Fluoxetine', category: 'Antidepressant' },
  { title: 'Salbutamol', category: 'Asthma' },
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
  const [sortConfig, setSortConfig] = React.useState<{ key: RowKey; direction: 'asc' | 'desc' }>({
    key: 'medicineName', direction: 'asc'
  });

  const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const navigate = useNavigate();

  const handleBreadcrumbClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/admin/inventory'); // Go back to the Inventory Page
  };

  const handleAddNewItemClick = () => {
    // Navigate to the page where users can add a new item
    navigate('/admin/inventory/add-new-item'); // Modify this path according to your routing
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
    // Navigate to the new URL with the medicine name
    navigate(`/admin/inventory/view-medicines-description/${medicineName}`);
};
  return (
    <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>
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
        <Typography color="text.primary">Medicines Available</Typography>
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
        {/* Title Section */}
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Medicines Available
          </Typography>
          <Typography variant="body1" sx={{ mt: -1 }}>
            List of medicines available for sales.
          </Typography>
        </Box>

        {/* Button Section */}
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
            onClick={handleAddNewItemClick}
          >
            <AddIcon />
            Add New Item
          </Button>
        </Box>
      </Box>

      {/* Search Input and Select in Flex Row with Space Between */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },  // Column on small screens, row on larger screens
          justifyContent: 'space-between',  // Space between items
          alignItems: 'center',
          mb: 3,
          mt: 2,
        }}
      >
        {/* Search Input */}
        <Autocomplete
          freeSolo
          id="search-input"
          disableClearable
          options={topRecentSearch.map((option) => option.title)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Medicine Inventory"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiInputBase-root': { alignItems: 'center' },
                '& .MuiInputBase-input': { padding: '8px', height: '13px' },
                width: '390px', // Set width to control spacing
                backgroundColor: 'white',
                marginBottom: { xs: '10px', sm: 0 },  // Adjust margin for small screens
              }}
            />
          )}
        />

        {/* Category Filter */}
        <FormControl sx={{ width: '270px', mt: { xs: 1, sm: 0 } }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={personName}
            onChange={handleChange}
            input={<OutlinedInput label="Filter by Category" />}
            MenuProps={MenuProps}
            renderValue={(selected) => selected.join(', ') || 'Filter by Category'}
            inputProps={{
              'aria-label': 'Without label',
              sx: { padding: '8px', height: '18px', backgroundColor: 'white' },
            }}
          >
            {names.map((name) => (
              <MenuItem key={name} value={name} style={getStyles(name, personName, theme)}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Table Section */}
      <TableContainer component={Paper} sx={{ maxHeight: 500, overflow: 'auto' }}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'left',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'white',  // Ensure the header has a background
                  zIndex: 1  // Make sure it appears above other content when scrolling
                }}
              >
                <Stack direction="row" alignItems="center" onClick={() => handleSort('medicineName')}>
                  Medicine Name
                  {sortConfig.key === 'medicineName' && (sortConfig.direction === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />)}
                </Stack>
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'left',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'white',
                  zIndex: 1
                }}
              >
                <Stack direction="row" alignItems="center" onClick={() => handleSort('medicineID')}>
                  Medicine ID
                  {sortConfig.key === 'medicineID' && (sortConfig.direction === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />)}
                </Stack>
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'left',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'white',
                  zIndex: 1
                }}
              >
                <Stack direction="row" alignItems="center" onClick={() => handleSort('groupName')}>
                  Group Name
                  {sortConfig.key === 'groupName' && (sortConfig.direction === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />)}
                </Stack>
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'left',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'white',
                  zIndex: 1
                }}
              >
                <Stack direction="row" alignItems="center" onClick={() => handleSort('stockQty')}>
                  Stock in Qty
                  {sortConfig.key === 'stockQty' && (sortConfig.direction === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />)}
                </Stack>
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'left',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'white',  // Ensure the background is consistent
                  zIndex: 1  // Make sure it stays on top of other content
                }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedRows.map((row) => (
              <TableRow
                key={row.medicineName}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row" sx={{ textAlign: 'left' }}>
                  {row.medicineName}
                </TableCell>
                <TableCell align="left" sx={{ textAlign: 'left' }}>{row.medicineID}</TableCell>
                <TableCell align="left" sx={{ textAlign: 'left' }}>{row.groupName}</TableCell>
                <TableCell align="left" sx={{ textAlign: 'left' }}>{row.stockQty}</TableCell>
                <TableCell align="left" sx={{ textAlign: 'left' }}>
                  <Button variant="text" style={{ color: 'black' }}
                    onClick={() => handleViewDetails(row.medicineName)}
                  >
                    View Full Detail &gt;&gt;
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

export default MedicinesAvailablePage;
