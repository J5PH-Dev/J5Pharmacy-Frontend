import React, { useState } from 'react';
import { Box, Container, Typography, Tabs, Tab, Paper } from '@mui/material';
import ReportDashboard from './reportSubPages/ReportDashboard';
import ViewAllTransaction from './reportSubPages/ViewAllTransaction';

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
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
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

const ReportsPage = () => {
    const [currentTab, setCurrentTab] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    return (
        <Box sx={{ p: 0, ml: { xs: 1, md: 38 }, mt: 1 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={currentTab} onChange={handleTabChange}>
                    <Tab label="Dashboard" />
                    <Tab label="All Transactions" />
                </Tabs>
            </Box>

            <TabPanel value={currentTab} index={0}>
                <ReportDashboard />
            </TabPanel>

            <TabPanel value={currentTab} index={1}>
                <ViewAllTransaction />
            </TabPanel>
        </Box>
    );
};

export default ReportsPage;
