import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, Button, Breadcrumbs, Link } from '@mui/material';
import { Medication, Group, Warning } from '@mui/icons-material'; // Material icons
import AddIcon from '@mui/icons-material/Add'; // Import Material UI Add icon
import { useNavigate } from 'react-router-dom';

// Define border colors and content for each container in an array of objects
const contentData = [
  {
    borderColor: '#03A9F5',
    icon: <Medication sx={{ fontSize: 40 }} />,
    title: '367',
    subtitle: 'Medicines Available',
    buttonText: 'View Full Details',
    breadcrumbTitle: 'Medicines Available',
    pageTitle: 'Medicines Available',
    pageSubtitle: 'List of medicines available for sales..',
  },
  {
    borderColor: '#01A768',
    icon: <Group sx={{ fontSize: 40 }} />,
    title: '2',
    subtitle: 'Medicines Group',
    buttonText: 'View Groups >>',
    breadcrumbTitle: 'Medicine Groups',
    pageTitle: 'Medicine Groups Overview',
    pageSubtitle: 'List and details of all available groups of medicines.',
  },
  {
    borderColor: '#F0483E',
    icon: <Warning sx={{ fontSize: 40 }} />,
    title: '01',
    subtitle: 'Medicine Shortage',
    buttonText: 'Resolve Now >>',
    breadcrumbTitle: 'Shortages',
    pageTitle: 'Medicine Shortages',
    pageSubtitle: 'Current shortages and actions to resolve them.',
  },
];

const InventoryPage = () => {
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
    navigate('/admin/inventory/view-medicine-shortage');
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

  return (
    <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>
      {/* Conditionally render Breadcrumbs only if selectedItem is not null */}
      {selectedItem && (
        <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: '16px' }}>
          <Link color="inherit" href="/" onClick={handleBreadcrumbClick}>
            Inventory
          </Link>
          <Typography color="text.primary">
            {selectedItem.breadcrumbTitle}
          </Typography>
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
        <Grid item xs={12}>
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
                  onClick={() => {
                    // Check if the item is for Medicines Group
                    if (content.subtitle === 'Medicines Group') {
                      HandleViewMedicineGroup(content); // Call HandleViewMedicineGroup
                    } else {
                      HandleViewMedicine(content); // Call HandleViewMedicine for other items
                    }
                  }}
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
        </Grid>
      )}

      {/* Placeholder for detailed content - Display only when an item is selected */}
      {selectedItem && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {selectedItem.title} - Full Details
          </Typography>
          <Typography variant="body1">
            {selectedItem.subtitle} {/* Replace with actual content later */}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default InventoryPage;
