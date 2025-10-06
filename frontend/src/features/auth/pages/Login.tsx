import { useEffect, useState } from 'react';
import API, { setAuthToken } from '../../../services/api';

type LoginProps = {
  onLogin: (access: string, refresh: string, remember: boolean) => void;
};

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(false);

  const rememberedUsers: string[] = JSON.parse(
    localStorage.getItem('rememberedUsers') || '[]'
  );

  // Auto-login if tokens already exist
  useEffect(() => {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    const refresh =
      localStorage.getItem('refresh') || sessionStorage.getItem('refresh');
    if (token && refresh) {
      setAuthToken(token);
      window.location.href = '/doctor/schedule';
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await API.post('/auth/login/', { username, password });
      const { access, refresh } = res.data;

      if (staySignedIn) {
        localStorage.setItem('token', access);
        localStorage.setItem('refresh', refresh);
      } else {
        sessionStorage.setItem('token', access);
        sessionStorage.setItem('refresh', refresh);
      }

      setAuthToken(access);
      onLogin(access, refresh, staySignedIn);

      if (!rememberedUsers.includes(username)) {
        localStorage.setItem(
          'rememberedUsers',
          JSON.stringify([...rememberedUsers, username])
        );
      }

      window.location.href = '/doctor/schedule';
    } catch {
      setError('Invalid username or password');
    }
  };

  return (
    <div className='flex justify-center items-center h-screen bg-gray-100'>
      <form
        onSubmit={handleLogin}
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
          className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition'
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;
