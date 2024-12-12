import React from 'react';
import { Box, Container, Typography, Divider, Button, Grid, TextField, MenuItem, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
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
    <Box sx={{ p: 3, ml: { xs: 1, md: 38 }, mt: 1 }}>
      {/* Title and Button Container with Centered Content */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Sales Report
          </Typography>
          <Typography variant="body1" sx={{ mt: -1 }}>
            A summary of sales performance and key insights.
          </Typography>
        </Box>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained"
              sx={{
                color: 'black',
                backgroundColor: 'white',
                boxShadow: 'none',
                border: '1px solid rgba(29, 36, 46, 0.2)',
                padding: '10px 20px',
                '&:hover': {
                  transform: 'scale(1.012)',
                  backgroundColor: 'white',
                  boxShadow: 'none',
                },
              }} onClick={downloadReport}>
              Download Report
            </Button>
          </Box>
        </Grid>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mb: 4, mt: 4, backgroundColor: 'white' }}>
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

        <Grid item xs={12} md={6}>
          <Box sx={{ backgroundColor: 'white', padding: '20px 30px', maxWidth: '746px', borderLeft: '1px solid rgba(29, 36, 46, 0.2)', borderRight: '1px solid rgba(29, 36, 46, 0.2)' }}>
            <div>
              <Typography variant="h6" gutterBottom>
                Sales Made
              </Typography>
            </div>
            <Divider sx={{ mb: 5, mt: 2 }} />
            <Box sx={{ width: '100%', height: 300, padding: 0 }}>
              <ResponsiveContainer>
                <AreaChart
                  data={salesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />

                  {/* Define the linear gradient */}
                  <defs>
                    <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#299DED" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#82CAFF" stopOpacity={0.2} /> {/* Lighter blue at the bottom */}
                    </linearGradient>
                  </defs>

                  {/* Apply the gradient to the Area chart */}
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#299DED"
                    fill="url(#salesGradient)" // Reference the gradient defined above
                    activeDot={{ r: 8 }}
                  />

                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            sx={{
              mb: 4,
              backgroundColor: 'white',
              padding: '30px',
              borderLeft: '1px solid rgba(29, 36, 46, 0.2)',
              borderRight: '1px solid rgba(29, 36, 46, 0.2)',
            }}
          >
            <Typography variant="h5" gutterBottom>
              Latest Transactions
            </Typography>
            <Box sx={{ maxHeight: '330px', overflowY: 'auto' }}>
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
                  {/* Add more rows to test scrolling */}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </Grid>

      </Grid>
    </Box>
  );
};

export default ReportsPage;
