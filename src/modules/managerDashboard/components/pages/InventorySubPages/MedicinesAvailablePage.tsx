import React, { useState, useEffect, ChangeEvent, useMemo, useRef } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack, Autocomplete, TextField, InputAdornment, Theme, useTheme, SelectChangeEvent, FormControl, InputLabel, Select, OutlinedInput, MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Alert, DialogTitle, DialogContent, Dialog, FormControlLabel, DialogActions, Checkbox, IconButton, TablePagination, Grid, CircularProgress, Switch, FormHelperText } from '@mui/material';
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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckBox from '@mui/icons-material/CheckBox';
import ArchiveIcon from '@mui/icons-material/Archive';
import ExportDialog from '../../common/ExportDialog';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CategoryIcon from '@mui/icons-material/Category';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';


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

interface BranchInventory {
  branch_id: number;
  stock: number;
  expiryDate: string | null;
  branch_name?: string;
}

interface Medicine {
  medicineID: string;
  name: string;
  brand_name: string;
  barcode: string;
  category: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
  branch_inventory?: BranchInventory[];
  [key: string]: any; // Allow dynamic properties for branch inventory data
}

interface SortConfig {
  key: keyof Medicine;
  direction: 'asc' | 'desc';
}

function getStyles(name: string, personName: string[], theme: Theme) {
  return {
    fontWeight: personName.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

interface DeleteMedicine {
  barcode: string;
  name: string;
}

// Add interface for API error response
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Add new interfaces for branch inventory
interface BranchInventoryInput {
  branchId: number;
  stock: number;
  expiryDate: string | null;
}

interface Branch {
  branch_id: number;
  branch_name: string;
  branch_code: string;
  location: string;
  branch_manager: string;
  contact_number: string;
  email: string;
}

// Update the errors interface
interface ValidationErrors {
  medicineName: boolean;
  medicineID: boolean;
  groupName: boolean;
  price: boolean;
  stockQty: boolean;
  howToUse: boolean;
  sideEffects: boolean;
}

// Add interface for category
interface Category {
  category_id: number;
  name: string;
  prefix: string;
}

// Add the dosage units array
const DOSAGE_UNITS = [
  'mg',
  'mcg',
  'g',
  'kg',
  'ml',
  'l',
  'tablet',
  'capsule',
  'pill',
  'patch',
  'spray',
  'drop',
  'mg/ml',
  'mcg/ml',
  'mg/l',
  'mcg/l',
  'mg/g',
  'mcg/g',
  'IU',
  'mEq',
  'mmol',
  'unit',
  'puff',
  'application',
  'sachet',
  'suppository',
  'ampoule',
  'vial',
  'syringe',
  'piece'
];

// Add new interface for date filters
interface DateFilter {
  startDate: string;
  endDate: string;
  type: 'createdAt' | 'updatedAt' | null;
}

const MedicinesAvailablePage = () => {
  const theme = useTheme();
  const [sortedRows, setSortedRows] = React.useState<any[]>([]);
  const [originalRows, setOriginalRows] = useState<Medicine[]>([]);
  const [filteredRows, setFilteredRows] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const [successMessageFromDeletion, setsuccessMessageFromDeletion] = useState(location.state?.successMessage);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<DeleteMedicine | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showAllWarningOpen, setShowAllWarningOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'updatedAt', direction: 'desc' });
  const [isLoading, setIsLoading] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchInventory, setBranchInventory] = useState<BranchInventoryInput[]>([]);
  const [showBranchInventory, setShowBranchInventory] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    startDate: '',
    endDate: '',
    type: null
  });
  const [currentUser, setCurrentUser] = useState<{
    employeeId: string;
    name: string;
  } | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [showCreatedDateFilter, setShowCreatedDateFilter] = useState(false);
  const [showUpdatedDateFilter, setShowUpdatedDateFilter] = useState(false);
  const [createdDateFilter, setCreatedDateFilter] = useState({ startDate: '', endDate: '' });
  const [updatedDateFilter, setUpdatedDateFilter] = useState({ startDate: '', endDate: '' });
  const [tempCreatedDateFilter, setTempCreatedDateFilter] = useState({ startDate: '', endDate: '' });
  const [tempUpdatedDateFilter, setTempUpdatedDateFilter] = useState({ startDate: '', endDate: '' });
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const preSelectedCategory = location.state?.preSelectedCategory;
  const [useBarcodePrefix, setUseBarcodePrefix] = useState(false);
  const [useBarcodeScanner, setUseBarcodeScanner] = useState(false);
  const [isWaitingForScan, setIsWaitingForScan] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Load user information on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        console.log('User data from localStorage:', userData); // Add logging
        setCurrentUser({
          employeeId: userData.employee_id || userData.employeeId, // Handle both cases
          name: userData.name
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        setErrorMessage('Error loading user information. Please try logging in again.');
      }
    }
  }, []);

  // Fetch data from the API on component mount
  useEffect(() => {
    const fetchMedicines = async (retryCount = 0) => {
      setIsLoading(true);
      try {
        const response = await axios.get<Medicine[]>('/admin/inventory/view-medicines-available', {
          params: {
            orderBy: sortConfig.key || 'updatedAt',
            sortDirection: sortConfig.direction,
            createdStartDate: createdDateFilter.startDate || undefined,
            createdEndDate: createdDateFilter.endDate || undefined,
            updatedStartDate: updatedDateFilter.startDate || undefined,
            updatedEndDate: updatedDateFilter.endDate || undefined
          }
        });
        console.log('Fetched medicines:', response.data);
        setOriginalRows(response.data);
        setFilteredRows(response.data);
        setSortedRows(response.data);
        setSuccessMessage(null);
      } catch (error) {
        console.error('Error fetching medicines:', error);
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          setTimeout(() => fetchMedicines(retryCount + 1), delay);
        } else {
          setSuccessMessage('Error loading medicines. Please try refreshing the page.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicines();
  }, [sortConfig, createdDateFilter, updatedDateFilter]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/admin/inventory/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (preSelectedCategory) {
        setCategoryFilter(preSelectedCategory);
    }
  }, [preSelectedCategory]);

  const [newMedicineData, setNewMedicineData] = useState({
    name: '',
    brand_name: '',
    barcode: '',
    category: '',
    price: '',
    description: '',
    sideEffects: '',
    dosage_amount: '',
    dosage_unit: '',
    pieces_per_box: '',
    critical: '',
    requiresPrescription: 0,
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

  // Add function to fetch branches
  const fetchBranches = async () => {
    try {
      const response = await axios.get('/admin/inventory/branches');
      setBranches(response.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  // Call fetchBranches when component mounts
  useEffect(() => {
    fetchBranches();
  }, []);

  // Add function to handle branch inventory changes
  const handleBranchInventoryChange = (branchId: number, field: 'stock' | 'expiryDate', value: string) => {
    setBranchInventory(prev => {
      const existing = prev.find(b => b.branchId === branchId);
      if (existing) {
        return prev.map(b => b.branchId === branchId ? {
          ...b,
          [field]: field === 'stock' ? Number(value) || 0 : value || null
        } : b);
      }
      return [...prev, {
        branchId,
        stock: field === 'stock' ? Number(value) || 0 : 0,
        expiryDate: field === 'expiryDate' ? value || null : null
      }];
    });
  };

  // Validate inputs and add data to table
  const handleSaveNewItem = async () => {
    const validationErrors: ValidationErrors = {
      medicineName: !newMedicineData.name,
      medicineID: !newMedicineData.barcode,
      groupName: !newMedicineData.category,
      price: !newMedicineData.price,
      stockQty: false,
      howToUse: !newMedicineData.description,
      sideEffects: !newMedicineData.sideEffects,
    };

    setErrors(validationErrors);

    if (Object.values(validationErrors).some((error) => error)) return;

    try {
      setIsLoading(true);
      console.log('Sending data:', {
        ...newMedicineData,
        price: parseFloat(newMedicineData.price),
        dosage_amount: newMedicineData.dosage_amount ? parseFloat(newMedicineData.dosage_amount) : 0,
        pieces_per_box: newMedicineData.pieces_per_box ? parseInt(newMedicineData.pieces_per_box) : 0,
        critical: newMedicineData.critical ? parseInt(newMedicineData.critical) : 0,
        branchInventory
      });

      const productResponse = await axios.post('/admin/inventory/add-medicine', {
        ...newMedicineData,
        price: parseFloat(newMedicineData.price),
        dosage_amount: newMedicineData.dosage_amount ? parseFloat(newMedicineData.dosage_amount) : 0,
        pieces_per_box: newMedicineData.pieces_per_box ? parseInt(newMedicineData.pieces_per_box) : 0,
        critical: newMedicineData.critical ? parseInt(newMedicineData.critical) : 0,
        branchInventory
      });

      if (productResponse.data.success) {
        handleModalClose();
        resetForm();
        setSuccessMessage(`${newMedicineData.name} has been added successfully!`);
        
        // Refresh the medicines list
        const response = await axios.get('/admin/inventory/view-medicines-available');
        setFilteredRows(response.data);
        setSortedRows(response.data);
      }
    } catch (error) {
      console.error('Error adding new item:', error);
      const apiError = error as ApiError;
      setSuccessMessage(apiError.response?.data?.message || 'Error adding new item');
    } finally {
      setIsLoading(false);
    }
  };


  // Handle change for modal inputs
  const handleModalInputChange = (field: keyof typeof newMedicineData, value: any) => {
    setNewMedicineData(prev => ({ ...prev, [field]: value }));
    
    // If category changes and barcode prefix is enabled, clear the barcode
    if (field === 'category' && useBarcodePrefix) {
      const selectedCategory = categories.find(c => c.name === value);
      if (selectedCategory) {
        axios.get(`/admin/inventory/next-barcode/${selectedCategory.category_id}`)
          .then(response => {
            setNewMedicineData(prev => ({ ...prev, barcode: response.data.barcode }));
          })
          .catch(error => {
            console.error('Error getting next barcode:', error);
            setErrorMessage('Failed to generate barcode');
          });
      }
    }

    // Clear any validation errors for the field
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleChange = (event: SelectChangeEvent<string>) => {
    const { value } = event.target;
    setCategoryFilter(value);
    setPage(0);

    let newFilteredRows = originalRows;

    // Apply category filter
    if (value !== 'All') {
      newFilteredRows = newFilteredRows.filter(row => row.category === value);
    }

    // Apply search filter if there's a search query
    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase();
      newFilteredRows = newFilteredRows.filter(row =>
        (row.name?.toLowerCase() || '').includes(searchTerm) ||
        (row.brand_name?.toLowerCase() || '').includes(searchTerm) ||
        (row.barcode?.toLowerCase() || '').includes(searchTerm)
      );
    }

    setFilteredRows(newFilteredRows);
  };

  // Add effect to filter rows when categoryFilter changes
  useEffect(() => {
    let newFilteredRows = originalRows;

    // Apply category filter
    if (categoryFilter !== 'All') {
      newFilteredRows = newFilteredRows.filter(row => row.category === categoryFilter);
    }

    // Apply search filter if there's a search query
    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase();
      newFilteredRows = newFilteredRows.filter(row =>
        (row.name?.toLowerCase() || '').includes(searchTerm) ||
        (row.brand_name?.toLowerCase() || '').includes(searchTerm) ||
        (row.barcode?.toLowerCase() || '').includes(searchTerm)
      );
    }

    setFilteredRows(newFilteredRows);
  }, [categoryFilter, searchQuery, originalRows]);

  const handleBreadcrumbClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/manager/inventory');
  };

  const handleAddNewItemClick = () => {
    resetForm(); // Reset the form when modal closes
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    resetForm(); // Reset the form when modal closes
  };


  const handleViewDetails = (barcode: string) => {
    console.log('Viewing details for barcode:', barcode);
    navigate(`/manager/inventory/view-medicines-description/${encodeURIComponent(barcode)}`);
  };

  const handleEditItem = (barcode: string) => {
    console.log('Editing item with barcode:', barcode);
    navigate(`/manager/inventory/view-medicines-description/${encodeURIComponent(barcode)}/edit-details`);
  };

  const handleDeleteItem = (barcode: string, name: string) => {
    setSelectedItems([barcode]); // Set only this item as selected
    setMedicineToDelete({ barcode, name });
    setIsDeleteModalOpen(true);
  };

  // Function to handle delete item confirmation
  const handleConfirmDeleteItem = async () => {
    console.log('Starting archive process...');
    console.log('Selected items:', selectedItems);
    console.log('Archive reason:', archiveReason);
    console.log('Current user:', currentUser); // Add logging

    if (!archiveReason) {
      console.log('Validation failed: Missing required fields');
      setErrorMessage('Please provide a reason for archiving');
      return;
    }

    if (!currentUser) {
      console.log('No user information available');
      setErrorMessage('User information not available. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      const archivePromises = selectedItems.map(async (barcode) => {
        console.log(`Sending archive request for barcode: ${barcode} with user:`, currentUser); // Add logging
        return axios.post(`/admin/inventory/archive-product/${barcode}`, {
          employee_id: currentUser.employeeId,
          userName: currentUser.name,
          reason: archiveReason
        });
      });

      const results = await Promise.all(archivePromises);
      console.log('Archive responses:', results);

      const allSuccessful = results.every(response => response.data.success);
      if (allSuccessful) {
        console.log('All archives successful, updating UI...');
        const removedBarcodes = selectedItems;
        setOriginalRows(prev => prev.filter(row => !removedBarcodes.includes(row.barcode)));
        setFilteredRows(prev => prev.filter(row => !removedBarcodes.includes(row.barcode)));
        setSortedRows(prev => prev.filter(row => !removedBarcodes.includes(row.barcode)));
        setSelectedItems([]);
        
        setSuccessMessage(`Successfully archived ${selectedItems.length} item(s)`);
      } else {
        console.log('Some archives failed');
        setSuccessMessage('Some items could not be archived. Please try again.');
      }

      setArchiveReason('');
      setMedicineToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (error: unknown) {
      console.error('Error details:', {
        error,
        isAxiosError: axios.isAxiosError(error),
        response: axios.isAxiosError(error) ? error.response : null,
        request: axios.isAxiosError(error) ? error.request : null,
      });

      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || 'An error occurred while archiving the medicines.';
      console.error('Error archiving items:', {
        message: errorMessage,
        originalError: error
      });
      setSuccessMessage(errorMessage);
    } finally {
      console.log('Archive process completed');
      setIsLoading(false);
    }
  };


  // Function to close delete confirmation modal
  const handleDeleteModalClose = () => {
    setMedicineToDelete(null);
    setIsDeleteModalOpen(false);
  };


  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);

    let newFilteredRows = originalRows;

    // Apply category filter if one is selected
    if (categoryFilter !== 'All') {
      newFilteredRows = newFilteredRows.filter(row => row.category === categoryFilter);
    }

    // Apply search filter
    if (query) {
      const searchTerm = query.toLowerCase();
      newFilteredRows = newFilteredRows.filter(row =>
        (row.name?.toLowerCase() || '').includes(searchTerm) ||
        (row.brand_name?.toLowerCase() || '').includes(searchTerm) ||
        (row.barcode?.toLowerCase() || '').includes(searchTerm)
      );
    }

    setFilteredRows(newFilteredRows);
  };


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
      name: '',
      brand_name: '',
      barcode: '',
      category: '',
      price: '',
      description: '',
      sideEffects: '',
      dosage_amount: '',
      dosage_unit: '',
      pieces_per_box: '',
      critical: '',
      requiresPrescription: 0,
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

    setBranchInventory([]);
  };


  // Function to handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Function to handle rows per page change
  const handleChangeRowsPerPage = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (value === 'all') {
      setShowAllWarningOpen(true); // Only show warning, don't change rowsPerPage yet
    } else {
      setRowsPerPage(parseInt(value, 10));
      setPage(0);
    }
  };

  // Function to handle show all confirmation
  const handleShowAllConfirm = () => {
    setRowsPerPage(filteredRows.length);
    setPage(0);
    setShowAllWarningOpen(false);
  };

  // Function to handle show all cancellation
  const handleShowAllCancel = () => {
    setShowAllWarningOpen(false);
    // Reset to previous value or default to 10
    setRowsPerPage(10);
  };

  // Reset to default view (10 items) when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      setRowsPerPage(10);
      setPage(0);
    };
  }, []);

  // Get current page rows
  const paginatedRows = React.useMemo(() => {
    return filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

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

  const handleSelectItem = (barcode: string) => {
    if (!selectionMode) return;
    
    setSelectedItems(prev => {
      const isSelected = prev.includes(barcode);
      if (isSelected) {
        return prev.filter(id => id !== barcode);
      } else {
        return [...prev, barcode];
      }
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageBarcodes = paginatedRows.map(row => row.barcode);
      setSelectedItems(currentPageBarcodes);
    } else {
      setSelectedItems([]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;
    
    // Find the names of selected products
    const selectedProducts = paginatedRows.filter(row => selectedItems.includes(row.barcode));
    const selectedNames = selectedProducts.map(product => product.name).join(", ");
    
    setMedicineToDelete({ 
      barcode: selectedItems[0], // We'll use this as a reference
      name: selectedNames
    });
    setIsDeleteModalOpen(true);
  };

  // Add sorting handler
  const handleSort = (key: keyof Medicine) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Add refresh function
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Medicine[]>('/admin/inventory/view-medicines-available', {
        params: {
          orderBy: sortConfig.key || 'updatedAt',
          sortDirection: sortConfig.direction
        }
      });
      setOriginalRows(response.data);
      setFilteredRows(response.data);
      setSortedRows(response.data);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add toggle selection mode function
  const toggleSelectionMode = () => {
    setSelectionMode(prev => !prev);
    if (selectionMode) {
      setSelectedItems([]); // Clear selections when turning off selection mode
    }
  };

  // Add date filter function
  const handleDateFilterChange = (field: keyof DateFilter, value: string) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'type' || (dateFilter.startDate && dateFilter.endDate)) {
      const filtered = originalRows.filter(row => {
        if (!dateFilter.type) return true;
        
        const dateStr = dateFilter.type === 'createdAt' ? row.createdAt : row.updatedAt;
        if (!dateStr) return true;

        const date = new Date(dateStr);
        const start = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
        const end = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

        if (start && end) {
          return date >= start && date <= end;
        }
        return true;
      });
      setFilteredRows(filtered);
    }
  };

  // Add useEffect to fetch user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const employeeId = localStorage.getItem('employeeId');
        if (employeeId) {
          const response = await axios.get(`/admin/users/${employeeId}`);
          setCurrentUser({
            employeeId,
            name: response.data.name
          });
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleExportClick = () => {
    setIsExportDialogOpen(true);
  };

  const handleExportClose = () => {
    setIsExportDialogOpen(false);
  };

  const exportColumns = useMemo(() => {
    const baseColumns = [
      { field: 'name', header: 'Product Name' },
      { field: 'brand_name', header: 'Brand Name' },
      { field: 'barcode', header: 'Barcode' },
      { field: 'category', header: 'Category' },
      { field: 'price', header: 'Price' },
      { field: 'createdAt', header: 'Created At' },
      { field: 'updatedAt', header: 'Updated At' }
    ];

    // Add columns for each branch's stock and expiry date
    branches.forEach(branch => {
      baseColumns.push(
        { field: `branch_${branch.branch_id}_stock`, header: `${branch.branch_name} Stock` },
        { field: `branch_${branch.branch_id}_expiry`, header: `${branch.branch_name} Expiry` }
      );
    });

    return baseColumns;
  }, [branches]);

  const handleCreatedDateFilterChange = (field: 'startDate' | 'endDate', value: string) => {
    setTempCreatedDateFilter(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdatedDateFilterChange = (field: 'startDate' | 'endDate', value: string) => {
    setTempUpdatedDateFilter(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyCreatedDateFilter = () => {
    setCreatedDateFilter(tempCreatedDateFilter);
    setShowCreatedDateFilter(false);
  };

  const handleApplyUpdatedDateFilter = () => {
    setUpdatedDateFilter(tempUpdatedDateFilter);
    setShowUpdatedDateFilter(false);
  };

  const handleClearCreatedDateFilter = () => {
    setTempCreatedDateFilter({ startDate: '', endDate: '' });
    setCreatedDateFilter({ startDate: '', endDate: '' });
    setShowCreatedDateFilter(false);
  };

  const handleClearUpdatedDateFilter = () => {
    setTempUpdatedDateFilter({ startDate: '', endDate: '' });
    setUpdatedDateFilter({ startDate: '', endDate: '' });
    setShowUpdatedDateFilter(false);
  };

  const processedProducts = useMemo(() => {
    let filtered = [...originalRows];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Created Date filter
    if (createdDateFilter.startDate || createdDateFilter.endDate) {
      filtered = filtered.filter(product => {
        const createdDate = new Date(product.createdAt).setHours(0, 0, 0, 0);
        const start = createdDateFilter.startDate ? new Date(createdDateFilter.startDate).setHours(0, 0, 0, 0) : null;
        const end = createdDateFilter.endDate ? new Date(createdDateFilter.endDate).setHours(23, 59, 59, 999) : null;

        if (start && end) {
          return createdDate >= start && createdDate <= end;
        } else if (start) {
          return createdDate >= start;
        } else if (end) {
          return createdDate <= end;
        }
        return true;
      });
    }

    // Updated Date filter
    if (updatedDateFilter.startDate || updatedDateFilter.endDate) {
      filtered = filtered.filter(product => {
        const updatedDate = new Date(product.updatedAt).setHours(0, 0, 0, 0);
        const start = updatedDateFilter.startDate ? new Date(updatedDateFilter.startDate).setHours(0, 0, 0, 0) : null;
        const end = updatedDateFilter.endDate ? new Date(updatedDateFilter.endDate).setHours(23, 59, 59, 999) : null;

        if (start && end) {
          return updatedDate >= start && updatedDate <= end;
        } else if (start) {
          return updatedDate >= start;
        } else if (end) {
          return updatedDate <= end;
        }
        return true;
      });
    }

    // Add branch inventory data to each product
    filtered = filtered.map(product => {
      const enhancedProduct: Medicine = { ...product };
      
      branches.forEach(branch => {
        const branchInventory = product.branch_inventory?.find((bi: BranchInventory) => bi.branch_id === branch.branch_id);
        enhancedProduct[`branch_${branch.branch_id}_stock`] = branchInventory?.stock?.toString() || '0';
        enhancedProduct[`branch_${branch.branch_id}_expiry`] = branchInventory?.expiryDate || 'N/A';
      });

      return enhancedProduct;
    });

    // Sort
    if (sortConfig && sortConfig.key) {
      filtered.sort((a: Medicine, b: Medicine) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === undefined || bValue === undefined) return 0;
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [originalRows, searchQuery, categoryFilter, createdDateFilter, updatedDateFilter, sortConfig, branches]);

  // Effect to handle barcode prefix
  useEffect(() => {
    if (useBarcodePrefix && newMedicineData.category) {
      // Get next available barcode for the selected category
      const selectedCategory = categories.find(c => c.name === newMedicineData.category);
      if (selectedCategory) {
        axios.get(`/admin/inventory/next-barcode/${selectedCategory.category_id}`)
          .then(response => {
            handleModalInputChange('barcode', response.data.barcode);
          })
          .catch(error => {
            console.error('Error getting next barcode:', error);
            setErrorMessage('Failed to generate barcode');
          });
      }
    }
  }, [useBarcodePrefix, newMedicineData.category]);

  // Effect to handle barcode scanner
  useEffect(() => {
    let scannedBarcode = '';
    let lastKeyTime = Date.now();

    const handleKeyPress = (e: KeyboardEvent) => {
      if (!useBarcodeScanner || !isWaitingForScan) return;

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100) {
        // If delay between keystrokes is too long, start a new barcode
        scannedBarcode = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        // Barcode scan complete
        if (scannedBarcode) {
          handleModalInputChange('barcode', scannedBarcode);
          setIsWaitingForScan(false);
          scannedBarcode = '';
        }
      } else {
        scannedBarcode += e.key;
      }
    };

    if (useBarcodeScanner) {
      window.addEventListener('keypress', handleKeyPress);
      setIsWaitingForScan(true);
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    }

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [useBarcodeScanner]);

  // Handle barcode scanner toggle
  const handleBarcodeScannerToggle = (checked: boolean) => {
    setUseBarcodeScanner(checked);
    if (checked) {
      setUseBarcodePrefix(false);
      setNewMedicineData(prev => ({ ...prev, barcode: '' }));
    }
  };

  // Handle barcode prefix toggle
  const handleBarcodePrefixToggle = (checked: boolean) => {
    setUseBarcodePrefix(checked);
    if (checked) {
      setUseBarcodeScanner(false);
      if (newMedicineData.category) {
        const selectedCategory = categories.find(c => c.name === newMedicineData.category);
        if (selectedCategory) {
          axios.get(`/admin/inventory/next-barcode/${selectedCategory.category_id}`)
            .then(response => {
              setNewMedicineData(prev => ({ ...prev, barcode: response.data.barcode }));
            })
            .catch(error => {
              console.error('Error getting next barcode:', error);
              setErrorMessage('Failed to generate barcode');
            });
        }
      } else {
        setErrorMessage('Please select a category first');
        setUseBarcodePrefix(false);
      }
    }
  };

  return (
    <Box sx={{ p: 0, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>
      {/* Messages */}
      <Box>
        {successMessageFromDeletion && (
          <Alert
            icon={<CheckIcon fontSize="inherit" />}
            severity="success"
            sx={{
              position: 'fixed',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1201,
            }}
          >
            {successMessageFromDeletion}
          </Alert>
        )}
      </Box>

      {/* Table Controls */}
      <Box sx={{ 
        backgroundColor: 'white',
        padding: 2,
        borderRadius: 1,
        boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
        mb: 3,
        mt: 2
      }}>
        {/* Action Buttons Group */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          mb: 2,
          flexWrap: 'wrap'
        }}>
          <Button
            variant="contained"
            sx={{ 
              backgroundColor: '#01A768', 
              color: '#fff', 
              fontWeight: 'medium', 
              textTransform: 'none', 
              '&:hover': { backgroundColor: '#017F4A' }
            }}
            onClick={handleAddNewItemClick}
            startIcon={<AddIcon />}
          >
            Add New Item
          </Button>
          <Button
            variant="contained"
            color="inherit"
            onClick={handleExportClick}
            startIcon={<FileDownloadIcon />}
            sx={{ textTransform: 'none' }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            color="inherit"
            onClick={handleRefresh}
            disabled={isLoading}
            startIcon={<RefreshIcon />}
            sx={{ textTransform: 'none' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="inherit"
            onClick={() => navigate('/manager/inventory/archived')}
            startIcon={<ArchiveIcon />}
            sx={{ textTransform: 'none' }}
          >
            View Archive
          </Button>
          <Button
            variant="contained"
            color="inherit"
            onClick={() => navigate('/manager/inventory/view-medicines-group')}
            startIcon={<CategoryIcon />}
            sx={{ textTransform: 'none' }}
          >
            View Categories
          </Button>

          <Box sx={{ flexGrow: 1 }} /> {/* Spacer */}

          <Button
            variant="contained"
            color={selectionMode ? "primary" : "inherit"}
            onClick={toggleSelectionMode}
            startIcon={<CheckBox />}
            sx={{ textTransform: 'none' }}
          >
            Selection Mode {selectionMode ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteSelected}
            disabled={selectedItems.length === 0}
            sx={{ textTransform: 'none' }}
          >
            Delete Selected ({selectedItems.length})
          </Button>
        </Box>

        {/* Search and Filters Group */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
            <TextField
              label="Search Product, Brand, Barcode"
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
                minWidth: { xs: '100%', md: '300px' },
                backgroundColor: '#fff',
              }}
            />

            <FormControl sx={{ minWidth: { xs: '100%', md: '200px' } }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={handleChange}
              >
                <MenuItem value="All">All</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.category_id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={() => setShowCreatedDateFilter(!showCreatedDateFilter)}
              sx={{ minWidth: { xs: '100%', md: 'auto' } }}
            >
              {createdDateFilter.startDate || createdDateFilter.endDate ? 'Created Date Filter Active' : 'Created Date Filter'}
            </Button>

            <Button
              variant="outlined"
              onClick={() => setShowUpdatedDateFilter(!showUpdatedDateFilter)}
              sx={{ minWidth: { xs: '100%', md: 'auto' } }}
            >
              {updatedDateFilter.startDate || updatedDateFilter.endDate ? 'Updated Date Filter Active' : 'Updated Date Filter'}
            </Button>
          </Box>

          <FormControl sx={{ minWidth: { xs: '100%', md: '150px' } }}>
            <InputLabel>Show entries</InputLabel>
            <Select
              value={rowsPerPage.toString()}
              onChange={handleChangeRowsPerPage}
              label="Show entries"
            >
              <MenuItem value={10}>10 entries</MenuItem>
              <MenuItem value={25}>25 entries</MenuItem>
              <MenuItem value={50}>50 entries</MenuItem>
              <MenuItem value={100}>100 entries</MenuItem>
              <MenuItem value="all">Show all</MenuItem>
            </Select>
          </FormControl>

          {showCreatedDateFilter && (
            <Paper sx={{
              position: 'absolute',
              top: '100%',
              right: 0,
              mt: 1,
              p: 2,
              zIndex: 1000,
              minWidth: 300,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              <Typography variant="subtitle2">Created Date Filter</Typography>
              <TextField
                label="Start Date"
                type="date"
                value={tempCreatedDateFilter.startDate}
                onChange={(e) => handleCreatedDateFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="End Date"
                type="date"
                value={tempCreatedDateFilter.endDate}
                onChange={(e) => handleCreatedDateFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  onClick={handleClearCreatedDateFilter}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleApplyCreatedDateFilter}
                >
                  Apply
                </Button>
              </Box>
            </Paper>
          )}

          {showUpdatedDateFilter && (
            <Paper sx={{
              position: 'absolute',
              top: '100%',
              right: 0,
              mt: 1,
              p: 2,
              zIndex: 1000,
              minWidth: 300,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              <Typography variant="subtitle2">Updated Date Filter</Typography>
              <TextField
                label="Start Date"
                type="date"
                value={tempUpdatedDateFilter.startDate}
                onChange={(e) => handleUpdatedDateFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="End Date"
                type="date"
                value={tempUpdatedDateFilter.endDate}
                onChange={(e) => handleUpdatedDateFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  onClick={handleClearUpdatedDateFilter}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleApplyUpdatedDateFilter}
                >
                  Apply
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {selectionMode && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedItems.length > 0 && selectedItems.length === processedProducts.length}
                    indeterminate={selectedItems.length > 0 && selectedItems.length < processedProducts.length}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedItems(processedProducts.map(product => product.barcode));
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                  />
                </TableCell>
              )}
              <TableCell 
                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => handleSort('name')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Product Name
                  {sortConfig.key === 'name' && (
                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => handleSort('brand_name')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Brand Name
                  {sortConfig.key === 'brand_name' && (
                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => handleSort('barcode')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Barcode
                  {sortConfig.key === 'barcode' && (
                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => handleSort('category')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Category
                  {sortConfig.key === 'category' && (
                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => handleSort('price')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Price
                  {sortConfig.key === 'price' && (
                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => handleSort('stock')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Stock Quantity
                  {sortConfig.key === 'stock' && (
                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => handleSort('createdAt')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Created at
                  {sortConfig.key === 'createdAt' && (
                    sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : processedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              processedProducts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product) => (
                  <TableRow 
                    key={product.barcode}
                    onClick={() => handleSelectItem(product.barcode)}
                    sx={{
                      cursor: selectionMode ? 'pointer' : 'default',
                      backgroundColor: selectedItems.includes(product.barcode) ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                      '&:hover': {
                        backgroundColor: selectionMode ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    {selectionMode && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedItems.includes(product.barcode)}
                          onChange={() => handleSelectItem(product.barcode)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.brand_name}</TableCell>
                    <TableCell>{product.barcode}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.createdAt ? new Date(product.createdAt).toLocaleString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(product.barcode);
                          }} 
                          sx={{ color: '#2BA3B6' }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditItem(product.barcode);
                          }} 
                          sx={{ color: '#1D7DFA' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(product.barcode, product.name);
                          }} 
                          sx={{ color: '#D83049' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={processedProducts.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />

      {/* Add New Item Modal */}
      <Dialog
        open={isModalOpen}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            handleModalClose();
          }
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Add New Product Item</DialogTitle>
          <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={newMedicineData.name}
                  onChange={(e) => handleModalInputChange('name', e.target.value)}
                  error={errors.medicineName}
                  helperText={errors.medicineName ? "This field is required" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Brand Name"
                  value={newMedicineData.brand_name}
                  onChange={(e) => handleModalInputChange('brand_name', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={errors.groupName}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newMedicineData.category}
                    label="Category"
                    onChange={(e) => handleModalInputChange('category', e.target.value)}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.category_id} value={category.name}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.groupName && (
                    <FormHelperText>This field is required</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useBarcodePrefix}
                        onChange={(e) => handleBarcodePrefixToggle(e.target.checked)}
                        disabled={!newMedicineData.category}
                      />
                    }
                    label="Use Barcode Prefix"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useBarcodeScanner}
                        onChange={(e) => handleBarcodeScannerToggle(e.target.checked)}
                      />
                    }
                    label="Scan Barcode"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Barcode"
                  value={newMedicineData.barcode}
                  onChange={(e) => handleModalInputChange('barcode', e.target.value)}
                  error={errors.medicineID}
                  helperText={errors.medicineID ? "This field is required" : useBarcodePrefix ? "Auto-generated barcode" : ""}
                  disabled={useBarcodePrefix}
                  inputRef={barcodeInputRef}
                  InputProps={{
                    endAdornment: useBarcodeScanner && isWaitingForScan && (
                      <InputAdornment position="end">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    ),
                    readOnly: useBarcodePrefix
                  }}
                  placeholder={useBarcodeScanner ? "Waiting for barcode scan..." : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={newMedicineData.price}
                  onChange={(e) => handleModalInputChange('price', e.target.value)}
                  error={errors.price}
                  helperText={errors.price ? "This field is required" : ""}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Dosage Amount"
                  type="number"
                  value={newMedicineData.dosage_amount}
                  onChange={(e) => handleModalInputChange('dosage_amount', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Dosage Unit</InputLabel>
                  <Select
                    value={newMedicineData.dosage_unit}
                    label="Dosage Unit"
                    onChange={(e) => handleModalInputChange('dosage_unit', e.target.value)}
                  >
                    {DOSAGE_UNITS.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pieces per Box"
                  type="number"
                  value={newMedicineData.pieces_per_box}
                  onChange={(e) => handleModalInputChange('pieces_per_box', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Critical Level"
                  type="number"
                  value={newMedicineData.critical}
                  onChange={(e) => handleModalInputChange('critical', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Branch Inventory</Typography>
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Branch</TableCell>
                        <TableCell align="right">Stock</TableCell>
                        <TableCell align="right">Expiry Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {branches.map((branch) => (
                        <TableRow key={branch.branch_id}>
                          <TableCell>{branch.branch_name}</TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              size="small"
                              value={branchInventory.find(b => b.branchId === branch.branch_id)?.stock || ''}
                              onChange={(e) => handleBranchInventoryChange(branch.branch_id, 'stock', e.target.value)}
                              InputProps={{ inputProps: { min: 0 } }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="date"
                              size="small"
                              value={branchInventory.find(b => b.branchId === branch.branch_id)?.expiryDate || ''}
                              onChange={(e) => handleBranchInventoryChange(branch.branch_id, 'expiryDate', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={newMedicineData.description}
                  onChange={(e) => handleModalInputChange('description', e.target.value)}
                  error={errors.howToUse}
                  helperText={errors.howToUse ? "This field is required" : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Side Effects"
                  multiline
                  rows={4}
                  value={newMedicineData.sideEffects}
                  onChange={(e) => handleModalInputChange('sideEffects', e.target.value)}
                  error={errors.sideEffects}
                  helperText={errors.sideEffects ? "This field is required" : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newMedicineData.requiresPrescription === 1}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Requires Prescription"
                />
              </Grid>
            </Grid>
          </Box>
          </DialogContent>
          <DialogActions>
          <Button onClick={handleModalClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveNewItem} color="primary">
            Add Item
            </Button>
          </DialogActions>
      </Dialog>

      {/* Show All Warning Dialog */}
      <Dialog
        open={showAllWarningOpen}
        onClose={handleShowAllCancel}
      >
        <DialogTitle>Warning</DialogTitle>
        <DialogContent>
          <Typography>
            Showing all items at once may cause the system to become slow. Are you sure you want to proceed?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleShowAllCancel}>Cancel</Button>
          <Button onClick={handleShowAllConfirm} variant="contained" color="primary">
            Show All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        aria-labelledby="delete-confirmation-dialog-title"
        PaperProps={{ style: { padding: '10px' } }}
      >
        <DialogTitle id="delete-confirmation-dialog-title">
          Archive {selectedItems.length > 1 ? 'Multiple Items' : 'Item'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to archive {selectedItems.length > 1 ? 'these medicines' : 'the medicine'}: "{medicineToDelete?.name}"?
            This will move the item(s) to the archive.
          </Typography>
          <TextField
            fullWidth
            label="Reason for archiving"
            multiline
            rows={3}
            value={archiveReason}
            onChange={(e) => setArchiveReason(e.target.value)}
            required
            error={!archiveReason}
            helperText={!archiveReason ? "Please provide a reason for archiving" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteModalClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteItem} 
            color="error" 
            variant="contained"
            disabled={!archiveReason}
          >
            Archive
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

      {/* Export Dialog */}
      <ExportDialog
        open={isExportDialogOpen}
        onClose={handleExportClose}
        data={filteredRows}
        columns={exportColumns}
        filename="products_available"
      />
    </Box>
  );
};

export default MedicinesAvailablePage;