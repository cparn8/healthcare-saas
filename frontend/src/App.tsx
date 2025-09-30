import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './components/Login';
import DoctorLayout from './components/DoctorLayout';

import Schedule from './pages/Schedule';
import Tasks from './pages/Tasks';
import Charts from './pages/Charts';
import Messaging from './pages/Messaging';
import EditInfo from './pages/EditInfo';
import ProviderOptions from './pages/ProviderOptions';
import Notifications from './pages/Notifications';
import ManageUsers from './pages/ManageUsers';

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
      <Routes>
        {token ? (
          <Route element={<DoctorLayout onLogout={handleLogout} />}>
            <Route path='/' element={<Navigate to='/doctor/schedule' />} />
            <Route path='/doctor/schedule' element={<Schedule />} />
            <Route path='/doctor/tasks' element={<Tasks />} />
            <Route path='/doctor/charts' element={<Charts />} />
            <Route path='/doctor/messaging' element={<Messaging />} />
            <Route path='/doctor/edit-info' element={<EditInfo />} />
            <Route
              path='/doctor/provider-options'
              element={<ProviderOptions />}
            />
            <Route path='/doctor/notifications' element={<Notifications />} />
            <Route path='/doctor/manage-users' element={<ManageUsers />} />
          </Route>
        ) : (
          <Route path='*' element={<Login onLogin={handleLogin} />} />
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
