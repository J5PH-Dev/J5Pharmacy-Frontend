import React, { useState, useEffect, useRef } from 'react';
import { Box, Grid, Paper, Typography, useTheme, List, ListItem, ListItemText, Divider, Button, Fab, Dialog, DialogTitle, DialogContent, DialogActions, SpeedDial, SpeedDialIcon, SpeedDialAction, TextField, CircularProgress, Snackbar, Alert, Chip, Stack } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from "socket.io-client";
import { motion, AnimatePresence } from 'framer-motion';
import CodeIcon from '@mui/icons-material/Code';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';

// Initialize socket connection
const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');

interface DashboardData {
  todaySales: number;
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
}

interface Transaction {
  transaction_id: number;
  invoice_number: string;
  created_at: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  branch_name: string;
}

interface LowStockItem {
  id: number;
  name: string;
  barcode: string;
  category_name: string;
  critical: number;
  critical_branches: string;
}

interface DevTransaction {
    total_amount: number;
    payment_method: 'cash' | 'card' | 'gcash';
    branch_name: string;
}

interface Branch {
  branch_id: number;
  branch_name: string;
  is_active: boolean;
}

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [lowStockLoading, setLowStockLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    todaySales: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [generatingTransaction, setGeneratingTransaction] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [devTransaction, setDevTransaction] = useState<DevTransaction>({
    total_amount: 0,
    payment_method: 'cash',
    branch_name: 'Main Branch'
  });

  // Add a ref to track initial mount
  const isInitialMount = useRef(true);

  // Add initial load tracking
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch dashboard overview data
      const overviewResponse = await axios.get('/api/dashboard/overview');
      setDashboardData(overviewResponse.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      if (!initialLoadComplete) {
        setTransactionsLoading(true);
      }
      
      const response = await axios.get<{ transactions: Transaction[] }>('/api/dashboard/recent-transactions');
      const newTransactions = response.data.transactions;
      
      if (newTransactions && newTransactions.length > 0) {
        setRecentTransactions(prev => {
          // Create a new array with existing transactions
          const existingTransactions = [...prev];
          
          // Sort new transactions by created_at in descending order
          const sortedNewTransactions = [...newTransactions].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          // Update or add transactions
          sortedNewTransactions.forEach(newTx => {
            const existingIndex = existingTransactions.findIndex(tx => tx.invoice_number === newTx.invoice_number);
            if (existingIndex >= 0) {
              existingTransactions[existingIndex] = newTx;
            } else {
              existingTransactions.unshift(newTx);
            }
          });
          
          // Sort final array by created_at and take latest 5
          return existingTransactions
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);
        });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      if (!initialLoadComplete) {
        setTransactionsLoading(false);
      }
    }
  };

  const fetchLowStock = async () => {
    try {
      // Only show loading on initial load
      if (!initialLoadComplete) {
        setLowStockLoading(true);
      }
      
      const response = await axios.get<{ items: LowStockItem[] }>('/api/dashboard/low-stock');
      const newItems = response.data.items;
      
      if (newItems && newItems.length > 0) {
        setLowStockItems(prev => {
          const existingItems = [...prev];
          
          newItems.forEach(newItem => {
            const existingIndex = existingItems.findIndex(item => item.id === newItem.id);
            if (existingIndex >= 0) {
              existingItems[existingIndex] = newItem;
            } else {
              existingItems.unshift(newItem);
            }
          });
          
          return existingItems;
        });
      }
    } catch (error) {
      console.error('Error fetching low stock items:', error);
    } finally {
      if (!initialLoadComplete) {
        setLowStockLoading(false);
      }
    }
  };

  // Fetch branches only when DevTools is opened
  useEffect(() => {
    if (devToolsOpen) {
      const fetchBranches = async () => {
        setLoadingBranches(true);
        try {
          const response = await axios.get('/api/dev/branches');
          setBranches(response.data);
        } catch (error) {
          console.error('Error fetching branches:', error);
        } finally {
          setLoadingBranches(false);
        }
      };

      fetchBranches();
    }
  }, [devToolsOpen]);

  useEffect(() => {
    // Initial data fetch
    const initialLoad = async () => {
      await Promise.all([
        fetchDashboardData(),
        fetchTransactions(),
        fetchLowStock()
      ]);
      setInitialLoadComplete(true);
    };
    
    initialLoad();

    // Socket listeners for real-time updates
    socket.on('transaction_update', (newTransaction: Transaction) => {
      setRecentTransactions(prev => {
        // Remove the transaction if it already exists
        const withoutNew = prev.filter(tx => tx.invoice_number !== newTransaction.invoice_number);
        
        // Add the new transaction at the beginning
        const updated = [newTransaction, ...withoutNew];
        
        // Keep only the latest 5 transactions
        return updated.slice(0, 5);
      });
      
      fetchDashboardData();
    });

    // Set up auto-refresh interval (every 30 seconds)
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
      fetchTransactions();
      fetchLowStock();
    }, 30000);

    return () => {
      socket.off('transaction_update');
      socket.off('dashboard_update');
      socket.off('disconnect');
      socket.off('connect');
      clearInterval(refreshInterval);
    };
  }, []);

  const contentData = [
    {
      borderColor: '#03A9F5',
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: `₱${dashboardData.todaySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Today's Sales",
      buttonText: 'View Sales Report',
      route: '/admin/sales-report'
    },
    {
      borderColor: '#01A768',
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      title: dashboardData.totalProducts.toLocaleString(),
      subtitle: 'Total Products',
      buttonText: 'View Products',
      route: '/admin/inventory/view-medicines-available'
    },
    {
      borderColor: '#FCD538',
      icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
      title: dashboardData.totalOrders.toLocaleString(),
      subtitle: 'Total Orders',
      buttonText: 'View Transactions',
      route: '/admin/sales-report'
    },
    {
      borderColor: '#db426b',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: dashboardData.totalCustomers.toLocaleString(),
      subtitle: 'Total Customers',
      buttonText: 'View Customers',
      route: '/admin/customer-info'
    },
  ];

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  const handleDevToolsClick = () => {
    setDevToolsOpen(!devToolsOpen);
  };

  const handleTransactionDialogOpen = () => {
    setTransactionDialogOpen(true);
  };

  const handleTransactionDialogClose = () => {
    setTransactionDialogOpen(false);
    setDevTransaction({
      total_amount: 0,
      payment_method: 'cash',
      branch_name: 'Main Branch'
    });
  };

  const generateTransaction = async () => {
    setGeneratingTransaction(true);
    try {
      await axios.post('/api/dev/generate-transaction', devTransaction);
      setTransactionSuccess(true);
      handleTransactionDialogClose();
      fetchDashboardData(); // Refresh dashboard data
    } catch (error) {
      console.error('Error generating transaction:', error);
    } finally {
      setGeneratingTransaction(false);
    }
  };

  const devTools = [
    { icon: <PointOfSaleIcon />, name: 'Generate Transaction', onClick: handleTransactionDialogOpen }
  ];

  return (
    <Box sx={{ p: 0, ml: { xs: 1, md: 35 }, mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'Black', textAlign: 'center' }}>
        Dashboard Overview
      </Typography>
      <p className='mt-[-13px] text-gray-700 mb-5 text-center'>A quick data overview of the pharmacy.</p>

      {/* Grid for the containers */}
      <Grid container spacing={0} sx={{ justifyContent: 'center', mb: 5 }}>
        {contentData.map((content, index) => (
          <Grid key={index} item xs={12} sm={6} md={2.75}>
            <Paper
              sx={(theme) => ({
                height: 220,
                width: '100%',
                maxWidth: 320,
                margin: '0 auto',
                backgroundColor: '#fff',
                border: `1px solid ${content.borderColor}`,
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
              onClick={() => handleCardClick(content.route)}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1,
                }}
              >
                <div>{React.cloneElement(content.icon, { sx: { fontSize: 40, color: content.borderColor } })}</div>
                <div>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    {content.title}
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: 'center' }}>
                    {content.subtitle}
                  </Typography>
                </div>
              </div>

              <Button
                sx={{
                  backgroundColor: content.borderColor,
                  color: '#fff',
                  width: '100%',
                  textTransform: 'none',
                  borderRadius: 1,
                  marginTop: 'auto',
                  '&:hover': {
                    backgroundColor: `${content.borderColor}99`,
                  },
                }}
              >
                {content.buttonText}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent Transactions and Low Stock Alert */}
      <Grid container spacing={6} sx={{ justifyContent: 'center', mb: 4 }}>
        <Grid item xs={12} md={5.35}>
          <Paper 
            sx={{ 
              p: 3, 
              height: 'calc(100vh - 450px)',
              border: '2px solid #1976d2',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              mb: 2
            }} 
            elevation={2}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                Recent Transactions
              </Typography>
              <Button 
                variant="text" 
                onClick={() => navigate('/admin/sales-report')}
                sx={{ textTransform: 'none', color: '#1976d2' }}
              >
                View All
              </Button>
            </Box>
            {transactionsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress sx={{ color: '#1976d2' }} />
              </Box>
            ) : (
              <Box sx={{ 
                flex: 1,
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '0.4em'
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#888'
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#555'
                }
              }}>
                <AnimatePresence>
                  {recentTransactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.invoice_number}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                        <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 'medium', fontSize: '1.1rem' }}>
                          {transaction.invoice_number}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.9rem' }}>
                          {transaction.created_at}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.primary', mt: 1, fontSize: '1rem' }}>
                          ₱{transaction.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                          <Chip
                            label={transaction.payment_status.toUpperCase()}
                            variant="outlined"
                            size="medium"
                            sx={{ 
                              color: transaction.payment_status === 'paid' ? '#2e7d32' : 
                                    transaction.payment_status === 'pending' ? '#ed6c02' : 
                                    '#d32f2f',
                              borderColor: transaction.payment_status === 'paid' ? '#2e7d32' : 
                                         transaction.payment_status === 'pending' ? '#ed6c02' : 
                                         '#d32f2f',
                              backgroundColor: 'transparent',
                              fontSize: '0.9rem'
                            }}
                          />
                          <Chip
                            label={transaction.payment_method.toUpperCase()}
                            variant="outlined"
                            size="medium"
                            sx={{ 
                              color: '#1976d2',
                              borderColor: '#1976d2',
                              backgroundColor: 'transparent',
                              fontSize: '0.9rem'
                            }}
                          />
                          <Chip
                            label={transaction.branch_name}
                            variant="outlined"
                            size="medium"
                            sx={{ 
                              color: '#757575',
                              borderColor: '#757575',
                              backgroundColor: 'transparent',
                              fontSize: '0.9rem'
                            }}
                          />
                        </Stack>
                      </Box>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={5.35}>
          <Paper 
            sx={{ 
              p: 3, 
              height: 'calc(100vh - 450px)',
              border: '2px solid #d32f2f',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              mb: 2
            }} 
            elevation={2}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                Low Stock Alert
              </Typography>
              <Button 
                variant="text" 
                onClick={() => navigate('/admin/inventory/medicine-shortage')}
                sx={{ textTransform: 'none', color: '#d32f2f' }}
              >
                View All
              </Button>
            </Box>
            {lowStockLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress sx={{ color: '#d32f2f' }} />
              </Box>
            ) : (
              <Box sx={{ 
                flex: 1,
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '0.4em'
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#888'
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#555'
                }
              }}>
                <AnimatePresence>
                  {lowStockItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                        <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 'medium', fontSize: '1.1rem' }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.9rem' }}>
                          {item.barcode} • {item.category_name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.primary', mt: 1, fontSize: '1rem' }}>
                          Critical Level: {item.critical}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                          {item.critical_branches.split(', ').map((branch, idx) => {
                            const [branchName, stock] = branch.split(': ');
                            const stockNum = parseInt(stock);
                            const isOutOfStock = stockNum === 0;
                            
                            return (
                              <Chip
                                key={idx}
                                icon={isOutOfStock ? <WarningIcon /> : undefined}
                                label={`${branchName}: ${stock}`}
                                variant="outlined"
                                size="medium"
                                sx={{ 
                                  color: isOutOfStock ? '#ff1744' : '#ff9800',
                                  borderColor: isOutOfStock ? '#ff1744' : '#ff9800',
                                  backgroundColor: 'transparent',
                                  fontSize: '0.9rem',
                                  '& .MuiChip-icon': { 
                                    color: isOutOfStock ? '#ff1744' : '#ff9800'
                                  }
                                }}
                              />
                            );
                          })}
                        </Stack>
                      </Box>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* DevTools Speed Dial */}
      <SpeedDial
        ariaLabel="Dev Tools"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon icon={<CodeIcon />} openIcon={<CloseIcon />} />}
        open={devToolsOpen}
        onClick={handleDevToolsClick}
      >
        {devTools.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
          />
        ))}
      </SpeedDial>

      {/* Transaction Generator Dialog */}
      <Dialog 
        open={transactionDialogOpen} 
        onClose={handleTransactionDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Generate Test Transaction</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Total Amount"
              type="number"
              value={devTransaction.total_amount}
              onChange={(e) => setDevTransaction({
                ...devTransaction,
                total_amount: parseFloat(e.target.value)
              })}
              inputProps={{ min: 0, step: 0.01 }}
              fullWidth
            />
            <TextField
              select
              label="Payment Method"
              value={devTransaction.payment_method}
              onChange={(e) => setDevTransaction({
                ...devTransaction,
                payment_method: e.target.value as 'cash' | 'card' | 'gcash'
              })}
              fullWidth
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="gcash">GCash</MenuItem>
            </TextField>
            <TextField
              select
              label="Branch"
              value={devTransaction.branch_name}
              onChange={(e) => setDevTransaction({
                ...devTransaction,
                branch_name: e.target.value
              })}
              fullWidth
              disabled={loadingBranches}
            >
              {branches.map((branch) => (
                <MenuItem key={branch.branch_id} value={branch.branch_name}>
                  {branch.branch_name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTransactionDialogClose}>Cancel</Button>
          <Button
            onClick={generateTransaction}
            variant="contained"
            disabled={generatingTransaction || devTransaction.total_amount <= 0 || loadingBranches}
            sx={{
              backgroundColor: '#1B3E2D',
              '&:hover': {
                backgroundColor: '#2D5741',
              },
            }}
          >
            {generatingTransaction ? <CircularProgress size={24} /> : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={transactionSuccess}
        autoHideDuration={3000}
        onClose={() => setTransactionSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setTransactionSuccess(false)} 
          severity="success"
          sx={{ width: '100%' }}
        >
          Test transaction generated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;
