import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Button, Breadcrumbs, Link } from '@mui/material';
import { Medication, Category, Warning } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const InventoryPage = () => {
  const [stats, setStats] = useState({
    productsAvailable: 0,
    medicineGroups: 0,
    medicineShortage: 0,
  });

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const navigate = useNavigate();

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

  const handleBreadcrumbClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedItem(null);
  };

  const handlers = [
    handleMedicinesAvailable,
    handleMedicinesGroup,
    handleMedicineShortage,
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/admin/inventory/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching inventory stats:', error);
      }
    };

    fetchStats();
  }, []);

  const contentData = [
    {
      borderColor: '#03A9F5',
      icon: <Medication sx={{ fontSize: 40 }} />,
      NumberAmount: stats.productsAvailable,
      subtitle: 'Products Available',
      buttonText: 'View Full Details',
      route: '/admin/inventory/view-medicines-available',
    },
    {
      borderColor: '#01A768',
      icon: <Category sx={{ fontSize: 40 }} />,
      NumberAmount: stats.medicineGroups,
      subtitle: 'Product Categories',
      buttonText: 'View Categories >>',
      route: '/admin/inventory/view-medicines-group',
    },
    {
      borderColor: '#F0483E',
      icon: <Warning sx={{ fontSize: 40 }} />,
      NumberAmount: stats.medicineShortage,
      subtitle: 'Product Shortage',
      buttonText: 'Resolve Now >>',
      route: '/admin/inventory/medicine-shortage',
    },
  ];

  return (
    <Box sx={{ p: 0, ml: { xs: 1, md: 35 }, mt: 4 }}>
      {selectedItem && (
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: { xs: 'center', sm: 'flex-start' },
            textAlign: { xs: 'center', sm: 'left' },
            width: '100%',
          }}
        >
          <Link color="inherit" href="/" onClick={handleBreadcrumbClick}>
            Inventory
          </Link>
          {selectedItem && (
            <Typography color="text.primary">
              {selectedItem.breadcrumbTitle}
            </Typography>
          )}
        </Breadcrumbs>
      )}

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'Black', textAlign: 'center' }}>
        {selectedItem ? selectedItem.pageTitle : 'Inventory Overview'}
      </Typography>
      <p className='mt-[-13px] text-gray-700 mb-5 text-center'>
        {selectedItem ? selectedItem.pageSubtitle : 'Overview of product inventory, categories, and stock levels.'}
      </p>

      {!selectedItem && (
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
                      {content.NumberAmount}
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
    </Box>
  );
};

export default InventoryPage;
