import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { setAuthToken } from '../../../services/api';

type LoginProps = {
  onLogin: (access: string, refresh: string, remember: boolean) => void;
};

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const rememberedUsers: string[] = JSON.parse(
    localStorage.getItem('rememberedUsers') || '[]'
  );

  // Attempt auto-login if valid tokens exist
  useEffect(() => {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    const refresh =
      localStorage.getItem('refresh') || sessionStorage.getItem('refresh');

    const verifyToken = async () => {
      if (!token || !refresh) return;
      try {
        await API.post('/auth/verify/', { token });
        setAuthToken(token);
        navigate('/doctor/schedule', { replace: true });
      } catch {
        // Token invalid or expired — clear and stay on login
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refresh');
      }
    };
    verifyToken();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/login/', { username, password });
      const { access, refresh } = res.data;

      // Persist tokens
      if (staySignedIn) {
        localStorage.setItem('token', access);
        localStorage.setItem('refresh', refresh);
      } else {
        sessionStorage.setItem('token', access);
        sessionStorage.setItem('refresh', refresh);
      }

      setAuthToken(access);
      onLogin(access, refresh, staySignedIn);

      // Save remembered usernames
      if (!rememberedUsers.includes(username)) {
        localStorage.setItem(
          'rememberedUsers',
          JSON.stringify([...rememberedUsers, username])
        );
      }

      navigate('/doctor/schedule', { replace: true });
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex justify-center items-center h-screen bg-gray-100'>
      <form
        onSubmit={handleLogin}
        noValidate
        className='bg-white p-6 rounded-lg shadow-md w-96'
      >
        <h2 className='text-2xl font-bold mb-4 text-center'>Provider Login</h2>

        <label className='block mb-2 text-sm font-medium text-gray-700'>
          Username
        </label>
        <input
          list='usernames'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className='border p-2 w-full rounded mb-4'
          placeholder='Enter username'
          required
        />
        <datalist id='usernames'>
          {rememberedUsers.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>

        <label className='block mb-2 text-sm font-medium text-gray-700'>
          Password
        </label>
        <input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='border p-2 w-full rounded mb-4'
          placeholder='Enter password'
          required
        />

        <label className='inline-flex items-center mb-4'>
          <input
            type='checkbox'
            checked={staySignedIn}
            onChange={(e) => setStaySignedIn(e.target.checked)}
            className='mr-2'
          />
          Stay signed in
        </label>

        {error && <p className='text-red-500 text-sm mb-2'>{error}</p>}

        <button
          type='submit'
          disabled={loading}
          className={`w-full text-white py-2 rounded transition ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default Login;
