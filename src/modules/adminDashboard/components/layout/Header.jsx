import React, { useState, useEffect } from 'react';
import headerLogo from '../../assets/headerLogo.png';
import smallHeaderLogo from '../../assets/smallHeaderLogo.png';
import GenericAvatar from '../../assets/GenericAvatar.png';
import DotsMoreDark from '../../assets/dotsMoreDark.png';
import FaSearch from '@mui/icons-material/Search';
import FaSun from '@mui/icons-material/WbSunny';
import FaMoon from '@mui/icons-material/WbCloudy';
import FaCloudSun from '@mui/icons-material/Bedtime';
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
    const [openNotifications, setOpenNotifications] = useState(false);

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
            return `${datePart} ${timePart}`; // Combine date and time without "at"
        };

        updateGreetingAndIcon();
        const intervalId = setInterval(updateGreetingAndIcon, 0); // Update every minute

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    const toggleDrawer = (open) => {
        setIsDrawerOpen(open);
    };

    return (
        <nav className="navbar font-all bg-[#F7FAFD] w-full p-0 border-b-2 border-[#1D242E4D]">
            <div className="container-fluid flex justify-between items-center px-6">

                {/* Logo */}
                <div className="ml-[-26px] bg-white flex items-center justify-center h-[59.7812px] flex-shrink-0"
                    style={{ width: '286px' }}>
                    <a className="navbar-brand mb-0" href="#">
                        <img
                            src={headerLogo} // Conditionally set the logo based on sidebar state
                            alt="J5 Pharmacy Logo"
                            className={`w-auto h-auto max-w-[162px]`}
                        />
                    </a>
                </div>

                {/* Search Bar (Visible on larger screens) */}
                <form className="flex-grow-1 px-4 pe-2" role="search"
                    style={{
                        display: window.innerWidth < 900 ? 'none' : 'flex',
                    }}>
                    <div className="input-group" style={{ width: '100%', justifyContent: 'flex-start' }}>
                        <input
                            className="form-control me-2"
                            type="search"
                            placeholder="Search Medicine here"
                            aria-label="Search"
                            style={{
                                padding: '6px 12px',
                                color: 'rgb(33, 37, 41)',
                                maxWidth: '440px',  // Keep the input field at 440px
                                backgroundColor: '#E3EBF3',
                                fontSize: '13px',
                                border: 'none',
                                marginLeft: '0',   // Align input field to the left
                                paddingLeft: '10px', // Optional: Adds space inside input for text
                                borderRadius: '5px'
                            }}
                        />
                        <button
                            type="submit"
                            className="btn"
                            aria-label="Search"
                            style={{
                                backgroundColor: '#F7FAFD',
                                border: '1px solid #A4A5A7',
                                marginLeft: '-9px',
                                cursor: 'pointer',
                                padding: '2.7px 7px'
                            }}>
                            <FaSearch />
                        </button>
                    </div>
                </form>



                {/* Greeting and Date (Visible on larger devices) */}
                <div className="text-end hidden lg:flex flex-col pr-5"
                    style={{
                        display: window.innerWidth < 900 ? 'none' : 'flex', // Show on small devices (<768px)
                    }}>
                    <p className="mb-[-1.4px] font-bold text-[14px]">
                        {greeting} {icon}
                    </p>
                    <small className="text-[12px] pr-2">{currentTime}</small>
                </div>

                {/* Hamburger Toggle Button for Small Devices (Only visible on small devices) */}
                <Button
                    onClick={() => toggleDrawer(true)}
                    style={{
                        display: window.innerWidth < 900 ? 'block' : 'none', // Show on small devices (<768px)
                        marginRight: '1rem', // Equivalent to `me-4` in Tailwind
                    }}
                    aria-label="Toggle Navigation"
                >
                    <span className="navbar-toggler-icon">f</span>
                </Button>

                {/* Drawer Menu (Material UI Drawer) */}
                <Drawer
                    anchor="right"
                    open={isDrawerOpen}
                    onClose={() => toggleDrawer(false)}
                    className="w-[400px]" // Set the width similar to sidebar
                >
                    <div className="flex flex-col justify-between h-full p-4 w-[350px]">
                        {/* Greeting and Date inside Drawer */}
                        <div>
                            <p className="font-bold text-[14px]">{greeting} {icon}</p>
                            <small className="text-[12px]">{currentTime}</small>
                        </div>

                        {/* Search Form inside Drawer */}
                        <form className="flex mb-3" role="search">
                            <input
                                className="form-control me-2"
                                type="search"
                                placeholder="Search Medicine here"
                                aria-label="Search"
                                style={{ backgroundColor: '#E3EBF3', fontSize: '13px', border: 'none' }}
                            />
                            <button
                                type="submit"
                                className="btn"
                                aria-label="Search"
                                style={{
                                    backgroundColor: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                <FaSearch />
                            </button>
                        </form>

                        {/* Nav Links */}
                        <List>
                            <ListItem button sx={{ display: 'flex', alignItems: 'center' }}>
                                <DashboardIcon sx={{ marginRight: '13px' }} /> {/* Adds space between icon and text */}
                                <ListItemText primary="Dashboard" />
                            </ListItem>
                            <ListItem button onClick={() => setOpenInventory(!openInventory)} sx={{ display: 'flex', alignItems: 'center' }}>
                                <InventoryIcon sx={{ marginRight: '8px' }} /> {/* Adds space between icon and text */}
                                <ListItemText primary="Inventory" />
                                {openInventory ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </ListItem>
                            <Collapse in={openInventory} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <ListItem button sx={{ paddingLeft: '32px' }}>
                                        <ListItemText primary="List of Items" />
                                    </ListItem>
                                    <ListItem button sx={{ paddingLeft: '32px' }}>
                                        <ListItemText primary="Item" />
                                    </ListItem>
                                    <ListItem button sx={{ paddingLeft: '32px' }}>
                                        <ListItemText primary="Encode Items" />
                                    </ListItem>
                                </List>
                            </Collapse>
                            <ListItem button onClick={() => setOpenBranches(!openBranches)} sx={{ display: 'flex', alignItems: 'center' }}>
                                <StoreIcon sx={{ marginRight: '8px' }} /> {/* Adds space between icon and text */}
                                <ListItemText primary="Branches" />
                                {openBranches ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </ListItem>
                            <Collapse in={openBranches} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <ListItem button sx={{ paddingLeft: '32px' }}>
                                        <ListItemText primary="Manage Branch" />
                                    </ListItem>
                                    <ListItem button sx={{ paddingLeft: '32px' }}>
                                        <ListItemText primary="Add a Branch" />
                                    </ListItem>
                                </List>
                            </Collapse>
                            <ListItem button onClick={() => setOpenReports(!openReports)} sx={{ display: 'flex', alignItems: 'center' }}>
                                <BarChartIcon sx={{ marginRight: '8px' }} /> {/* Adds space between icon and text */}
                                <ListItemText primary="Reports" />
                                {openReports ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </ListItem>
                            <Collapse in={openReports} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <ListItem button sx={{ paddingLeft: '32px' }}>
                                        <ListItemText primary="Statistics" />
                                    </ListItem>
                                    <ListItem button sx={{ paddingLeft: '32px' }}>
                                        <ListItemText primary="Sales" />
                                    </ListItem>
                                    <ListItem button sx={{ paddingLeft: '32px' }}>
                                        <ListItemText primary="Inventory" />
                                    </ListItem>
                                    <ListItem button sx={{ paddingLeft: '32px' }}>
                                        <ListItemText primary="Returns" />
                                    </ListItem>
                                    <ListItem button sx={{ paddingLeft: '32px' }}>
                                        <ListItemText primary="Void" />
                                    </ListItem>
                                </List>
                            </Collapse>
                            <ListItem button onClick={() => setOpenEmployee(!openEmployee)} sx={{ display: 'flex', alignItems: 'center' }}>
                                <PeopleIcon sx={{ marginRight: '8px' }} /> {/* Adds space between icon and text */}
                                <ListItemText primary="Employee & Staff" />
                                {openEmployee ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </ListItem>
                            <Collapse in={openEmployee} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <ListItem button sx={{ paddingLeft: '32px' }}>
                                        <ListItemText primary="Employee Management" />
                                    </ListItem>
                                    <ListItem button sx={{ paddingLeft: '32px' }}>
                                        <ListItemText primary="Add an Employee" />
                                    </ListItem>
                                </List>
                            </Collapse>
                            <ListItem button onClick={() => setOpenCustomer(!openCustomer)} sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon sx={{ marginRight: '8px' }} /> {/* Adds space between icon and text */}
                                <ListItemText primary="Customer Info" />
                                {openCustomer ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </ListItem>
                            <Collapse in={openCustomer} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <ListItem button sx={{ paddingLeft: '32px' }}>
                                        <ListItemText primary="Customer Info" />
                                    </ListItem>
                                    <ListItem button sx={{ paddingLeft: '32px' }}>
                                        <ListItemText primary="Manage Customer" />
                                    </ListItem>
                                </List>
                            </Collapse>
                            <ListItem button sx={{ display: 'flex', alignItems: 'center' }}>
                                <NotificationsIcon sx={{ marginRight: '8px' }} /> {/* Adds space between icon and text */}
                                <ListItemText primary="Notifications" />
                            </ListItem>
                            <ListItem button sx={{ display: 'flex', alignItems: 'center' }}>
                                <SettingsIcon sx={{ marginRight: '8px' }} /> {/* Adds space between icon and text */}
                                <ListItemText primary="Settings" />
                            </ListItem>
                        </List>

                        {/* Divider between menu and profile */}
                        <Divider />

                        {/* Profile Section inside Drawer */}
                        <footer className="mt-auto px-8 py-6 border-t border-[#ddd]">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <img src={GenericAvatar} alt="Profile" className="w-12 h-12 rounded-full" />
                                    <div className="ml-4 text-left">
                                        <h5 className="font-medium text-[#333] text-[17px]">Janeth</h5>
                                        <p className="text-[#555] text-[13px] mt-1">Owner</p>
                                    </div>
                                </div>
                                <div className="text-[#333] text-[20px] cursor-pointer">
                                    <img src={DotsMoreDark} alt="" className="w-[3.8px] h-[17px]" />
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
