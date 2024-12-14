import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface HoldTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
}

const HoldTransactionDialog: React.FC<HoldTransactionDialogProps> = ({
  open,
  onClose,
  onConfirm
}) => {
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    onConfirm(note);
    setNote('');
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleConfirm();
    } else if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Hold Transaction</Typography>
          <IconButton onClick={onClose} size="small">
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
            <span><strong>Enter</strong> Confirm</span>
            <span><strong>Esc</strong> Cancel</span>
            <span><strong>Shift+Enter</strong> New Line</span>
          </Typography>
        </Box>
        <TextField
          autoFocus
          fullWidth
          multiline
          rows={3}
          label="Note (Optional)"
          placeholder="Enter a note for this held transaction..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Hold Transaction
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HoldTransactionDialog; 