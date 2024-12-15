import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Button, Breadcrumbs, Link } from '@mui/material';
import { Medication, Group, Warning } from '@mui/icons-material'; // Material icons
import AddIcon from '@mui/icons-material/Add'; // Import Material UI Add icon
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const InventoryPage = () => {
  const [stats, setStats] = useState({
    medicinesAvailable: 0,
    medicineGroups: 0,
    medicineShortage: 0,
  });


  const [selectedItem, setSelectedItem] = useState<any>(null);
  const navigate = useNavigate(); // Initialize the navigate hook

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


  const handleBreadcrumbClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the default link behavior
    setSelectedItem(null); // Reset selected item, returning to the initial inventory view
  };

  // Map handlers to content
  const handlers = [
    handleMedicinesAvailable,
    handleMedicinesGroup,
    handleMedicineShortage,
  ];


  // Fetch inventory stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/admin/inventory');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching inventory stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Define border colors and content for each container in an array of objects
  const contentData = [
    {
      borderColor: '#03A9F5',
      icon: <Medication sx={{ fontSize: 40 }} />,
      NumberAmount: stats.medicinesAvailable,
      subtitle: 'Medicines Available',
      buttonText: 'View Full Details',
      route: '/admin/inventory/view-medicines-available',
    },
    {
      borderColor: '#01A768',
      icon: <Group sx={{ fontSize: 40 }} />,
      NumberAmount: stats.medicineGroups,
      subtitle: 'Medicine Groups',
      buttonText: 'View Groups >>',
      route: '/admin/inventory/view-medicines-group',
    },
    {
      borderColor: '#F0483E',
      icon: <Warning sx={{ fontSize: 40 }} />,
      NumberAmount: stats.medicineShortage,
      subtitle: 'Medicine Shortage',
      buttonText: 'Resolve Now >>',
      route: '/admin/inventory/medicine-shortage',
    },
  ];

  return (
    <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>
      {/* Conditionally render Breadcrumbs only if selectedItem is not null */}
      {selectedItem && (
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: { xs: 'center', sm: 'flex-start' }, // Center on small screens, left-align on larger screens
            textAlign: { xs: 'center', sm: 'left' }, // Align text center on small screens, left-align on larger screens
            width: '100%', // Ensure it takes full width for centering on small screens
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

      {/* Title and Button Container with Centered Content */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            {selectedItem ? selectedItem.pageTitle : 'Inventory'}
          </Typography>
          <Typography variant="body1" sx={{ mt: -1 }}>
            {selectedItem ? selectedItem.pageSubtitle : 'List of medicines available for sales.'}
          </Typography>
        </Box>
      </Box>

      {/* Grid for the containers */}
      {!selectedItem && (
        <Grid container spacing={3} sx={{ justifyContent: { xs: 'center', sm: 'flex-start' } }}>
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
