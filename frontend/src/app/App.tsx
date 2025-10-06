import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Login from '../features/auth/pages/Login';
import DoctorLayout from '../components/layout/DoctorLayout';

import Schedule from '../features/appointments/pages/Schedule';
import Charts from '../features/charts/pages/Charts';
import PatientChart from '../features/charts/pages/PatientChart';
import Messaging from '../features/messaging/pages/Messaging';

import PatientsList from '../features/patients/pages/PatientsList';
import PatientProfile from '../features/patients/pages/PatientProfile';

import ProvidersList from '../features/providers/pages/ProvidersList';
import CreateProvider from '../features/providers/pages/CreateProvider';
import EditInfo from '../features/providers/pages/EditInfo';
import ProviderOptions from '../features/providers/pages/ProviderOptions';
import ManageUsers from '../features/providers/pages/ManageUsers';
import Notifications from '../features/providers/pages/Notifications';
import Tasks from '../features/tasks/pages/Tasks';

import { setAuthToken, handleLogout } from '../services/api';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);

  // Restore token on mount
  useEffect(() => {
    const savedToken =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      setAuthToken(savedToken);
    }
  }, []);

  const handleLogin = (
    newAccess: string,
    newRefresh: string,
    remember: boolean
  ) => {
    if (remember) {
      localStorage.setItem('token', newAccess);
      localStorage.setItem('refresh', newRefresh);
    } else {
      sessionStorage.setItem('token', newAccess);
      sessionStorage.setItem('refresh', newRefresh);
    }
    setAuthToken(newAccess);
    setToken(newAccess);
  };

  const handleLogoutClick = () => {
    handleLogout();
    setToken(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {token ? (
          <Route
            path='/doctor'
            element={<DoctorLayout onLogout={handleLogoutClick} />}
          >
            <Route index element={<Navigate to='schedule' replace />} />
            <Route path='schedule' element={<Schedule />} />
            <Route path='tasks' element={<Tasks />} />
            <Route path='charts' element={<Charts />} />
            <Route path='messaging' element={<Messaging />} />

            <Route path='edit-info' element={<EditInfo />} />
            <Route path='provider-options' element={<ProviderOptions />} />
            <Route path='notifications' element={<Notifications />} />
            <Route path='manage-users' element={<ManageUsers />} />
            <Route path='manage-users/patients' element={<PatientsList />} />
            <Route path='manage-users/providers' element={<ProvidersList />} />
            <Route
              path='manage-users/providers/new'
              element={<CreateProvider />}
            />
            <Route path='charts/:id' element={<PatientChart />} />
            <Route
              path='manage-users/patients/:id'
              element={<PatientProfile />}
            />
          </Route>
        ) : (
          <Route path='*' element={<Login onLogin={handleLogin} />} />
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
