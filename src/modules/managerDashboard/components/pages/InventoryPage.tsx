import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Button, Breadcrumbs, Link } from '@mui/material';
import { Medication, Category, Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../auth/contexts/AuthContext';

const InventoryPage = () => {
  const [stats, setStats] = useState({
    productsAvailable: 0,
    medicineGroups: 0,
    medicineShortage: 0,
  });

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const branchId = user?.branchId;

  const handleMedicinesAvailable = () => {
    navigate('/manager/inventory/view-medicines-available', {
      state: { 
        branchId,
        branchName: user?.branch_name 
      }
    });
  };

  const handleMedicinesGroup = () => {
    navigate('/manager/inventory/view-medicines-group', {
      state: { 
        branchId,
        branchName: user?.branch_name 
      }
    });
  };

  const handleMedicineShortage = () => {
    navigate('/manager/inventory/medicine-shortage', {
      state: { 
        branchId,
        branchName: user?.branch_name 
      }
    });
  };

  const handleBreadcrumbClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedItem(null);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!branchId) {
          console.log('Branch ID not available');
          return;
        }

        console.log('Fetching inventory stats for branch:', branchId);
        const response = await axios.get(`/admin/inventory/stats?branch_id=${branchId}`);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching inventory stats:', error);
      }
    };

    if (branchId) {
      fetchStats();
    }
  }, [branchId]);

  const contentData = [
    {
      borderColor: '#03A9F5',
      icon: <Medication sx={{ fontSize: 40 }} />,
      NumberAmount: stats.productsAvailable,
      subtitle: `Products Available in ${user?.branch_name || 'Branch'}`,
      buttonText: 'View Full Details',
      onClick: handleMedicinesAvailable
    },
    {
      borderColor: '#01A768',
      icon: <Category sx={{ fontSize: 40 }} />,
      NumberAmount: stats.medicineGroups,
      subtitle: 'Product Categories',
      buttonText: 'View Categories >>',
      onClick: handleMedicinesGroup
    },
    {
      borderColor: '#F0483E',
      icon: <Warning sx={{ fontSize: 40 }} />,
      NumberAmount: stats.medicineShortage,
      subtitle: `Product Shortage in ${user?.branch_name || 'Branch'}`,
      buttonText: 'Resolve Now >>',
      onClick: handleMedicineShortage
    },
  ];

  return (
    <Box sx={{ p: 0, ml: { xs: 1, md: 35 }, mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'Black', textAlign: 'center' }}>
        {user?.branch_name ? `${user.branch_name} Inventory Overview` : 'Inventory Overview'}
      </Typography>
      <p className='mt-[-13px] text-gray-700 mb-5 text-center'>
        Overview of product inventory, categories, and stock levels for your branch.
      </p>

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
              onClick={content.onClick}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
              }}>
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
    </Box>
  );
};

export default InventoryPage;
