import React from 'react';
import { NavLink } from 'react-router-dom';
import Dropdown from '../ui/Dropdown';

type TopbarProps = {
  providerName: string;
  onLogout: () => void;
};

const Topbar: React.FC<TopbarProps> = ({ providerName, onLogout }) => {
  return (
    <div className='flex justify-end items-center bg-white border-b border-gray-300 px-4 py-2 gap-4'>
      {/* Provider menu */}
      <Dropdown
        trigger={({ toggle }) => (
          <button
            onClick={toggle}
            className='px-3 py-2 text-gray-700 hover:text-blue-600'
          >
            {providerName} ⌄
          </button>
        )}
      >
        <NavLink
          to='/doctor/edit-info'
          className={({ isActive }) =>
            `block px-4 py-2 hover:bg-blue-50 ${
              isActive ? 'font-bold text-blue-700 bg-blue-50' : ''
            }`
          }
        >
          Edit Info
        </NavLink>
        <NavLink
          to='/doctor/provider-options'
          className={({ isActive }) =>
            `block px-4 py-2 hover:bg-blue-50 ${
              isActive ? 'font-bold text-blue-700 bg-blue-50' : ''
            }`
          }
        >
          Other Option
        </NavLink>
      </Dropdown>

      {/* Settings menu */}
      <Dropdown
        trigger={({ toggle }) => (
          <button
            onClick={toggle}
            className='px-3 py-2 text-gray-700 hover:text-blue-600'
          >
            ⚙️ Settings
          </button>
        )}
      >
        <NavLink
          to='/doctor/notifications'
          className={({ isActive }) =>
            `block px-4 py-2 hover:bg-blue-50 ${
              isActive ? 'font-bold text-blue-700 bg-blue-50' : ''
            }`
          }
        >
          Notifications
        </NavLink>
        <NavLink
          to='/doctor/manage-users'
          className={({ isActive }) =>
            `block px-4 py-2 hover:bg-blue-50 ${
              isActive ? 'font-bold text-blue-700 bg-blue-50' : ''
            }`
          }
        >
          Users
        </NavLink>
      </Dropdown>

      <button
        onClick={onLogout}
        className='bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600'
      >
        Logout
      </button>
    </div>
  );
};

export default Topbar;
