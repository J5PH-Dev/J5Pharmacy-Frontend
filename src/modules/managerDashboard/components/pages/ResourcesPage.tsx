import React, { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SupplierManagement from './ResourcesSubPages/SupplierManagement';
import BulkInventoryImport from './ResourcesSubPages/BulkInventoryImport';
import PriceManagement from './ResourcesSubPages/PriceManagement';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`resource-tabpanel-${index}`}
            aria-labelledby={`resource-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const ResourcesPage = () => {
    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    return (
        <Box sx={{ p: 0, ml: { xs: 1, md: 38 }, mt: 1 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                    value={selectedTab} 
                    onChange={handleTabChange}
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 1,
                        },
                        '& .Mui-selected': {
                            color: '#1B3E2D !important',
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#1B3E2D',
                        },
                    }}
                >
                    <Tab 
                        icon={<LocalShippingIcon />} 
                        label="Supplier Management" 
                    />
                    <Tab 
                        icon={<CloudUploadIcon />} 
                        label="Bulk Inventory Import" 
                    />
                    <Tab 
                        icon={<MonetizationOnIcon />} 
                        label="Price Management" 
                    />
                </Tabs>
            </Box>

            <TabPanel value={selectedTab} index={0}>
                <SupplierManagement />
            </TabPanel>
            <TabPanel value={selectedTab} index={1}>
                <BulkInventoryImport />
            </TabPanel>
            <TabPanel value={selectedTab} index={2}>
                <PriceManagement />
            </TabPanel>
        </Box>
    );
};

export default ResourcesPage;
