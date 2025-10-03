import React, { useState } from 'react';
import API, { setAuthToken } from '../../../services/api';

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      //  Fixed path
      const res = await API.post('token/', { username, password });

      const access = res.data.access;
      const refresh = res.data.refresh;

      //  Store both tokens
      setAuthToken(access);
      localStorage.setItem('refresh', refresh);

      onLogin(access);
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type='text'
        placeholder='Username'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type='password'
        placeholder='Password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type='submit'>Login</button>
    </form>
  );
};

export default Login;
