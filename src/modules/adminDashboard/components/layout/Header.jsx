import React, { useState, useEffect } from 'react';
import headerLogo from '../../assets/headerLogo.png';
import GenericAvatar from '../../assets/GenericAvatar.png';
import FaSearch from '@mui/icons-material/Search';
import FaSun from '@mui/icons-material/WbSunny';
import FaMoon from '@mui/icons-material/WbCloudy';
import FaCloudSun from '@mui/icons-material/Bedtime';
import { Drawer, Button, List, ListItem, ListItemText, Collapse } from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Inventory as InventoryIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import './Header.css';

const Header = () => {
    const [greeting, setGreeting] = useState('');
    const [icon, setIcon] = useState(<FaSun />);
    const [currentTime, setCurrentTime] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [openInventory, setOpenInventory] = useState(false);

    useEffect(() => {
        const updateGreetingAndIcon = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleString());
            const hour = now.getHours();
            if (hour < 12) {
                setGreeting('Good Morning');
                setIcon(<FaSun />);
            } else if (hour < 18) {
                setGreeting('Good Afternoon');
                setIcon(<FaCloudSun />);
            } else {
                setGreeting('Good Evening');
                setIcon(<FaMoon />);
            }
        };

        updateGreetingAndIcon();
        const intervalId = setInterval(updateGreetingAndIcon, 1000);
        return () => clearInterval(intervalId);
    }, []);

    const toggleDrawer = (open) => {
        setIsDrawerOpen(open);
    };

    return (
        <nav className="navbar">
            <div className="container-fluid">
                {/* Logo */}
                <div className="navbar-logo">
                    <a href="#">
                        <img src={headerLogo} alt="J5 Pharmacy Logo" className="navbar-logo-image" />
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

                {/* Hamburger Menu */}
                <Button
                    onClick={() => toggleDrawer(true)}
                    className="navbar-toggler"
                    aria-label="Toggle Navigation"
                >
                    ☰
                </Button>

                {/* Drawer */}
                <Drawer
                    anchor="right"
                    open={isDrawerOpen}
                    onClose={() => toggleDrawer(false)}
                >
                    <div className="drawer-content">
                        {/* Greeting and Date in Drawer */}
                        <div className="drawer-greeting">
                            <p>{greeting} {icon}</p>
                            <small>{currentTime}</small>
                        </div>

                        {/* Search in Drawer */}
                        <form className="drawer-search-bar" role="search">
                            <input
                                type="search"
                                placeholder="Search Medicine here"
                                aria-label="Search"
                            />
                            <button type="submit" aria-label="Search">
                                <FaSearch />
                            </button>
                        </form>

                        {/* Navigation Links */}
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

                        {/* Profile in Drawer */}
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
