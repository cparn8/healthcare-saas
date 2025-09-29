import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <aside className='sidebar'>
      <ul>
        <li>
          <Link to='/doctor/schedule'>Schedule</Link>
        </li>
        <li>
          <Link to='/doctor/tasks'>Tasks</Link>
        </li>
        <li>
          <Link to='/doctor/charts'>Charts</Link>
        </li>
        <li>
          <Link to='/doctor/messaging'>Messaging</Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
