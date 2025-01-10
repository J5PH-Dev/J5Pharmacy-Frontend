import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Paper, Tab, Tabs, TextField, MenuItem, Button } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { io } from "socket.io-client";
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Initialize socket connection
const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');

interface Transaction {
    invoice_number: string;
    branch_id: number;
    created_at: string;
    total_amount: number;
    branch_name: string;
}

interface MetricsData {
    total_transactions: number;
    total_sales: number;
    average_transaction_value: number;
    total_discounts: number;
    total_returns: number;
    total_return_amount: number;
    unique_customers: number;
}

const ReportDashboard: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [salesData, setSalesData] = useState([]);
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [timeFilter, setTimeFilter] = useState('day');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [currentTab, setCurrentTab] = useState(0);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    // Fetch initial data
    useEffect(() => {
        fetchTransactionSummary();
        fetchLatestTransactions();
        fetchMetrics();
    }, [timeFilter, selectedBranch, dateRange]);

    // Socket connection for real-time updates
    useEffect(() => {
        socket.on('transaction_update', (newTransaction: Transaction) => {
            setTransactions(prev => {
                const updated = [newTransaction, ...prev.slice(0, 9)];
                return updated;
            });
        });

        return () => {
            socket.off('transaction_update');
        };
    }, []);

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

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                {/* Filters */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
                        <TextField
                            select
                            label="Time Filter"
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            sx={{ minWidth: 120 }}
                        >
                            <MenuItem value="hour">Hourly</MenuItem>
                            <MenuItem value="day">Daily</MenuItem>
                            <MenuItem value="week">Weekly</MenuItem>
                            <MenuItem value="month">Monthly</MenuItem>
                            <MenuItem value="year">Yearly</MenuItem>
                        </TextField>
                        <TextField
                            select
                            label="Branch"
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            sx={{ minWidth: 120 }}
                        >
                            <MenuItem value="">All Branches</MenuItem>
                            {/* Add branch options dynamically */}
                        </TextField>
                        <TextField
                            type="date"
                            label="Start Date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            type="date"
                            label="End Date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Paper>
                </Grid>

                {/* Sales Graph */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2, height: 400 }}>
                        <Typography variant="h6" gutterBottom>
                            Sales Overview
                        </Typography>
                        <ResponsiveContainer>
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="total_sales" stroke="#4CAF50" name="Sales" />
                                <Line type="monotone" dataKey="total_discounts" stroke="#2196F3" name="Discounts" />
                                <Line type="monotone" dataKey="return_amount" stroke="#F44336" name="Returns" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Latest Transactions */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: 400, overflow: 'hidden' }}>
                        <Typography variant="h6" gutterBottom>
                            Latest Transactions
                        </Typography>
                        <Box sx={{ height: 'calc(100% - 32px)', overflow: 'auto' }}>
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
                                            <Typography variant="body2">
                                                ₱{transaction.total_amount.toFixed(2)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {transaction.branch_name}
                                            </Typography>
                                        </Box>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </Box>
                    </Paper>
                </Grid>

                {/* Key Metrics */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Key Metrics
                        </Typography>
                        <Grid container spacing={3}>
                            {metrics && (
                                <>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="subtitle2">Total Transactions</Typography>
                                        <Typography variant="h4">{metrics.total_transactions}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="subtitle2">Total Sales</Typography>
                                        <Typography variant="h4">₱{metrics.total_sales.toFixed(2)}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="subtitle2">Average Transaction</Typography>
                                        <Typography variant="h4">₱{metrics.average_transaction_value.toFixed(2)}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="subtitle2">Unique Customers</Typography>
                                        <Typography variant="h4">{metrics.unique_customers}</Typography>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ReportDashboard; 