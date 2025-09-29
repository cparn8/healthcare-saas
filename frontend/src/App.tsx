import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './components/Login';
import Navbar from './components/Navbar';
import CreatePatient from './components/CreatePatient';
import BookAppointment from './components/BookAppointment';
import PatientList from './components/PatientList';
import { useState } from 'react';

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
    <Router>
      {token && <Navbar onLogout={handleLogout} />}
      <Routes>
        {token ? (
          <>
            <Route path='/' element={<PatientList />} />
            <Route path='/patients' element={<CreatePatient />} />
            <Route path='/appointments' element={<BookAppointment />} />
          </>
        ) : (
          <Route path='*' element={<Login onLogin={handleLogin} />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;
