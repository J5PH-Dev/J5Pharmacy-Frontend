import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    TablePagination,
    LinearProgress,
    Tabs,
    Tab,
    Grid,
    Snackbar,
    Alert as MuiAlert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import WarningIcon from '@mui/icons-material/Warning';
import StoreIcon from '@mui/icons-material/Store';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PreviewIcon from '@mui/icons-material/Preview';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArticleIcon from '@mui/icons-material/Article';
import AddBoxIcon from '@mui/icons-material/AddBox';
import MedicationIcon from '@mui/icons-material/Medication';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import StorefrontIcon from '@mui/icons-material/Storefront';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useBulkImport } from '../../../contexts/BulkImportContext';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import UndoIcon from '@mui/icons-material/Undo';
import AddIcon from '@mui/icons-material/Add';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNotification } from '../../../hooks/useNotification';
import { Notification } from '../../common/Notification';
import { useErrorLogs } from '../../../hooks/useErrorLogs';
import { ErrorLogsDialog } from '../../common/ErrorLogsDialog';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface MatchedProduct {
    id: number;
    barcode: string;
    name: string;
    brand_name: string;
    category: number;
    category_name: string;
    description: string;
    sideEffects: string;
    dosage_amount: number;
    dosage_unit: string;
    price: number;
    pieces_per_box: number;
    critical: number;
    requiresPrescription: boolean;
    supplier_name?: string;
    supplier_price?: number;
    ceiling_price?: number;
    markup_percentage?: number;
    current_stock?: number;
}

interface StockDisplay {
    currentStock: number;
    importedStock: number;
    difference: number;
}

interface ImportedProduct {
    barcode: string;
    name: string;
    brand_name: string;
    category?: number;
    category_name?: string;
    status: 'pending' | 'matched' | 'similar' | 'new' | 'invalid';
    matchedProduct?: MatchedProduct;
    similarProducts?: MatchedProduct[];
    errors?: string[];
    action?: 'create' | 'update';
    description?: string;
    sideEffects?: string;
    dosage_amount?: number;
    dosage_unit?: string;
    price?: number;
    pieces_per_box?: number;
    critical?: number;
    requiresPrescription?: boolean;
    quantity: number;
    expiry: string;
    currentStock?: number;
    stockDisplay?: StockDisplay;
}

interface Category {
    category_id: number;
    name: string;
    prefix: string;
}

interface Branch {
    branch_id: number;
    branch_name: string;
}

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
            id={`guidelines-tabpanel-${index}`}
            aria-labelledby={`guidelines-tab-${index}`}
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

const Guidelines: React.FC<{ 
    open: boolean; 
    onClose: () => void;
    categories: Category[]; 
}> = ({ open, onClose, categories }) => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="guidelines tabs">
                        <Tab label="Import Templates" />
                        <Tab label="Import Process" />
                        <Tab label="Valid Values" />
                        <Tab label="Important Tips" />
                    </Tabs>
                </Box>
            </DialogTitle>
            <DialogContent>
                {/* Import Templates Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>Import Templates</Typography>
                    
                    <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                        {/* Existing Products Template Card */}
                        <Paper 
                            elevation={2} 
                            sx={{ 
                                flex: 1,
                                p: 3,
                                borderRadius: 2,
                                border: '1px solid #e0e0e0',
                                '&:hover': {
                                    boxShadow: 3
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                <ArticleIcon sx={{ color: '#1B3E2D', fontSize: 28 }} />
                                <Typography variant="h6" color="primary">
                                    Existing Products Template
                </Typography>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Use this template when importing inventory for products that already exist in the system.
                </Typography>

                            <Box sx={{ 
                                bgcolor: '#f5f5f5',
                                p: 2,
                                borderRadius: 1,
                                mb: 2
                            }}>
                                <Typography variant="subtitle2" gutterBottom color="primary">
                                    Required Columns:
                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {[
                                        'Barcode',
                                        'Product Name',
                                        'Brand Name',
                                        'Quantity',
                                        'Expiry (MM/YY)'
                                    ].map((item, index) => (
                                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box 
                                                sx={{ 
                                                    width: 6, 
                                                    height: 6, 
                                                    bgcolor: '#1B3E2D', 
                                                    borderRadius: '50%' 
                                                }} 
                                            />
                                            <Typography variant="body2">{item}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 1 }}>
                                <Typography variant="subtitle2" gutterBottom color="primary">
                                    Example:
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    4806522630659, IRBESARTAN, CENTRAMED, 55, 06/30/2027
                                </Typography>
                            </Box>
                        </Paper>

                        {/* New & Existing Products Template Card */}
                        <Paper 
                            elevation={2} 
                            sx={{ 
                                flex: 1,
                                p: 3,
                                borderRadius: 2,
                                border: '1px solid #e0e0e0',
                                '&:hover': {
                                    boxShadow: 3
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                <AddBoxIcon sx={{ color: '#1B3E2D', fontSize: 28 }} />
                                <Typography variant="h6" color="primary">
                                    New & Existing Products Template
                                </Typography>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Use this template when importing both new products and existing inventory items.
                            </Typography>

                            <Box sx={{ 
                                bgcolor: '#f5f5f5',
                                p: 2,
                                borderRadius: 1,
                                mb: 2
                            }}>
                                <Typography variant="subtitle2" gutterBottom color="primary">
                                    Required Columns:
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {[
                                        'Barcode',
                                        'Product Name',
                                        'Brand Name',
                                        'Category',
                                        'Quantity',
                                        'Expiry',
                                        'Dosage Unit',
                                        'Dosage Amount',
                                        'Prescription (0 or 1)',
                                        'Description',
                                        'Side Effects'
                                    ].map((item, index) => (
                                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box 
                                                sx={{ 
                                                    width: 6, 
                                                    height: 6, 
                                                    bgcolor: '#1B3E2D', 
                                                    borderRadius: '50%' 
                                                }} 
                                            />
                                            <Typography variant="body2">{item}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            <Box sx={{ 
                                bgcolor: '#fff4e5', 
                                p: 2, 
                                borderRadius: 1,
                                border: '1px solid #ffb74d'
                            }}>
                                <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                                    Note:
                                </Typography>
                                <Typography variant="body2" color="warning.dark">
                                    For new products, all fields are required. For existing products, only the basic fields (as in the Existing Products Template) are needed.
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>

                    <Box sx={{ 
                        mt: 3, 
                        p: 2, 
                        bgcolor: '#e8f5e9', 
                        borderRadius: 1,
                        border: '1px solid #81c784'
                    }}>
                        <Typography variant="subtitle2" color="success.dark" gutterBottom>
                            Pro Tip:
                        </Typography>
                        <Typography variant="body2" color="success.dark">
                            Download the appropriate template using the buttons above the import area. The templates include sample data to help you understand the required format.
                        </Typography>
                    </Box>
                </TabPanel>

                {/* Import Process Tab */}
                <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>Import Process</Typography>
                    <Box sx={{ ml: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Step 1 */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <Box sx={{ 
                                    bgcolor: '#1B3E2D', 
                                    color: 'white', 
                                    borderRadius: '50%', 
                                    width: 32, 
                                    height: 32, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    1
                                </Box>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <StoreIcon color="primary" />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Select Branch
                </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Choose the branch where you want to import the inventory
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Step 2 */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <Box sx={{ 
                                    bgcolor: '#1B3E2D', 
                                    color: 'white', 
                                    borderRadius: '50%', 
                                    width: 32, 
                                    height: 32, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    2
                                </Box>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <DescriptionIcon color="primary" />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Choose Template
                </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Select the appropriate template based on your needs (New & Existing or Existing Only)
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Step 3 */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <Box sx={{ 
                                    bgcolor: '#1B3E2D', 
                                    color: 'white', 
                                    borderRadius: '50%', 
                                    width: 32, 
                                    height: 32, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    3
                                </Box>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <EditIcon color="primary" />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Fill Template
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Fill in the template with your product data following the required format
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Step 4 */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <Box sx={{ 
                                    bgcolor: '#1B3E2D', 
                                    color: 'white', 
                                    borderRadius: '50%', 
                                    width: 32, 
                                    height: 32, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    4
                                </Box>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <UploadFileIcon color="primary" />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Upload File
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Upload your completed Excel template file
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Step 5 */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <Box sx={{ 
                                    bgcolor: '#1B3E2D', 
                                    color: 'white', 
                                    borderRadius: '50%', 
                                    width: 32, 
                                    height: 32, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    5
                                </Box>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <FactCheckIcon color="primary" />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Verify Data
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Check the validation results:
                                    </Typography>
                                    <Box sx={{ ml: 2, mt: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <Box sx={{ color: 'success.main', display: 'flex', alignItems: 'center' }}>●</Box>
                                            <Typography variant="body2">Green: Product matched by barcode</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <Box sx={{ color: 'warning.main', display: 'flex', alignItems: 'center' }}>●</Box>
                                            <Typography variant="body2">Orange: Similar products found</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>●</Box>
                                            <Typography variant="body2">Red: No match found</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Step 6 */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <Box sx={{ 
                                    bgcolor: '#1B3E2D', 
                                    color: 'white', 
                                    borderRadius: '50%', 
                                    width: 32, 
                                    height: 32, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    6
                                </Box>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <PreviewIcon color="primary" />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Review Matches
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Review and confirm all product matches and resolve any conflicts
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Step 7 */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <Box sx={{ 
                                    bgcolor: '#1B3E2D', 
                                    color: 'white', 
                                    borderRadius: '50%', 
                                    width: 32, 
                                    height: 32, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    7
                                </Box>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <AddCircleIcon color="primary" />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Create New Products
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Create new product entries for unmatched items if needed
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </TabPanel>

                {/* Valid Values Tab */}
                <TabPanel value={tabValue} index={2}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>Valid Values</Typography>

                    {/* Categories Section */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                            Categories
                        </Typography>
                        <Paper sx={{ 
                            p: 2, 
                            bgcolor: '#f5f5f5',
                            borderRadius: 1,
                            maxHeight: 200,
                            overflow: 'auto'
                        }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Category Name</TableCell>
                                        <TableCell>Prefix</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {categories.map((category) => (
                                        <TableRow key={category.category_id} hover>
                                            <TableCell>{category.name}</TableCell>
                                            <TableCell>{category.prefix}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                        <Typography 
                            variant="caption" 
                            color="textSecondary" 
                            sx={{ display: 'block', mt: 1 }}
                        >
                            * Categories are required for new products only
                        </Typography>
                    </Box>

                    {/* Other Valid Values Sections */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                            Date Format
                        </Typography>
                        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                Long Format (Recommended)
                            </Typography>
                            <Typography variant="body2">MM/DD/YYYY (e.g., 06/30/2027)</Typography>
                            
                            <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }} gutterBottom>
                                Short Format
                            </Typography>
                            <Typography variant="body2">MM/YY (e.g., 06/27)</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                            Prescription Field
                        </Typography>
                        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                            <Typography variant="body2" gutterBottom>
                                Use these values to indicate if a product requires prescription:
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                                <Typography variant="body2">• 0 or No - Does not require prescription</Typography>
                                <Typography variant="body2">• 1 or Yes - Requires prescription</Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Add this in the Valid Values tab, before the Quantity section */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                            Dosage Units
                        </Typography>
                        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                            <Typography variant="body2" gutterBottom>
                                Use only these standard dosage units:
                            </Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={4}>
                                    <Typography variant="body2">• mg - Milligrams</Typography>
                                    <Typography variant="body2">• g - Grams</Typography>
                                    <Typography variant="body2">• ml - Milliliters</Typography>
                                    <Typography variant="body2">• tablet - Tablet form</Typography>
                                    <Typography variant="body2">• capsule - Capsule form</Typography>
                                    <Typography variant="body2">• IU - International Units</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2">• mcg - Micrograms</Typography>
                                    <Typography variant="body2">• kg - Kilograms</Typography>
                                    <Typography variant="body2">• l - Liters</Typography>
                                    <Typography variant="body2">• pill - Pill form</Typography>
                                    <Typography variant="body2">• patch - Patch form</Typography>
                                    <Typography variant="body2">• puff - Puff</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2">• spray - Spray form</Typography>
                                    <Typography variant="body2">• drop - Drops</Typography>
                                    <Typography variant="body2">• mEq - Milliequivalents</Typography>
                                    <Typography variant="body2">• mmol - Millimoles</Typography>
                                    <Typography variant="body2">• piece - Individual piece</Typography>
                                    <Typography variant="body2">• sachet - Sachet form</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                            Quantity
                        </Typography>
                        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                            <Typography variant="body2" gutterBottom>
                                • Must be a positive whole number
                            </Typography>
                            <Typography variant="body2">
                                • Maximum value: 999,999
                            </Typography>
                        </Box>
                    </Box>
                </TabPanel>

                {/* Important Tips Tab */}
                <TabPanel value={tabValue} index={3}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>Important Tips & Limitations</Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Barcode Limitation */}
                        <Paper sx={{ p: 3, bgcolor: '#fff3e0', borderRadius: 2 }}>
                            <Typography variant="subtitle1" color="warning.dark" gutterBottom>
                                ⚠️ Custom Barcode Limitation
                            </Typography>
                            <Typography variant="body2">
                                Products with custom barcodes should be added directly through the Inventory Management interface, 
                                not through bulk import. This prevents potential conflicts with the automatic barcode prefix 
                                incrementation system.
                            </Typography>
                        </Paper>

                        {/* File Size */}
                        <Paper sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                📁 File Size Limit
                            </Typography>
                            <Typography variant="body2">
                                Maximum file size: 5MB
                            </Typography>
                        </Paper>

                        {/* Data Validation */}
                        <Paper sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                ✓ Data Validation Tips
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body2">• Verify all required fields are filled</Typography>
                                <Typography variant="body2">• Check expiry dates are in correct format</Typography>
                                <Typography variant="body2">• Ensure quantities are positive numbers</Typography>
                                <Typography variant="body2">• Validate category names match exactly</Typography>
                            </Box>
                        </Paper>

                        {/* Best Practices */}
                        <Paper sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                💡 Best Practices
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body2">• Use the provided templates</Typography>
                                <Typography variant="body2">• Import in smaller batches for easier verification</Typography>
                                <Typography variant="body2">• Review the preview before confirming import</Typography>
                                <Typography variant="body2">• Keep a backup of your import file</Typography>
                            </Box>
                        </Paper>
                    </Box>
                </TabPanel>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

const pulseAnimation = {
    '@keyframes pulse': {
        '0%': {
            boxShadow: '0 0 0 0 rgba(27, 62, 45, 0.4)',
        },
        '70%': {
            boxShadow: '0 0 0 10px rgba(27, 62, 45, 0)',
        },
        '100%': {
            boxShadow: '0 0 0 0 rgba(27, 62, 45, 0)',
        },
    },
};

// Add this component for consistent step styling
const StepLabel: React.FC<{ label: string; sublabel: string }> = ({ label, sublabel }) => (
    <Box sx={{ textAlign: 'center' }}>
        <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mb: 0.5 }}
        >
            {label}
        </Typography>
        <Typography 
            variant="subtitle2" 
            sx={{ 
                fontWeight: 'bold',
                color: '#1B3E2D'
            }}
        >
            {sublabel}
        </Typography>
    </Box>
);

interface ErrorLog {
    timestamp: string;
    user: {
        name: string;
        employeeId: string;
        role: string;
    };
    error: string;
    details?: any;
}

// Add this interface for similar products
interface SimilarProductMatch {
    product: MatchedProduct;
    similarity: number;
}

// Add this utility function
const convertDateFormat = (dateStr: string): string => {
    // Check if date is in MM/DD/YYYY format
    const mmddyyyyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (mmddyyyyRegex.test(dateStr)) {
        const [_, month, day, year] = mmddyyyyRegex.exec(dateStr) || [];
        return `${year}-${month}-${day}`;
    }
    
    // Check if date is in DD/MM/YYYY format
    const ddmmyyyyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (ddmmyyyyRegex.test(dateStr)) {
        const [_, day, month, year] = ddmmyyyyRegex.exec(dateStr) || [];
        return `${year}-${month}-${day}`;
    }

    // Return null or original string if format is not recognized
    return dateStr;
};

// Add this animation keyframe at the top level
const slideAnimation = {
    '@keyframes slideIn': {
        from: { transform: 'translateX(100%)', opacity: 0 },
        to: { transform: 'translateX(0)', opacity: 1 }
    },
    '@keyframes slideOut': {
        from: { transform: 'translateX(0)', opacity: 1 },
        to: { transform: 'translateX(-100%)', opacity: 0 }
    }
};

// Add this helper function to get a friendly name for the import type
const getImportTypeName = (type: string | null) => {
    switch (type) {
        case 'all':
            return 'New & Existing Products';
        case 'existing':
            return 'Existing Products Only';
        default:
            return 'Not Selected';
    }
};

const BulkInventoryImport: React.FC = () => {
    const { importedData, setImportedData, clearImportedData } = useBulkImport();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesMap, setCategoriesMap] = useState<{ [key: string]: number }>({});

    const [showSimilarProducts, setShowSimilarProducts] = useState(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
    const [branches, setBranches] = useState<Branch[]>([]);

    const { selectedBranch, setSelectedBranch, importType, setImportType } = useBulkImport();
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const [hasSeenGuidelines, setHasSeenGuidelines] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ImportedProduct | null>(null);
    const [editFormData, setEditFormData] = useState({
        quantity: '',
        expiry: '',
        // ... other fields ...
    });
    const [similarProducts, setSimilarProducts] = useState<SimilarProductMatch[]>([]);
    const [resolvingProduct, setResolvingProduct] = useState<ImportedProduct | null>(null);
    const [undoHistory, setUndoHistory] = useState<{
        product: ImportedProduct;
        previousState: ImportedProduct;
    }[]>([]);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MatchedProduct[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchPage, setSearchPage] = useState(0);
    const [searchRowsPerPage, setSearchRowsPerPage] = useState(5);
    const [totalSearchResults, setTotalSearchResults] = useState(0);

    // Add import progress state
    const [importProgress, setImportProgress] = useState<{
        show: boolean;
        current: number;
        total: number;
    }>({ show: false, current: 0, total: 0 });

    // Add these states for branch pagination
    const [currentBranchPage, setCurrentBranchPage] = useState(0);
    const branchesPerPage = 8;

    const { notification: notificationState, setNotification: setNotificationState, handleNotification } = useNotification();
    const { 
        errorLogs, 
        showErrorDialog, 
        setShowErrorDialog, 
        logError, 
        copyErrorLogs 
    } = useErrorLogs();

    const [selectedProduct, setSelectedProduct] = useState<ImportedProduct | null>(null);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchBranches();
    }, []);

    useEffect(() => {
        return () => {
            setPendingFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };
    }, []);

    useEffect(() => {
        const hasSeenGuide = localStorage.getItem('hasSeenBulkImportGuidelines');
        if (hasSeenGuide) {
            setHasSeenGuidelines(true);
        }
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/resources/categories');
            setCategories(response.data);
            
            // Create a mapping of category names to category_ids
            const map: { [key: string]: number } = {};
            response.data.forEach((category: { category_id: number; name: string }) => {
                map[category.name] = category.category_id;
            });
            setCategoriesMap(map);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to fetch categories');
        }
    };



    const fetchBranches = async () => {
        try {
            const response = await axios.get('/api/admin/branches');
            setBranches(response.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
            setError('Failed to fetch branches');
        }
    };

    const getFormattedDate = () => {
        const date = new Date();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${mm}${dd}${yyyy}`;
    };

    const downloadNewAndExistingTemplate = () => {
        const template = [
            {
                'barcode': '123456789',
                'name': 'Product',
                'brand_name': 'Brand',
                'category': 'BRANDED',
                'quantity': '100',
                'expiry': '12/31/2024',
                'dosage_amount': '500',
                'dosage_unit': 'mg',
                'prescription': '0',
                'description': 'Take as directed',
                'sideEffects': 'None known' 
            }
        ];

        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        

        const currentDateTime = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/(\d{2}):(\d{2})/, (match, p1, p2) => `${(parseInt(p1) + 8) % 24}:${p2}`);
        XLSX.writeFile(wb, `import_full_${currentDateTime}.xlsx`);
        
        handleNotification('Template downloaded successfully', 'success');
    };

    const downloadExistingOnlyTemplate = () => {
        const template = [
            {
                'barcode': '123456789',
                'name': 'Product',
                'brand_name': 'Brand',
                'quantity': '100',
                'expiry': '12/31/2025'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        const currentDateTime = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/(\d{2}):(\d{2})/, (match, p1, p2) => `${(parseInt(p1) + 8) % 24}:${p2}`);
        XLSX.writeFile(wb, `import_existing_${currentDateTime}.xlsx`);
        
        handleNotification('Template downloaded successfully', 'success');
    };

    // Modify the handleFileSelect function
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!selectedBranch) {
            handleNotification('Please select a branch first', 'error');
            return;
        }

        // Process file directly without showing import type dialog
        processFile(file);
    };

    const processFile = async (file: File) => {
        console.log('[BulkImport] Starting file upload process...');
        console.log(`[BulkImport] File details: Name=${file.name}, Size=${(file.size / 1024).toFixed(2)}KB`);

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            console.log('[BulkImport] Error: File size exceeds 5MB limit');
            handleNotification('File size too large. Maximum size is 5MB.', 'error');
            setPendingFile(null);
            return;
        }

        // Check file type
        if (!file.name.match(/\.(xlsx|xls)$/)) {
            console.log('[BulkImport] Error: Invalid file type');
            handleNotification('Invalid file type. Please upload an Excel file (.xlsx or .xls)', 'error');
            setPendingFile(null);
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            console.log('[BulkImport] Starting file processing...');
            
            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    const newProgress = Math.min(prev + 10, 90);
                    console.log(`[BulkImport] Upload progress: ${newProgress}%`);
                    return newProgress;
                });
            }, 200);

            const data = await file.arrayBuffer();
            console.log('[BulkImport] File converted to array buffer');
            
            const workbook = XLSX.read(data, { type: 'array' });
            console.log('[BulkImport] Excel workbook read successfully');
            
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            // Convert Excel dates to MM/DD/YYYY format
            const jsonData = XLSX.utils.sheet_to_json(firstSheet).map((row: any) => {
                if (row.expiry) {
                    // Handle different date formats
                    let expiryDate;
                    if (typeof row.expiry === 'number') {
                        // Handle Excel serial date
                        expiryDate = new Date(Math.round((row.expiry - 25569) * 86400 * 1000));
                    } else if (typeof row.expiry === 'string') {
                        // Try to parse string date
                        expiryDate = new Date(row.expiry);
                    }

                    if (expiryDate && !isNaN(expiryDate.getTime())) {
                        // Convert to MM/DD/YYYY format
                        const month = String(expiryDate.getMonth() + 1).padStart(2, '0');
                        const day = String(expiryDate.getDate()).padStart(2, '0');
                        const year = expiryDate.getFullYear();
                        return {
                            ...row,
                            expiry: `${month}/${day}/${year}`
                        };
                    }
                }
                return row;
            });
            console.log(`[BulkImport] Parsed ${jsonData.length} rows from Excel`);

            // Validate required columns based on import type
            const requiredColumns = importType === 'existing' 
                ? ['barcode', 'name', 'quantity', 'expiry']
                : ['barcode', 'name'];

            const firstRow = jsonData[0] as any;
            const missingColumns = requiredColumns.filter(col => {
                if (col === 'quantity') {
                    // Check for either 'quantity' or 'imported_stock'
                    return !Object.keys(firstRow || {}).some(key => 
                        key.toLowerCase().replace(/\s+/g, '_') === 'quantity' ||
                        key.toLowerCase().replace(/\s+/g, '_') === 'imported_stock'
                    );
                }
                return !Object.keys(firstRow || {}).some(key => 
                    key.toLowerCase().replace(/\s+/g, '_') === col.toLowerCase()
                );
            });

            if (missingColumns.length > 0) {
                console.log(`[BulkImport] Error: Missing required columns: ${missingColumns.join(', ')}`);
                clearInterval(progressInterval);
                setError(`Missing required columns: ${missingColumns.join(', ')}`);
                setIsUploading(false);
                setUploadProgress(0);
                setPendingFile(null);
                return;
            }

            console.log('[BulkImport] Sending data to backend for validation...');
            const response = await axios.post('/api/resources/bulk-import/validate', {
                products: jsonData,
                importType,
                branchId: selectedBranch
            });

            console.log('[BulkImport] Backend validation complete');
            clearInterval(progressInterval);
            setUploadProgress(100);
            console.log('[BulkImport] Upload complete (100%)');
            
            setImportedData(response.data);
            console.log(`[BulkImport] Processed ${response.data.length} products`);
            
            const invalidCount = response.data.filter((item: ImportedProduct) => 
                item.status === 'invalid' || (Array.isArray(item.errors) && item.errors.length > 0)
            ).length;

            if (invalidCount > 0) {
                console.log(`[BulkImport] Found ${invalidCount} invalid entries`);
                handleNotification(`Found ${invalidCount} invalid entries. Please review and correct them before proceeding.`, 'error');
            } else {
                console.log('[BulkImport] All entries are valid');
                handleNotification('File uploaded successfully', 'success');
            }

            // Reset progress after a short delay
            setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
                console.log('[BulkImport] Reset upload progress');
            }, 1000);

        } catch (err) {
            console.error('[BulkImport] Error processing file:', err);
            setError('Failed to process Excel file. Please make sure it follows the template format.');
            setIsUploading(false);
            setUploadProgress(0);
        } finally {
            setLoading(false);
            setPendingFile(null);
            console.log('[BulkImport] File upload process completed');
        }
    };

    const handleSearchProduct = async (product: ImportedProduct) => {
        setResolvingProduct(product);
        try {
            // Search by both name and brand name
            const response = await axios.get('/api/resources/bulk-import/search-product', {
                params: {
                    name: product.name,
                    brand: product.brand_name
                }
            });

            // Calculate similarity scores and sort results
            const similarResults = response.data.map((matchedProduct: MatchedProduct) => ({
                product: matchedProduct,
                similarity: calculateSimilarity(product, matchedProduct)
            })).sort((a: SimilarProductMatch, b: SimilarProductMatch) => b.similarity - a.similarity);

            setSimilarProducts(similarResults);
                setShowSimilarProducts(true);
        } catch (error) {
            handleNotification('Error searching for similar products', 'error');
        }
    };

    const calculateSimilarity = (imported: ImportedProduct, existing: MatchedProduct): number => {
        let score = 0;
        
        // Name similarity (higher weight)
        if (imported.name.toLowerCase() === existing.name.toLowerCase()) {
            score += 0.5;
        } else if (existing.name.toLowerCase().includes(imported.name.toLowerCase()) ||
                   imported.name.toLowerCase().includes(existing.name.toLowerCase())) {
            score += 0.3;
        }

        // Brand similarity
        if (imported.brand_name.toLowerCase() === existing.brand_name.toLowerCase()) {
            score += 0.3;
        } else if (existing.brand_name.toLowerCase().includes(imported.brand_name.toLowerCase()) ||
                   imported.brand_name.toLowerCase().includes(existing.brand_name.toLowerCase())) {
            score += 0.2;
        }

        return score;
    };

    const handleSelectSimilarProduct = (selectedProduct: MatchedProduct) => {
        if (!resolvingProduct) return;

        // Store current state for undo
        setUndoHistory(prev => [...prev, {
            product: resolvingProduct,
            previousState: { ...resolvingProduct }
        }]);

        setImportedData(prev => prev.map(item => 
            item === resolvingProduct ? {
                ...item,
                status: 'matched',
                matchedProduct: selectedProduct,
                errors: []
            } : item
        ));

        setShowSimilarProducts(false);
        setResolvingProduct(null);
        setSimilarProducts([]);
        handleNotification('Product successfully matched', 'success');
    };

    


    // Update the handleImport function to use the converted date
    const handleImport = async () => {
        if (!selectedBranch) {
            handleNotification('Please select a branch first', 'error');
            return;
        }

        // Check for invalid or missing products
        const invalidProducts = importedData.filter(
            product => product.status === 'invalid' || product.status === 'similar'
        );

        if (invalidProducts.length > 0) {
            const confirmImport = window.confirm(
                `Warning: There are ${invalidProducts.length} products that are either missing or invalid.\n\n` +
                `These products will be skipped during import and will not be added to the inventory. ` +
                `You can resolve these products by clicking the 'Resolve' button next to each item.\n\n` +
                `Would you like to continue importing only the valid products?`
            );

            if (!confirmImport) {
            return;
            }
        }

        // Continue with import for valid products only
        const validProducts = importedData.filter(
            product => product.status !== 'invalid' && product.status !== 'similar'
        );

        setImportProgress({ show: true, current: 0, total: validProducts.length });
        setLoading(true);

        try {
            const importData = validProducts.map(product => ({
                product_id: product.matchedProduct?.id,
                barcode: product.barcode,
                name: product.name,
                brand_name: product.brand_name,
                quantity: product.quantity,
                expiry: convertDateFormat(product.expiry),
                status: product.status,
                branch_id: selectedBranch,
                category: product.category ? categoriesMap[product.category] : null,
                description: product.how_to_use,
                sideEffects: product.side_effects,
                dosage_amount: product.dosage_amount,
                dosage_unit: product.dosage_unit
            }));

            // Import products in batches of 10
            const batchSize = 10;
            for (let i = 0; i < importData.length; i += batchSize) {
                const batch = importData.slice(i, i + batchSize);
            await axios.post('/api/resources/bulk-import/process', { 
                    products: batch,
                    branch_id: selectedBranch
                });
                setImportProgress(prev => ({
                    ...prev,
                    current: Math.min(i + batchSize, importData.length)
                }));
            }

            handleNotification('Products imported successfully', 'success');
            setImportedData([]);
            
        } catch (error: any) {
            logError(error);
            handleNotification('Failed to import products. Click "See error logs" for details.', 'error');
        } finally {
            setLoading(false);
            setImportProgress({ show: false, current: 0, total: 0 });
        }
    };

    const handleRemoveItem = (index: number) => {
        setImportedData(prev => prev.filter((_, i) => i !== index));
        if (importedData.length === 1) {
            handleNotification('', 'error');
            handleNotification('', 'success');
        }
    };

    const handleEditClick = (product: ImportedProduct) => {
        setEditingProduct(product);
        setEditFormData({
            quantity: product.quantity.toString(),
            expiry: product.expiry,
        });
    };

    const handleEditChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleEditSave = () => {
        if (editingProduct) {
            const updatedProduct = {
                ...editingProduct,
                quantity: parseInt(editFormData.quantity),
                expiry: editFormData.expiry,
            };

        setImportedData(prev => prev.map(item => 
                item === editingProduct ? updatedProduct : item
            ));

            // Don't close dialog automatically
            setEditFormData({
                quantity: updatedProduct.quantity.toString(),
                expiry: updatedProduct.expiry,
            });
            
            handleNotification('Product updated successfully', 'success');
        }
    };

    const EditProductDialog = () => (
        <Dialog 
            open={!!editingProduct} 
            onClose={() => {
                setEditingProduct(null);
                setEditFormData({ quantity: '', expiry: '' });
            }}
        >
                <DialogTitle>Edit Product</DialogTitle>
                <DialogContent>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                        label="Quantity"
                            type="number"
                        value={editFormData.quantity}
                        onChange={handleEditChange('quantity')}
                                fullWidth
                        />
                        <TextField
                        label="Expiry Date"
                        type="date"
                        value={editFormData.expiry}
                        onChange={handleEditChange('expiry')}
                                fullWidth
                        InputLabelProps={{
                            shrink: true,
                        }}
                            />
                    </Box>
                </DialogContent>
                <DialogActions>
                <Button onClick={handleEditSave} color="primary">
                    Save Changes
                </Button>
                <Button 
                    onClick={() => {
                        setEditingProduct(null);
                        setEditFormData({ quantity: '', expiry: '' });
                    }}
                >
                    Close
                    </Button>
                </DialogActions>
            </Dialog>
        );

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'matched':
                return <Tooltip title="Product Found"><CheckCircleIcon color="success" /></Tooltip>;
            case 'similar':
                return <Tooltip title="Similar products found"><HelpOutlineIcon color="warning" /></Tooltip>;
            case 'new':
                return <Tooltip title="No product found"><WarningIcon color="error" /></Tooltip>;
            default:
                return <Tooltip title="Invalid"><ErrorIcon color="error" /></Tooltip>;
        }
    };

    const getStockDisplay = (currentStock: number, importedStock: number) => {
        const difference = importedStock - currentStock;
        const color = difference >= 0 ? 'success.main' : 'error.main';
        const sign = difference >= 0 ? '+' : '';
        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="span">{currentStock}</Typography>
                <Typography component="span" color={color} sx={{ ml: 1 }}>
                    ({sign}{difference})
                </Typography>
            </Box>
        );
    };

    

    

    const UploadProgress = () => {
        if (!isUploading) return null;

        return (
            <Box sx={{ width: '100%', mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                        Uploading...
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {uploadProgress}%
                    </Typography>
                </Box>
                <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: '#1B3E2D',
                            borderRadius: 4,
                        }
                    }}
                />
            </Box>
        );
    };

    // Add this component for the branch selection dialog
    const StartImportDialog = () => {
        const totalPages = Math.ceil(branches.length / branchesPerPage);
        const startIndex = currentBranchPage * branchesPerPage;
        const displayedBranches = branches.slice(startIndex, startIndex + branchesPerPage);
        const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
        const [isAnimating, setIsAnimating] = useState(false);

        // Handle navigation
        const handleNextPage = () => {
            if (currentBranchPage < totalPages - 1 && !isAnimating) {
                setSlideDirection('left');
                setIsAnimating(true);
                setTimeout(() => {
                    setCurrentBranchPage(prev => prev + 1);
                    setIsAnimating(false);
                }, 300);
            }
        };

        const handlePrevPage = () => {
            if (currentBranchPage > 0 && !isAnimating) {
                setSlideDirection('right');
                setIsAnimating(true);
                setTimeout(() => {
                    setCurrentBranchPage(prev => prev - 1);
                    setIsAnimating(false);
                }, 300);
            }
        };

        // Handle swipe
        const [touchStart, setTouchStart] = useState(0);
        const [touchEnd, setTouchEnd] = useState(0);

        const handleTouchStart = (e: React.TouchEvent) => {
            setTouchStart(e.targetTouches[0].clientX);
        };

        const handleTouchMove = (e: React.TouchEvent) => {
            setTouchEnd(e.targetTouches[0].clientX);
        };

        const handleTouchEnd = () => {
            if (!isAnimating) {
                if (touchStart - touchEnd > 75) {
                    handleNextPage();
                }
                if (touchStart - touchEnd < -75) {
                    handlePrevPage();
                }
            }
        };

        return (
        <Dialog 
            open={startDialogOpen} 
                onClose={() => setStartDialogOpen(false)}
                maxWidth="sm"
            fullWidth
        >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StorefrontIcon sx={{ color: '#1B3E2D' }} />
                        <Typography variant="h6" sx={{ color: '#1B3E2D' }}>
                            Select Branch
                        </Typography>
                    </Box>
            </DialogTitle>
            <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Select the branch where you want to import the inventory
                        </Typography>
                        <Box sx={{ position: 'relative', mt: 3, height: 360 }}>
                            {/* Navigation Arrows for Desktop */}
                            {totalPages > 1 && (
                                <>
                                    <IconButton
                                        onClick={handlePrevPage}
                                        disabled={currentBranchPage === 0 || isAnimating}
                                        sx={{
                                            position: 'absolute',
                                            left: -20,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                                            display: { xs: 'none', sm: 'flex' }
                                        }}
                                    >
                                        <NavigateBeforeIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={handleNextPage}
                                        disabled={currentBranchPage === totalPages - 1 || isAnimating}
                                        sx={{
                                            position: 'absolute',
                                            right: -20,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                                            display: { xs: 'none', sm: 'flex' }
                                        }}
                                    >
                                        <NavigateNextIcon />
                                    </IconButton>
                                </>
                            )}
                            
                            <Box 
                                sx={{ 
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: 2,
                                    height: '100%',
                                    animation: `${slideDirection === 'right' ? 'slideIn' : 'slideOut'} 0.3s ease-in-out`,
                                    ...slideAnimation
                                }}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                {displayedBranches.map((branch) => (
                            <Button
                                        key={branch.branch_id}
                                        variant={selectedBranch === branch.branch_id ? "contained" : "outlined"}
                                        onClick={() => {
                                            setSelectedBranch(branch.branch_id);
                                            setStartDialogOpen(false);
                                            if (pendingFile) {
                                                processFile(pendingFile);
                                            }
                                        }}
                                        sx={{
                                            height: 80,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            backgroundColor: selectedBranch === branch.branch_id ? '#1B3E2D' : 'transparent',
                                            borderColor: '#1B3E2D',
                                            color: selectedBranch === branch.branch_id ? 'white' : '#1B3E2D',
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': {
                                                backgroundColor: selectedBranch === branch.branch_id ? '#2D5741' : 'rgba(45, 87, 65, 0.04)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            {branch.branch_name}
                                        </Typography>
                            </Button>
                                ))}
                        </Box>
                    </Box>
                        {totalPages > 1 && (
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                gap: 1,
                                mt: 2 
                            }}>
                                {[...Array(totalPages)].map((_, index) => (
                                    <Box
                                        key={index}
                                        onClick={() => !isAnimating && setCurrentBranchPage(index)}
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            backgroundColor: currentBranchPage === index ? '#1B3E2D' : '#e0e0e0',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            transform: currentBranchPage === index ? 'scale(1.2)' : 'scale(1)',
                                            '&:hover': {
                                                backgroundColor: currentBranchPage === index ? '#1B3E2D' : '#bdbdbd',
                                            }
                                        }}
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStartDialogOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        );
    };

    const handleGuidelinesOpen = () => {
        setIsGuidelinesOpen(true);
        localStorage.setItem('hasSeenBulkImportGuidelines', 'true');
        setHasSeenGuidelines(true);
    };

    const handleUndo = (product: ImportedProduct) => {
        const undoEntry = undoHistory.find(h => h.product === product);
        if (undoEntry) {
            setImportedData(prev => prev.map(item => 
                item === product ? undoEntry.previousState : item
            ));
            setUndoHistory(prev => prev.filter(h => h.product !== product));
            handleNotification('Product match undone', 'success');
        }
    };

    const handleProductSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSearchResults([]);
            setTotalSearchResults(0);
            return;
        }

        setSearchLoading(true);
        try {
            const response = await axios.get('/api/resources/bulk-import/search-product', {
                params: { 
                    query,
                    page: searchPage,
                    limit: searchRowsPerPage
                }
            });
            setSearchResults(response.data.products);
            setTotalSearchResults(response.data.total);
        } catch (error) {
            handleNotification('Error searching products', 'error');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleAddProduct = (product: MatchedProduct) => {
        setImportedData(prev => [...prev, {
            barcode: product.barcode,
            name: product.name,
            brand_name: product.brand_name,
            status: 'matched',
            matchedProduct: product,
            quantity: 0,
            expiry: '',
            errors: []
        }]);
        setShowAddProduct(false);
        handleNotification('Product added to import list', 'success');
    };

    const AddProductDialog = () => (
        <Dialog
            open={showAddProduct}
            onClose={() => {
                setShowAddProduct(false);
                setSearchQuery('');
                setSearchResults([]);
                setSearchPage(0);
            }}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>Add Product</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    label="Search products"
                                variant="outlined"
                    value={searchQuery}
                    onChange={(e) => handleProductSearch(e.target.value)}
                    sx={{ mb: 2, mt: 1 }}
                    placeholder="Enter at least 3 characters to search..."
                />
                
                {searchLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : searchQuery.length < 3 ? (
                    <Typography color="textSecondary" align="center">
                        Enter at least 3 characters to search
                        </Typography>
                ) : (
                    <>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Barcode</TableCell>
                                        <TableCell>Product Name</TableCell>
                                        <TableCell>Brand Name</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {searchResults.map((product) => (
                                        <TableRow key={product.id} hover>
                                            <TableCell>{product.barcode}</TableCell>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell>{product.brand_name}</TableCell>
                                            <TableCell>{product.category_name}</TableCell>
                                            <TableCell>
                            <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handleAddProduct(product)}
                                                    sx={{
                                                        backgroundColor: '#1B3E2D',
                                                        '&:hover': {
                                                            backgroundColor: '#2D5741',
                                                        },
                                                    }}
                                                >
                                                    Add
                            </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            component="div"
                            count={totalSearchResults}
                            page={searchPage}
                            onPageChange={handleSearchPageChange}
                            rowsPerPage={searchRowsPerPage}
                            onRowsPerPageChange={handleSearchRowsPerPageChange}
                            rowsPerPageOptions={[5, 10, 25]}
                        />
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    setShowAddProduct(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    setSearchPage(0);
                }}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );

    // Add pagination handlers
    const handleSearchPageChange = (event: unknown, newPage: number) => {
        setSearchPage(newPage);
        handleProductSearch(searchQuery);
    };

    const handleSearchRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchRowsPerPage(parseInt(event.target.value, 10));
        setSearchPage(0);
        handleProductSearch(searchQuery);
    };

    // Add Import Progress Dialog
    const ImportProgressDialog = () => (
        <Dialog
            open={importProgress.show}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { p: 2 }
            }}
        >
            <DialogTitle>Importing Products</DialogTitle>
            <DialogContent>
                <Box sx={{ width: '100%', mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="textSecondary">
                            Progress: {importProgress.current} of {importProgress.total} products
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {Math.round((importProgress.current / importProgress.total) * 100)}%
                                    </Typography>
                                </Box>
                    <LinearProgress
                        variant="determinate"
                        value={(importProgress.current / importProgress.total) * 100}
                        sx={{ height: 10, borderRadius: 1 }}
                    />
                        </Box>
            </DialogContent>
        </Dialog>
    );

    // Add this component back inside the BulkInventoryImport component, before the return statement
    const SimilarProductsDialog = () => (
        <Dialog
            open={showSimilarProducts}
            onClose={() => setShowSimilarProducts(false)}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Typography variant="h6">Similar Products Found</Typography>
                <Typography variant="body2" color="textSecondary">
                    Select the matching product from the list below
                </Typography>
            </DialogTitle>
            <DialogContent>
                {resolvingProduct && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                            Imported Product Details:
                        </Typography>
                        <Typography variant="body2">
                            Name: {resolvingProduct.name}
                        </Typography>
                        <Typography variant="body2">
                            Brand: {resolvingProduct.brand_name}
                        </Typography>
                    </Box>
                )}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Brand Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Match Score</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {similarProducts.map((match, index) => (
                                <TableRow key={index} hover>
                                    <TableCell>{match.product.name}</TableCell>
                                    <TableCell>{match.product.brand_name}</TableCell>
                                    <TableCell>{match.product.category_name}</TableCell>
                                    <TableCell>
                                        {(match.similarity * 100).toFixed(0)}%
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => handleSelectSimilarProduct(match.product)}
                                            sx={{
                                                backgroundColor: '#1B3E2D',
                                                '&:hover': {
                                                    backgroundColor: '#2D5741',
                                                },
                                            }}
                                        >
                                            Select
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setShowSimilarProducts(false)}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );

    // Function to handle viewing product details
    const handleViewProduct = (product: ImportedProduct) => {
        setSelectedProduct(product);
        setOpenViewDialog(true);
    };

    // Function to handle editing product details
    const handleEditProduct = (product: ImportedProduct) => {
        setSelectedProduct(product);
        setOpenEditDialog(true);
    };

    // Update the handleSaveEdit function
    const handleSaveEdit = () => {
        if (!selectedProduct) return;

        try {
            // Validate required fields
            if (!selectedProduct.category) {
                handleNotification('Category is required', 'error');
                return;
            }

            // Find the category name from the selected category_id
            const selectedCategory = categories.find(cat => cat.category_id === selectedProduct.category);
            if (!selectedCategory) {
                handleNotification('Invalid category selected', 'error');
                return;
            }
            
            // Update the product in importedData
            const updatedData = importedData.map(product => {
                if (product.barcode === selectedProduct.barcode) {
                    return {
                        ...selectedProduct,
                        category: selectedProduct.category,
                        category_name: selectedCategory.name
                    };
                }
                return product;
            });

            setImportedData(updatedData);
            handleNotification('Product updated successfully', 'success');
            setOpenEditDialog(false);
        } catch (error) {
            logError(error);
            handleNotification('Error updating product', 'error');
        }
    };

    const handleReset = () => {
        // Reset all state variables to their initial values
        setImportedData([]);
        setError('');
        setSuccess('');
        setLoading(false);
        setIsUploading(false);
        setUploadProgress(0);
        setPendingFile(null);
        setSelectedBranch(null);
        setImportType(null);
        setPage(0);
        setRowsPerPage(10);
        setShowSimilarProducts(false);
        setSimilarProducts([]);
        setResolvingProduct(null);
        setUndoHistory([]);
        setSelectedProduct(null);
        setOpenEditDialog(false);
        setOpenViewDialog(false);
        setImportProgress({ show: false, current: 0, total: 0 });
        setEditFormData({ quantity: '', expiry: '' });
        setShowAddProduct(false);
        setIsGuidelinesOpen(false);

        // Show success notification
        handleNotification('All data has been reset successfully', 'success');
        console.log('[BulkImport] All states have been reset to initial values');
    };

    const handleRemoveProduct = (index: number) => {
        const updatedData = [...importedData];
        updatedData.splice(index, 1); // Remove the product at the specified index
        setImportedData(updatedData); // Update the state
        handleNotification('Product removed successfully', 'success'); // Optional notification
    };

    return (
        <Box sx={{ p: 2, ml: { xs: 1, md: 35 }, mt: 0 }}>
            <Paper 
                elevation={1}
                sx={{ 
                    p: 1, 
                    backgroundColor: '#ffffff',
                    borderRadius: 2,
                    mb: 1
                }}
            >
                {/* Steps Header */}
                <Grid 
                    container 
                    spacing={3} 
                    sx={{ 
                        mb: 3,
                        '& .MuiGrid-item': {
                            display: 'flex',
                            alignItems: 'stretch'
                        }
                    }}
                >
                    {/* Step items with consistent heights */}
                    <Grid item xs={3}>
                        <Box sx={{ 
                            flex: 1,
                            borderRight: 1, 
                            borderColor: 'divider',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Need Help?
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Import Guidelines
                </Typography>
            </Box>
                    </Grid>
                    <Grid item xs={3}>
                        <Box sx={{ 
                            flex: 1,
                            borderRight: 1, 
                            borderColor: 'divider',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Step 1
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Select Branch
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={3}>
                        <Box sx={{ 
                            flex: 1,
                            borderRight: 1, 
                            borderColor: 'divider',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Step 2
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Download Template
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={3}>
                        <Box sx={{ 
                            flex: 1,
                            borderRight: 1, 
                            borderColor: 'divider',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Step 3
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Upload File
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Action Buttons Section */}
                <Grid 
                    container 
                    spacing={3}
                    sx={{ 
                        '& .MuiGrid-item': {
                        display: 'flex', 
                        alignItems: 'center',
                            justifyContent: 'center'
                        }
                    }}
                >
                    <Grid item xs={3}>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 1,
                            width: '100%',
                            maxWidth: 250
                        }}>
                        <Button
                            variant="outlined"
                            startIcon={<HelpOutlineIcon />}
                            onClick={handleGuidelinesOpen}
                            sx={{
                                borderColor: '#1B3E2D',
                                color: '#1B3E2D',
                                animation: !hasSeenGuidelines ? 'pulse 2s infinite' : 'none',
                                '@keyframes pulse': pulseAnimation['@keyframes pulse'],
                                '&:hover': {
                                    borderColor: '#2D5741',
                                    backgroundColor: 'rgba(45, 87, 65, 0.04)',
                                },
                                width: '100%',
                                maxWidth: 250
                            }}
                        >
                            Import Guidelines
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={handleReset}
                            sx={{
                                borderColor: '#1B3E2D',
                                color: '#1B3E2D',
                                animation: !hasSeenGuidelines ? 'pulse 2s infinite' : 'none',
                                '@keyframes pulse': pulseAnimation['@keyframes pulse'],
                                '&:hover': {
                                    borderColor: '#2D5741',
                                    backgroundColor: 'rgba(45, 87, 65, 0.04)',
                                },
                                width: '100%',
                                maxWidth: 250
                            }}
                        >
                            Reset Page
                        </Button>
                        </Box>
                    </Grid>
                    <Grid item xs={3}>
                        <Button
                            variant="outlined"
                            startIcon={<StorefrontIcon />}
                            onClick={() => setStartDialogOpen(true)}
                            sx={{
                                borderColor: selectedBranch ? '#1B3E2D' : '#d32f2f',
                                color: selectedBranch ? '#1B3E2D' : '#d32f2f',
                                '&:hover': {
                                    borderColor: selectedBranch ? '#2D5741' : '#d32f2f',
                                    backgroundColor: selectedBranch ? 
                                        'rgba(45, 87, 65, 0.04)' : 
                                        'rgba(211, 47, 47, 0.04)',
                                },
                                width: '100%',
                                maxWidth: 250,
                                height: '85%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.5,
                                py: 1
                            }}
                        >
                            {selectedBranch ? 
                                `${branches.find(b => b.branch_id === selectedBranch)?.branch_name}` : 
                                'Select Branch'
                            }
                        </Button>
                    </Grid>
                    <Grid item xs={3}>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 1,
                            width: '100%',
                            maxWidth: 250
                        }}>
                            <Button
                                variant="contained"
                                startIcon={<FileDownloadIcon />}
                                onClick={() => {
                                    setImportType('all'); // Set import type for new & existing
                                    downloadNewAndExistingTemplate();
                                }}
                                disabled={!selectedBranch}
                                fullWidth
                            sx={{
                                backgroundColor: '#1B3E2D',
                                '&:hover': {
                                    backgroundColor: '#2D5741',
                                },
                            }}
                        >
                                Download New & Existing
                        </Button>
                        <Button
                            variant="contained"
                                startIcon={<FileDownloadIcon />}
                                onClick={() => {
                                    setImportType('existing'); // Set import type for existing only
                                    downloadExistingOnlyTemplate();
                                }}
                                disabled={!selectedBranch}
                                fullWidth
                            sx={{
                                backgroundColor: '#1B3E2D',
                                '&:hover': {
                                    backgroundColor: '#2D5741',
                                },
                            }}
                        >
                                Download Existing Only
                        </Button>
                    </Box>
                    </Grid>
                    <Grid item xs={3}>
                    <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5
    }}>
                    <Button
                        variant="contained"
                        startIcon={<CloudUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={!selectedBranch || !importType}
                        sx={{
                            backgroundColor: '#1B3E2D',
                            '&:hover': {
                                backgroundColor: '#2D5741',
                            },
                width: '100%',
                maxWidth: 250
            }}
        >
            Upload File
        </Button>

        {/* Import Type Indicator */}
        <Box sx={{ 
            width: '100%',
            maxWidth: 250,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            
            {importType ? (
                <Paper
                    elevation={0}
                    sx={{
                        width: '100%',
                        p: 1,
                        backgroundColor: importType === 'all' ? 'rgba(27, 62, 45, 0.08)' : 'rgba(45, 87, 65, 0.08)',
                        border: 1,
                        borderColor: importType === 'all' ? '#1B3E2D' : '#2D5741',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1
                    }}
                >
                    <ArticleIcon 
                        sx={{ 
                            fontSize: '1.1rem',
                            color: importType === 'all' ? '#1B3E2D' : '#2D5741'
                        }} 
                    />
                    <Typography 
                        variant="body2"
                        sx={{ 
                            color: importType === 'all' ? '#1B3E2D' : '#2D5741',
                            fontWeight: 500,
                            textAlign: 'center'
                        }}
                    >
                        {getImportTypeName(importType)}
                    </Typography>
                </Paper>
            ) : (
                <Paper
                    elevation={0}
                    sx={{
                        width: '100%',
                        p: 1,
                        backgroundColor: 'rgba(211, 47, 47, 0.08)',
                        border: 1,
                        borderColor: '#d32f2f',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1
                    }}
                >
                    <WarningIcon 
                        sx={{ 
                            fontSize: '1.1rem',
                            color: '#d32f2f'
                        }} 
                    />
                    <Typography 
                        variant="body2"
                        sx={{ 
                            color: '#d32f2f',
                            fontWeight: 500,
                            textAlign: 'center'
                        }}
                    >
                        Please download a template first
                    </Typography>
                </Paper>
            )}
        </Box>
                        <input
                            ref={fileInputRef}
                            type="file"
                            hidden
                            accept=".xlsx,.xls"
                            onChange={handleFileSelect}
                        />
    </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Alerts Section */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            {/* Main Content */}
            {importedData.length > 0 ? (
                <Box sx={{ mt: 4 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 2 
                    }}>
                        <Typography variant="h6" sx={{ color: '#1B3E2D' }}>
                            Step 4: Review and Import Products
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => setShowAddProduct(true)}
                                startIcon={<AddIcon />}
                            >
                                Add Product
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleImport}
                                disabled={loading || importedData.length === 0}
                        sx={{
                            backgroundColor: '#1B3E2D',
                            '&:hover': {
                                backgroundColor: '#2D5741',
                            },
                        }}
                    >
                                Import Products
                    </Button>
                </Box>
                    </Box>
                <Paper sx={{ width: '100%', overflow: 'hidden', mb: 2 }}>
                        <TableContainer sx={{ maxHeight: 'calc(90vh - 300px)' }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Barcode</TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="subtitle2">Product Name</Typography>
                                                <Typography variant="caption" color="textSecondary">Imported / Actual</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="subtitle2">Brand Name</Typography>
                                                <Typography variant="caption" color="textSecondary">Imported / Actual</Typography>
                                            </Box>
                                        </TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Current Stock</TableCell>
                                        <TableCell>Import</TableCell>
                                    <TableCell>Expiry</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {importedData
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((product, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>{getStatusIcon(product.status)}</TableCell>
                                            <TableCell>{product.barcode}</TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography 
                                                            variant="body2" 
                                                            sx={{ 
                                                                color: product.matchedProduct && 
                                                                       product.name !== product.matchedProduct.name ? 
                                                                       'warning.main' : 'inherit'
                                                            }}
                                                        >
                                                            {product.name}
                                                        </Typography>
                                                        {product.matchedProduct && product.name !== product.matchedProduct.name && (
                                                            <Typography 
                                                                variant="caption" 
                                                                color="primary"
                                                                sx={{ display: 'block', ml: 1 }}
                                                            >
                                                                → {product.matchedProduct.name}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography 
                                                            variant="body2"
                                                            sx={{ 
                                                                color: product.matchedProduct && 
                                                                       product.brand_name !== product.matchedProduct.brand_name ? 
                                                                       'warning.main' : 'inherit'
                                                            }}
                                                        >
                                                            {product.brand_name}
                                                        </Typography>
                                                        {product.matchedProduct && product.brand_name !== product.matchedProduct.brand_name && (
                                                            <Typography 
                                                                variant="caption" 
                                                                color="primary"
                                                                sx={{ display: 'block', ml: 1 }}
                                                            >
                                                                → {product.matchedProduct.brand_name}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            <TableCell>{product.matchedProduct?.category_name || product.category_name || ''}</TableCell>
                                            <TableCell>
                                                {product.matchedProduct ? 
                                                    getStockDisplay(
                                                        product.matchedProduct.current_stock || 0,
                                                        product.quantity
                                                    ) : '-'
                                                }
                                            </TableCell>
                                            <TableCell>{product.quantity}</TableCell>
                                            <TableCell>{product.expiry}</TableCell>
                                            <TableCell>
                                                    {product.status === 'matched' && undoHistory.some(h => h.product === product) && (
                                                        <Tooltip title="Undo match">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleUndo(product)}
                                                                color="warning"
                                                            >
                                                                <UndoIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                {product.status === 'invalid' || product.status === 'similar' ? (
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        color="warning"
                                                        onClick={() => handleSearchProduct(product)}
                                                    >
                                                        Resolve
                                                    </Button>
                                                    
                                                ) : (
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Tooltip title="View Details">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleViewProduct(product)}
                                                                color="info"
                                                            >
                                                                <VisibilityIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Edit Product">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEditProduct(product)}
                                                            color="primary"
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Remove">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleRemoveItem(index)}
                                                            color="error"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                        
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={importedData.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
                </Box>
            ) : (
                <Paper 
                    sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        backgroundColor: '#f8f9fa',
                        border: '2px dashed #dee2e6'
                    }}
                >
                    <CloudUploadIcon sx={{ fontSize: 60, color: '#6c757d', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        No File Uploaded
                        </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Follow the steps above to import products
                    </Typography>
                                            
                </Paper>
            )}

            {/* Edit Dialog */}
            <EditProductDialog />

            {/* Similar Products Dialog */}
            <SimilarProductsDialog />

            <Guidelines 
                open={isGuidelinesOpen} 
                onClose={() => setIsGuidelinesOpen(false)}
                categories={categories} // Pass the categories
            />

            <UploadProgress />
            <StartImportDialog />

            <Notification 
                notification={notificationState}
                setNotification={setNotificationState}
                onErrorClick={() => setShowErrorDialog(true)} // Optional error logs handler
            />

            <ErrorLogsDialog 
                open={showErrorDialog}
                onClose={() => setShowErrorDialog(false)}
                errorLogs={errorLogs}
                onCopyLogs={() => {
                    copyErrorLogs();
                    handleNotification('Error logs copied to clipboard', 'success');
                }}
            />

            <AddProductDialog />

            {/* Remove the bottom loading bar and keep only the top one */}
            {loading && (
                <LinearProgress
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 9999
                    }}
                />
            )}

            {/* Add Import Progress Dialog */}
            <ImportProgressDialog />

            {/* View Product Dialog */}
            <Dialog
                open={openViewDialog} 
                onClose={() => setOpenViewDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VisibilityIcon color="primary" />
                        <Typography variant="h6">Product Details</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedProduct && (
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Paper sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" color="primary" gutterBottom>Basic Information</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">Barcode</Typography>
                                            <Typography>{selectedProduct.barcode}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">Product Name</Typography>
                                            <Typography>{selectedProduct.name}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">Brand Name</Typography>
                                            <Typography>{selectedProduct.brand_name}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                                            <Typography>
                                                {selectedProduct.category_name || 'No category'}
                        </Typography>
                    </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={6}>
                                <Paper sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" color="primary" gutterBottom>Stock Information</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">Quantity</Typography>
                                            <Typography>{selectedProduct.quantity}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">Expiry Date</Typography>
                                            <Typography>{selectedProduct.expiry}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">Dosage</Typography>
                                            <Typography>{`${selectedProduct.dosage_amount} ${selectedProduct.dosage_unit}`}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">Prescription Required</Typography>
                                            <Typography>{selectedProduct.requiresPrescription ? 'Yes' : 'No'}</Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="subtitle1" color="primary" gutterBottom>Additional Information</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                                            <Typography>{selectedProduct.description || 'No description available'}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">Side Effects</Typography>
                                            <Typography>{selectedProduct.sideEffects || 'No side effects listed'}</Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Enhanced Edit Product Dialog */}
            <Dialog 
                open={openEditDialog} 
                onClose={() => setOpenEditDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EditIcon color="primary" />
                        <Typography variant="h6">Edit Product</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedProduct && (
                        <form>
                            <Grid container spacing={2}>
                                {/* Basic Information */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="primary" gutterBottom>Basic Information</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Product Name"
                                        value={selectedProduct.name}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Brand Name"
                                        value={selectedProduct.brand_name}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, brand_name: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            value={selectedProduct.category || ''}
                                            onChange={(e) => {
                                                const categoryId = Number(e.target.value);
                                                setSelectedProduct({ 
                                                    ...selectedProduct, 
                                                    category: categoryId,
                                                    category_name: categories.find(cat => cat.category_id === categoryId)?.name || ''
                                                });
                                            }}
                                            label="Category"
                                        >
                                            {categories.map((category) => (
                                                <MenuItem key={category.category_id} value={category.category_id}>
                                                    {category.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Stock Information */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 2 }}>Stock Information</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Quantity"
                                        type="number"
                                        value={selectedProduct.quantity}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, quantity: Number(e.target.value) })}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Expiry Date"
                                        type="date"
                                        value={selectedProduct.expiry}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, expiry: e.target.value })}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Dosage Amount"
                                        type="number"
                                        value={selectedProduct.dosage_amount}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, dosage_amount: Number(e.target.value) })}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Dosage Unit</InputLabel>
                                        <Select
                                            value={selectedProduct.dosage_unit || ''}
                                            onChange={(e) => setSelectedProduct({ ...selectedProduct, dosage_unit: e.target.value })}
                                            label="Dosage Unit"
                                        >
                                            {[
                                                'mg', 'mcg', 'g', 'kg', 'ml', 'l', 'tablet', 'capsule',
                                                'pill', 'patch', 'spray', 'drop', 'IU', 'mEq', 'mmol',
                                                'unit', 'puff', 'application', 'sachet', 'suppository',
                                                'ampoule', 'vial', 'syringe', 'piece'
                                            ].map((unit) => (
                                                <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={selectedProduct.requiresPrescription}
                                                onChange={(e) => setSelectedProduct({ 
                                                    ...selectedProduct, 
                                                    requiresPrescription: e.target.checked 
                                                })}
                                            />
                                        }
                                        label="Requires Prescription"
                                    />
                                </Grid>

                                {/* Additional Information */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 2 }}>Additional Information</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Description"
                                        multiline
                                        rows={3}
                                        value={selectedProduct.description}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Side Effects"
                                        multiline
                                        rows={3}
                                        value={selectedProduct.sideEffects}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, sideEffects: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </form>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button 
                        onClick={handleSaveEdit}
                        variant="contained"
                        sx={{
                            backgroundColor: '#1B3E2D',
                            '&:hover': {
                                backgroundColor: '#2D5741',
                            },
                        }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BulkInventoryImport;
