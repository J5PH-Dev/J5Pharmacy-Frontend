import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { format } from 'date-fns';
import { Snackbar, Alert, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, List, ListItem, ListItemText, IconButton, Typography, Chip, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

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

// Import types and utilities
import { CartItem } from '../types/cart';
import { DiscountType } from '../components/TransactionSummary/types';
import { calculateTotals } from '../utils/calculations';
import { cartItemToReceiptItem } from '../utils/mappers';
import { HeldTransaction } from '../types/transaction';
import { sampleItems } from '../../../devtools/sampleData';

const generateTransactionId = (branchId: string = 'B001'): string => {
  const now = new Date();
  const dateStr = format(now, 'yyMMdd');
  // In a real application, this number would come from a database or counter service
  const sequenceNumber = '00001';
  return `${branchId}-${dateStr}-${sequenceNumber}`;
};

const POSPage: React.FC = () => {
  const { logout } = useAuth();
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
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'warning' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [manualSearchOpen, setManualSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CartItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const {
    subtotal,
    discountAmount,
    discountedSubtotal,
    vat,
    total
  } = calculateTotals(cartItems, discountType, customDiscountValue);

  const showMessage = (message: string, severity: 'success' | 'warning' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
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

    if (existingItemIndex > -1) {
      // Update existing item quantity
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + (product.quantity || 1)
      };
    } else {
      // Add new item with its quantity
      newItems.push({ ...product, quantity: product.quantity || 1 });
    }

    setCartItems(newItems);
  };

  const handleRecallTransaction = (transaction: HeldTransaction) => {
    setCartItems(transaction.items);
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
    if (searchResults.length === 0) return;

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
        if (searchResults.length > 0) {
          handleProductSelect(searchResults[selectedIndex]);
        } else {
          showMessage('Product not found', 'error');
          setManualSearchOpen(false);
          setSearchQuery('');
          setSearchResults([]);
        }
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

  // Handle product selection from search
  const handleProductSelect = (product: CartItem) => {
    handleAddProduct({ ...product, quantity: 1 });
    setManualSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedIndex(0);
    showMessage(`Added ${product.name} to cart`, 'success');
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
              onRecallTransaction={handleRecallTransaction}
              isCheckoutOpen={isCheckoutOpen}
              onManualSearchOpen={() => setManualSearchOpen(true)}
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
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          top: '24px !important',
          '& .MuiPaper-root': {
            minWidth: '400px',
            fontSize: '1.1rem'
          }
        }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: '1.1rem',
              padding: '8px 0'
            },
            '& .MuiAlert-icon': {
              fontSize: '2rem'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

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
                            {product.category} • {product.dosage_amount}{product.dosage_unit}
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
    </Box>
  );
};

export default POSPage;
