import React, { useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import theme from './theme/theme';
import Header from './components/Header';
import TransactionInfo from './components/TransactionInfo';
import FunctionKeys from './components/FunctionKeys';
import Cart from './components/Cart';
import DevTools from './devtools/DevTools';
import { CartItem } from './types/cart';

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const handleAddSampleItems = (newItems: CartItem[]) => {
    setCartItems(prevItems => [...prevItems, ...newItems]);
  };

  const handleResetStock = () => {
    // TODO: Implement stock reset functionality
    console.log('Reset stock clicked');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', p: 1.5, bgcolor: 'background.default' }}>
        {/* Top Bar */}
        <Grid container spacing={1.5} sx={{ mb: 1.5, height: '85px' }}>
          {/* Header Section - 1/3 width */}
          <Grid item xs={4}>
            <Paper 
              elevation={2}
              sx={{ 
                height: '100%',
                overflow: 'hidden',
              }}
            >
              <Header />
            </Paper>
          </Grid>
          {/* Transaction Info Section - 2/3 width */}
          <Grid item xs={8}>
            <Paper 
              elevation={2}
              sx={{ 
                height: '100%',
                overflow: 'hidden',
              }}
            >
              <TransactionInfo />
            </Paper>
          </Grid>
        </Grid>
        
        {/* Main Content Area */}
        <Grid container spacing={1.5} sx={{ flexGrow: 1 }}>
          {/* Function Keys */}
          <Grid item xs={2}>
            <Paper 
              elevation={2}
              sx={{ height: '100%', overflow: 'hidden' }}
            >
              <FunctionKeys />
            </Paper>
          </Grid>
          {/* Cart Section */}
          <Grid item xs={7}>
            <Paper 
              elevation={2}
              sx={{ 
                p: 2, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <Cart items={cartItems} />
            </Paper>
          </Grid>
          {/* Right Side - Transaction Summary & Action Buttons */}
          <Grid item xs={3}>
            <Grid container direction="column" spacing={1.5} sx={{ height: '100%' }}>
              <Grid item xs>
                <Paper 
                  elevation={2}
                  sx={{ p: 2, height: '100%' }}
                >
                  Transaction Summary
                </Paper>
              </Grid>
              <Grid item>
                <Paper 
                  elevation={2}
                  sx={{ p: 2 }}
                >
                  Action Buttons
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Developer Tools */}
      <DevTools 
        onAddSampleItems={handleAddSampleItems} 
        onResetStock={() => {}} 
        onClearCart={() => setCartItems([])}
      />
    </ThemeProvider>
  );
}

export default App;
