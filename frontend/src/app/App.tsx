import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

import Login from '../features/auth/pages/Login';
import DoctorLayout from '../components/layout/DoctorLayout';

import Schedule from '../features/appointments/pages/Schedule';
// import BookAppointment from '../features/appointments/pages/BookAppointment';

import Charts from '../features/charts/pages/Charts';
import PatientChart from '../features/charts/pages/PatientChart';

import Messaging from '../features/messaging/pages/Messaging';

import PatientsList from '../features/patients/pages/PatientsList';
import PatientProfile from '../features/patients/pages/PatientProfile';

import ProvidersList from '../features/providers/pages/ProvidersList';
import EditInfo from '../features/providers/pages/EditInfo';
import ProviderOptions from '../features/providers/pages/ProviderOptions';
import ManageUsers from '../features/providers/pages/ManageUsers';
import Notifications from '../features/providers/pages/Notifications';

import Tasks from '../features/tasks/pages/Tasks';

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
