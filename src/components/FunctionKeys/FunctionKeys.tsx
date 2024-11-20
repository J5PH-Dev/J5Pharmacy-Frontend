import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemText, Typography, Badge } from '@mui/material';
import { styled } from '@mui/material/styles';
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

// Function key type definition
interface FunctionKey {
  key: string;
  label: string;
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
  border: `1px solid ${theme.palette.primary.light}`,
  minHeight: '48px',
  backgroundColor: theme.palette.primary.light,
  transition: theme.transitions.create(['background-color', 'transform', 'box-shadow'], {
    duration: theme.transitions.duration.short,
  }),
  '& .MuiListItemText-primary, & .MuiListItemText-secondary, & .MuiSvgIcon-root, & .KeyText': {
    color: theme.palette.common.white,
    transition: theme.transitions.create('color'),
  },
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'translateX(4px)',
    boxShadow: theme.shadows[4],
    '& .MuiListItemText-primary, & .MuiListItemText-secondary, & .MuiSvgIcon-root, & .KeyText': {
      color: theme.palette.common.white,
    },
    '& .MuiListItemText-secondary': {
      color: theme.palette.grey[100],
    }
  },
  '&:active': {
    transform: 'translateX(2px)',
    boxShadow: theme.shadows[2],
  }
}));

const KeyText = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginRight: theme.spacing(1),
  whiteSpace: 'nowrap',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem',
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

// Function keys data
const functionKeys: FunctionKey[] = [
  {
    key: 'F1',
    label: 'Search Products',
    description: 'Search and find products',
    icon: <SearchIcon />,
    action: () => console.log('Search clicked'),
  },
  {
    key: 'F2',
    label: 'New Transaction',
    description: 'Start a new transaction',
    icon: <AddIcon />,
    action: () => console.log('New clicked'),
  },
  {
    key: 'F3',
    label: 'Hold Transaction',
    description: 'Temporarily hold current transaction',
    icon: <PauseIcon />,
    action: () => console.log('Hold clicked'),
  },
  {
    key: 'F4',
    label: 'Recall Transaction',
    description: 'Recall a held transaction',
    icon: <RestoreIcon />,
    action: () => console.log('Recall clicked'),
  },
  {
    key: 'F5',
    label: 'Apply Discount',
    description: 'Apply discount to transaction',
    icon: <LocalOfferIcon />,
    action: () => console.log('Discount clicked'),
  },
  {
    key: 'F6',
    label: 'Process Return',
    description: 'Process a product return',
    icon: <AssignmentReturnIcon />,
    action: () => console.log('Return clicked'),
  },
  {
    key: 'F7',
    label: 'View Reports',
    description: 'Access sales and inventory reports',
    icon: <AssessmentIcon />,
    action: () => console.log('Reports clicked'),
  },
  {
    key: 'F8',
    label: 'System Settings',
    description: 'Configure system settings',
    icon: <SettingsIcon />,
    action: () => console.log('Settings clicked'),
  },
  {
    key: 'F9',
    label: 'Notifications',
    description: 'View system notifications',
    icon: <Badge badgeContent={3} color="error"><NotificationsIcon /></Badge>,
    action: () => console.log('Notifications clicked'),
  },
];

interface FunctionKeysProps {
  onLogout?: () => void;
}

const FunctionKeys: React.FC<FunctionKeysProps> = ({ 
  onLogout = () => console.log('Logout clicked')
}) => {
  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      if (key === 'F12') {
        event.preventDefault();
        onLogout();
        return;
      }
      
      if (key.startsWith('F') && !isNaN(Number(key.slice(1)))) {
        const functionKey = functionKeys.find(fk => fk.key === key);
        if (functionKey) {
          event.preventDefault();
          functionKey.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onLogout]);

  return (
    <FunctionKeysContainer>
      <StyledList>
        {functionKeys.map((fKey) => (
          <StyledListItem key={fKey.key} disablePadding>
            <StyledListItemButton onClick={fKey.action}>
              <IconWrapper>{fKey.icon}</IconWrapper>
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
            backgroundColor: theme.palette.error.light,
            borderColor: theme.palette.error.main,
            transition: theme.transitions.create(['background-color', 'transform', 'box-shadow'], {
              duration: theme.transitions.duration.short,
            }),
            '&:hover': {
              backgroundColor: theme.palette.error.dark,
              transform: 'translateX(4px)',
              boxShadow: theme.shadows[4],
              '& .MuiListItemText-secondary': {
                color: theme.palette.grey[100],
              }
            },
            '&:active': {
              transform: 'translateX(2px)',
              boxShadow: theme.shadows[2],
            }
          })}
        >
          <IconWrapper>
            <LogoutIcon />
          </IconWrapper>
          <ListItemContent
            primary={
              <Box display="flex" alignItems="center">
                <KeyText className="KeyText">F12</KeyText>
                <Typography variant="body2" noWrap>Logout</Typography>
              </Box>
            }
            secondary="Exit the system"
          />
        </StyledListItemButton>
      </Box>
    </FunctionKeysContainer>
  );
};

export default FunctionKeys;