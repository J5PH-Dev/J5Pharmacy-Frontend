import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { format } from 'date-fns';

// Import POS components
import Header from '../../../core/components/Header';
import TransactionInfo from '../components/TransactionInfo';
import FunctionKeys from '../components/FunctionKeys';
import Cart from '../components/Cart';
import ActionButtons from '../../../core/components/ActionButtons';
import DiscountDialog from '../components/DiscountDialog';
import TransactionSummary from '../components/TransactionSummary/TransactionSummary';
import { CheckoutDialog } from '../components/CheckoutDialog/CheckoutDialog';
import DevTools from '../../../devtools/DevTools';

// Import types and utilities
import { CartItem } from '../types/cart';
import { DiscountType } from '../components/TransactionSummary/types';
import { calculateTotals } from '../utils/calculations';
import { cartItemToReceiptItem } from '../utils/mappers';

const generateTransactionId = (branchId: string = 'B001'): string => {
  const now = new Date();
  const dateStr = format(now, 'yyMMdd');
  // In a real application, this number would come from a database or counter service
  const sequenceNumber = '00001';
  return `${branchId}-${dateStr}-${sequenceNumber}`;
};

const POSPage: React.FC = () => {
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
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [starPointsEarned, setStarPointsEarned] = useState(0);

  const handleAddSampleItems = (newItems: CartItem[]) => {
    setCartItems(prevItems => [...prevItems, ...newItems]);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setIsCheckoutOpen(true);
  };

  const handleCheckoutComplete = () => {
    setIsCheckoutOpen(false);
    setCartItems([]); // Clear the cart
  };

  const handleVoid = () => {
    setCartItems([]);
    setCustomerId(undefined);
    setCustomerName(undefined);
    setStarPointsId(undefined);
    setDiscountType('None');
  };

  const handlePrint = () => {
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
    handleVoid();
  };

  const handleCustomerInfo = () => {
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

  const handleDiscountChange = (discountType: DiscountType) => {
    setDiscountType(discountType);
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

  // Calculate star points: 1 point per 200 PHP
  useEffect(() => {
    const totals = calculateTotals(cartItems, discountType, customDiscountValue);
    setStarPointsEarned(Math.floor(totals.total / 200));
  }, [cartItems, discountType, customDiscountValue]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', p: 1.5, bgcolor: 'background.default' }}>
      {/* Top Bar */}
      <Grid container spacing={1.5} sx={{ mb: 1.5, height: '85px' }}>
        {/* Header Section - 1/3 width */}
        <Grid item xs={4}>
          <Paper elevation={2} sx={{ height: '100%', overflow: 'hidden' }}>
            <Header />
          </Paper>
        </Grid>
        {/* Transaction Info Section - 2/3 width */}
        <Grid item xs={8}>
          <Paper elevation={2} sx={{ height: '100%', overflow: 'hidden' }}>
            <TransactionInfo />
          </Paper>
        </Grid>
      </Grid>

      {/* Main Content Area */}
      <Grid container spacing={1.5} sx={{ flexGrow: 1 }}>
        {/* Function Keys */}
        <Grid item xs={2}>
          <Paper elevation={2} sx={{ height: '100%', overflow: 'hidden' }}>
            <FunctionKeys />
          </Paper>
        </Grid>
        {/* Cart Section */}
        <Grid item xs={7}>
          <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Cart items={cartItems} setItems={setCartItems} />
          </Paper>
        </Grid>
        {/* Right Side - Transaction Summary & Action Buttons */}
        <Grid item xs={3}>
          <Grid container direction="column" spacing={1.5} sx={{ height: '100%' }}>
            <Grid item xs>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <TransactionSummary
                  transactionId={transactionId}
                  customerId={customerId}
                  customerName={customerName}
                  starPointsId={starPointsId}
                  subtotal={subtotal}
                  discountType={discountType as DiscountType}
                  discountAmount={discountAmount}
                  discountedSubtotal={discountedSubtotal}
                  vat={vat}
                  total={total}
                  customValue={customDiscountValue}
                  onDiscountChange={handleDiscountChange}
                  currentDiscount={discountType as DiscountType}
                />
              </Paper>
            </Grid>
            <Grid item>
              <Paper elevation={2} sx={{ p: 2 }}>
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

      {/* Dialogs and DevTools */}
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
      <CheckoutDialog
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems.map(cartItemToReceiptItem)}
        subtotal={subtotal}
        discountType={discountType}
        discountAmount={discountAmount}
        discountedSubtotal={discountedSubtotal}
        vat={vat}
        total={total}
        starPointsEarned={starPointsEarned}
        onCheckout={handleCheckoutComplete}
        onClearCart={() => setCartItems([])}
      />
    </Box>
  );
};

export default POSPage;
