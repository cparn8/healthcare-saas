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
import PatientsList from './pages/PatientsList';
import ProvidersList from './pages/ProvidersList';
import PatientProfile from './pages/PatientProfile';
import PatientChart from './pages/PatientChart';

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
          <Route
            path='/doctor'
            element={<DoctorLayout onLogout={handleLogout} />}
          >
            {/* Redirect root /doctor to /doctor/schedule */}
            <Route index element={<Navigate to='schedule' replace />} />

            {/* Sidebar pages */}
            <Route path='schedule' element={<Schedule />} />
            <Route path='tasks' element={<Tasks />} />
            <Route path='charts' element={<Charts />} />
            <Route path='messaging' element={<Messaging />} />

            {/* Topbar dropdown pages */}
            <Route path='edit-info' element={<EditInfo />} />
            <Route path='provider-options' element={<ProviderOptions />} />
            <Route path='notifications' element={<Notifications />} />
            <Route path='manage-users' element={<ManageUsers />} />
            <Route path='manage-users/patients' element={<PatientsList />} />
            <Route path='manage-users/providers' element={<ProvidersList />} />
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
