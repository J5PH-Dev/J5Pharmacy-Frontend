import { Box, Breadcrumbs, Button, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const ViewMedicineDescription = () => {
    const { medicineName } = useParams(); // Extract the medicine name from URL

    return (
        <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1, mr: 3 }}>

            <div>
                <h2>Details for {medicineName}</h2>
                {/* Add the details of the selected medicine here */}
            </div>
        </Box>
    );
};

export default ViewMedicineDescription;
