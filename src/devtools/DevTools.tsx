import React, { useState } from 'react';
import { 
  SpeedDial, 
  SpeedDialAction, 
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import { sampleItems } from './sampleData';
import { CartItem } from '../modules/pos/types/cart';
import { resetInvoiceNumber } from '../modules/pos/utils/transactionManager';

interface DevToolsProps {
  onAddSampleItems: (items: CartItem[]) => void;
  onResetStock: () => void;
  onClearCart: () => void;
  onResetInvoice?: () => void;
}

const DevTools: React.FC<DevToolsProps> = ({ 
  onAddSampleItems, 
  onResetStock,
  onClearCart,
  onResetInvoice
}) => {
  const [open, setOpen] = useState(false);
  const [randomItemCount, setRandomItemCount] = useState(1);
  const [countDialogOpen, setCountDialogOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const getRandomItems = (count: number): CartItem[] => {
    const items: CartItem[] = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * sampleItems.length);
      items.push({ ...sampleItems[randomIndex], quantity: 1 });
    }
    return items;
  };

  const handleAddRandomItems = () => {
    setCountDialogOpen(true);
    handleClose();
  };

  const handleConfirmRandomItems = () => {
    const items = getRandomItems(randomItemCount);
    onAddSampleItems(items);
    setCountDialogOpen(false);
    setRandomItemCount(1);
  };

  const actions = [
    { 
      icon: <AddCircleIcon />, 
      name: 'Add Random Items', 
      onClick: handleAddRandomItems
    },
    { 
      icon: <RestartAltIcon />, 
      name: 'Reset Stock', 
      onClick: () => {
        onResetStock();
        handleClose();
      }
    },
    { 
      icon: <ClearAllIcon />, 
      name: 'Clear Cart', 
      onClick: () => {
        onClearCart();
        handleClose();
      }
    },
    {
      icon: <FormatListNumberedIcon />,
      name: 'Reset Invoice #',
      onClick: () => {
        resetInvoiceNumber();
        onResetInvoice?.();
        handleClose();
      }
    },
  ];

  return (
    <>
      <SpeedDial
        ariaLabel="Dev Tools"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon icon={<BuildIcon />} />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        direction="up"
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={action.onClick}
          />
        ))}
      </SpeedDial>

      <Dialog open={countDialogOpen} onClose={() => setCountDialogOpen(false)}>
        <DialogTitle>Add Random Items</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Number of items"
            type="number"
            fullWidth
            value={randomItemCount}
            onChange={(e) => setRandomItemCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
            inputProps={{ min: 1, max: 10 }}
            helperText="Choose between 1-10 items"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCountDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmRandomItems} variant="contained">Add Items</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DevTools;
