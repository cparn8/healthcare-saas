import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNavbar from './TopNavbar';
import Sidebar from './Sidebar';

const DoctorLayout: React.FC = () => {
  return (
    <div className='app-container'>
      <TopNavbar />
      <div className='content-container'>
        <Sidebar />
        <main className='page-content'>
          <Outlet /> {/* renders child routes */}
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
