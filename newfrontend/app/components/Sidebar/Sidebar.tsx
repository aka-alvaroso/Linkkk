import React from 'react';
import DesktopSidebar from './DesktopSidebar';
import MobileNavbar from '../Navbar/MobileNavbar';

const Sidebar = () => {
    return (
        <div>
            <MobileNavbar />
            <DesktopSidebar />
        </div>
    );
};

export default Sidebar;
