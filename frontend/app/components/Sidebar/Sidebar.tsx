import React from 'react';
import DesktopSidebar from './DesktopSidebar';
import MobileNavigation from "../Navigation/MobileNavigation";


const Sidebar = () => {
    return (
        <div>
            <MobileNavigation />
            <DesktopSidebar />
        </div>
    );
};

export default Sidebar;
