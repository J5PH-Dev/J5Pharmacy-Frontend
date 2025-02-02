import React, { useState } from 'react';
import { Box, Tab, Tabs, Typography, Grid, Paper, Button } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SupplierManagement from './ResourcesSubPages/SupplierManagement';
import BulkInventoryImport from './ResourcesSubPages/BulkInventoryImport';
import PriceManagement from './ResourcesSubPages/PriceManagement';
import { BulkImportProvider } from '../../contexts/BulkImportContext';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';

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
    const navigate = useNavigate();

    // Define the content for each card (icon, title, route, button text, etc.)
    const contentData = [
        {
            icon: <PeopleIcon sx={{ fontSize: 40, color: '#01A768' }} />,
            title: 'Supplier Management',
            description: 'Manage Supplier Information',
            route: '/admin/resources/supplier-management',
            buttonText: 'View Supplier Management',
        },
        {
            icon: <LocalShippingIcon sx={{ fontSize: 40, color: '#F7931A' }} />,
            title: 'Bulk Inventory Import',
            description: 'Import Products in Bulk',
            route: '/admin/resources/bulk-inventory-import',
            buttonText: 'View Bulk Import',
        },
        // {
        //     icon: <MonetizationOnIcon sx={{ fontSize: 40, color: '#03A9F5' }} />,
        //     title: 'Price Management',
        //     description: 'Manage Pricing Details',
        //     route: '/admin/resources/price-management',
        //     buttonText: 'View Price Management',
        // },
    ];

    return (
        <Box sx={{ p: 0, ml: { xs: 1, md: 35 }, mt: 4 }}>
            {/* Page Title */}
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                Resource Management
            </Typography>
            <p className='mt-[-13px] text-gray-700 mb-5 text-center'>
                Manage resources, imports, and pricing in one place.
            </p>

            {/* Cards Section */}
            <Grid container spacing={2} sx={{ justifyContent: 'center', mb: 5 }}>
                {contentData.map((item, index) => (
                    <Grid key={index} item xs={12} sm={6} md={2.75}>
                        <Paper
                            sx={(theme) => ({
                                height: 220,
                                width: '100%',
                                maxWidth: 320,
                                margin: '0 auto',
                                backgroundColor: '#fff',
                                border: `1px solid ${item.icon.props.sx.color || '#ccc'}`,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: theme.spacing(0),
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.01)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                },
                            })}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flex: 1,
                                    paddingTop: '20px',
                                }}
                            >
                                {item.icon}
                                <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', mt: 1 }}>
                                    {item.title}
                                </Typography>
                                <Typography variant="body2" sx={{ textAlign: 'center', color: '#666', mt: 1 }}>
                                    {item.description}
                                </Typography>
                            </div>

                            <Button
                                sx={{
                                    backgroundColor: item.icon.props.sx.color || '#1B3E2D',
                                    color: '#fff',
                                    width: '100%',
                                    textTransform: 'none',
                                    borderRadius: 1,
                                    marginTop: 'auto',
                                    '&:hover': {
                                        backgroundColor: `${item.icon.props.sx.color || '#1B3E2D'}99`,
                                    },
                                }}
                                onClick={() => navigate(item.route)}
                            >
                                {item.buttonText}
                            </Button>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ResourcesPage;
