import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Topbar.module.css';

type TopbarProps = {
  providerName: string;
  onLogout: () => void;
};

const Topbar: React.FC<TopbarProps> = ({ providerName, onLogout }) => {
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  return (
    <div className={styles.topbar}>
      {/* Provider Dropdown */}
      <div
        className={styles.dropdown}
        onMouseEnter={() => setShowProviderMenu(true)}
        onMouseLeave={() => setShowProviderMenu(false)}
      >
        <button className={styles.button}>{providerName} ⌄</button>
        {showProviderMenu && (
          <div className={styles.dropdownContent}>
            <NavLink
              to='/doctor/provider/edit'
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              Edit Info
            </NavLink>
            <NavLink
              to='/doctor/provider/other'
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              Other Option
            </NavLink>
          </div>
        )}
      </div>

      {/* Settings Dropdown */}
      <div
        className={styles.dropdown}
        onMouseEnter={() => setShowSettingsMenu(true)}
        onMouseLeave={() => setShowSettingsMenu(false)}
      >
        <button className={styles.button}>Settings ⚙</button>
        {showSettingsMenu && (
          <div className={styles.dropdownContent}>
            <NavLink
              to='/doctor/settings/notifications'
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              Notifications
            </NavLink>
            <NavLink
              to='/doctor/settings/users'
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              Users
            </NavLink>
          </div>
        )}
      </div>

      {/* Logout */}
      <button className={styles.logout} onClick={onLogout}>
        Logout
      </button>
    </div>
  );
};

export default Topbar;
