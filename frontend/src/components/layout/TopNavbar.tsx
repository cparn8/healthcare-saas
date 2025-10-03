import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';

type TopbarProps = {
  providerName: string;
  onLogout: () => void;
};

const Topbar: React.FC<TopbarProps> = ({ providerName, onLogout }) => {
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const providerRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        providerRef.current &&
        !providerRef.current.contains(event.target as Node)
      ) {
        setShowProviderMenu(false);
      }
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to close both menus after navigation
  const closeMenus = () => {
    setShowProviderMenu(false);
    setShowSettingsMenu(false);
  };

  return (
    <div className='flex justify-end items-center bg-white border-b border-gray-300 px-4 py-2'>
      {/* Provider Dropdown */}
      <div ref={providerRef} className='relative mr-4'>
        <button
          onClick={() => {
            setShowProviderMenu(!showProviderMenu);
            setShowSettingsMenu(false);
          }}
          className='px-3 py-2 text-gray-700 hover:text-blue-600'
        >
          {providerName} ⌄
        </button>
        {showProviderMenu && (
          <div className='absolute top-10 right-0 bg-white border border-gray-300 shadow-md rounded w-40'>
            <NavLink
              to='/doctor/edit-info'
              onClick={closeMenus}
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
              onClick={closeMenus}
              className={({ isActive }) =>
                `block px-4 py-2 hover:bg-blue-50 ${
                  isActive ? 'font-bold text-blue-700 bg-blue-50' : ''
                }`
              }
            >
              Other Option
            </NavLink>
          </div>
        )}
      </div>

      {/* Settings Dropdown */}
      <div ref={settingsRef} className='relative mr-4'>
        <button
          onClick={() => {
            setShowSettingsMenu(!showSettingsMenu);
            setShowProviderMenu(false);
          }}
          className='px-3 py-2 text-gray-700 hover:text-blue-600'
        >
          ⚙️ Settings
        </button>
        {showSettingsMenu && (
          <div className='absolute top-10 right-0 bg-white border border-gray-300 shadow-md rounded w-40'>
            <NavLink
              to='/doctor/notifications'
              onClick={closeMenus}
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
              onClick={closeMenus}
              className={({ isActive }) =>
                `block px-4 py-2 hover:bg-blue-50 ${
                  isActive ? 'font-bold text-blue-700 bg-blue-50' : ''
                }`
              }
            >
              Users
            </NavLink>
          </div>
        )}
      </div>

      {/* Logout Button */}
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
