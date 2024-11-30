import { Box } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

const InventoryPage = () => {
  return (
<div className='ml-72'>
  <h1>InventoryPage</h1>
  <Link to="/dashboard">
    <button>Go to Dashboard</button>
  </Link>
</div>


  );
};

export default InventoryPage;
