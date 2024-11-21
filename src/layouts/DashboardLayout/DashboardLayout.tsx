import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StoreIcon from '@mui/icons-material/Store';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import { useAuth } from '../../modules/auth/contexts/AuthContext';
import { UserRole } from '../../modules/auth/types/auth.types';

const drawerWidth = 240;

interface MenuItem {
  text: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
  requiresConfirmation?: boolean;
}

const menuItems: MenuItem[] = [
  {
    text: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    text: 'Branch Management',
    path: '/branch',
    icon: <StoreIcon />,
    roles: [UserRole.ADMIN],
  },
  {
    text: 'Inventory',
    path: '/inventory',
    icon: <InventoryIcon />,
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.PHARMACIST],
  },
  {
    text: 'Customers',
    path: '/customers',
    icon: <PeopleIcon />,
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    text: 'POS',
    path: '/pos',
    icon: <ShoppingCartIcon />,
    roles: [UserRole.MANAGER, UserRole.PHARMACIST],
    requiresConfirmation: true,
  },
];

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; path: string }>({
    open: false,
    path: '',
  });
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string, requiresConfirmation?: boolean) => {
    if (requiresConfirmation) {
      setConfirmDialog({ open: true, path });
    } else {
      navigate(path);
    }
  };

  const handleConfirmNavigation = () => {
    navigate(confirmDialog.path);
    setConfirmDialog({ open: false, path: '' });
  };

  const filteredMenuItems = menuItems.filter(
    item => user?.role && item.roles.includes(user.role)
  );

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          J5 Pharmacy
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleNavigation(item.path, item.requiresConfirmation)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user?.role} Dashboard
          </Typography>
          <IconButton color="inherit" onClick={logout}>
            Logout
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
        }}
      >
        {children}
      </Box>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, path: '' })}
      >
        <DialogTitle>Enter POS Mode</DialogTitle>
        <DialogContent>
          <Typography>
            You are about to enter the Point of Sale system. This will open in a new view. Are you sure you want to continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, path: '' })}>Cancel</Button>
          <Button onClick={handleConfirmNavigation} variant="contained" color="primary">
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
