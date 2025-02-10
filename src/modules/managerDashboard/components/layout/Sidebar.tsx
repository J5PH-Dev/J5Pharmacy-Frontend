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
  Modal,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useAuth } from '../../../auth/contexts/AuthContext';

const drawerWidth = 280;

// Sidebar container styled to respect header height
const SidebarContainer = styled(Box)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: '#284E3B',
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 61px)', // Adjust height based on header height
    marginTop: '61px', // Space for header (adjust as necessary)
    overflowY: 'auto', // Enable scrolling for sidebar content
    borderRadius: '101px', // Add custom border-radius

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
  paddingBottom: '30px',
  paddingLeft: '30px',
  paddingTop: '45px',
  paddingRight: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const UserInfo = styled(Box)(({ theme }) => ({
  flex: 1,
  '& .MuiTypography-name': {
    fontWeight: 600,
    fontSize: '1rem',
    color: '#FFFFFF',
  },
  '& .MuiTypography-role': {
    color: '#FED600',
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
    path: '/manager/dashboard',
  },
  {
    title: 'Inventory',
    icon: <InventoryIcon />,
    path: '/manager/inventory',
    children: [
      // { title: 'List of Items', path: '/manager/inventory' },
      // { title: 'Item', path: '/manager/inventory/item' },
      // { title: 'Encode Items', path: '/manager/inventory/encode' },
    ],
  },
  // {
  //   title: 'Resource Management',
  //   icon: <LocalShippingIcon />,
  //   path: '/manager/resources',
  //   children: [
  //     // { title: 'Supplier Management', path: '/manager/resources/supplier-management' },
  //     // { title: 'Bulk Inventory Import', path: '/manager/resources/bulk-inventory-import' },
  //     // { title: 'Price Management', path: '/manager/resources/price-management' },
  //   ],
  // },
  // {
  //   title: 'Reports',
  //   icon: <AssessmentIcon />,
  //   path: '/manager/sales-report',
  //   children: [
  //     // { title: 'Statistics', path: '/manager/reports/statistics' },
  //     // { title: 'Sales', path: '/manager/reports/sales' },
  //     // { title: 'Inventory', path: '/manager/reports/inventory' },
  //     // { title: 'Returns', path: '/manager/reports/returns' },
  //     // { title: 'Void', path: '/manager/reports/void' },
  //   ],
  // },
  {
    title: 'Employee & Staff',
    icon: <PeopleIcon />,
    path: '/manager/employee-staff',
    children: [
      // { title: 'Manage Staff', path: '/manager/staff/manage' },
      // { title: 'Add Staff', path: '/manager/staff/add' },
    ],
  },
  {
    title: 'Customer Info',
    icon: <PersonIcon />,
    path: '/manager/customer-info',
    children: [
      // { title: 'Customer List', path: '/manager/customers/list' },
      // { title: 'StarPoints', path: '/manager/customers/starpoints' },
    ],
  },
  // {
  //   title: 'Settings',
  //   icon: <SettingsIcon />,
  //   path: '/manager/settings',
  // },
  // {
  //   title: 'Notifications',
  //   icon: <NotificationsIcon />,
  //   path: '/manager/notifications',
  //   children: [
  //     // { title: 'Announcements', path: '/manager/notifications/announcements' },
  //     // { title: 'Message Board', path: '/manager/notifications/messages' },
  //   ],
  // },
];

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeItem, setActiveItem] = useState<string>(navigationItems[0].path || '');
  const [isModalOpen, setModalOpen] = useState(false);

  // Get user data from localStorage for additional info
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Format image URL if image_data exists
  const userImageUrl = userData.image_data 
    ? `data:${userData.image_type || 'image/jpeg'};base64,${userData.image_data}`
    : undefined;

  // Update active item based on the current location (path)
  React.useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const handleItemClick = (title: string, path: string) => {
    setActiveItem(path);  // Set active item on click
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
    navigate(path); // Navigate to the path
  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleUserProfile = () => {
    handleUserMenuClose(); // Close the user menu
    setModalOpen(true); // Open the modal
  };

  const handleModalClose = () => {
    setModalOpen(false);
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
            borderRadius: '0px',
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
            sx={{ 
              width: 48, 
              height: 48,
              bgcolor: '#FED600',
              color: '#1B3E2D',
            }} 
            src={userImageUrl}
            alt={userData.name}
          >
            {userData.name ? userData.name[0].toUpperCase() : 'U'}
          </Avatar>
          <UserInfo>
            <Typography className="MuiTypography-name">{userData.name || 'User'}</Typography>
            <Typography className="MuiTypography-role">{userData.role || 'Role'}</Typography>
          </UserInfo>
          <IconButton onClick={handleUserMenuClick}>
            <MoreVertIcon style={{ color: 'white' }} />
          </IconButton>
          <Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={handleUserMenuClose}>
            <MenuItem onClick={handleUserProfile}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </UserSection>

        {/* Navigation Items */}
        <List sx={{ flex: 1, overflowY: 'auto', pt: 0 }}>
          {navigationItems.map((item, index) => (
            <React.Fragment key={item.title}>
              <ListItem disablePadding>
                {item.path ? (
                  <Link to={item.path} style={{ width: '100%', textDecoration: 'none' }}>
                    <ListItemButton
                      onClick={() => handleItemClick(item.title, item.path!)}
                      sx={{
                        backgroundColor: activeItem === item.path ? '#1D9928' : 'transparent', // Active color
                        '&:hover': {
                          backgroundColor: activeItem === item.path ? '#1D9928' : '#1D3E2E', // Hover color
                        },
                        pl: '25px', // Left padding
                        pt: '10px', // Top padding
                        pb: '10px', // Bottom padding
                      }}
                    >
                      <ListItemIcon style={{ color: 'white' }}>{item.icon}</ListItemIcon>
                      <ListItemText style={{ color: 'white', fontWeight: 'normal', marginLeft: '-10px' }} primary={item.title} />
                    </ListItemButton>
                  </Link>
                ) : (
                  <ListItemButton onClick={() => item.children && handleItemClick(item.title, '')}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.title} />
                    {item.children && (openItems.includes(item.title) ? <ExpandLess /> : <ExpandMore />)}
                  </ListItemButton>
                )}
              </ListItem>
              {item.children && (
                <Collapse in={openItems.includes(item.title)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <Link key={child.title} to={child.path} style={{ width: '100%', textDecoration: 'none' }}>
                        <ListItemButton sx={{ pl: 4 }}>
                          <ListItemText primary={child.title} />
                        </ListItemButton>
                      </Link>
                    ))}
                  </List>
                </Collapse>
              )}

              {/* Divider after 4th item */}
              {index === 3 && <Divider sx={{ borderColor: '#5D7A6C', mt: '10px', mb: '10px' }} />}

              {/* White Divider after 6th item */}
              {index === 6 && <Divider sx={{ borderColor: '#5D7A6C', mt: '10px', mb: '10px' }} />}

            </React.Fragment>
          ))}
        </List>

        {/* Modal */}
        <Modal open={isModalOpen} onClose={handleModalClose}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              padding: '30px 40px',
              boxShadow: 24,
              width: '600px',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                margin: '0 auto 20px',
                backgroundColor: '#FED600',
                color: '#1B3E2D',
              }}
              src={userImageUrl}
              alt={userData.name}
            >
              {userData.name ? userData.name[0].toUpperCase() : 'U'}
            </Avatar>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              {userData.name}
            </Typography>
            <Box sx={{ textAlign: 'left', color: '#555', marginBottom: 4 }}>
              <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Role:</strong> {userData.role}
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Branch:</strong> {userData.branch_name || 'All Branches'}
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Employee ID:</strong> {userData.employeeId}
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Hired Date:</strong> {new Date(userData.hired_at).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Email:</strong> {userData.email || 'Not provided'}
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Phone:</strong> {userData.phone || 'Not provided'}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleModalClose}
              sx={{ marginTop: 2 }}
            >
              Close
            </Button>
          </Box>
        </Modal>

        {/* Footer */}
        <Footer sx={{ color: 'white', backgroundColor: '#1B3E2D' }}>
          <Typography style={{ color: 'white', fontWeight: '200' }}>J5 Pharmacy 2025 v.0.2.5</Typography>
        </Footer>
      </Drawer>
    </SidebarContainer>
  );
};

export default Sidebar;