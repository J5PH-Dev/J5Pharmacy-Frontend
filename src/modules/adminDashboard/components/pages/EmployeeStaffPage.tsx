import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Button } from '@mui/material';
import UserManagement from './staffSubPages/UserManagement';
import PharmacistManagement from './staffSubPages/PharmacistManagement';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ExportDialog from '../common/ExportDialog';
import axios from 'axios';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

interface ExportData {
    users: any[];
    pharmacists: any[];
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`staff-tabpanel-${index}`}
            aria-labelledby={`staff-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `staff-tab-${index}`,
        'aria-controls': `staff-tabpanel-${index}`,
    };
}

const EmployeeStaffPage: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [openExport, setOpenExport] = useState(false);
    const [exportData, setExportData] = useState<ExportData>({ users: [], pharmacists: [] });

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const fetchExportData = async () => {
        try {
            const [usersResponse, pharmacistsResponse] = await Promise.all([
                axios.get('/api/staff/users'),
                axios.get('/api/staff/pharmacists')
            ]);

            setExportData({
                users: usersResponse.data.data,
                pharmacists: pharmacistsResponse.data.data
            });
            setOpenExport(true);
        } catch (error) {
            console.error('Error fetching export data:', error);
        }
    };

    const userColumns = [
        { field: 'employee_id', header: 'Employee ID' },
        { field: 'name', header: 'Name' },
        { field: 'role', header: 'Role' },
        { field: 'email', header: 'Email' },
        { field: 'phone', header: 'Phone' },
        { field: 'branch_name', header: 'Branch' },
        { field: 'hired_at', header: 'Hired Date' }
    ];

    const pharmacistColumns = [
        { field: 'staff_id', header: 'Staff ID' },
        { field: 'name', header: 'Name' },
        { field: 'email', header: 'Email' },
        { field: 'phone', header: 'Phone' },
        { field: 'branch_name', header: 'Branch' },
        { field: 'pin_code', header: 'PIN Code' }
    ];

  return (
    <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Staff & Employees
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<FileDownloadIcon />}
                    onClick={fetchExportData}
                    sx={{ backgroundColor: '#01A768', '&:hover': { backgroundColor: '#017F4A' } }}
                >
                    Export Data
                </Button>
                </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="staff management tabs"
              sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 'medium',
                        },
                        '& .Mui-selected': {
                            color: '#01A768',
                        },
                        '& .MuiTabs-indicator': {
                backgroundColor: '#01A768',
                },
              }}
            >
                    <Tab label="User Management" {...a11yProps(0)} />
                    <Tab label="Pharmacist Management" {...a11yProps(1)} />
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                <UserManagement />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <PharmacistManagement />
            </TabPanel>

            {/* Export Dialog */}
            <ExportDialog
                open={openExport}
                onClose={() => setOpenExport(false)}
                data={tabValue === 0 ? exportData.users : exportData.pharmacists}
                columns={tabValue === 0 ? userColumns : pharmacistColumns}
                filename={tabValue === 0 ? 'users_data' : 'pharmacists_data'}
            />
    </Box>
  );
};

export default EmployeeStaffPage;
