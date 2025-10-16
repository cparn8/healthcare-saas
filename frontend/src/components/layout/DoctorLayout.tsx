import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

type DoctorLayoutProps = {
  onLogout: () => void;
};

const DoctorLayout: React.FC<DoctorLayoutProps> = ({ onLogout }) => {
  return (
    <div className='flex flex-col h-screen bg-gray-50 font-sans'>
      {/* Top navigation bar */}
      <TopNavbar onLogout={onLogout} />

      {/* Main content area */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Sidebar navigation */}
        <Sidebar />

        {/* Page content */}
        <div className='flex-1 p-4 overflow-y-auto bg-gray-50'>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DoctorLayout;
