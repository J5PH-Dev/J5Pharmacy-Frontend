import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemText, Typography, Badge, Snackbar, Alert, 
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PauseIcon from '@mui/icons-material/Pause';
import RestoreIcon from '@mui/icons-material/Restore';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';

// Import components
import { CartItem } from '../../types/cart';
import { HeldTransaction } from '../../types/transaction';
import * as handlers from './handlers';
import { handleProcessReturn } from './handlers/processReturn';
import SearchProductDialog from './dialogs/SearchProductDialog';
import ConfirmationDialog from './dialogs/ConfirmationDialog';
import { sampleItems } from '../../../../devtools/sampleData';

// Function key type definition
interface FunctionKey {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  disabled?: boolean;
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
  onAddProduct: (product: CartItem) => void;
  currentItems: CartItem[];
  currentTotal: number;
  cartState: {
    items: CartItem[];
    totals: {
      subtotal: number;
      totalDiscount: number;
      total: number;
      itemCount: number;
    };
    prescriptionRequired: boolean;
    prescriptionVerified: boolean;
  };
  onClearCart: () => void;
  onHoldTransaction: () => void;
  onRecallTransaction: (transaction: HeldTransaction) => void;
  isCheckoutOpen: boolean;
  onManualSearchOpen: () => void;
  setRecallDialogOpen: (open: boolean) => void;
  setHoldDialogOpen: (open: boolean) => void;
  setProcessReturnDialogOpen: (open: boolean) => void;
}

const FunctionKeys: React.FC<FunctionKeysProps> = ({
  onLogout = () => console.log('Logout clicked'),
  onAddProduct,
  currentItems,
  currentTotal,
  cartState,
  onClearCart,
  onHoldTransaction,
  onRecallTransaction,
  isCheckoutOpen,
  onManualSearchOpen,
  setRecallDialogOpen,
  setHoldDialogOpen,
  setProcessReturnDialogOpen
}) => {
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [barcodeBuffer, setBarcodeBuffer] = useState('');
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [isBarcodeScanMode, setIsBarcodeScanMode] = useState(false);
  const [lastKeyPressTime, setLastKeyPressTime] = useState(0);

  const handleConfirmNewTransaction = () => {
    onClearCart();
    setIsConfirmationDialogOpen(false);
    console.log('New transaction started');
  };

  const handlerProps = {
    cartState,
    onAddProduct,
    onClearCart,
    onRecallTransaction,
    isCheckoutOpen,
    setSearchDialogOpen: setIsSearchDialogOpen,
    setReportsDialogOpen: setReportsOpen,
    setConfirmationDialogOpen: setIsConfirmationDialogOpen,
    setRecallDialogOpen,
    setHoldDialogOpen,
    setProcessReturnDialogOpen
  };

  console.log('FunctionKeys handlerProps:', handlerProps);

  const functionKeys: FunctionKey[] = [
    {
      key: 'F1',
      label: 'Search Product',
      description: 'Search for products',
      icon: <SearchIcon />,
      action: handlers.handleSearchProduct(handlerProps),
    },
    {
      key: 'F2',
      label: 'New Transaction',
      description: 'Start a new transaction',
      icon: <AddIcon />,
      action: handlers.handleNewTransaction(handlerProps),
    },
    {
      key: 'F3',
      label: 'Hold Transaction',
      description: 'Temporarily hold current transaction',
      icon: <PauseIcon />,
      action: () => {
        console.log('F3 Hold Transaction clicked');
        const holdHandler = handlers.handleHoldTransaction(handlerProps);
        console.log('Hold handler created:', holdHandler);
        holdHandler();
      },
    },
    {
      key: 'F4',
      label: 'Recall Transaction',
      description: 'Recall a held transaction',
      icon: <RestoreIcon />,
      action: handlers.handleRecallTransaction(handlerProps),
    },
    {
      key: 'F5',
      label: 'Prescription',
      description: 'Manage prescriptions',
      icon: <AssignmentReturnIcon />,
      action: handlers.handlePrescription(handlerProps),
    },
    {
      key: 'F6',
      label: 'Process Return',
      description: 'Process a product return',
      icon: <AssignmentReturnIcon />,
      action: handlers.handleProcessReturn(handlerProps),
    },
    {
      key: 'F7',
      label: 'View Reports',
      description: 'Access sales and inventory reports',
      icon: <AssessmentIcon />,
      action: handlers.handleViewReports(handlerProps),
    },
    {
      key: 'F8',
      label: 'System Settings',
      description: 'Configure system settings',
      icon: <SettingsIcon />,
      action: handlers.handleSystemSettings(handlerProps),
    },
    {
      key: 'F9',
      label: 'Notifications',
      description: 'View system notifications',
      icon: <Badge badgeContent={4} color="error"><NotificationsIcon /></Badge>,
      action: handlers.handleNotifications(handlerProps),
    }
  ];

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

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Skip if the event originated from an input element
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Only accept alphanumeric characters
      if (/^[a-zA-Z0-9]$/.test(event.key)) {
        // Check for rapid keystrokes (barcode scanner)
        const now = Date.now();
        if (now - lastKeyPressTime < 50) {
          setBarcodeBuffer(prev => prev + event.key);
        } else {
          // Manual typing - open search
          onManualSearchOpen();
        }
        setLastKeyPressTime(now);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Enter for barcode
      if (event.key === 'Enter' && barcodeBuffer) {
        event.preventDefault();
        
        // Find product in sampleItems by barcode
        const foundProduct = sampleItems.find(item => item.barcode === barcodeBuffer);
        
        if (foundProduct) {
          onAddProduct({
            ...foundProduct,
            quantity: 1
          });
          setSnackbar({
            open: true,
            message: `Added ${foundProduct.name} to cart`,
            severity: 'success'
          });
        } else {
          setSnackbar({
            open: true,
            message: `No product found for barcode: ${barcodeBuffer}`,
            severity: 'error'
          });
        }
        
        setBarcodeBuffer('');
      }

      // Handle function keys
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

    window.addEventListener('keypress', handleKeyPress);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [barcodeBuffer, onAddProduct, onLogout, functionKeys, onManualSearchOpen]);

  return (
    <FunctionKeysContainer>
      <StyledList>
        {functionKeys.map((fKey) => (
          <StyledListItem key={fKey.key}>
            <StyledListItemButton onClick={fKey.action} disabled={fKey.disabled}>
              <IconWrapper>
                {fKey.icon}
              </IconWrapper>
              <ListItemContent
                primary={
                  <Box display="flex" alignItems="center">
                    <KeyText className="KeyText">{fKey.key}</KeyText>
                    <Typography variant="body2" noWrap>{fKey.label}</Typography>
                  </Box>
                }
                secondary={fKey.description}
              />
            </StyledListItemButton>
          </StyledListItem>
        ))}
      </StyledList>
      
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
      
      <SearchProductDialog
        open={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)}
      />
      <ConfirmationDialog
        open={isConfirmationDialogOpen}
        onClose={() => setIsConfirmationDialogOpen(false)}
        onConfirm={handleConfirmNewTransaction}
        message="You have items in your cart. Are you sure you want to start a new transaction?"
      />
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={2000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </FunctionKeysContainer>
  );
};

export default FunctionKeys;