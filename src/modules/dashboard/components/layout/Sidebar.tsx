import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useAuth } from '../../../auth/contexts/AuthContext';

const drawerWidth = 280;

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    height: '100vh',
    position: 'fixed',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '4px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.divider,
      borderRadius: '2px',
    },
  },
}));

const UserSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const UserInfo = styled(Box)(({ theme }) => ({
  flex: 1,
  '& .MuiTypography-name': {
    fontWeight: 600,
    fontSize: '1rem',
  },
  '& .MuiTypography-role': {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },
}));

const Footer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  marginTop: 'auto',
  textAlign: 'center',
  '& .MuiTypography-root': {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
}));

interface NavigationItem {
  title: string;
  icon: React.ReactNode;
  children?: { title: string; path: string }[];
  path?: string;
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    title: 'Inventory',
    icon: <InventoryIcon />,
    children: [
      { title: 'List of Items', path: '/inventory/list' },
      { title: 'Item', path: '/inventory/item' },
      { title: 'Encode Items', path: '/inventory/encode' },
    ],
  },
  {
    title: 'Branches',
    icon: <BusinessIcon />,
    children: [
      { title: 'Manage Branch', path: '/branches/manage' },
      { title: 'Add a Branch', path: '/branches/add' },
    ],
  },
  {
    title: 'Reports',
    icon: <AssessmentIcon />,
    children: [
      { title: 'Statistics', path: '/reports/statistics' },
      { title: 'Sales', path: '/reports/sales' },
      { title: 'Inventory', path: '/reports/inventory' },
      { title: 'Returns', path: '/reports/returns' },
      { title: 'Void', path: '/reports/void' },
    ],
  },
  {
    title: 'Employee & Staff',
    icon: <PeopleIcon />,
    children: [
      { title: 'Manage Staff', path: '/staff/manage' },
      { title: 'Add Staff', path: '/staff/add' },
    ],
  },
  {
    title: 'Customer Info',
    icon: <PersonIcon />,
    children: [
      { title: 'Customer List', path: '/customers/list' },
      { title: 'StarPoints', path: '/customers/starpoints' },
    ],
  },
  {
    title: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
  },
  {
    title: 'Notifications',
    icon: <NotificationsIcon />,
    children: [
      { title: 'Announcements', path: '/notifications/announcements' },
      { title: 'Message Board', path: '/notifications/messages' },
    ],
  },
];

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const { logout } = useAuth();
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleItemClick = (title: string) => {
    setOpenItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  return (
    <SidebarContainer>
      <Drawer
        variant="permanent"
        sx={{
          '& .MuiDrawer-paper': {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
        }}
      >
        <UserSection>
          <Avatar
            sx={{ width: 48, height: 48 }}
            src="/path-to-user-image.jpg"
          />
          <UserInfo>
            <Typography className="MuiTypography-name">Janeth</Typography>
            <Typography className="MuiTypography-role">Owner</Typography>
          </UserInfo>
          <IconButton onClick={handleUserMenuClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
          >
            <MenuItem onClick={handleUserMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </UserSection>

        <Divider />

        <List sx={{ flex: 1, overflowY: 'auto', pt: 0 }}>
          {navigationItems.map((item) => (
            <React.Fragment key={item.title}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => item.children && handleItemClick(item.title)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.title} />
                  {item.children && (
                    openItems.includes(item.title) ? <ExpandLess /> : <ExpandMore />
                  )}
                </ListItemButton>
              </ListItem>
              {item.children && (
                <Collapse in={openItems.includes(item.title)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.title}
                        sx={{ pl: 4 }}
                      >
                        <ListItemText primary={child.title} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>

        <Footer>
          <Typography>J5 Pharmacy 2024 v.0.1.1-b1</Typography>
        </Footer>
      </Drawer>
    </SidebarContainer>
  );
};

export default Sidebar;
