import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemText, Typography, Badge } from '@mui/material';
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
}

const FunctionKeys: React.FC<FunctionKeysProps> = ({ 
  onLogout = () => console.log('Logout clicked')
}) => {
  const functionKeys: FunctionKey[] = [
    {
      key: 'F1',
      label: 'Search Product',
      description: 'Search for products',
      icon: <SearchIcon />,
      action: () => console.log('Search clicked')
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
      icon: <Badge badgeContent={4} color="error"><NotificationsIcon /></Badge>,
      action: () => console.log('Notifications clicked')
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

  return (
    <FunctionKeysContainer>
      <StyledList>
        {functionKeys.map((fk) => (
          <StyledListItem key={fk.key}>
            <StyledListItemButton onClick={fk.action}>
              <IconWrapper>
                {fk.icon}
              </IconWrapper>
              <ListItemContent
                primary={
                  <Box display="flex" alignItems="center">
                    <KeyText className="KeyText">{fk.key}</KeyText>
                    <Typography variant="body2" noWrap>{fk.label}</Typography>
                  </Box>
                }
                secondary={fk.description}
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
    </FunctionKeysContainer>
  );
};

export default FunctionKeys;