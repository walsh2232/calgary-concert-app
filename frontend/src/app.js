import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminPage from './pages/AdminPage';
import CardView from './components/CardView';
import ListView from './components/ListView';

function App() {
  return (
    <Router>
      <nav style={{ display: 'flex', gap: '1rem', background: 'red', padding: '1rem' }}>
        <Link to="/">Home</Link>
        <Link to="/list">My List</Link>
        <Link to="/admin">Admin</Link>
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
      </nav>
      <Routes>
        <Route path="/" element={<CardView />} />
        <Route path="/list" element={<ListView />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
