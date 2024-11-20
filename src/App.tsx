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
import ActionButtons from './components/ActionButtons';
import DiscountDialog from './components/DiscountDialog';
import { CartItem } from './types/cart';
import { DiscountType } from './components/TransactionSummary/types';
import TransactionSummary from './components/TransactionSummary/TransactionSummary';
import { calculateTotals } from './utils/calculations';
import { format } from 'date-fns';

const generateTransactionId = (branchId: string = 'B001'): string => {
  const now = new Date();
  const dateStr = format(now, 'yyMMdd');
  // In a real application, this number would come from a database or counter service
  const sequenceNumber = '00001';
  return `${branchId}-${dateStr}-${sequenceNumber}`;
};

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [transactionId] = useState<string>(() => generateTransactionId());
  const [customerId, setCustomerId] = useState<string>();
  const [customerName, setCustomerName] = useState<string>();
  const [starPointsId, setStarPointsId] = useState<string>();
  const [discountType, setDiscountType] = useState<DiscountType>('None');
  const [heldTransactions, setHeldTransactions] = useState<{
    id: string;
    items: CartItem[];
    customerId?: string;
    customerName?: string;
    starPointsId?: string;
    discountType: DiscountType;
  }[]>([]);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [customDiscountValue, setCustomDiscountValue] = useState<number>();

  const handleAddSampleItems = (newItems: CartItem[]) => {
    setCartItems(prevItems => [...prevItems, ...newItems]);
  };

  const handleResetStock = () => {
    // TODO: Implement stock reset functionality
    console.log('Reset stock clicked');
  };

  const handleCheckout = () => {
    const totals = calculateTotals(cartItems, discountType, customDiscountValue);
    console.log('Checkout clicked', {
      transactionId,
      customerId,
      customerName,
      starPointsId,
      ...totals
    });
  };

  const handleVoid = () => {
    // TODO: Implement void logic
    setCartItems([]);
    setCustomerId(undefined);
    setCustomerName(undefined);
    setStarPointsId(undefined);
    setDiscountType('None');
  };

  const handlePrint = () => {
    // TODO: Implement print logic
    console.log('Print clicked');
  };

  const handleHoldTransaction = () => {
    const heldTransaction = {
      id: `HOLD-${format(new Date(), 'yyyyMMdd-HHmmss')}`,
      items: cartItems,
      customerId,
      customerName,
      starPointsId,
      discountType
    };
    setHeldTransactions([...heldTransactions, heldTransaction]);
    handleVoid(); // Clear current transaction
    console.log('Transaction held:', heldTransaction);
  };

  const handleCustomerInfo = () => {
    // TODO: Implement customer info dialog
    console.log('Opening customer info dialog', {
      customerId,
      customerName,
      starPointsId
    });
  };

  const handleDiscountClick = () => {
    setDiscountDialogOpen(true);
  };

  const handleDiscountSelect = (type: DiscountType, customValue?: number) => {
    setDiscountType(type);
    setCustomDiscountValue(customValue);
  };

  // Calculate transaction totals
  const {
    subtotal,
    discountAmount,
    discountedSubtotal,
    vat,
    total,
    items: itemsWithDiscounts
  } = calculateTotals(cartItems, discountType, customDiscountValue);

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
              <Cart 
                items={cartItems}
              />
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
                  <TransactionSummary
                    transactionId={transactionId}
                    customerId={customerId}
                    customerName={customerName}
                    starPointsId={starPointsId}
                    subtotal={subtotal}
                    discountType={discountType}
                    discountAmount={discountAmount}
                    discountedSubtotal={discountedSubtotal}
                    vat={vat}
                    total={total}
                    customValue={customDiscountValue}
                  />
                </Paper>
              </Grid>
              <Grid item>
                <Paper 
                  elevation={2}
                  sx={{ p: 2 }}
                >
                  <ActionButtons
                    onCheckout={handleCheckout}
                    onVoid={handleVoid}
                    onPrint={handlePrint}
                    onDiscount={handleDiscountClick}
                    onCustomerInfo={handleCustomerInfo}
                    isCartEmpty={cartItems.length === 0}
                    currentDiscount={discountType}
                  />
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
      <DiscountDialog
        open={discountDialogOpen}
        onClose={() => setDiscountDialogOpen(false)}
        onSelect={handleDiscountSelect}
        currentDiscount={discountType}
      />
    </ThemeProvider>
  );
}

export default App;
