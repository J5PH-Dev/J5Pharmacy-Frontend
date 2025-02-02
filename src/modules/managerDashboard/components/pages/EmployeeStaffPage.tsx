import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Button, FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material';
// import UserManagement from './staffSubPages/UserManagement';
import PharmacistManagement from './staffSubPages/PharmacistManagement';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ExportDialog from '../common/ExportDialog';
import axios from 'axios';
import { useAuth } from '../../../auth/contexts/AuthContext';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

interface ExportData {
    users: any[];
    pharmacists: any[];
}

interface Branch {
    branch_id: number;
    branch_name: string;
}

interface FilterProps {
    selectedRole: string;
    selectedBranch: string;
    onRoleChange: (role: string) => void;
    onBranchChange: (branchId: string) => void;
    branches: Branch[];
}

const FilterSection: React.FC<FilterProps> = ({ selectedRole, selectedBranch, onRoleChange, onBranchChange, branches }) => (
    <Stack direction="row" spacing={2}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Role</InputLabel>
            <Select
                value={selectedRole}
                label="Role"
                onChange={(e) => onRoleChange(e.target.value)}
            >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="MANAGER">Manager</MenuItem>
            </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Branch</InputLabel>
            <Select
                value={selectedBranch}
                label="Branch"
                onChange={(e) => onBranchChange(e.target.value)}
            >
                <MenuItem value="">All Branches</MenuItem>
                {branches.map((branch) => (
                    <MenuItem key={branch.branch_id} value={branch.branch_id}>
                        {branch.branch_name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    </Stack>
);

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
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const { user } = useAuth(); // Ensure that this is getting the user context

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const response = await axios.get('/api/staff/branches');
            setBranches(response.data.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        // Reset filters when changing tabs
        setSelectedRole('');
        setSelectedBranch('');
    };

    const fetchExportData = async () => {
        try {
            let usersUrl = '/api/staff/users';
            let pharmacistsUrl = '/api/staff/pharmacists';
    
            if (user?.branchId) {
                usersUrl += `?branch_id=${user.branchId}`;
                pharmacistsUrl += `?branch_id=${user.branchId}`;
            }
    
            console.log('Fetching export data from:', usersUrl, pharmacistsUrl);
    
            const [usersResponse, pharmacistsResponse] = await Promise.all([
                axios.get(usersUrl),
                axios.get(pharmacistsUrl),
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
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {/* {tabValue === 0 ? (
                        <FilterSection
                            selectedRole={selectedRole}
                            selectedBranch={selectedBranch}
                            onRoleChange={setSelectedRole}
                            onBranchChange={setSelectedBranch}
                            branches={branches}
                        />
                    ) : ( */}
                    {/* )} */}
                    <Button
                        variant="contained"
                        startIcon={<FileDownloadIcon />}
                        onClick={fetchExportData}
                        sx={{ backgroundColor: '#01A768', '&:hover': { backgroundColor: '#017F4A' } }}
                    >
                        Export Data
                    </Button>
                </Box>
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
                    {/* <Tab label="User Management" {...a11yProps(0)} /> */}
                    <Tab label="Pharmacist Management" {...a11yProps(0)} />
                </Tabs>
            </Box>

            {/* <TabPanel value={tabValue} index={0}>
                <UserManagement selectedRole={selectedRole} selectedBranch={selectedBranch} />
            </TabPanel> */}
            <TabPanel value={tabValue} index={0}>
                <PharmacistManagement selectedBranch={selectedBranch} />
            </TabPanel>

            {/* Export Dialog */}
            <ExportDialog
                open={openExport}
                onClose={() => setOpenExport(false)}
                data={exportData.pharmacists}
                columns={pharmacistColumns}
                filename="pharmacists_data"
            />
        </Box>
    );
};

export default EmployeeStaffPage;