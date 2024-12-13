import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Paper,
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { format } from 'date-fns';
import { transactionManager } from '../../utils/transactionManager';
import { HeldTransaction } from '../../types/transaction';

interface RecallTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  onRecall: (transaction: HeldTransaction) => void;
}

const RecallTransactionDialog: React.FC<RecallTransactionDialogProps> = ({
  open,
  onClose,
  onRecall,
}) => {
  const [heldTransactions, setHeldTransactions] = useState<HeldTransaction[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  useEffect(() => {
    if (open) {
      const transactions = transactionManager.getHeldTransactions();
      setHeldTransactions(transactions);
      setSelectedIndex(transactions.length > 0 ? 0 : -1);
    }
  }, [open]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (heldTransactions.length === 0) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev - 1 < 0 ? heldTransactions.length - 1 : prev - 1
        );
        break;
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          (prev + 1) % heldTransactions.length
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0) {
          handleRecall(heldTransactions[selectedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
    }
  };

  const handleRecall = (transaction: HeldTransaction) => {
    onRecall(transaction);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      onKeyDown={handleKeyDown}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RestoreIcon sx={{ fontSize: '1.5rem' }} />
          <Typography variant="h5" component="span">
            Recall Transaction
          </Typography>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 2 }}>
        {heldTransactions.length > 0 ? (
          <>
            <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
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
                }}>Enter</Box>
                <span style={{ opacity: 0.7 }}>to select</span>
              </Typography>
            </Box>
            <List sx={{ 
              width: '100%',
              bgcolor: 'background.paper',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              {heldTransactions.map((transaction, index) => (
                <ListItem
                  key={index}
                  button
                  selected={index === selectedIndex}
                  onClick={() => handleRecall(transaction)}
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'secondary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.main',
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" component="span">
                          {transaction.items.length} {transaction.items.length === 1 ? 'item' : 'items'}
                        </Typography>
                        <Typography variant="h6" component="span">
                          ₱{transaction.total.toFixed(2)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography 
                          variant="body1" 
                          color={index === selectedIndex ? 'primary.contrastText' : 'text.secondary'}
                          sx={{ fontSize: '1.1rem' }}
                        >
                          {format(new Date(transaction.timestamp), 'MMM dd, yyyy hh:mm:ss a')}
                        </Typography>
                        {transaction.notes && (
                          <Typography 
                            variant="body1"
                            color={index === selectedIndex ? 'primary.contrastText' : 'text.secondary'}
                            sx={{ 
                              mt: 1,
                              fontStyle: 'italic',
                              fontSize: '1.2rem',
                              fontWeight: 500
                            }}
                          >
                            Note: {transaction.notes}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              bgcolor: 'action.hover'
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No held transactions available
            </Typography>
          </Paper>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose}
          size="large"
        >
          Cancel
        </Button>
        <Button
          onClick={() => selectedIndex >= 0 && handleRecall(heldTransactions[selectedIndex])}
          variant="contained"
          color="primary"
          startIcon={<RestoreIcon />}
          size="large"
          disabled={selectedIndex < 0}
        >
          Recall Selected Transaction
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecallTransactionDialog;
