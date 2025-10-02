import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <aside className='w-56 bg-gray-100 border-r border-gray-300 h-screen pt-4 flex flex-col'>
      <NavLink
        to='/doctor/schedule'
        className={({ isActive }) =>
          `block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700 ${
            isActive
              ? 'font-bold text-blue-700 border-l-4 border-blue-700 bg-blue-50'
              : ''
          }`
        }
      >
        Schedule
      </NavLink>
      <NavLink
        to='/doctor/tasks'
        className={({ isActive }) =>
          `block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700 ${
            isActive
              ? 'font-bold text-blue-700 border-l-4 border-blue-700 bg-blue-50'
              : ''
          }`
        }
      >
        Tasks
      </NavLink>
      <NavLink
        to='/doctor/charts'
        className={({ isActive }) =>
          `block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700 ${
            isActive
              ? 'font-bold text-blue-700 border-l-4 border-blue-700 bg-blue-50'
              : ''
          }`
        }
      >
        Charts
      </NavLink>
      <NavLink
        to='/doctor/messaging'
        className={({ isActive }) =>
          `block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700 ${
            isActive
              ? 'font-bold text-blue-700 border-l-4 border-blue-700 bg-blue-50'
              : ''
          }`
        }
      >
        Messaging
      </NavLink>
    </aside>
  );
};

export default Sidebar;
