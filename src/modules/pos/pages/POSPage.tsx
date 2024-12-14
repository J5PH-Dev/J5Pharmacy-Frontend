import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { format } from 'date-fns';
import { Snackbar, Alert, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, List, ListItem, ListItemText, IconButton, Typography, Chip, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

// Import auth context
import { useAuth } from '../../../modules/auth/contexts/AuthContext';

// Import POS components
import Header from '../components/Header';
import FunctionKeys from '../components/FunctionKeys';
import Cart from '../components/Cart';
import ActionButtons from '../../../core/components/ActionButtons';
import DiscountDialog from '../components/DiscountDialog';
import TransactionSummary from '../components/TransactionSummary/TransactionSummary';
import { CheckoutDialog } from '../components/CheckoutDialog/CheckoutDialog';
import DevTools from '../../../devtools/DevTools';
import HeldTransactionsDialog from '../components/FunctionKeys/dialogs/HeldTransactionsDialog';
import QuantityDialog from '../components/FunctionKeys/dialogs/QuantityDialog';
import NotificationStack, { Notification } from '../components/NotificationStack/NotificationStack';
import HoldTransactionDialog from '../components/FunctionKeys/dialogs/HoldTransactionDialog';
import { ProcessReturnDialog } from '../components/FunctionKeys/dialogs/ProcessReturnDialog';

// Import types and utilities
import { CartItem } from '../types/cart';
import { DiscountType } from '../components/TransactionSummary/types';
import { calculateTotals } from '../utils/calculations';
import { cartItemToReceiptItem } from '../utils/mappers';
import { HeldTransaction, Transaction } from '../types/transaction';
import { sampleItems } from '../../../devtools/sampleData';
import { generateTransactionId } from '../utils/transactionManager';
import { devStorage } from '../../../devtools/storage';

const POSPage: React.FC = () => {
  const { logout } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentTransactionId, setCurrentTransactionId] = useState<string>(generateTransactionId());
  const [customerId, setCustomerId] = useState<string>();
  const [customerName, setCustomerName] = useState<string>();
  const [starPointsId, setStarPointsId] = useState<string>();
  const [discountType, setDiscountType] = useState<DiscountType>('None');
  const [heldTransactions, setHeldTransactions] = useState<HeldTransaction[]>([]);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [customDiscountValue, setCustomDiscountValue] = useState<number>();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [starPointsEarned, setStarPointsEarned] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [manualSearchOpen, setManualSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CartItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isRecallDialogOpen, setIsRecallDialogOpen] = useState(false);
  const [preSelectedQuantity, setPreSelectedQuantity] = useState<number>(1);
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);
  const [barcodeBuffer, setBarcodeBuffer] = useState<string>('');
  const [lastKeyTime, setLastKeyTime] = useState<number>(0);
  const [isHoldDialogOpen, setIsHoldDialogOpen] = useState(false);
  const [isProcessReturnDialogOpen, setIsProcessReturnDialogOpen] = useState(false);

  const {
    subtotal,
    discountAmount,
    discountedSubtotal,
    vat,
    total
  } = calculateTotals(cartItems, discountType, customDiscountValue);

  const showMessage = (message: string, severity: 'success' | 'warning' | 'error' | 'info') => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      message,
      severity,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleNotificationClose = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const handleDiscountClick = () => {
    setDiscountDialogOpen(true);
  };

  const handleDiscountSelect = (type: DiscountType, customValue?: number) => {
    setDiscountType(type);
    setCustomDiscountValue(customValue);
    setDiscountDialogOpen(false);
  };

  const handleDiscountChange = (type: DiscountType) => {
    setDiscountType(type);
  };

  const handleCustomerInfo = () => {
    // TODO: Implement customer info dialog
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handleCheckoutComplete = () => {
    // Update stock levels
    cartItems.forEach(cartItem => {
      const itemIndex = sampleItems.findIndex(item => item.id === cartItem.id);
      if (itemIndex !== -1) {
        sampleItems[itemIndex] = {
          ...sampleItems[itemIndex],
          stock: sampleItems[itemIndex].stock - cartItem.quantity
        };
      }
    });

    // Save the completed transaction
    const completedTransaction: Transaction = {
      id: currentTransactionId,
      items: cartItems,
      timestamp: new Date().toISOString(),
      total: total,
      subtotal: subtotal,
      discountType: discountType,
      discountAmount: discountAmount,
      vat: vat,
      prescriptionRequired: cartItems.some(item => item.requiresPrescription),
      prescriptionVerified: false,
      customerId,
      customerName,
      starPointsId,
      starPointsEarned
    };
    
    devStorage.saveTransaction(completedTransaction);
    showMessage('Transaction completed successfully', 'success');

    // Generate new transaction ID for next transaction
    setCurrentTransactionId(generateTransactionId());
    
    // Clear the cart and reset all states
    setCartItems([]);
    setDiscountType('None');
    setCustomDiscountValue(undefined);
    setCustomerId(undefined);
    setCustomerName(undefined);
    setStarPointsId(undefined);
    setIsCheckoutOpen(false);
  };

  const handleVoid = () => {
    setCartItems([]);
    setDiscountType('None');
    setCustomDiscountValue(undefined);
  };

  const handlePrint = () => {
    // TODO: Implement receipt printing
    console.log('Printing receipt...');
  };

  const handleAddSampleItems = (items: CartItem[]) => {
    // Add items with their quantities to the cart
    const newItems = items.map(item => ({
      ...item,
      quantity: item.quantity || 1 // Ensure quantity is at least 1
    }));
    setCartItems([...cartItems, ...newItems]);
  };

  const handleAddProduct = (product: CartItem) => {
    const newItems = [...cartItems];
    const existingItemIndex = newItems.findIndex(item => item.id === product.id);

    // Check if adding this quantity would exceed available stock
    const requestedQuantity = product.quantity || 1;
    const existingQuantity = existingItemIndex > -1 ? newItems[existingItemIndex].quantity : 0;
    const totalRequestedQuantity = existingQuantity + requestedQuantity;

    if (totalRequestedQuantity > product.stock) {
      showMessage(
        product.stock === 0 
          ? `${product.name} is out of stock`
          : `Cannot add ${requestedQuantity} units. Only ${product.stock - existingQuantity} units available.`,
        'error'
      );
      return;
    }

    if (existingItemIndex > -1) {
      // Update existing item quantity
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: totalRequestedQuantity
      };
    } else {
      // Add new item with its quantity
      newItems.push({ ...product, quantity: requestedQuantity });
    }

    setCartItems(newItems);
    showMessage(`Added ${requestedQuantity}x ${product.name} to cart`, 'success');
  };

  const handleHoldTransaction = (note: string) => {
    const timestamp = new Date().toISOString();
    const transaction: HeldTransaction = {
      id: `HOLD-${Date.now()}`,
      items: cartItems,
      total: total,
      timestamp: timestamp,
      holdTimestamp: timestamp,
      status: 'held',
      prescriptionRequired: cartItems.some(item => item.requiresPrescription),
      prescriptionVerified: false,
      discountType: discountType,
      holdReason: note,
      customerId,
      customerName,
      starPointsId
    };

    setHeldTransactions(prev => [...prev, transaction]);
    setCartItems([]);
    setDiscountType('None');
    setCustomDiscountValue(undefined);
    setCustomerId(undefined);
    setCustomerName(undefined);
    setStarPointsId(undefined);
    showMessage('Transaction held successfully', 'success');
  };

  const handleRecallTransaction = (transaction: HeldTransaction) => {
    // Check if cart is not empty
    if (cartItems.length > 0) {
      showMessage('Please clear the current cart before recalling a transaction', 'error');
      return;
    }

    // Set cart items from held transaction
    setCartItems(transaction.items);
    setDiscountType(transaction.discountType);
    if (transaction.customerId) setCustomerId(transaction.customerId);
    if (transaction.customerName) setCustomerName(transaction.customerName);
    if (transaction.starPointsId) setStarPointsId(transaction.starPointsId);

    // Remove the transaction from held transactions
    setHeldTransactions(prev => prev.filter(t => t.id !== transaction.id));
    setIsRecallDialogOpen(false);
    showMessage('Transaction recalled successfully', 'success');
  };

  useEffect(() => {
    const totals = calculateTotals(cartItems, discountType, customDiscountValue);
    setStarPointsEarned(Math.floor(totals.total / 200));
  }, [cartItems, discountType, customDiscountValue]);

  // Reset selected index when search results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  // Update global keyboard handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if the event originated from an input element
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        setIsQuantityDialogOpen(true);
      } else if (event.key === 'F10') {
        event.preventDefault();
        if (!isCheckoutOpen && cartItems.length > 0) {
          handleCheckout();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartItems.length, isCheckoutOpen]);

  const handleQuantityConfirm = (quantity: number) => {
    setPreSelectedQuantity(quantity);
    showMessage(`Pre-selected quantity set to ${quantity}`, 'info');
  };

  // Handle manual search
  const handleManualSearch = (query: string) => {
    setSearchQuery(query);
    
    // Close dialog if query is empty
    if (!query) {
      setManualSearchOpen(false);
      setSearchResults([]);
      return;
    }

    if (query.length >= 3) {
      const results = sampleItems.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        (item.barcode?.toLowerCase() || '').includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // Handle keyboard navigation in search
  const handleSearchKeyDown = (event: React.KeyboardEvent) => {
    if (searchResults.length === 0) {
      if (event.key === 'Enter') {
        const query = searchQuery;
        // Show notification for any non-empty query that could be a barcode
        // Allow any character except spaces and control characters
        if (query && /^[^\s]+$/.test(query)) {
          showMessage(`No product found with barcode: ${query}`, 'error');
        }
        setManualSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => (prev + 1) % searchResults.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
        break;
      case 'Enter':
        event.preventDefault();
        handleProductSelect(searchResults[selectedIndex]);
        break;
      case 'Backspace':
        if (searchQuery.length <= 1) {
          setManualSearchOpen(false);
          setSearchQuery('');
          setSearchResults([]);
        }
        break;
    }
  };

  // Update handleProductSelect
  const handleProductSelect = (product: CartItem) => {
    const quantity = preSelectedQuantity;
    
    // Check stock before adding
    if (quantity > product.stock) {
      showMessage(
        product.stock === 0 
          ? `${product.name} is out of stock`
          : `Cannot add ${quantity} units. Only ${product.stock} units available.`,
        'error'
      );
      return;
    }

    handleAddProduct({ ...product, quantity });
    setPreSelectedQuantity(1); // Reset to 1 after adding
    setManualSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedIndex(0);
  };

  // Add barcode scanning handler
  useEffect(() => {
    const BARCODE_SCAN_TIMEOUT = 50; // ms between keystrokes for barcode scanner

    const handleBarcodeScanner = (event: KeyboardEvent) => {
      // Skip if the event originated from an input element
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const currentTime = Date.now();
      
      // If it's a rapid keystroke (likely from scanner)
      if (currentTime - lastKeyTime < BARCODE_SCAN_TIMEOUT) {
        if (event.key === 'Enter' && barcodeBuffer) {
          // Search for product with this barcode
          const product = sampleItems.find(item => item.barcode === barcodeBuffer);
          if (product) {
            handleAddProduct({ ...product, quantity: preSelectedQuantity });
            showMessage(`Added ${preSelectedQuantity}x ${product.name} to cart`, 'success');
          } else {
            showMessage(`No product found with barcode: ${barcodeBuffer}`, 'error');
          }
          setBarcodeBuffer('');
        } else if (event.key.length === 1 && /[^\s]/.test(event.key)) { // Accept any character except spaces
          setBarcodeBuffer(prev => prev + event.key);
        }
      } else if (event.key.length === 1 && /[^\s]/.test(event.key)) { // Start new barcode with any character except spaces
        setBarcodeBuffer(event.key);
      }
      
      setLastKeyTime(currentTime);
    };

    window.addEventListener('keydown', handleBarcodeScanner);
    return () => window.removeEventListener('keydown', handleBarcodeScanner);
  }, [barcodeBuffer, lastKeyTime, preSelectedQuantity, handleAddProduct, showMessage]);

  // Update FunctionKeys props to include setHoldDialogOpen
  const handleHoldClick = () => {
    if (cartItems.length === 0) {
      showMessage('Cannot hold an empty transaction', 'error');
      return;
    }
    setIsHoldDialogOpen(true);
  };

  // Add handler for processing returns
  const handleProcessReturn = (transaction: Transaction) => {
    // TODO: Implement return processing logic
    showMessage(`Processing return for invoice ${transaction.id}`, 'info');
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
      {/* Top Bar */}
      <Grid container spacing={1.5} sx={{ mb: 1.5, height: '85px', flexShrink: 0 }}>
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ height: '100%', overflow: 'hidden', position: 'relative' }}>
            <Header />
            {preSelectedQuantity > 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  py: 0.5,
                  px: 1.5,
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <Tooltip title="Pre-selected quantity (Press Tab to change)">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalOfferIcon />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                      x{preSelectedQuantity}
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            )}
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
              onLogout={logout}
              onAddProduct={handleAddProduct}
              currentItems={cartItems}
              currentTotal={total}
              cartState={{
                items: cartItems,
                totals: {
                  subtotal,
                  totalDiscount: discountAmount,
                  total,
                  itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
                },
                prescriptionRequired: cartItems.some(item => item.requiresPrescription),
                prescriptionVerified: false
              }}
              onClearCart={handleVoid}
              onHoldTransaction={handleHoldClick}
              onRecallTransaction={handleRecallTransaction}
              isCheckoutOpen={isCheckoutOpen}
              onManualSearchOpen={() => setManualSearchOpen(true)}
              setRecallDialogOpen={setIsRecallDialogOpen}
              setHoldDialogOpen={setIsHoldDialogOpen}
              setProcessReturnDialogOpen={setIsProcessReturnDialogOpen}
            />
          </Paper>
        </Grid>
        {/* Cart Section */}
        <Grid item xs={7} sx={{ height: '100%' }}>
          <Paper 
            elevation={2} 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <Cart items={cartItems} setItems={setCartItems} />
          </Paper>
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
                  transactionId={currentTransactionId}
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
            <Grid item sx={{ flexShrink: 0 }}>
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
        onResetInvoice={() => {
          setCurrentTransactionId(generateTransactionId());
          showMessage('Invoice number has been reset', 'success');
        }}
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
      <NotificationStack
        notifications={notifications}
        onClose={handleNotificationClose}
      />

      {/* Manual Search Dialog */}
      <Dialog 
        open={manualSearchOpen} 
        onClose={() => {
          setManualSearchOpen(false);
          setSearchQuery('');
          setSearchResults([]);
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <SearchIcon />
              <Typography variant="h6">Product Search</Typography>
            </Box>
            <IconButton 
              onClick={() => {
                setManualSearchOpen(false);
                setSearchQuery('');
                setSearchResults([]);
              }} 
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            alignItems: 'center',
            bgcolor: 'info.light',
            color: 'info.contrastText',
            p: 1,
            borderRadius: 1,
            mb: 2
          }}>
            <Typography variant="body2" sx={{ display: 'flex', gap: 2 }}>
              <span><strong>↑↓</strong> Navigate</span>
              <span><strong>Enter</strong> Select</span>
              <span><strong>Backspace</strong> Clear</span>
              <span><strong>Type</strong> Search</span>
            </Typography>
          </Box>

          <TextField
            autoFocus
            margin="dense"
            placeholder="Search by name or barcode..."
            fullWidth
            value={searchQuery}
            onChange={(e) => handleManualSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: { fontSize: '1.1rem' }
            }}
          />

          {searchQuery.length > 0 && (
            <Box sx={{ mt: 2, mb: 1 }}>
              {searchQuery.length < 3 ? (
                <Typography 
                  variant="body2" 
                  color="warning.main"
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}
                >
                  Please enter at least 3 characters to search
                  ({3 - searchQuery.length} more to go)
                </Typography>
              ) : searchResults.length === 0 ? (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}
                >
                  No products found
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          <List>
            {searchResults.map((product, index) => (
              <ListItem 
                key={product.barcode} 
                button
                onClick={() => handleProductSelect(product)}
                divider
                selected={index === selectedIndex}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                    '& .MuiTypography-root': {
                      color: theme => theme.palette.primary.contrastText
                    },
                    '& .MuiChip-root': {
                      borderColor: theme => theme.palette.primary.contrastText,
                      color: theme => theme.palette.primary.contrastText
                    },
                    '& .MuiListItemText-secondary .MuiTypography-root': {
                      color: theme => theme.palette.primary.contrastText
                    }
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6" sx={{ fontSize: '1.3rem' }}>{product.name}</Typography>
                      <Chip 
                        label={product.requiresPrescription ? 'Rx' : 'OTC'} 
                        size="small"
                        color={product.requiresPrescription ? 'error' : 'success'}
                        sx={{ fontSize: '1rem' }}
                      />
                      <Chip 
                        label={product.SKU}
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ fontSize: '1rem' }}
                      />
                      <Chip 
                        label={product.stock === 0 ? 'Out of Stock' : `Stock: ${product.stock}`}
                        size="small"
                        color={product.stock === 0 ? 'error' : 'success'}
                        variant={product.stock === 0 ? 'filled' : 'outlined'}
                        sx={{ 
                          fontSize: '1rem',
                          fontWeight: product.stock === 0 ? 'bold' : 'normal'
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mt: 1 
                      }}>
                        <Box>
                          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                            {product.category}  {product.dosage_amount}{product.dosage_unit}
                          </Typography>
                          {product.barcode && (
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, fontSize: '1.1rem' }}>
                              Barcode: {product.barcode}
                            </Typography>
                          )}
                        </Box>
                        <Typography 
                          variant="h6" 
                          color="primary.main" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '1.5rem',
                            ml: 2
                          }}
                        >
                          ₱{product.price.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setManualSearchOpen(false);
              setSearchQuery('');
              setSearchResults([]);
            }} 
            size="large"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Held Transactions Dialog */}
      <HeldTransactionsDialog
        open={isRecallDialogOpen}
        onClose={() => setIsRecallDialogOpen(false)}
        transactions={heldTransactions}
        onRecall={handleRecallTransaction}
      />

      {/* Add QuantityDialog */}
      <QuantityDialog
        open={isQuantityDialogOpen}
        onClose={() => setIsQuantityDialogOpen(false)}
        onConfirm={handleQuantityConfirm}
        currentQuantity={preSelectedQuantity}
      />

      {/* Add HoldTransactionDialog */}
      <HoldTransactionDialog
        open={isHoldDialogOpen}
        onClose={() => setIsHoldDialogOpen(false)}
        onConfirm={handleHoldTransaction}
      />

      {/* Add ProcessReturnDialog */}
      <ProcessReturnDialog
        open={isProcessReturnDialogOpen}
        onClose={() => setIsProcessReturnDialogOpen(false)}
        onProcessReturn={handleProcessReturn}
      />
    </Box>
  );
};

export default POSPage;
