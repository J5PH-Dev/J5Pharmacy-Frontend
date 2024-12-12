import React, { useState, useEffect } from 'react'; 
import headerLogo from '../../assets/headerLogo.png';
import smallHeaderLogo from '../../assets/smallHeaderLogo.png';
import GenericAvatar from '../../assets/GenericAvatar.png';
import DotsMoreDark from '../../assets/dotsMoreDark.png';
import FaSearch from '@mui/icons-material/Search';
import FaSun from '@mui/icons-material/WbSunny';
import FaMoon from '@mui/icons-material/WbCloudy';
import FaCloudSun from '@mui/icons-material/Bedtime';
import './Header.css';
import { Drawer, Button, List, ListItem, ListItemText, Divider, Collapse } from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Inventory as InventoryIcon,
    Store as StoreIcon,
    BarChart as BarChartIcon,
    People as PeopleIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Notifications as NotificationsIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const Header = () => {
    const [greeting, setGreeting] = useState('');
    const [icon, setIcon] = useState(<FaSun />); // Default icon
    const [currentTime, setCurrentTime] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State to control Drawer visibility
    const [openInventory, setOpenInventory] = useState(false);
    const [openBranches, setOpenBranches] = useState(false);
    const [openReports, setOpenReports] = useState(false);
    const [openEmployee, setOpenEmployee] = useState(false);
    const [openCustomer, setOpenCustomer] = useState(false);

    useEffect(() => {
        const updateGreetingAndIcon = () => {
            const now = new Date();
            setCurrentTime(formatDate(now)); // Update the current time

            const currentHour = now.getHours();
            if (currentHour < 12) {
                setGreeting('Good Morning');
                setIcon(<FaSun />);
            } else if (currentHour < 18) {
                setGreeting('Good Afternoon');
                setIcon(<FaCloudSun />);
            } else {
                setGreeting('Good Evening');
                setIcon(<FaMoon />);
            }
        };

        const formatDate = (date) => {
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            const datePart = date.toLocaleDateString('en-US', options); // Format only the date
            const timePart = date.toTimeString().split(' ')[0]; // Get time in HH:MM:SS format
            return `${datePart} ${timePart}`; // Combine date and time
        };

        updateGreetingAndIcon();
        const intervalId = setInterval(updateGreetingAndIcon, 1000); // Update every second

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    const toggleDrawer = (open) => {
        setIsDrawerOpen(open);
    };

    return (
        <nav className="navbar">
            <div className="container-fluid">

                {/* Logo */}
                <div className="navbar-logo">
                    <a className="navbar-brand" href="#">
                        <img
                            src={headerLogo}
                            alt="J5 Pharmacy Logo"
                            className="navbar-logo-image"
                        />
                    </a>
                </div>

                {/* Search Bar */}
                <form className="header-search-bar" role="search">
                    <input
                        type="search"
                        placeholder="Search Medicine here"
                        aria-label="Search"
                    />
                    <button type="submit" className="header-search-button" aria-label="Search">
                        <FaSearch />
                    </button>
                </form>

                {/* Greeting and Date */}
                <div className="header-greeting-container">
                    <p className="header-greeting">
                        {greeting} {icon}
                    </p>
                    <small className="header-date">{currentTime}</small>
                </div>

                {/* Hamburger Toggle Button */}
                <Button
                    onClick={() => toggleDrawer(true)}
                    className="navbar-toggler"
                    aria-label="Toggle Navigation"
                >
                    <span className="navbar-toggler-icon">f</span>
                </Button>

                {/* Drawer Menu */}
                <Drawer
                    anchor="right"
                    open={isDrawerOpen}
                    onClose={() => toggleDrawer(false)}
                >
                    <div className="drawer-content">
                        <div>
                            <p className="header-greeting">{greeting} {icon}</p>
                            <small className="header-date">{currentTime}</small>
                        </div>

                        <form className="header-search-bar drawer-search-bar" role="search">
                            <input
                                type="search"
                                placeholder="Search Medicine here"
                                aria-label="Search"
                            />
                            <button type="submit" className="header-search-button" aria-label="Search">
                                <FaSearch />
                            </button>
                        </form>

                        {/* Nav Links */}
                        <List>
                            <ListItem button>
                                <DashboardIcon />
                                <ListItemText primary="Dashboard" />
                            </ListItem>
                            <ListItem button onClick={() => setOpenInventory(!openInventory)}>
                                <InventoryIcon />
                                <ListItemText primary="Inventory" />
                                {openInventory ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </ListItem>
                            <Collapse in={openInventory} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <ListItem button>
                                        <ListItemText primary="List of Items" />
                                    </ListItem>
                                </List>
                            </Collapse>
                        </List>

                        {/* Profile Section */}
                        <footer className="drawer-footer">
                            <div className="drawer-profile">
                                <img src={GenericAvatar} alt="Profile" />
                                <div className="drawer-profile-info">
                                    <h5>Janeth</h5>
                                    <p>Owner</p>
                                </div>
                            </div>
                        </footer>
                    </div>
                </Drawer>
            </div>
        </nav>
    );
};

export default Header;
