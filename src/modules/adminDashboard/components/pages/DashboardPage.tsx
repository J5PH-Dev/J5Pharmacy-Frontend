import React from 'react';
import { Box, Grid, Paper, Typography, useTheme, IconButton, List, ListItem, ListItemText, Divider } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Mock data
const recentTransactions = [
  { id: 1, customer: 'John Doe', amount: 150.50, date: '2024-01-20', items: 3 },
  { id: 2, customer: 'Jane Smith', amount: 75.25, date: '2024-01-20', items: 2 },
  { id: 3, customer: 'Bob Wilson', amount: 220.00, date: '2024-01-19', items: 4 },
];

const lowStockItems = [
  { name: 'Paracetamol 500mg', stock: 15, threshold: 20 },
  { name: 'Amoxicillin 250mg', stock: 8, threshold: 15 },
  { name: 'Vitamin C 1000mg', stock: 12, threshold: 25 },
];

const DashboardPage: React.FC = () => {
  const theme = useTheme();

  const StatCard = ({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) => (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          transition: 'transform 0.3s ease-in-out',
        },
      }}
      elevation={2}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="h6" color="text.secondary" sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
          {title}
        </Typography>
        <IconButton size="small">
          <MoreVertIcon />
        </IconButton>
      </Box>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
        {value}
      </Typography>
      <Box
        sx={{
          position: 'absolute',
          right: -10,
          bottom: -10,
          opacity: 0.2,
          transform: 'rotate(-15deg)',
        }}
      >
        <Box sx={{ color: color, fontSize: '4rem' }}>
          {icon}
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1}}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'Black' }}>
        Dashboard Overview
      </Typography>
      <p className='mt-[-13px] text-gray-700 mb-5'>A quick data overview of the inventory.</p>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Sales"
            value="₱15,250"
            icon={<TrendingUpIcon sx={{ fontSize: 'inherit' }} />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value="1,250"
            icon={<InventoryIcon sx={{ fontSize: 'inherit' }} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value="85"
            icon={<ShoppingCartIcon sx={{ fontSize: 'inherit' }} />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value="450"
            icon={<PeopleIcon sx={{ fontSize: 'inherit' }} />}
            color={theme.palette.info.main}
          />
        </Grid>
      </Grid>

      {/* Detailed Information */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }} elevation={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Recent Transactions
            </Typography>
            <List>
              {recentTransactions.map((transaction, index) => (
                <React.Fragment key={transaction.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {transaction.customer}
                        </Typography>
                      }
                      secondary={`${transaction.date} • ${transaction.items} items`}
                    />
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                      ₱{transaction.amount.toFixed(2)}
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
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
              Low Stock Alert
            </Typography>
            <List>
              {lowStockItems.map((item, index) => (
                <React.Fragment key={item.name}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: 'white' }}>
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Stock: {item.stock} (Min: {item.threshold})
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
