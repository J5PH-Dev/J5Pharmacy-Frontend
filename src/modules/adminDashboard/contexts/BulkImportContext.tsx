import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';

interface ImportedProduct {
    barcode: string;
    name: string;
    brand_name: string;
    quantity: number;
    expiry: string;
    category?: number;
    category_name?: string;
    dosage_amount?: number;
    dosage_unit?: string;
    requiresPrescription?: boolean;
    how_to_use?: string;
    side_effects?: string;
    status: 'pending' | 'matched' | 'similar' | 'new' | 'invalid';
    matchedProduct?: any;
    similarProducts?: any[];
    errors?: string[];
    action?: 'create' | 'update';
    importedData?: {
        name: string;
        brand_name: string;
    };
    batch_number?: string;
    supplier_id?: number;
    received_date?: string;
    batch_notes?: string;
}

interface BulkImportContextType {
    importedData: ImportedProduct[];
    setImportedData: React.Dispatch<React.SetStateAction<ImportedProduct[]>>;
    clearImportedData: () => void;
    selectedBranch: number | null;
    setSelectedBranch: React.Dispatch<React.SetStateAction<number | null>>;
    importType: 'existing' | 'all' | null;
    setImportType: React.Dispatch<React.SetStateAction<'existing' | 'all' | null>>;
    validateProduct: (product: ImportedProduct) => Promise<ImportedProduct>;
    batchInfo: {
        batch_number: string;
        supplier_id: number | null;
        received_date: string;
        notes: string;
    };
    setBatchInfo: React.Dispatch<React.SetStateAction<{
        batch_number: string;
        supplier_id: number | null;
        received_date: string;
        notes: string;
    }>>;
}

const BulkImportContext = createContext<BulkImportContextType | undefined>(undefined);

export const BulkImportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [importedData, setImportedData] = useState<ImportedProduct[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [importType, setImportType] = useState<'existing' | 'all' | null>(null);
    const { isAuthenticated } = useAuth();
    
    const [batchInfo, setBatchInfo] = useState({
        batch_number: '',
        supplier_id: null as number | null,
        received_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    useEffect(() => {
        if (!isAuthenticated) {
            setImportedData([]);
            setSelectedBranch(null);
            setImportType(null);
            setBatchInfo({
                batch_number: '',
                supplier_id: null,
                received_date: new Date().toISOString().split('T')[0],
                notes: ''
            });
        }
    }, [isAuthenticated]);

    const clearImportedData = () => {
        setImportedData([]);
        setSelectedBranch(null);
        setImportType(null);
        setBatchInfo({
            batch_number: '',
            supplier_id: null,
            received_date: new Date().toISOString().split('T')[0],
            notes: ''
        });
    };

    const validateProduct = async (product: ImportedProduct): Promise<ImportedProduct> => {
        try {
            // First try to match by barcode
            const barcodeResponse = await fetch(`/api/resources/products/search?type=barcode&query=${product.barcode}`);
            const barcodeResults = await barcodeResponse.json();

            if (barcodeResults.length > 0) {
                // If barcode matches, use the existing product data
                const matchedProduct = barcodeResults[0];
                return {
                    ...product,
                    name: matchedProduct.name,
                    brand_name: matchedProduct.brand_name,
                    category: matchedProduct.category,
                    category_name: matchedProduct.category_name,
                    dosage_amount: matchedProduct.dosage_amount,
                    dosage_unit: matchedProduct.dosage_unit,
                    requiresPrescription: matchedProduct.requiresPrescription,
                    status: 'matched',
                    matchedProduct,
                    importedData: {
                        name: product.name,
                        brand_name: product.brand_name
                    }
                };
            }

            // If no barcode match, search by name and brand
            const nameResponse = await fetch(`/api/resources/products/search?type=name&query=${encodeURIComponent(product.name)}`);
            const nameResults = await nameResponse.json();

            if (nameResults.length > 0) {
                // Found similar products
                return {
                    ...product,
                    status: 'similar',
                    similarProducts: nameResults
                };
            }

            // No matches found
            return {
                ...product,
                status: importType === 'existing' ? 'invalid' : 'new'
            };

        } catch (error) {
            console.error('Error validating product:', error);
            return {
                ...product,
                status: 'invalid',
                errors: ['Error validating product']
            };
        }
    };

    return (
        <BulkImportContext.Provider 
            value={{ 
                importedData, 
                setImportedData, 
                clearImportedData,
                selectedBranch,
                setSelectedBranch,
                importType,
                setImportType,
                validateProduct,
                batchInfo,
                setBatchInfo
            }}
        >
            {children}
        </BulkImportContext.Provider>
    );
};

export const useBulkImport = () => {
    const context = useContext(BulkImportContext);
    if (context === undefined) {
        throw new Error('useBulkImport must be used within a BulkImportProvider');
    }
    return context;
}; 