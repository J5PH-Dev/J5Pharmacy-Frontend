import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Paper, Tab, Tabs, TextField, MenuItem, Button, IconButton } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie } from 'recharts';
import { io } from "socket.io-client";
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import InventoryIcon from '@mui/icons-material/Inventory';

// Initialize socket connection
const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');

interface Transaction {
    invoice_number: string;
    branch_id: number;
    created_at: string;
    total_amount: number;
    branch_name: string;
    payment_method: 'cash' | 'card' | 'gcash' | 'maya';
    payment_status: 'paid' | 'pending' | 'cancelled' | 'refunded';
    discount_type: 'None' | 'Senior' | 'PWD' | 'Employee' | 'Points';
    discount_amount: number;
}

interface SalesDataPoint {
    date: string;
    total_sales: number;
    total_discounts: number;
    return_amount: number;
}

interface MetricsData {
    total_transactions: number;
    total_sales: number;
    average_transaction_value: number;
    total_discounts: number;
    total_returns: number;
    total_return_amount: number;
    unique_customers: number;
    paid_transactions: number;
}

interface ExpandedSections {
    salesOverview: boolean;
    latestTransactions: boolean;
    quickStats: boolean;
}

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
            id={`dashboard-tabpanel-${index}`}
            aria-labelledby={`dashboard-tab-${index}`}
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

const ReportDashboard: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [timeFilter, setTimeFilter] = useState('hour');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [dateRange, setDateRange] = useState(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        return {
            start: today.toISOString().split('.')[0],
            end: endOfDay.toISOString().split('.')[0]
        };
    });
    const [isExpanded, setIsExpanded] = useState({
        salesOverview: false,
        latestTransactions: false,
        quickStats: false
    });
    const [branches, setBranches] = useState<Array<{branch_id: number, branch_name: string}>>([]);

    // Socket connection for real-time updates
    useEffect(() => {
        // Initial fetch
        fetchTransactionSummary();
        fetchLatestTransactions();
        fetchMetrics();
        fetchBranches();

        // Set up socket listeners
        socket.on('transaction_update', (newTransaction: Transaction) => {
            setTransactions(prev => [newTransaction, ...prev.slice(0, 9)]);
            // Trigger refetch of summary and metrics
            fetchTransactionSummary();
            fetchMetrics();
        });

        // Set up periodic refresh
        const refreshInterval = setInterval(() => {
            fetchTransactionSummary();
            fetchLatestTransactions();
            fetchMetrics();
        }, 30000); // Refresh every 30 seconds

        return () => {
            socket.off('transaction_update');
            clearInterval(refreshInterval);
        };
    }, []); // Empty dependency array for initial setup

    // Fetch data when filters change
    useEffect(() => {
        fetchTransactionSummary();
        fetchLatestTransactions();
        fetchMetrics();
    }, [timeFilter, selectedBranch, dateRange]);

    // Update date range when time filter changes
    useEffect(() => {
        const now = new Date();
        let start = new Date();
        let end = new Date();

        switch(timeFilter) {
            case 'hour':
                start = new Date(now.setHours(0, 0, 0, 0));
                end = new Date(now.setHours(23, 59, 59, 999));
                break;
            case 'day':
                start = new Date(now.setDate(now.getDate() - 30));
                break;
            case 'week':
                start = new Date(now.setDate(now.getDate() - 84)); // 12 weeks
                break;
            case 'month':
                start = new Date(now.setMonth(now.getMonth() - 12));
                break;
            case 'year':
                start = new Date(now.setFullYear(now.getFullYear() - 5));
                break;
        }

        setDateRange({
            start: start.toISOString().split('.')[0],
            end: end.toISOString().split('.')[0]
        });
    }, [timeFilter]);

    const fetchTransactionSummary = async () => {
        try {
            const response = await axios.get('/api/transactions/summary', {
                params: {
                    timeFilter,
                    branchId: selectedBranch,
                    startDate: dateRange.start,
                    endDate: dateRange.end
                }
            });
            setSalesData(response.data);
        } catch (error) {
            console.error('Error fetching transaction summary:', error);
        }
    };

    const fetchLatestTransactions = async () => {
        try {
            const response = await axios.get('/api/transactions/latest', {
                params: {
                    branchId: selectedBranch,
                    limit: 10
                }
            });
            setTransactions(response.data);
        } catch (error) {
            console.error('Error fetching latest transactions:', error);
        }
    };

    const fetchMetrics = async () => {
        try {
            const response = await axios.get('/api/transactions/metrics', {
                params: {
                    branchId: selectedBranch,
                    startDate: dateRange.start,
                    endDate: dateRange.end
                }
            });
            setMetrics(response.data);
        } catch (error) {
            console.error('Error fetching metrics:', error);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const toggleSection = (section: 'salesOverview' | 'latestTransactions' | 'quickStats') => {
        setIsExpanded(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Add branch fetching
    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const response = await axios.get('/api/branches');
            setBranches(response.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            {/* Filters Panel */}
            <Paper sx={{ mb: 2, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Time Filter"
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            helperText="Select time period for data grouping"
                        >
                            <MenuItem value="hour">Last 24 Hours</MenuItem>
                            <MenuItem value="day">Last 30 Days</MenuItem>
                            <MenuItem value="week">Last 12 Weeks</MenuItem>
                            <MenuItem value="month">Last 12 Months</MenuItem>
                            <MenuItem value="year">Last 5 Years</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Branch"
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            helperText="Filter by specific branch"
                        >
                            <MenuItem value="">All Branches</MenuItem>
                            {branches.map(branch => (
                                <MenuItem key={branch.branch_id} value={branch.branch_id}>
                                    {branch.branch_name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            type="date"
                            fullWidth
                            label="Start Date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            helperText="Select start date"
                            inputProps={{
                                max: dateRange.end
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            type="date"
                            fullWidth
                            label="End Date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            helperText="Select end date"
                            inputProps={{
                                min: dateRange.start,
                                max: new Date().toISOString().split('T')[0]
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Tabs Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
                    <Tab icon={<TrendingUpIcon />} label="Main Overview" />
                    {/* <Tab icon={<PeopleIcon />} label="Financial Analytics" />
                    <Tab icon={<InventoryIcon />} label="Product Performance" />
                    <Tab icon={<PeopleIcon />} label="Customer Insights" />
                    <Tab icon={<StorefrontIcon />} label="Branch Performance" /> */}
                </Tabs>
            </Box>

            {/* Main Overview Tab */}
            <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2}>
                    {/* Sales Overview Chart */}
                    <Grid item xs={12} md={8}>
                        <Paper 
                            sx={{ 
                                p: 2, 
                                height: isExpanded.salesOverview ? '80vh' : 400,
                                transition: 'height 0.3s ease-in-out'
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Sales Overview</Typography>
                                <IconButton onClick={() => toggleSection('salesOverview')}>
                                    {isExpanded.salesOverview ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                            </Box>
                            <ResponsiveContainer>
                                <LineChart 
                                    data={[...salesData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
                                    margin={{ top: 25, right: 30, left: 20, bottom: 25 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return timeFilter === 'hour' 
                                                ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : date.toLocaleDateString();
                                        }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis 
                                        tickFormatter={(value) => `₱${value.toLocaleString()}`}
                                        domain={['auto', 'auto']}
                                    />
                                    <Tooltip 
                                        formatter={(value: any, name: string) => {
                                            if (value === null || value === undefined) return ['₱0.00', name];
                                            const numValue = Number(value);
                                            return isNaN(numValue) ? ['₱0.00', name] : [`₱${numValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, name];
                                        }}
                                        labelFormatter={(label: string) => {
                                            const date = new Date(label);
                                            return timeFilter === 'hour'
                                                ? date.toLocaleString([], { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })
                                                : date.toLocaleDateString();
                                        }}
                                    />
                                    <Legend wrapperStyle={{ position: 'relative', marginTop: '10px' }}/>
                                    <Line type="monotone" dataKey="total_sales" stroke="#4CAF50" name="Sales" strokeWidth={2} />
                                    <Line type="monotone" dataKey="total_discounts" stroke="#2196F3" name="Discounts" strokeWidth={2} />
                                    <Line type="monotone" dataKey="return_amount" stroke="#F44336" name="Returns" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Latest Transactions */}
                    <Grid item xs={12} md={4}>
                        <Paper 
                            sx={{ 
                                p: 2, 
                                height: isExpanded.latestTransactions ? '80vh' : 400,
                                transition: 'height 0.3s ease-in-out',
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Latest Transactions</Typography>
                                <IconButton onClick={() => toggleSection('latestTransactions')}>
                                    {isExpanded.latestTransactions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                            </Box>
                            <Box sx={{ height: 'calc(100% - 48px)', overflow: 'auto' }}>
                                <AnimatePresence>
                                    {transactions.map((transaction, index) => (
                                        <motion.div
                                            key={transaction.invoice_number}
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 20 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <Box sx={{ p: 1, borderBottom: '1px solid #eee' }}>
                                                <Typography variant="subtitle2">
                                                    {transaction.invoice_number}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(transaction.created_at).toLocaleString()}
                                                </Typography>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="body2">
                                                        ₱{(transaction?.total_amount ? Number(transaction.total_amount) : 0).toFixed(2)}
                                                    </Typography>
                                                    <Typography 
                                                        variant="caption" 
                                                        sx={{ 
                                                            color: 'white',
                                                            bgcolor: transaction.payment_status === 'paid' ? 'success.main' : 
                                                                    transaction.payment_status === 'pending' ? 'warning.main' : 
                                                                    'error.main',
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: 1
                                                        }}
                                                    >
                                                        {transaction.payment_status.toUpperCase()}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {transaction.branch_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {transaction.payment_method.toUpperCase()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Quick Stats */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Quick Stats</Typography>
                                <IconButton onClick={() => toggleSection('quickStats')}>
                                    {isExpanded.quickStats ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                            </Box>
                            <Grid container spacing={3}>
                                {metrics && (
                                    <>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Typography variant="subtitle2">Total Transactions</Typography>
                                            <Typography variant="h4">{metrics?.total_transactions || 0}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Typography variant="subtitle2">Total Sales</Typography>
                                            <Typography variant="h4">₱{(metrics?.total_sales ? Number(metrics.total_sales) : 0).toFixed(2)}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Typography variant="subtitle2">Average Transaction</Typography>
                                            <Typography variant="h4">₱{(metrics?.average_transaction_value ? Number(metrics.average_transaction_value) : 0).toFixed(2)}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Typography variant="subtitle2">Unique Customers</Typography>
                                            <Typography variant="h4">{metrics?.unique_customers || 0}</Typography>
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Financial Analytics Tab */}
            <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                    {/* Detailed Sales Metrics */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Detailed Sales Metrics</Typography>
                            {/* Add detailed sales metrics content */}
                        </Paper>
                    </Grid>

                    {/* Payment Analytics */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Payment Analytics</Typography>
                            {/* Add payment analytics content */}
                        </Paper>
                    </Grid>

                    {/* Returns and Discounts */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Returns and Discounts</Typography>
                            {/* Add returns and discounts content */}
                        </Paper>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Product Performance Tab */}
            <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                    {/* Top Sellers */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Top Sellers</Typography>
                            {/* Add top sellers content */}
                        </Paper>
                    </Grid>

                    {/* Category Performance */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Category Performance</Typography>
                            {/* Add category performance content */}
                        </Paper>
                    </Grid>

                    {/* Stock Alerts */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Stock Alerts</Typography>
                            {/* Add stock alerts content */}
                        </Paper>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Customer Insights Tab */}
            <TabPanel value={tabValue} index={3}>
                <Grid container spacing={3}>
                    {/* Customer Metrics */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Customer Metrics</Typography>
                            {/* Add customer metrics content */}
                        </Paper>
                    </Grid>

                    {/* Star Points Analytics */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Star Points Analytics</Typography>
                            {/* Add star points analytics content */}
                        </Paper>
                    </Grid>

                    {/* Peak Hours */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Peak Hours</Typography>
                            {/* Add peak hours content */}
                        </Paper>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Branch Performance Tab */}
            <TabPanel value={tabValue} index={4}>
                <Grid container spacing={3}>
                    {/* Branch Comparison */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Branch Comparison</Typography>
                            {/* Add branch comparison content */}
                        </Paper>
                    </Grid>

                    {/* Staff Performance */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Staff Performance</Typography>
                            {/* Add staff performance content */}
                        </Paper>
                    </Grid>

                    {/* Branch-specific Trends */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Branch-specific Trends</Typography>
                            {/* Add branch-specific trends content */}
                        </Paper>
                    </Grid>
                </Grid>
            </TabPanel>
        </Box>
    );
};

export default ReportDashboard; 