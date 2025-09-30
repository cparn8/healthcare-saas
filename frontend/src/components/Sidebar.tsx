import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  return (
    <div className={styles.sidebar}>
      <NavLink
        to='/doctor/schedule'
        className={({ isActive }) =>
          isActive ? `${styles.link} ${styles.active}` : styles.link
        }
      >
        Schedule
      </NavLink>
      <NavLink
        to='/doctor/tasks'
        className={({ isActive }) =>
          isActive ? `${styles.link} ${styles.active}` : styles.link
        }
      >
        Tasks
      </NavLink>
      <NavLink
        to='/doctor/charts'
        className={({ isActive }) =>
          isActive ? `${styles.link} ${styles.active}` : styles.link
        }
      >
        Charts
      </NavLink>
      <NavLink
        to='/doctor/messaging'
        className={({ isActive }) =>
          isActive ? `${styles.link} ${styles.active}` : styles.link
        }
      >
        Messaging
      </NavLink>
    </div>
  );
};

export default Sidebar;
