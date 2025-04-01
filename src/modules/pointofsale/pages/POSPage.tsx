import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { useAuth } from '../../auth/contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { useNotification } from '../contexts/NotificationContext';
import axios from 'axios';

// Import components
import Header from '../layout/Header';
import FunctionKeys from '../components/FuntionKeys/FunctionKeys';
import Cart from '../components/Cart/Cart';
import ActionButtons from '../components/ActionButtons/ActionButtons';
import TransactionSummary from '../components/TransactionSummary/TransactionSummary';
import { AddItemDialog } from '../components/Cart/addItem/AddItemDialog';
import { ManualStockDialog } from '../components/Cart/manualStock/ManualStockDialog';
import RecallTransaction from '../components/FuntionKeys/dialogs/RecallTransaction';
import { CheckoutDialog } from '../components/ActionButtons/checkout/CheckoutDialog';
import Recent from '../components/Cart/Recent';
import NewTransaction from '../components/FuntionKeys/dialogs/NewTransaction';
// Import types and utilities
import { CartItem } from '../types/cart';
import { DiscountType } from '../types/discount';
import { calculateTotals } from '../utils/calculations';

interface Customer {
  name: string;
  card_id: string;
  points_balance: number;
}

interface PaymentDetails {
  paymentMethod: string;
  amountTendered: number;
  change?: number;
  discountIdNumber?: string;
  referenceNumber?: string;
}

const POSPage: React.FC = () => {
  const { logout, currentSession, user } = useAuth();
  const { showNotification } = useNotification();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentTransactionId, setCurrentTransactionId] = useState<string>('');
  const [discountType, setDiscountType] = useState<DiscountType>('None');
  const [customDiscountValue, setCustomDiscountValue] = useState<number>();
  const [branchId] = useState<number>(1);
  const [defaultQuantity, setDefaultQuantity] = useState(1);
  const [openAddItem, setOpenAddItem] = useState(false);
  const [openManualStock, setOpenManualStock] = useState(false);
  const [lastKeyPressTime, setLastKeyPressTime] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [customerName, setCustomerName] = useState<string>('Walk-in Customer');
  const [starPointsId, setStarPointsId] = useState<string | null>(null);
  const [currentInvoiceNumber, setCurrentInvoiceNumber] = useState<string>('');
  const [customerData, setCustomerData] = useState<{
    name: string;
    starPointsId: string;
    pointsBalance: number;
  }>({
    name: 'Walk-in Customer',
    starPointsId: '001',
    pointsBalance: 0
  });
  const [openCheckout, setOpenCheckout] = useState(false);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [recentItem, setRecentItem] = useState<CartItem | null>(null);
  const [openNewTransaction, setOpenNewTransaction] = useState(false);

  const {
    subtotal,
    discountAmount,
    discountedSubtotal,
    vat,
    total
  } = calculateTotals(cartItems, discountType, customDiscountValue, pointsUsed);

  const handleDiscountChange = (type: DiscountType, amount?: number, points?: number) => {
    console.log('POSPage handling discount change:', {
      type,
      amount,
      points,
      previousDiscount: discountType,
      subtotal
    });
    setDiscountType(type);
    setCustomDiscountValue(amount);
    setPointsUsed(points || 0);
  };

  const handleVoid = () => {
    setCartItems([]);
    setDiscountType('None');
    setCustomDiscountValue(undefined);
  };

  const handleRecallTransaction = (items: CartItem[]) => {
    setCartItems(items);
    showNotification('Transaction recalled successfully', 'success');
  };

  const handleAddProduct = (product: CartItem) => {
    const newItems = [...cartItems];
    const existingItemIndex = newItems.findIndex(item => item.id === product.id);

    // Calculate the new quantity considering existing items
    let newQuantity = product.quantity;
    let stockLimited = false;

    if (existingItemIndex > -1) {
      const totalQuantity = newItems[existingItemIndex].quantity + product.quantity;
      if (totalQuantity > product.stock) {
        newQuantity = product.stock - newItems[existingItemIndex].quantity;
        stockLimited = true;
        if (newQuantity <= 0) {
          showNotification('Maximum stock already in cart', 'error');
          return;
        }
      }
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + newQuantity
      };
    } else {
      if (product.quantity > product.stock) {
        newQuantity = product.stock;
        stockLimited = true;
      }
      newItems.push({ ...product, quantity: newQuantity });
    }

    setCartItems(newItems);
    setRecentItem({ ...product, quantity: newQuantity });
    
    if (stockLimited) {
      showNotification(
        `Added ${newQuantity}x ${product.name} to cart (limited by available stock: ${product.stock})`,
        'warning'
      );
    } else {
      showNotification(
        `Added ${newQuantity}x ${product.name} to cart`,
        'success'
      );
    }
    
    setDefaultQuantity(1);
  };

  const handleRemoveItem = (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleEditQuantity = (updatedItem: CartItem) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    );
    
    console.log('Cart item quantity updated:', {
      itemId: updatedItem.id,
      newQuantity: updatedItem.quantity,
      newSubtotal: updatedItem.subtotal
    });
    
    showNotification(
      `Updated ${updatedItem.name} quantity to ${updatedItem.quantity}`, 
      'success'
    );
  };

  const handleCheckout = async (paymentDetails: PaymentDetails) => {
    if (!currentSession?.salesSessionId) {
      showNotification('No active sales session', 'error');
      return;
    }

    try {
      const response = await axios.post('/api/pos/transactions', {
        branchId: currentSession.branchId,
        salesSessionId: currentSession.salesSessionId,
        pharmacistSessionId: currentSession.pharmacistSessionId,
        customerName: customerData.name,
        starPointsId: customerData.starPointsId,
        discountType,
        discountAmount,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity
        })),
        subtotal,
        discountedSubtotal,
        vat,
        total,
        pointsUsed,
        ...paymentDetails
      }, { withCredentials: true });

      if (response.data.success) {
        setCurrentTransactionId(response.data.invoiceNumber);
        setCartItems([]);
        setDiscountType('None');
        setCustomDiscountValue(undefined);
        setPointsUsed(0);
        setCurrentInvoiceNumber('');
        setCustomerData({
          name: 'Walk-in Customer',
          starPointsId: '001',
          pointsBalance: 0
        });
        showNotification('Transaction completed successfully', 'success');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showNotification('Failed to process payment', 'error');
    }
  };

  const handleNewTransaction = () => {
    // Clear cart items
    setCartItems([]);
    
    // Reset recent item
    setRecentItem(null);
    
    // Reset customer data
    setCustomerData({
      name: 'Walk-in Customer',
      starPointsId: '001',
      pointsBalance: 0
    });
    
    // Reset discount
    setDiscountType('None');
    setCustomDiscountValue(undefined);
    setPointsUsed(0);
    
    // Reset invoice number (if needed)
    setCurrentInvoiceNumber('');
  };

  useEffect(() => {
    console.log('POSPage Current Session:', currentSession);
    console.log('POSPage User Data:', user);

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore key events in input fields
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Tab key for manual stock
      if (event.key === 'Tab') {
        event.preventDefault();
        setOpenManualStock(true);
        return;
      }

      // Any character key for add item
      if (
        event.key.length === 1 && 
        !event.ctrlKey && 
        !event.altKey && 
        !event.metaKey
      ) {
        const now = Date.now();
        // Prevent multiple triggers within 100ms
        if (now - lastKeyPressTime > 100) {
          setOpenAddItem(true);
          setLastKeyPressTime(now);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lastKeyPressTime, currentSession, user]);

  useEffect(() => {
    if (cartItems.length > 0 && !currentInvoiceNumber) {
      generateInvoiceNumber();
    } else if (cartItems.length === 0) {
      setCurrentInvoiceNumber(''); // Reset invoice number when cart is empty
    }
  }, [cartItems.length, currentSession]);

  const generateInvoiceNumber = async () => {
    if (!currentSession?.branchId) return;
    
    try {
      const response = await axios.get('/api/pos/generate-invoice-number', {
        params: { branchId: currentSession.branchId }
      });
      setCurrentInvoiceNumber(response.data.invoiceNumber);
      console.log('Generated invoice number:', response.data.invoiceNumber);
    } catch (error) {
      console.error('Error generating invoice number:', error);
      showNotification('Error generating invoice number', 'error');
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    console.log('Selected customer:', customer);
    setCustomerData({
      name: customer.name || 'Walk-in Customer',
      starPointsId: customer.card_id || '001',
      pointsBalance: customer.points_balance || 0
    });
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      p: 1.5, 
      bgcolor: 'background.default',
      overflow: 'hidden'
    }}>
      {/* Header Section */}
      <Grid container spacing={1.5} sx={{ mb: 1.5, height: '85px', flexShrink: 0 }}>
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ height: '100%', overflow: 'hidden' }}>
            <Header />
          </Paper>
        </Grid>
      </Grid>

      {/* Main Content Area */}
      <Grid 
        container 
        spacing={1.5} 
        sx={{ 
          flexGrow: 1,
          minHeight: 0,
          height: 'calc(100% - 85px - 12px)'
        }}
      >
        {/* Function Keys */}
        <Grid item xs={2} sx={{ height: '100%' }}>
          <Paper elevation={2} sx={{ height: '100%', overflow: 'hidden' }}>
            <FunctionKeys 
              onAddProduct={handleAddProduct}
              currentItems={cartItems}
              currentTotal={total}
              branchId={branchId}
              onRecallTransaction={handleRecallTransaction}
              onHoldSuccess={() => setCartItems([])}
              handleNewTransaction={handleNewTransaction}
            />
          </Paper>
        </Grid>

        {/* Cart Section */}
        <Grid item xs={7} sx={{ height: '100%' }}>
          <Grid container spacing={1.5} sx={{ height: '100%' }}>
            <Grid item xs={12} sx={{ height: '70%' }}>
              <Paper 
                elevation={2} 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                <Cart
                  items={cartItems}
                  onRemoveItem={handleRemoveItem}
                  onEditQuantity={handleEditQuantity}
                  branchId={branchId}
                />
              </Paper>
            </Grid>

            {/* Recent Section */}
            <Grid item xs={12} sx={{ height: '30%' }}>
              <Paper 
                elevation={2} 
                sx={{ 
                  height: '100%',
                  overflow: 'hidden'
                }}
              >
                <Recent item={recentItem} />
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Side - Transaction Summary & Action Buttons */}
        <Grid item xs={3} sx={{ height: '100%' }}>
          <Grid 
            container 
            direction="column" 
            spacing={1.5} 
            sx={{ 
              height: '100%',
              minHeight: 0
            }}
          >
            <Grid item xs sx={{ minHeight: 0 }}>
              <Paper elevation={2} sx={{ height: '100%', overflow: 'hidden' }}>
                <TransactionSummary
                  invoiceNumber={currentInvoiceNumber}
                  customerName={customerData.name}
                  starPointsId={customerData.starPointsId}
                  subtotal={subtotal}
                  pointsEarned={subtotal / 200}
                  discountType={discountType}
                  discountAmount={discountAmount}
                  total={total}
                  branchCode={currentSession?.branchCode || ''}
                  pointsBalance={customerData.pointsBalance}
                  pointsUsed={pointsUsed}
                />
              </Paper>
            </Grid>
            <Grid item sx={{ flexShrink: 0 }}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <ActionButtons
                  onVoid={handleVoid}
                  isCartEmpty={cartItems.length === 0}
                  currentDiscount={discountType}
                  items={cartItems}
                  subtotal={subtotal}
                  discountAmount={discountAmount}
                  discountedSubtotal={discountedSubtotal}
                  vat={vat}
                  total={total}
                  onDiscount={handleDiscountChange}
                  onCheckout={handleCheckout}
                  onCustomerSelect={handleCustomerSelect}
                  customerName={customerData.name}
                  starPointsId={customerData.starPointsId}
                  pointsBalance={customerData.pointsBalance}
                />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <AddItemDialog
        open={openAddItem}
        onClose={() => setOpenAddItem(false)}
        onAddProduct={handleAddProduct}
        branchId={branchId}
        defaultQuantity={defaultQuantity}
      />

      <ManualStockDialog
        open={openManualStock}
        onClose={() => setOpenManualStock(false)}
        onSetQuantity={(quantity) => {
          setDefaultQuantity(quantity);
          showNotification(`Default quantity set to ${quantity}`, 'success');
        }}
      />

      <CheckoutDialog
        open={openCheckout}
        onClose={() => setOpenCheckout(false)}
        items={cartItems}
        subtotal={subtotal}
        discountType={discountType}
        discountAmount={discountAmount}
        discountedSubtotal={discountedSubtotal}
        vat={vat}
        total={total}
        customerName={customerData.name}
        starPointsId={customerData.starPointsId}
        pointsBalance={customerData.pointsBalance}
        onCustomerSelect={(customer: Customer) => {
          setCustomerData({
            name: customer.name || 'Walk-in Customer',
            starPointsId: customer.card_id || '001',
            pointsBalance: customer.points_balance || 0
          });
        }}
        onCheckout={handleCheckout}
      />

      <NewTransaction
        open={openNewTransaction}
        onClose={() => setOpenNewTransaction(false)}
        currentItems={cartItems}
        onNewTransaction={handleNewTransaction}
      />
    </Box>
  );
};


const POSPageWrapper: React.FC = () => {
  return (
    <NotificationProvider>
      <POSPage />
    </NotificationProvider>
  );
};

export default POSPageWrapper;

