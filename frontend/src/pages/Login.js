import React, { useState } from 'react';
import { api } from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post('/auth/login', { email, password })
      .then(res => setMessage('Logged in successfully!'))
      .catch(err => setMessage('Login failed.'));
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Email: <input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label><br />
        <label>Password: <input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label><br />
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Login;
