import React, { useState } from 'react';
import { api } from '../services/api';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post('/auth/signup', { email, password })
      .then(res => setMessage('Account created successfully!'))
      .catch(err => setMessage('Signup failed or user already exists.'));
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <label>Email: <input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label><br />
        <label>Password: <input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label><br />
        <button type="submit">Sign Up</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Signup;
