import React, { useState, useEffect, useRef } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemText, Typography, Badge, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Snackbar, Alert, Paper, Popper, Fade, Chip, Backdrop, IconButton, Fab, Tabs, Tab, Divider } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PauseIcon from '@mui/icons-material/Pause';
import RestoreIcon from '@mui/icons-material/Restore';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import BookIcon from '@mui/icons-material/Book';
import CloseIcon from '@mui/icons-material/Close';
import HelpIcon from '@mui/icons-material/Help';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { ProductInquiryDialog } from '../Dialogs/ProductInquiryDialog';
import { RecallTransactionDialog } from '../Dialogs/RecallTransactionDialog';
import { AlertColor } from '@mui/material';

// Function key type definition
interface FunctionKey {
  key: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

// Styled components
const FunctionKeysContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
}));

const StyledList = styled(List)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1),
  flexGrow: 1,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.paper,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.primary.light,
    borderRadius: '4px',
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: 0,
  marginBottom: theme.spacing(0.75),
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  minHeight: '48px',
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  transition: theme.transitions.create(['background-color', 'transform', 'box-shadow'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(4px)',
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
    '& .MuiListItemText-primary': {
      color: theme.palette.primary.main,
    },
    '& .MuiListItemText-secondary': {
      color: theme.palette.primary.main,
      opacity: 0.8,
    },
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.main,
    }
  },
  '&:active': {
    transform: 'translateX(2px)',
    boxShadow: `0 1px 4px ${alpha(theme.palette.primary.main, 0.2)}`,
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
  },
  '& .MuiListItemText-primary': {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  '& .MuiListItemText-secondary': {
    color: theme.palette.text.secondary,
  },
  '& .MuiSvgIcon-root': {
    color: theme.palette.primary.main,
  }
}));

const KeyText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1rem',
  marginRight: theme.spacing(1),
  whiteSpace: 'nowrap',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: '1.3rem',
  },
}));

const ListItemContent = styled(ListItemText)(({ theme }) => ({
  margin: 0,
  '& .MuiListItemText-primary': {
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
  },
  '& .MuiListItemText-secondary': {
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

interface FunctionKeysProps {
  onLogout?: () => void;
  currentItems?: CartItem[];
  currentTotal?: number;
  onRecallTransaction?: (transaction: HeldTransaction) => void;
  onAddProduct?: (product: CartItem) => void;
  cartState?: CartState;
  onClearCart?: () => void;
  isCheckoutOpen?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`help-tabpanel-${index}`}
      aria-labelledby={`help-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const FunctionKeys: React.FC<FunctionKeysProps> = ({ 
  onLogout = () => console.log('Logout clicked'),
  currentItems = [],
  currentTotal = 0,
  onRecallTransaction,
  onAddProduct,
  cartState,
  onClearCart,
  isCheckoutOpen = false
}) => {
  const functionKeys: FunctionKey[] = [
    {
      key: 'F1',
      label: 'Product Inquiry',
      shortLabel: 'Inquiry',
      description: 'Search and view product information',
      icon: <SearchIcon />,
      action: handleSearchOpen,
    },
    {
      key: 'F2',
      label: 'New Transaction',
      shortLabel: 'New',
      description: 'Start a new transaction',
      icon: <AddIcon />,
      action: onNewTransaction,
    },
    {
      key: 'F3',
      label: 'Hold Transaction',
      shortLabel: 'Hold',
      description: 'Hold current transaction for later',
      icon: <PauseIcon />,
      action: onHoldTransaction,
    },
    {
      key: 'F4',
      label: 'Recall Transaction',
      shortLabel: 'Recall',
      description: 'Recall a held transaction',
      icon: <RestoreIcon />,
      action: onRecallTransactions,
      disabled: !hasHeldTransactions,
    },
    {
      key: 'F5',
      label: 'Prescription Book',
      shortLabel: 'Rx',
      description: 'Access prescription records',
      icon: <BookIcon />,
      action: () => {
        // TODO: Implement prescription book
        console.log('Prescription Book opened');
      },
    },
    {
      key: 'F6',
      label: 'Process Return',
      shortLabel: 'Return',
      description: 'Process a product return',
      icon: <AssignmentReturnIcon />,
      action: () => console.log('Return clicked'),
    },
    {
      key: 'F7',
      label: 'View Reports',
      shortLabel: 'Reports',
      description: 'Access sales and inventory reports',
      icon: <AssessmentIcon />,
      action: () => console.log('Reports clicked'),
    },
    {
      key: 'F8',
      label: 'System Settings',
      shortLabel: 'Settings',
      description: 'Configure system settings',
      icon: <SettingsIcon />,
      action: () => console.log('Settings clicked'),
    },
    {
      key: 'F9',
      label: 'Notifications',
      shortLabel: 'Notifications',
      description: 'View system notifications',
      icon: <Badge badgeContent={4} color="error"><NotificationsIcon /></Badge>,
      action: () => console.log('Notifications clicked')
    }
  ];

  // Reset selected index when search results change
  useEffect(() => {
    setSelectedIndex(0);
    setSelectedSKU('Box');
  }, [searchResults]);

  // Reset SKU when search is closed
  useEffect(() => {
    if (!showSearch) {
      setSelectedSKU('Box');
    }
  }, [showSearch]);

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      if (key === 'F12') {
        event.preventDefault();
        onLogout();
      } else {
        const functionKey = functionKeys.find(fk => fk.key === key);
        if (functionKey) {
          event.preventDefault();
          functionKey.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [functionKeys, onLogout]);

  const handleAddProduct = (product: CartItem) => {
    if (onAddProduct) {
      const quantity = preSelectQuantity || 1;
      const productWithQuantity = {
        ...product,
        quantity: quantity
      };
      onAddProduct(productWithQuantity);
      showMessage(`Added ${quantity}x ${product.name}`, 'success');
      setSearchBuffer('');
      setBarcodeBuffer('');
      setShowSearch(false);
      setSelectedIndex(0);
      setSelectedSKU('Box');
      setPreSelectQuantity(null);
    }
  };

  // Group products by name (combining Box and Piece variants)
  const groupSearchResults = (results: CartItem[]) => {
    const grouped = new Map<string, { box?: CartItem; piece?: CartItem }>();
    
    results.forEach(item => {
      const existing = grouped.get(item.name) || { box: undefined, piece: undefined };
      if (item.SKU === 'Box') {
        existing.box = item;
      } else {
        existing.piece = item;
      }
      grouped.set(item.name, existing);
    });

    return Array.from(grouped.values())
      .filter(group => group.box || group.piece) // Ensure at least one variant exists
      .map(group => ({
        name: (group.box || group.piece)!.name,
        category: (group.box || group.piece)!.category,
        requiresPrescription: (group.box || group.piece)!.requiresPrescription,
        variants: {
          box: group.box,
          piece: group.piece
        }
      }));
  };

  // Handle keyboard input for both barcode and manual search
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Disable keyboard input when dialogs are open or during checkout
      if (holdDialogOpen || showQuantityInput || newTransactionDialogOpen || productInquiryOpen || isCheckoutOpen) {
        if (event.key === 'Escape') {
          if (showQuantityInput) {
            setShowQuantityInput(false);
            setPreSelectQuantity(null);
          }
          if (holdDialogOpen) {
            setHoldDialogOpen(false);
          }
          if (newTransactionDialogOpen) {
            setNewTransactionDialogOpen(false);
          }
          if (productInquiryOpen) {
            setProductInquiryOpen(false);
          }
        }
        return;
      }

      // Handle Tab for quantity pre-selection
      if (event.key === 'Tab') {
        event.preventDefault();
        setShowQuantityInput(true);
        setTimeout(() => {
          if (quantityInputRef.current) {
            quantityInputRef.current.focus();
          }
        }, 100);
        return;
      }

      // Handle backspace
      if (event.key === 'Backspace') {
        event.preventDefault();
        const newSearchTerm = searchBuffer.slice(0, -1);
        setSearchBuffer(newSearchTerm);
        setBarcodeBuffer(prev => prev.slice(0, -1));
        
        if (newSearchTerm.length >= MIN_SEARCH_LENGTH) {
          const results = sampleItems.filter(item => 
            item.name.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
            item.barcode?.toLowerCase().includes(newSearchTerm.toLowerCase())
          );
          setSearchResults(results);
        } else {
          setShowSearch(false);
          setSearchResults([]);
          if (newSearchTerm.length < MIN_SEARCH_LENGTH) {
            setSearchBuffer('');
            setBarcodeBuffer('');
          }
        }
        return;
      }

      // Handle arrow keys for navigation
      if (showSearch && searchResults.length > 0) {
        const groupedResults = groupSearchResults(searchResults);
        
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            setSelectedIndex(prev => (prev + 1) % groupedResults.length);
            break;
          case 'ArrowUp':
            event.preventDefault();
            setSelectedIndex(prev => 
              prev - 1 < 0 ? groupedResults.length - 1 : prev - 1
            );
            break;
          case 'ArrowLeft':
          case 'ArrowRight':
            event.preventDefault();
            const currentGroup = groupedResults[selectedIndex];
            const newSKU = selectedSKU === 'Box' ? 'Piece' : 'Box';
            // Only switch if the variant exists
            if (currentGroup.variants[newSKU.toLowerCase() as 'box' | 'piece']) {
              setSelectedSKU(newSKU);
            }
            break;
          case 'Enter':
            event.preventDefault();
            const selectedGroup = groupedResults[selectedIndex];
            // Get the variant based on current selectedSKU
            const variant = selectedSKU === 'Box' ? 
              selectedGroup.variants.box : 
              selectedGroup.variants.piece;

            if (variant) {
              handleAddProduct({
                ...variant,
                quantity: preSelectQuantity || 1,
                SKU: selectedSKU // Ensure we use the selected SKU
              });
              setSearchBuffer('');
              setBarcodeBuffer('');
              setShowSearch(false);
              setSelectedIndex(0);
              setPreSelectQuantity(null);
              setSelectedSKU('Box'); // Reset SKU after adding
            } else {
              showMessage(`${selectedSKU} variant not available`, 'warning');
            }
            break;
        }
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      // Disable keyboard input when dialogs are open or during checkout
      if (holdDialogOpen || showQuantityInput || newTransactionDialogOpen || productInquiryOpen || isCheckoutOpen) {
        return;
      }

      // Clear timeout if it exists
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // If it's Enter, process the input
      if (event.key === 'Enter') {
        // If we're showing search results, handle in keyDown instead
        if (showSearch && searchResults.length > 0) {
          return;
        }

        // Process barcode
        if (barcodeBuffer.length >= 10) {
          // First try exact barcode match
          const exactProduct = sampleItems.find(item => item.barcode === barcodeBuffer);
          if (exactProduct) {
            handleAddProduct(exactProduct);
          } else {
            showMessage('Product not found', 'error');
          }
          setBarcodeBuffer('');
          setSearchBuffer('');
          setShowSearch(false);
        }
        return;
      }

      // Handle ESC key
      if (event.key === 'Escape') {
        setSearchBuffer('');
        setBarcodeBuffer('');
        setShowSearch(false);
        setSelectedIndex(0);
        return;
      }

      // Update both buffers
      const newChar = event.key;
      if (newChar.length === 1) { // Only single characters
        const newSearchTerm = searchBuffer + newChar;
        setBarcodeBuffer(prev => prev + newChar);
        setSearchBuffer(newSearchTerm);
        setShowSearch(true);
        
        // Set anchor element for Popper
        setAnchorEl(searchAnchorRef);

        // Search if we have minimum characters or it's a potential barcode
        if (newSearchTerm.length >= MIN_SEARCH_LENGTH) {
          const results = sampleItems.filter(item => 
            item.name.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
            (item.barcode && item.barcode.toLowerCase().includes(newSearchTerm.toLowerCase()))
          );
          setSearchResults(results);
        } else {
          setSearchResults([]);
        }
      }

      // Set a timeout to clear the barcode buffer
      timeoutId = setTimeout(() => {
        setBarcodeBuffer('');
      }, 100); // Adjust timeout as needed for barcode scanner speed
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keypress', handleKeyPress);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [holdDialogOpen, showQuantityInput, newTransactionDialogOpen, productInquiryOpen, isCheckoutOpen, searchBuffer, barcodeBuffer, showSearch, searchResults, selectedIndex, selectedSKU, preSelectQuantity, onAddProduct]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <>
      <FunctionKeysContainer>
        <StyledList>
          {functionKeys.map((fk) => (
            <StyledListItem key={fk.key}>
              <StyledListItemButton 
                onClick={fk.action}
                disabled={fk.disabled}
                sx={{
                  ...(fk.disabled && {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                    '&:hover': {
                      backgroundColor: 'inherit',
                      transform: 'none',
                      boxShadow: 'none',
                    },
                  })
                }}
              >
                <IconWrapper>
                  {fk.icon}
                </IconWrapper>
                <ListItemContent
                  primary={
                    <Box display="flex" alignItems="center">
                      <KeyText>{fk.key}</KeyText>
                      <Typography variant="body2" noWrap>
                        {isCompact ? fk.shortLabel : fk.label}
                      </Typography>
                    </Box>
                  }
                  secondary={!isCompact ? fk.description : undefined}
                />
              </StyledListItemButton>
            </StyledListItem>
          ))}
        </StyledList>

        {/* Hold Dialog */}
        <Dialog 
          open={holdDialogOpen} 
          onClose={() => setHoldDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PauseIcon />
              Hold Transaction
            </Box>
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Note (optional)"
              fullWidth
              value={holdNote}
              onChange={(e) => setHoldNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  handleConfirmHold();
                }
              }}
              multiline
              rows={3}
              placeholder="Add a note for this held transaction..."
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Press Ctrl + Enter to confirm
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHoldDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleConfirmHold} 
              variant="contained" 
              color="primary"
              startIcon={<PauseIcon />}
            >
              Hold Transaction
            </Button>
          </DialogActions>
        </Dialog>

        {/* Recall Transaction Dialog */}
        <RecallTransactionDialog
          open={recallDialogOpen}
          onClose={() => setRecallDialogOpen(false)}
          onRecall={handleRecallTransaction}
        />

        {/* New Transaction Dialog */}
        <Dialog
          open={newTransactionDialogOpen}
          onClose={() => setNewTransactionDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddIcon />
              New Transaction
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ mt: 2 }}>
              Are you sure you want to clear the current transaction and start a new one?
            </Typography>
            <Typography color="warning.main" sx={{ mt: 2, fontWeight: 'medium' }}>
              This action cannot be undone. Consider using "Hold Transaction" if you want to save it for later.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Press Enter to confirm or Esc to cancel
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewTransactionDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleConfirmNewTransaction} 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
            >
              Start New Transaction
            </Button>
          </DialogActions>
        </Dialog>

        {/* Recall Confirmation Dialog */}
        <Dialog
          open={recallConfirmationOpen}
          onClose={() => setRecallConfirmationOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RestoreIcon />
              Recall Transaction
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ mt: 2 }}>
              There are items in your current transaction. Recalling another transaction will clear the current cart.
            </Typography>
            <Typography color="warning.main" sx={{ mt: 2, fontWeight: 'medium' }}>
              This action cannot be undone. Consider using "Hold Transaction" if you want to save the current transaction for later.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRecallConfirmationOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleConfirmRecall}
              variant="contained" 
              color="primary"
              startIcon={<RestoreIcon />}
            >
              Continue to Recall
            </Button>
          </DialogActions>
        </Dialog>

        {/* Logout Button - Separated at the bottom */}
        <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
          <StyledListItemButton 
            onClick={onLogout}
            sx={(theme) => ({ 
              backgroundColor: alpha(theme.palette.error.main, 0.02),
              borderColor: alpha(theme.palette.error.main, 0.3),
              borderWidth: '1px',
              borderStyle: 'solid',
              '& .MuiListItemText-primary': {
                color: theme.palette.error.main,
              },
              '& .MuiListItemText-secondary': {
                color: alpha(theme.palette.error.main, 0.7),
              },
              '& .MuiSvgIcon-root': {
                color: theme.palette.error.main,
              },
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.08),
                transform: 'translateX(4px)',
                boxShadow: `0 2px 8px ${alpha(theme.palette.error.main, 0.15)}`,
                borderColor: theme.palette.error.main,
                '& .MuiListItemText-primary': {
                  color: theme.palette.error.main,
                },
                '& .MuiListItemText-secondary': {
                  color: theme.palette.error.main,
                  opacity: 0.8,
                },
                '& .MuiSvgIcon-root': {
                  color: theme.palette.error.main,
                }
              },
              '&:active': {
                transform: 'translateX(2px)',
                boxShadow: `0 1px 4px ${alpha(theme.palette.error.main, 0.2)}`,
                backgroundColor: alpha(theme.palette.error.main, 0.12),
              }
            })}
          >
            <IconWrapper>
              <LogoutIcon />
            </IconWrapper>
            <ListItemContent
              primary={
                <Box display="flex" alignItems="center">
                  <KeyText className="KeyText" sx={{ color: 'inherit' }}>F12</KeyText>
                  <Typography variant="body2" noWrap>Logout</Typography>
                </Box>
              }
              secondary="Exit the system"
            />
          </StyledListItemButton>
        </Box>
      </FunctionKeysContainer>

      {/* Dialogs */}
      <SearchProductDialog
        open={productInquiryOpen}
        onClose={() => setProductInquiryOpen(false)}
      />
      {/* ... other dialogs ... */}

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          top: '24px !important',
          '& .MuiPaper-root': {
            minWidth: '400px',
          }
        }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            width: '100%',
            alignItems: 'center',
            '& .MuiAlert-message': {
              fontSize: '1.25rem',
              padding: '10px 0',
              fontWeight: 500,
            },
            '& .MuiAlert-icon': {
              fontSize: '2.2rem',
              marginRight: '12px',
              padding: '8px 0',
              alignSelf: 'center',
            },
            '& .MuiSvgIcon-root': {
              fontSize: '1.5rem',
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Backdrop */}
      <Backdrop
        open={showSearch && searchBuffer.length > 0}
        sx={{ 
          color: '#fff', 
          zIndex: 1400,
          backgroundColor: 'rgba(0, 0, 0, 0.6)'
        }}
        onClick={() => {
          setShowSearch(false);
          setSearchBuffer('');
        }}
      />

      {/* Search Popper */}
      <Popper
        open={showSearch && searchBuffer.length > 0}
        anchorEl={anchorEl}
        placement="top"
        transition
        style={{ 
          zIndex: 1500,
          position: 'fixed',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              sx={{
                p: 2,
                width: '500px',
                minHeight: '200px',
                maxHeight: '400px',
                overflow: 'auto',
                mt: 1,
                boxShadow: 3
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SearchIcon color="primary" />
                <Typography variant="subtitle1">
                  Searching: {searchBuffer}
                </Typography>
                {searchBuffer.length > 0 && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      ml: 'auto', 
                      color: searchBuffer.length < MIN_SEARCH_LENGTH ? 'warning.main' : 'text.secondary'
                    }}
                  >
                    {searchBuffer.length < MIN_SEARCH_LENGTH 
                      ? `Enter ${MIN_SEARCH_LENGTH - searchBuffer.length} more character${MIN_SEARCH_LENGTH - searchBuffer.length === 1 ? '' : 's'}`
                      : ''
                    }
                  </Typography>
                )}
              </Box>
              
              {searchBuffer.length < MIN_SEARCH_LENGTH ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '150px',
                  flexDirection: 'column',
                  gap: 1
                }}>
                  <Typography color="text.secondary">
                    Please enter at least {MIN_SEARCH_LENGTH} characters to search
                  </Typography>
                </Box>
              ) : searchResults.length > 0 ? (
                <>
                  <Box sx={{ mb: 1, display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span style={{ opacity: 0.7 }}>Use</span>
                      <Box component="span" sx={{ 
                        px: 1, 
                        py: 0.25, 
                        bgcolor: 'action.selected', 
                        borderRadius: 1, 
                        fontSize: '0.75rem',
                        fontFamily: 'monospace'
                      }}>↑</Box>
                      <Box component="span" sx={{ 
                        px: 1, 
                        py: 0.25, 
                        bgcolor: 'action.selected', 
                        borderRadius: 1, 
                        fontSize: '0.75rem',
                        fontFamily: 'monospace'
                      }}>↓</Box>
                      <span style={{ opacity: 0.7 }}>to navigate,</span>
                      <Box component="span" sx={{ 
                        px: 1, 
                        py: 0.25, 
                        bgcolor: 'action.selected', 
                        borderRadius: 1, 
                        fontSize: '0.75rem',
                        fontFamily: 'monospace'
                      }}>←</Box>
                      <Box component="span" sx={{ 
                        px: 1, 
                        py: 0.25, 
                        bgcolor: 'action.selected', 
                        borderRadius: 1, 
                        fontSize: '0.75rem',
                        fontFamily: 'monospace'
                      }}>→</Box>
                      <span style={{ opacity: 0.7 }}>to switch SKU,</span>
                      <Box component="span" sx={{ 
                        px: 1, 
                        py: 0.25, 
                        bgcolor: 'action.selected', 
                        borderRadius: 1, 
                        fontSize: '0.75rem',
                        fontFamily: 'monospace'
                      }}>Enter</Box>
                      <span style={{ opacity: 0.7 }}>to select</span>
                    </Typography>
                  </Box>
                  <List sx={{ pt: 0 }}>
                    {groupSearchResults(searchResults).map((group, index) => (
                      <ListItem
                        key={group.name}
                        button
                        selected={index === selectedIndex}
                        onClick={() => {
                          const variant = selectedSKU === 'Box' ? 
                            group.variants.box : 
                            group.variants.piece;
                          if (variant) {
                            handleAddProduct(variant);
                          } else {
                            showMessage(`${selectedSKU} variant not available`, 'warning');
                          }
                        }}
                        sx={{
                          borderRadius: 1,
                          mb: 0.5,
                          transition: 'all 0.2s ease',
                          '&.Mui-selected': {
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.15),
                            borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
                            '&:hover': {
                              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                            },
                            '& .MuiTypography-root': {
                              color: 'primary.main'
                            }
                          },
                          '&:hover': {
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                          }
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 1,
                          width: '100%',
                          pl: index === selectedIndex ? 1 : 2,
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: index === selectedIndex ? 700 : 500,
                                color: index === selectedIndex ? 'primary.main' : 'text.primary',
                                fontSize: index === selectedIndex ? '1.1rem' : '1rem',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {group.name}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'text.secondary',
                                opacity: index === selectedIndex ? 1 : 0.7
                              }}
                            >
                              {group.category} • {(group.variants.box || group.variants.piece)?.dosage_amount}{(group.variants.box || group.variants.piece)?.dosage_unit}
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            display: 'flex', 
                            gap: 0.5,
                            opacity: index === selectedIndex ? 1 : 0.85
                          }}>
                            {['Box', 'Piece'].map((sku) => {
                              const isSelected = index === selectedIndex && selectedSKU === sku;
                              const isAvailable = group.variants[sku.toLowerCase() as 'box' | 'piece'];
                              return (
                                <Chip
                                  key={sku}
                                  label={sku}
                                  size="small"
                                  color={sku === 'Piece' ? 'secondary' : 'info'}
                                  variant={isSelected ? 'filled' : 'outlined'}
                                  disabled={!isAvailable}
                                  sx={{ 
                                    minWidth: '70px',
                                    fontWeight: isSelected ? 700 : 500,
                                    fontSize: '0.85rem',
                                    opacity: isAvailable ? 1 : 0.4,
                                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                    transition: 'all 0.2s ease',
                                    ...(isSelected && {
                                      backgroundColor: sku === 'Piece' ? 'secondary.main' : 'info.main',
                                      color: '#fff',
                                      borderColor: 'transparent',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                      '&:hover': {
                                        backgroundColor: sku === 'Piece' ? 'secondary.dark' : 'info.dark',
                                      }
                                    }),
                                    ...(!isSelected && {
                                      borderColor: sku === 'Piece' ? 'secondary.main' : 'info.main',
                                      color: sku === 'Piece' ? 'secondary.main' : 'info.main',
                                      backgroundColor: 'transparent',
                                      '&:hover': {
                                        backgroundColor: sku === 'Piece' ? 'secondary.50' : 'info.50',
                                      }
                                    }),
                                    '& .MuiChip-label': {
                                      px: 2
                                    }
                                  }}
                                />
                              );
                            })}
                          </Box>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '150px'
                }}>
                  <Typography color="text.secondary">
                    No products found
                  </Typography>
                </Box>
              )}
            </Paper>
          </Fade>
        )}
      </Popper>

      {/* Quantity Pre-selection Dialog */}
      <Dialog
        open={showQuantityInput}
        onClose={() => setShowQuantityInput(false)}
        PaperProps={{
          sx: {
            position: 'fixed',
            top: '30%',
            minWidth: '300px'
          }
        }}
      >
        <DialogTitle>Pre-select Quantity</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Enter quantity for next item (press Enter to confirm)
            </Typography>
            <TextField
              autoFocus
              fullWidth
              type="number"
              inputRef={quantityInputRef}
              value={preSelectQuantity || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value > 0) {
                  setPreSelectQuantity(value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && preSelectQuantity) {
                  setShowQuantityInput(false);
                  showMessage(`Quantity pre-set to ${preSelectQuantity}`, 'info');
                } else if (e.key === 'Escape') {
                  setShowQuantityInput(false);
                  setPreSelectQuantity(null);
                }
              }}
              InputProps={{
                inputProps: { 
                  min: 1,
                  style: { fontSize: '1.2rem' }
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => {
              setShowQuantityInput(false);
              setPreSelectQuantity(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              if (preSelectQuantity) {
                setShowQuantityInput(false);
                showMessage(`Quantity pre-set to ${preSelectQuantity}`, 'info');
              }
            }}
            disabled={!preSelectQuantity}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Show active pre-selected quantity indicator */}
      {preSelectQuantity && (
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            bgcolor: 'primary.main',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 2,
            boxShadow: 2,
            zIndex: 1400,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Next Quantity: {preSelectQuantity}
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => setPreSelectQuantity(null)}
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Floating Help Button */}
      <Fab
        color="primary"
        aria-label="help"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
        onClick={() => setHelpDialogOpen(true)}
      >
        <HelpIcon />
      </Fab>

      {/* Help Dialog */}
      <Dialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Help & Instructions</Typography>
            <IconButton onClick={() => setHelpDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={selectedTab} onChange={handleTabChange}>
              <Tab icon={<HelpIcon />} label="How to Use" />
              <Tab icon={<KeyboardIcon />} label="Keyboard Shortcuts" />
              {/* Add more tabs here as needed */}
              {/* Example: <Tab icon={<SettingsIcon />} label="Advanced Features" /> */}
            </Tabs>
          </Box>

          {/* How to Use Tab */}
          <TabPanel value={selectedTab} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" gutterBottom>Basic Usage</Typography>
              <Typography>
                1. Start typing or scan a barcode to search for products
              </Typography>
              <Typography>
                2. Use arrow keys to navigate through search results
              </Typography>
              <Typography>
                3. Press Tab to pre-select quantity before adding items
              </Typography>
              <Typography>
                4. Use function keys (F1-F12) for quick actions
              </Typography>
              <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>Search Tips</Typography>
              <Typography>
                • Type at least 3 characters to start searching
              </Typography>
              <Typography>
                • Use Left/Right arrows to switch between Box/Piece variants
              </Typography>
              <Typography>
                • Press Enter to add the selected item to cart
              </Typography>
            </Box>
          </TabPanel>

          {/* Keyboard Shortcuts Tab */}
          <TabPanel value={selectedTab} index={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" gutterBottom>Function Keys</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 1, alignItems: 'center' }}>
                <Typography fontWeight="bold">F1</Typography>
                <Typography>Add New Transaction</Typography>
                <Typography fontWeight="bold">F2</Typography>
                <Typography>Hold Transaction</Typography>
                <Typography fontWeight="bold">F3</Typography>
                <Typography>Recall Transaction</Typography>
                <Typography fontWeight="bold">F4</Typography>
                <Typography>Return Item</Typography>
                <Typography fontWeight="bold">F5</Typography>
                <Typography>Prescription Book</Typography>
                <Typography fontWeight="bold">F12</Typography>
                <Typography>Logout</Typography>
              </Box>
              <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>Navigation Keys</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1, alignItems: 'center' }}>
                <Typography fontWeight="bold">↑/↓ (Arrows)</Typography>
                <Typography>Navigate through search results</Typography>
                <Typography fontWeight="bold">←/→ (Arrows)</Typography>
                <Typography>Switch between Box/Piece variants</Typography>
                <Typography fontWeight="bold">Tab</Typography>
                <Typography>Pre-select quantity before adding items</Typography>
                <Typography fontWeight="bold">Enter</Typography>
                <Typography>Add selected item to cart</Typography>
                <Typography fontWeight="bold">Escape</Typography>
                <Typography>Clear search or close dialogs</Typography>
              </Box>
            </Box>
          </TabPanel>

          {/* Add more TabPanels here as needed */}
          {/* Example:
          <TabPanel value={selectedTab} index={2}>
            <Box>
              <Typography variant="h6">Advanced Features</Typography>
              // Add content for advanced features
            </Box>
          </TabPanel>
          */}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FunctionKeys;