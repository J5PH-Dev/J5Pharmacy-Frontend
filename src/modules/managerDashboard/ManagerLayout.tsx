import { Outlet } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import { useState } from 'react';

const ManagerLayout = () => {
    return (
        <div className="main-container bg-[#F4F7FB] h-screen">
            {/* Sidebar and header */}
            <Header />
            <Sidebar />
            <div className="content-area">
                <Outlet />
            </div>
        </div>
    );
};

export default ManagerLayout;
