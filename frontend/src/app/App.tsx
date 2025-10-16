import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API, { setAuthToken, handleLogout } from '../services/api';

import Login from '../features/auth/pages/Login';
import DoctorLayout from '../components/layout/DoctorLayout';

import Schedule from '../features/appointments/pages/Schedule';
import Charts from '../features/charts/pages/Charts';
import PatientChart from '../features/charts/pages/PatientChart';
import Messaging from '../features/messaging/pages/Messaging';
import PatientsList from '../features/patients/pages/PatientsList';
import PatientProfile from '../features/patients/pages/PatientProfile';
import ProvidersList from '../features/providers/pages/ProvidersList';
import ProviderProfile from '../features/providers/pages/ProviderProfile';
import CreateProvider from '../features/providers/pages/CreateProvider';
import EditInfo from '../features/providers/pages/EditInfo';
import ProviderOptions from '../features/providers/pages/ProviderOptions';
import ManageUsers from '../features/providers/pages/ManageUsers';
import Notifications from '../features/providers/pages/Notifications';
import Tasks from '../features/tasks/pages/Tasks';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Verify token validity before loading routes
  useEffect(() => {
    const verifyToken = async () => {
      const savedToken =
        localStorage.getItem('token') || sessionStorage.getItem('token');

      if (!savedToken) {
        setToken(null);
        setCheckingAuth(false);
        return;
      }

      try {
        setAuthToken(savedToken);
        await API.post('/auth/verify/', { token: savedToken });
        setToken(savedToken);
      } catch {
        handleLogout(); // clears storage and sends to /login
        setToken(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyToken();
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
    handleLogout(); // redirects to /login
    setToken(null);
  };

  if (checkingAuth) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <p className='text-gray-600 text-lg font-medium'>
          Checking authentication…
        </p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      {!token && (
        <>
          <Route path='/login' element={<Login onLogin={handleLogin} />} />
          <Route path='*' element={<Navigate to='/login' replace />} />
        </>
      )}

      {/* Authenticated routes */}
      {token && (
        <>
          <Route
            path='/'
            element={<Navigate to='/doctor/schedule' replace />}
          />
          <Route
            path='/login'
            element={<Navigate to='/doctor/schedule' replace />}
          />
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
            <Route
              path='manage-users/providers/:id'
              element={<ProviderProfile />}
            />
          </Route>
          <Route
            path='*'
            element={<Navigate to='/doctor/schedule' replace />}
          />
        </>
      )}
    </Routes>
  );
};

export default App;
