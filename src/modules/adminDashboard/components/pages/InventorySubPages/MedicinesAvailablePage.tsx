import React, { useState, useEffect } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack, Autocomplete, TextField, InputAdornment, Theme, useTheme, SelectChangeEvent, FormControl, InputLabel, Select, OutlinedInput, MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add'; // Add Material UI icon
import { useNavigate, useParams } from 'react-router-dom';
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

  const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const navigate = useNavigate();

  const handleBreadcrumbClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/admin/inventory');
  };

  const handleAddNewItemClick = () => {
    navigate('/admin/inventory/add-new-item');
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
          <TableHead sx={{ backgroundColor: 'white', zIndex: 1}}>
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
    </Box>
  );
};

export default MedicinesAvailablePage;