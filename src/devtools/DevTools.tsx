import React, { useState } from 'react';
import { 
  SpeedDial, 
  SpeedDialAction, 
  SpeedDialIcon,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { generateDummyItem } from './dummyData';

interface DevToolsProps {
  onAddSampleItems: (items: any[]) => void;
  onResetStock: () => void;
  onClearCart: () => void;
}

const DevTools: React.FC<DevToolsProps> = ({ 
  onAddSampleItems, 
  onResetStock,
  onClearCart 
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddSingleDummyItem = () => {
    const dummyItem = generateDummyItem();
    onAddSampleItems([dummyItem]);
    handleClose();
  };

  const actions = [
    { 
      icon: <AddCircleIcon />, 
      name: 'Add Dummy Item', 
      onClick: handleAddSingleDummyItem
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
    </>
  );
};

export default DevTools;
