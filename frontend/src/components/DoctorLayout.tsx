import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './TopNavbar';
import '../styles/doctorLayout.css';

type DoctorLayoutProps = {
  onLogout: () => void;
};

const DoctorLayout: React.FC<DoctorLayoutProps> = ({ onLogout }) => {
  return (
    <div className='doctor-layout'>
      <Topbar providerName='Dr. Smith' onLogout={onLogout} />
      <div className='layout-body'>
        <Sidebar />
        <div className='layout-content'>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DoctorLayout;
