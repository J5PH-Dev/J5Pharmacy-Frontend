import { Box } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

const EmployeeStaffPage = () => {
  return (
<div className='ml-72'>
  <h1>EmployeeStaffPage</h1>
  <Link to="/dashboard">
    <button>Go to Dashboard</button>
  </Link>
</div>


  );
};

export default EmployeeStaffPage;
