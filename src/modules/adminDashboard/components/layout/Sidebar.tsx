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
  useMediaQuery,
  ButtonBase,
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
import { Link } from 'react-router-dom';

const drawerWidth = 280;

// Sidebar container styled to respect header height
const SidebarContainer = styled(Box)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 64px)', // Adjust height based on header height
    marginTop: '64px', // Space for header (adjust as necessary)
    overflowY: 'auto', // Enable scrolling for sidebar content
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
  textAlign: 'center',
  marginTop: 'auto',
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
    path: '/admin/dashboard',
  },
  {
    title: 'Inventory',
    icon: <InventoryIcon />,
    path: '/admin/inventory',
    children: [
      { title: 'List of Items', path: '/admin/inventory' },
      { title: 'Item', path: '/inventory/item' },
      { title: 'Encode Items', path: '/inventory/encode' },
    ],
  },
  {
    title: 'Branches',
    icon: <BusinessIcon />,
    path: '/admin/branches',
    children: [
      { title: 'Manage Branch', path: '/branches/manage' },
      { title: 'Add a Branch', path: '/branches/add' },
    ],
  },
  {
    title: 'Reports',
    icon: <AssessmentIcon />,
    path: '/admin/reports',
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
    path: '/admin/employee-staff',
    children: [
      { title: 'Manage Staff', path: '/staff/manage' },
      { title: 'Add Staff', path: '/staff/add' },
    ],
  },
  {
    title: 'Customer Info',
    icon: <PersonIcon />,
    path: '/admin/customer-info',
    children: [
      { title: 'Customer List', path: '/customers/list' },
      { title: 'StarPoints', path: '/customers/starpoints' },
    ],
  },
  {
    title: 'Settings',
    icon: <SettingsIcon />,
    path: '/admin/settings',
  },
  {
    title: 'Notifications',
    icon: <NotificationsIcon />,
    path: '/admin/notifications',
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

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleItemClick = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
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
        variant={isMobile ? 'temporary' : 'permanent'}
        sx={{
          '& .MuiDrawer-paper': {
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        open={!isMobile}
        onClose={() => { }}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {/* User Section */}
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

        {/* Navigation Items */}
        <List sx={{ flex: 1, overflowY: 'auto', pt: 0 }}>
          {navigationItems.map((item) => (
            <React.Fragment key={item.title}>
              <ListItem disablePadding>
                {/* Conditionally render Link only if 'path' is defined */}
                {item.path ? (
                  <Link
                    to={item.path}  // Only render Link if path is defined
                    style={{ width: '100%', textDecoration: 'none' }}
                  >
                    <ListItemButton onClick={() => item.children && handleItemClick(item.title)}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.title} />
                      {item.children && (
                        openItems.includes(item.title) ? <ExpandLess /> : <ExpandMore />
                      )}
                    </ListItemButton>
                  </Link>
                ) : (
                  // If no path is provided, render just the ListItemButton (no Link)
                  <ListItemButton onClick={() => item.children && handleItemClick(item.title)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.title} />
                    {item.children && (
                      openItems.includes(item.title) ? <ExpandLess /> : <ExpandMore />
                    )}
                  </ListItemButton>
                )}
              </ListItem>
              {item.children && (
                <Collapse in={openItems.includes(item.title)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <Link
                        key={child.title}
                        to={child.path}  // Only render Link if path is defined
                        style={{ width: '100%', textDecoration: 'none' }}
                      >
                        <ListItemButton sx={{ pl: 4 }}>
                          <ListItemText primary={child.title} />
                        </ListItemButton>
                      </Link>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>


        {/* Footer */}
        <Footer>
          <Typography>J5 Pharmacy 2024 v.0.1.1-b1</Typography>
        </Footer>
      </Drawer>
    </SidebarContainer>
  );
};

export default Sidebar;
