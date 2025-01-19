/**
 * server.js
 * Main entry point for the Node/Express server.
 */

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const db = require('./db');
require('./models'); // Ensure tables are created

const authRoutes = require('./routes/auth');
const concertRoutes = require('./routes/concerts');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// Simple session config
app.use(session({
  secret: 'YOUR_SECRET_HERE', // Replace with a secure secret
  resave: false,
  saveUninitialized: false
}));

// Increment visitor count for each request
app.use((req, res, next) => {
  db.run(`UPDATE visitor_count SET count = count + 1 WHERE id = 1`);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/concerts', concertRoutes);
app.use('/admin', adminRoutes);

// Basic Terms/Privacy endpoint
app.get('/privacy', (req, res) => {
  res.send(`
    <h1>Privacy & Terms</h1>
    <p>We collect your email for user accounts and do not share your data with third parties.</p>
  `);
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
