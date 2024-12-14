import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import { HeldTransaction } from '../../../types/transaction';

interface HeldTransactionsDialogProps {
  open: boolean;
  onClose: () => void;
  transactions: HeldTransaction[];
  onRecall: (transaction: HeldTransaction) => void;
}

const HeldTransactionsDialog: React.FC<HeldTransactionsDialogProps> = ({
  open,
  onClose,
  transactions,
  onRecall,
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Held Transactions</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {transactions.length === 0 ? (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight={200}
          >
            <Typography color="text.secondary">
              No held transactions available
            </Typography>
          </Box>
        ) : (
          <List>
            {transactions.map((transaction, index) => (
              <React.Fragment key={transaction.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    py: 2,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="h6">
                          Transaction #{transaction.id}
                        </Typography>
                        {transaction.customerName && (
                          <Chip 
                            label={transaction.customerName}
                            size="small"
                            color="primary"
                          />
                        )}
                        <Chip 
                          label={format(new Date(transaction.timestamp), 'MMM d, yyyy h:mm a')}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Items: {transaction.items.length} • 
                          Total: ₱{transaction.total.toFixed(2)}
                        </Typography>
                        <Box display="flex" gap={1} mt={1}>
                          {transaction.items.slice(0, 3).map((item, idx) => (
                            <Chip
                              key={idx}
                              label={`${item.name} (${item.quantity})`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {transaction.items.length > 3 && (
                            <Chip
                              label={`+${transaction.items.length - 3} more`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  <Button
                    variant="contained"
                    onClick={() => onRecall(transaction)}
                    sx={{ ml: 2 }}
                  >
                    Recall
                  </Button>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HeldTransactionsDialog; 