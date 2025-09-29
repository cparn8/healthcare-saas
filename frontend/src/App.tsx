import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

import Login from './components/Login';
import DoctorLayout from './components/DoctorLayout';

// placeholder doctor pages
import Schedule from './pages/SchedulePage';
import Tasks from './pages/TasksPage';
import Charts from './pages/ChartsPage';
import Messaging from './pages/MessagingPage';
import EditProviderInfo from './pages/doctor/EditProviderInfo';
import Notifications from './pages/doctor/Notifications';
import ManageUsers from './pages/doctor/ManageUsers';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <BrowserRouter>
      {token ? (
        <Routes>
          <Route
            path='/doctor'
            element={<DoctorLayout onLogout={handleLogout} />}
          >
            <Route path='schedule' element={<Schedule />} />
            <Route path='tasks' element={<Tasks />} />
            <Route path='charts' element={<Charts />} />
            <Route path='messaging' element={<Messaging />} />

            {/* New dropdown-linked pages */}
            <Route path='edit-info' element={<EditProviderInfo />} />
            <Route path='notifications' element={<Notifications />} />
            <Route path='manage-users' element={<ManageUsers />} />

            <Route index element={<Navigate to='schedule' />} />
          </Route>
          <Route path='*' element={<Navigate to='/doctor/schedule' />} />
        </Routes>
      ) : (
        <Routes>
          <Route path='*' element={<Login onLogin={handleLogin} />} />
        </Routes>
      )}
    </BrowserRouter>
  );
};

export default App;
