/**
 * auth.js
 * Handles user signup and login using email/password.
 */

const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

/**
 * POST /signup
 * Body: { email, password }
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into users table
    const insertStmt = `INSERT INTO users (email, password) VALUES (?, ?)`;
    db.run(insertStmt, [email, hashedPassword], function (err) {
      if (err) {
        return res.status(400).json({ error: 'User already exists or invalid data.' });
      }
      return res.json({ success: true, message: 'User created.' });
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * POST /login
 * Body: { email, password }
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const selectStmt = `SELECT * FROM users WHERE email = ?`;
  db.get(selectStmt, [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Simple session or token-based approach
    req.session.userId = user.id;
    return res.json({ success: true, message: 'Logged in.' });
  });
});

/**
 * GET /logout
 */
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out.' });
});

module.exports = router;
