import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import ElderlyIcon from '@mui/icons-material/Elderly';
import AccessibleIcon from '@mui/icons-material/Accessible';
import BadgeIcon from '@mui/icons-material/Badge';
import PercentIcon from '@mui/icons-material/Percent';
import BlockIcon from '@mui/icons-material/Block';
import { DiscountType } from '../TransactionSummary/types';

interface DiscountDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: DiscountType, customValue?: number) => void;
  currentDiscount: DiscountType;
}

interface DiscountOption {
  type: DiscountType;
  label: string;
  icon: React.ReactElement;
  description: string;
  value?: number;
}

const discountOptions: DiscountOption[] = [
  {
    type: 'None',
    label: 'No Discount',
    icon: <BlockIcon />,
    description: 'Remove all discounts',
    value: 0
  },
  {
    type: 'Senior',
    label: 'Senior Citizen',
    icon: <ElderlyIcon />,
    description: '20% discount for senior citizens',
    value: 20
  },
  {
    type: 'PWD',
    label: 'PWD',
    icon: <AccessibleIcon />,
    description: '20% discount for persons with disabilities',
    value: 20
  },
  {
    type: 'Employee',
    label: 'Employee',
    icon: <BadgeIcon />,
    description: '10% discount for employees',
    value: 10
  },
  {
    type: 'Custom',
    label: 'Custom',
    icon: <PercentIcon />,
    description: 'Enter a custom discount percentage'
  }
];

export const DiscountDialog: React.FC<DiscountDialogProps> = ({
  open,
  onClose,
  onSelect,
  currentDiscount
}) => {
  const [customValue, setCustomValue] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleOptionClick = (option: DiscountOption) => {
    if (option.type === 'Custom') {
      setShowCustomInput(true);
    } else {
      onSelect(option.type);
      onClose();
    }
  };

  const handleCustomSubmit = () => {
    const value = parseFloat(customValue);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      onSelect('Custom', value);
      onClose();
      setCustomValue('');
      setShowCustomInput(false);
    }
  };

  const handleClose = () => {
    setCustomValue('');
    setShowCustomInput(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Select Discount Type</DialogTitle>
      <DialogContent>
        {showCustomInput ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Enter Custom Discount Percentage
            </Typography>
            <TextField
              autoFocus
              label="Discount %"
              type="number"
              fullWidth
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              error={!!customValue && (isNaN(parseFloat(customValue)) || parseFloat(customValue) < 0 || parseFloat(customValue) > 100)}
              helperText={!!customValue && (isNaN(parseFloat(customValue)) || parseFloat(customValue) < 0 || parseFloat(customValue) > 100) ? 
                "Please enter a valid percentage between 0 and 100" : ""}
            />
          </Box>
        ) : (
          <List>
            {discountOptions.map((option) => (
              <ListItem key={option.type} disablePadding>
                <ListItemButton 
                  onClick={() => handleOptionClick(option)}
                  selected={currentDiscount === option.type}
                >
                  <ListItemIcon>
                    {option.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={option.label}
                    secondary={option.description}
                  />
                  {option.value !== undefined && (
                    <Typography variant="body2" color="text.secondary">
                      {option.value}%
                    </Typography>
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {showCustomInput && (
          <Button 
            onClick={handleCustomSubmit}
            disabled={!customValue || isNaN(parseFloat(customValue)) || parseFloat(customValue) < 0 || parseFloat(customValue) > 100}
            variant="contained"
            color="primary"
          >
            Apply
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DiscountDialog;
