import React, { useState } from 'react';
import { Link } from 'react-router-dom';

type TopbarProps = {
  providerName: string;
  onLogout: () => void;
};

const Topbar: React.FC<TopbarProps> = ({ providerName, onLogout }) => {
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  return (
    <div className='top-navbar'>
      {/* Provider dropdown */}
      <div className='dropdown'>
        <button
          onClick={() => {
            setShowProviderMenu(!showProviderMenu);
            setShowSettingsMenu(false);
          }}
        >
          {providerName} ⬇️
        </button>
        {showProviderMenu && (
          <div className='dropdown-menu'>
            <Link to='/doctor/edit-info'>Edit Info</Link>
            <Link to='/doctor/provider-options'>Other Option</Link>
          </div>
        )}
      </div>

      {/* Settings dropdown */}
      <div className='dropdown'>
        <button
          onClick={() => {
            setShowSettingsMenu(!showSettingsMenu);
            setShowProviderMenu(false);
          }}
        >
          ⚙️ Settings
        </button>
        {showSettingsMenu && (
          <div className='dropdown-menu'>
            <Link to='/doctor/notifications'>Notifications</Link>
            <Link to='/doctor/manage-users'>Manage Users</Link>
          </div>
        )}
      </div>

      {/* Logout */}
      <button onClick={onLogout}>Logout</button>
    </div>
  );
};

export default Topbar;
