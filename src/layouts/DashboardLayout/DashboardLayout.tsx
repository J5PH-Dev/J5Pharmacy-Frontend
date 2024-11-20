import React from 'react';
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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StoreIcon from '@mui/icons-material/Store';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../../core/contexts/AuthContext';
import { UserRole } from '../../core/types/roles';

const DRAWER_WIDTH = 240;

interface MenuItem {
  text: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getMenuItems = (): MenuItem[] => {
    const items: MenuItem[] = [
      {
        text: 'Dashboard',
        path: '/dashboard',
        icon: <DashboardIcon />,
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
      {
        text: 'POS',
        path: '/pos',
        icon: <ShoppingCartIcon />,
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.PHARMACIST],
      },
      {
        text: 'Branch Management',
        path: '/branches',
        icon: <StoreIcon />,
        roles: [UserRole.ADMIN],
      },
      {
        text: 'Inventory',
        path: '/inventory',
        icon: <InventoryIcon />,
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
      {
        text: 'Customers',
        path: '/customers',
        icon: <PeopleIcon />,
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
      {
        text: 'Analytics',
        path: '/analytics',
        icon: <BarChartIcon />,
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
      {
        text: 'User Management',
        path: '/users',
        icon: <AdminPanelSettingsIcon />,
        roles: [UserRole.ADMIN],
      },
    ];

    return items.filter(item => 
      user?.role && item.roles.includes(user.role)
    );
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          J5 Pharmacy
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
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
        sx={{ width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` }, ml: { sm: `${DRAWER_WIDTH}px` } }}
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
          <Typography variant="h6" noWrap component="div">
            {getMenuItems().find(item => window.location.pathname.startsWith(item.path))?.text || 'J5 Pharmacy'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` } }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
