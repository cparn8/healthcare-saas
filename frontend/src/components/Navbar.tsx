import React from 'react';
import { Link } from 'react-router-dom';

type NavbarProps = {
  onLogout: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  return (
    <nav>
      <ul>
        <li>
          <Link to='/'>Dashboard</Link>
        </li>
        <li>
          <Link to='/appointments'>Appointments</Link>
        </li>
        <li>
          <Link to='/patients'>Patients</Link>
        </li>
        <li>
          <button onClick={onLogout}>Logout</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
