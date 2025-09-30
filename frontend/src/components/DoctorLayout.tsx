import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './TopNavbar';
import styles from './DoctorLayout.module.css';

type DoctorLayoutProps = {
  onLogout: () => void;
};

const DoctorLayout: React.FC<DoctorLayoutProps> = ({ onLogout }) => {
  return (
    <div className={styles.doctorLayout}>
      <Topbar providerName='Dr. Smith' onLogout={onLogout} />
      <div className={styles.mainContent}>
        <Sidebar />
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DoctorLayout;
