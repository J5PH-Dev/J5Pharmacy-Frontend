import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, useTheme, IconButton, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Medication, Group, Warning } from '@mui/icons-material'; // Material icons
import { useNavigate } from 'react-router-dom';

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

const contentData = [
  {
    borderColor: '#03A9F5',
    icon: <Medication sx={{ fontSize: 40 }} />,
    title: '15,250',
    subtitle: 'Total Sales',
    buttonText: 'View Full Sales',
  },
  {
    borderColor: '#01A768',
    icon: <Group sx={{ fontSize: 40 }} />,
    title: '1250',
    subtitle: 'Total Products',
    buttonText: 'View Groups >>',
  },
  {
    borderColor: '#FCD538',
    icon: <Warning sx={{ fontSize: 40 }} />,
    title: '85',
    subtitle: 'Total Orders',
    buttonText: 'Resolve Now >>',
    breadcrumbTitle: 'Shortages',
    pageTitle: 'Medicine Shortages',
    pageSubtitle: 'Current shortages and actions to resolve them.',
  },
  {
    borderColor: '#F0483E',
    icon: <Warning sx={{ fontSize: 40 }} />,
    title: '450',
    subtitle: 'Total Customers',
    buttonText: 'Resolve Now >>',
    breadcrumbTitle: 'Shortages',
    pageTitle: 'Medicine Shortages',
    pageSubtitle: 'Current shortages and actions to resolve them.',
  },
];

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const navigate = useNavigate(); // Initialize the navigate hook

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

  // Separate handlers for each container
  const handleMedicinesAvailable = (item: any) => {
    setSelectedItem(item);
    navigate('/admin/inventory/view-medicines-available');
  };

  const handleMedicinesGroup = (item: any) => {
    setSelectedItem(item);
    navigate('/admin/inventory/view-medicines-group');
  };

  const handleMedicineShortage = (item: any) => {
    setSelectedItem(item);
    navigate('/admin/inventory/medicine-shortage');
  };

  const handleMedicineShortage1 = (item: any) => {
    setSelectedItem(item);
    navigate('/admin/inventory/medicine-shortage');
  };


  const handlers = [
    handleMedicinesAvailable,
    handleMedicinesGroup,
    handleMedicineShortage,
    handleMedicineShortage1
  ];

  return (
    <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'Black' }}>
        Dashboard Overview
      </Typography>
      <p className='mt-[-13px] text-gray-700 mb-5'>A quick data overview of the inventory.</p>

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
                onClick={() => handlers[index](content)}
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

      {/* Detailed Information */}
      <Grid container spacing={3} sx={{mt: 2}}>
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
