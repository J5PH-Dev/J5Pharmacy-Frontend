import { Outlet } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';

const AdminLayout = () => {
    return (
        <div className="main-container bg-[#F4F7FB] h-screen overflow-hidden">
            {/* Sidebar and header */}
            <Header />
            <Sidebar />
            <div className="content-area h-full w-full p-4 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
