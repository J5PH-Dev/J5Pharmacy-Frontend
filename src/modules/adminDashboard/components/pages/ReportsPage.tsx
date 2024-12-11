import React from 'react';
import { Box, Container, Typography, Divider, Button, Grid, TextField, MenuItem, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

// Sample sales data
const salesData = [
  { month: 'Jan', sales: 4000 },
  { month: 'Feb', sales: 3000 },
  { month: 'Mar', sales: 5000 },
  { month: 'Apr', sales: 4000 },
  { month: 'May', sales: 6000 },
  { month: 'Jun', sales: 7000 },
];

// Sample latest transactions
const latestTransactions = [
  { orderId: '12345', dateTime: '2024-12-11 12:30:45' },
  { orderId: '12346', dateTime: '2024-12-10 15:22:30' },
  { orderId: '12347', dateTime: '2024-12-09 14:10:15' },
];

const downloadReport = () => {
  const ws = XLSX.utils.json_to_sheet(latestTransactions);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Latest Transactions');
  XLSX.writeFile(wb, 'Latest_Transactions_Report.xlsx');
};

const ReportsPage = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Reports Page
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" color="primary" onClick={downloadReport}>
              Download Report
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <TextField
              label="Date Range"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Medicine Group"
              select
              fullWidth
            >
              <MenuItem value="Group1">Group 1</MenuItem>
              <MenuItem value="Group2">Group 2</MenuItem>
              <MenuItem value="Group3">Group 3</MenuItem>
            </TextField>
            <TextField
              label="Branch"
              select
              fullWidth
            >
              <MenuItem value="Branch1">Branch 1</MenuItem>
              <MenuItem value="Branch2">Branch 2</MenuItem>
              <MenuItem value="Branch3">Branch 3</MenuItem>
            </TextField>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 4 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>
              Sales Graph
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            <Divider sx={{ my: 4 }} />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Latest Transactions
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Date & Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>12345</TableCell>
                <TableCell>2024-12-11 12:30:45</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>12346</TableCell>
                <TableCell>2024-12-10 15:22:30</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>12347</TableCell>
                <TableCell>2024-12-09 14:10:15</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ReportsPage;
