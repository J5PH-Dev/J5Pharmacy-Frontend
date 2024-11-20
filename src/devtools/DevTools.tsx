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
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { sampleItems } from './sampleData';
import { generateDummyItem } from './dummyData';

interface DevToolsProps {
  onAddSampleItems: (items: typeof sampleItems) => void;
  onResetStock: () => void;
  onClearCart: () => void;
}

const DevTools: React.FC<DevToolsProps> = ({ 
  onAddSampleItems, 
  onResetStock,
  onClearCart 
}) => {
  const [open, setOpen] = useState(false);
  const [dummyCount, setDummyCount] = useState(1);
  const [showDummyDialog, setShowDummyDialog] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddDummyItems = () => {
    const dummyItems = Array.from({ length: dummyCount }, () => generateDummyItem());
    onAddSampleItems(dummyItems);
    setShowDummyDialog(false);
    handleClose();
  };

  const actions = [
    { 
      icon: <AddCircleIcon />, 
      name: 'Add Sample Items', 
      onClick: () => {
        onAddSampleItems(sampleItems);
        handleClose();
      }
    },
    { 
      icon: <PlaylistAddIcon />, 
      name: 'Add Dummy Items', 
      onClick: () => {
        setShowDummyDialog(true);
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
      icon: <RestartAltIcon />, 
      name: 'Reset Stock', 
      onClick: () => {
        onResetStock();
        handleClose();
      }
    },
  ];

  return (
    <>
      <SpeedDial
        ariaLabel="Developer Tools"
        icon={<SpeedDialIcon icon={<BuildIcon sx={{ color: theme => theme.palette.primary.light }} />} />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        direction="up"
        sx={{
          position: 'fixed',
          bottom: theme => theme.spacing(2),
          right: theme => theme.spacing(2),
          '& .MuiSpeedDial-actions': {
            paddingBottom: theme => theme.spacing(7),
            gap: theme => theme.spacing(1),
          },
        }}
        FabProps={{
          color: "primary",
          size: "medium",
          sx: {
            boxShadow: 3,
            bgcolor: theme => theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme => theme.palette.primary.dark,
            },
          }
        }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={action.onClick}
            FabProps={{
              size: "medium",
            }}
          />
        ))}
      </SpeedDial>

      <Dialog 
        open={showDummyDialog} 
        onClose={() => setShowDummyDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Dummy Items</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Number of Items"
            type="number"
            fullWidth
            value={dummyCount}
            onChange={(e) => setDummyCount(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDummyDialog(false)}>Cancel</Button>
          <Button onClick={handleAddDummyItems} variant="contained">Add Items</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DevTools;
