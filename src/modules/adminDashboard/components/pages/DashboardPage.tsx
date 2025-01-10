import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, useTheme, IconButton, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Medication, Group, Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface DashboardData {
  todaySales: number;
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
}

interface Transaction {
  transaction_id: number;
  customer_name: string;
  total_amount: number;
  transaction_date: string;
  item_count: number;
}

interface LowStockItem {
  medicine_name: string;
  current_stock: number;
  reorder_point: number;
}

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const [selectedItem, setSelectedItem] = useState<any>(null);
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
  }, []);

  const contentData = [
    {
      borderColor: '#03A9F5',
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: `₱${dashboardData.todaySales.toLocaleString()}`,
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
      route: '/admin/sales-report/view-all-transactions'
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
    <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'Black' }}>
        Dashboard Overview
      </Typography>
      <p className='mt-[-13px] text-gray-700 mb-5'>A quick data overview of the pharmacy.</p>

      {/* Grid for the containers */}
      {!selectedItem && (
        <Grid container spacing={4} sx={{ justifyContent: { xs: 'center', sm: 'flex-start' } }}>
          {contentData.map((content, index) => (
            <Grid key={index} item>
              <Paper
                sx={(theme) => ({
                  height: 220,
                  width: 272,
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
      )}

      {/* Recent Transactions and Low Stock Alert */}
      <Grid container spacing={3} sx={{mt: 2}}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }} elevation={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Recent Transactions
              </Typography>
              <Button 
                variant="text" 
                onClick={() => navigate('/admin/sales-report/view-all-transactions')}
                sx={{ textTransform: 'none' }}
              >
                View All
              </Button>
            </Box>
            <List>
              {recentTransactions.map((transaction, index) => (
                <React.Fragment key={transaction.transaction_id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {transaction.customer_name}
                        </Typography>
                      }
                      secondary={`${new Date(transaction.transaction_date).toLocaleDateString()} • ${transaction.item_count} items`}
                    />
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                      ₱{transaction.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </ListItem>
                  {index < recentTransactions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', bgcolor: theme.palette.error.light }} elevation={2}>
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
            <List>
              {lowStockItems.map((item, index) => (
                <React.Fragment key={item.medicine_name}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: 'white' }}>
                          {item.medicine_name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Stock: {item.current_stock} (Min: {item.reorder_point})
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < lowStockItems.length - 1 && <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
