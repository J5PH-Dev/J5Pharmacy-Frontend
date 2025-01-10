import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, useTheme, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from "socket.io-client";
import { motion, AnimatePresence } from 'framer-motion';

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

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    todaySales: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch dashboard overview data
        const overviewResponse = await axios.get('/api/dashboard/overview');
        setDashboardData(overviewResponse.data);

        // Fetch recent transactions
        const transactionsResponse = await axios.get('/api/dashboard/recent-transactions');
        setRecentTransactions(transactionsResponse.data.transactions);

        // Fetch low stock items
        const lowStockResponse = await axios.get('/api/dashboard/low-stock');
        setLowStockItems(lowStockResponse.data.items);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Socket listeners for real-time updates
    socket.on('transaction_update', (newTransaction: Transaction) => {
      setRecentTransactions(prev => [newTransaction, ...prev.slice(0, 4)]);
      fetchDashboardData(); // Refresh dashboard data when new transaction comes in
    });

    return () => {
      socket.off('transaction_update');
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

  return (
    <Box sx={{ p: 3, ml: { xs: 1, md: 35 }, mt: 4 }}>
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
              display: 'flex',
              flexDirection: 'column',
              mb: 2
            }} 
            elevation={2}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Recent Transactions
              </Typography>
              <Button 
                variant="text" 
                onClick={() => navigate('/admin/sales-report')}
                sx={{ textTransform: 'none' }}
              >
                View All
              </Button>
            </Box>
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
                    <Box sx={{ p: 1, borderBottom: '1px solid #eee' }}>
                      <Typography variant="subtitle2">
                        {transaction.invoice_number}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(transaction.created_at).toLocaleString()}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">
                          ₱{transaction.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
        <Grid item xs={12} md={5.35}>
          <Paper 
            sx={{ 
              p: 3, 
              height: 'calc(100vh - 450px)',
              bgcolor: 'rgba(211, 47, 47, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              mb: 2
            }} 
            elevation={2}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                Low Stock Alert
              </Typography>
              <Button 
                variant="text" 
                onClick={() => navigate('/admin/inventory/medicine-shortage')}
                sx={{ textTransform: 'none', color: 'white' }}
              >
                View All
              </Button>
            </Box>
            <Box sx={{ 
              flex: 1,
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '0.4em'
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255, 255, 255, 0.1)'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(255, 255, 255, 0.5)'
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
                    <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'medium' }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block' }}>
                        {item.barcode} • {item.category_name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mt: 1 }}>
                        Critical Level: {item.critical}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mt: 0.5 }}>
                        {item.critical_branches}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
