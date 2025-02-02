import React, { useState } from 'react';
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
    Tooltip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';
import * as XLSX from 'xlsx';

interface ValidationError {
    row: number;
    column: string;
    message: string;
}

interface ImportedProduct {
    barcode: string;
    name: string;
    brand_name: string;
    category: string;
    description: string;
    supplier_id: number;
    supplier_price: number;
    ceiling_price: number;
    markup_percentage: number;
    status: 'pending' | 'valid' | 'invalid';
    errors?: string[];
}

const BulkInventoryImport: React.FC = () => {
    const [importedData, setImportedData] = useState<ImportedProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const downloadTemplate = () => {
        const template = [
            {
                barcode: 'Example: 1234567890',
                name: 'Example: Product Name',
                brand_name: 'Example: Brand Name',
                category: 'Example: Category',
                description: 'Example: Product Description',
                supplier_id: 'Example: 1',
                supplier_price: 'Example: 100.00',
                ceiling_price: 'Example: 150.00',
                markup_percentage: 'Example: 30'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'bulk_import_template.xlsx');
    };

    const validateData = (data: any[]): ImportedProduct[] => {
        return data.map(row => {
            const errors: string[] = [];
            const product: ImportedProduct = {
                barcode: row.barcode?.toString() || '',
                name: row.name?.toString() || '',
                brand_name: row.brand_name?.toString() || '',
                category: row.category?.toString() || '',
                description: row.description?.toString() || '',
                supplier_id: Number(row.supplier_id) || 0,
                supplier_price: Number(row.supplier_price) || 0,
                ceiling_price: Number(row.ceiling_price) || 0,
                markup_percentage: Number(row.markup_percentage) || 0,
                status: 'pending'
            };

            // Validation rules
            if (!product.barcode) errors.push('Barcode is required');
            if (!product.name) errors.push('Product name is required');
            if (!product.supplier_id) errors.push('Supplier ID is required');
            if (product.supplier_price <= 0) errors.push('Supplier price must be greater than 0');
            if (product.ceiling_price <= 0) errors.push('Ceiling price must be greater than 0');
            if (product.markup_percentage < 0) errors.push('Markup percentage cannot be negative');
            if (product.ceiling_price <= product.supplier_price) {
                errors.push('Ceiling price must be greater than supplier price');
            }

            product.status = errors.length === 0 ? 'valid' : 'invalid';
            product.errors = errors;

            return product;
        });
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError('');
        setSuccess('');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                
                const validatedData = validateData(jsonData);
                setImportedData(validatedData);
                
                const invalidCount = validatedData.filter(item => item.status === 'invalid').length;
                if (invalidCount > 0) {
                    setError(`Found ${invalidCount} invalid entries. Please correct them before proceeding.`);
                }
            } catch (err) {
                setError('Failed to parse Excel file. Please make sure it follows the template format.');
                console.error('Error parsing Excel file:', err);
            } finally {
                setLoading(false);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleImport = async () => {
        const validProducts = importedData.filter(product => product.status === 'valid');
        if (validProducts.length === 0) {
            setError('No valid products to import');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/resources/bulk-import/process', { products: validProducts });
            setSuccess(`Successfully imported ${validProducts.length} products`);
            setImportedData([]);
            setError('');
        } catch (err) {
            setError('Failed to import products');
            console.error('Error importing products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = (index: number) => {
        setImportedData(prev => prev.filter((_, i) => i !== index));
        if (importedData.length === 1) {
            setError('');
            setSuccess('');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" component="h2">
                    Bulk Inventory Import
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={downloadTemplate}
                        sx={{ mr: 2 }}
                    >
                        Download Template
                    </Button>
                    <Button
                        variant="contained"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        sx={{
                            backgroundColor: '#1B3E2D',
                            '&:hover': {
                                backgroundColor: '#2D5741',
                            },
                        }}
                    >
                        Upload Excel File
                        <input
                            type="file"
                            hidden
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                        />
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {importedData.length > 0 && (
                <>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Barcode</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Brand</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Supplier ID</TableCell>
                                    <TableCell>Supplier Price</TableCell>
                                    <TableCell>Ceiling Price</TableCell>
                                    <TableCell>Markup %</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {importedData.map((product, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Tooltip title={product.errors?.join('\n') || 'Valid'}>
                                                {product.status === 'valid' ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <ErrorIcon color="error" />
                                                )}
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>{product.barcode}</TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.brand_name}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>{product.supplier_id}</TableCell>
                                        <TableCell>{product.supplier_price}</TableCell>
                                        <TableCell>{product.ceiling_price}</TableCell>
                                        <TableCell>{product.markup_percentage}%</TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemoveItem(index)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={handleImport}
                            disabled={loading || importedData.every(product => product.status === 'invalid')}
                            sx={{
                                backgroundColor: '#1B3E2D',
                                '&:hover': {
                                    backgroundColor: '#2D5741',
                                },
                            }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Import Products'}
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default BulkInventoryImport;
