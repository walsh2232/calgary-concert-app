/**
 * admin.js
 * Routes for adding/editing/deleting concerts. Restricted to logged-in admin users.
 */

const express = require('express');
const db = require('../db');
const router = express.Router();

/**
 * Middleware to ensure user is "admin".
 * Here, for simplicity, we'll assume there's only one admin user
 * or you can store a user role in the DB if you want multiple roles.
 */
function adminCheck(req, res, next) {
  // For demonstration, let's assume user with id=1 is admin
  if (req.session.userId === 1) {
    return next();
  }
  return res.status(403).json({ error: 'Not authorized.' });
}

/**
 * POST /admin/concerts
 * Body: { artist, venue, date, time, genre, price, imageUrl }
 */
router.post('/concerts', adminCheck, (req, res) => {
  const { artist, venue, date, time, genre, price, imageUrl } = req.body;
  const sql = `
    INSERT INTO concerts (artist, venue, date, time, genre, price, imageUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(sql, [artist, venue, date, time, genre, price, imageUrl], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ success: true, concertId: this.lastID });
  });
});

/**
 * PUT /admin/concerts/:id
 * Body can include any fields to update
 */
router.put('/concerts/:id', adminCheck, (req, res) => {
  const { id } = req.params;
  const { artist, venue, date, time, genre, price, imageUrl } = req.body;
  const sql = `
    UPDATE concerts
    SET artist = ?, venue = ?, date = ?, time = ?, genre = ?, price = ?, imageUrl = ?
    WHERE id = ?
  `;
  db.run(sql, [artist, venue, date, time, genre, price, imageUrl, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ success: true });
  });
});

/**
 * DELETE /admin/concerts/:id
 */
router.delete('/concerts/:id', adminCheck, (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM concerts WHERE id = ?`;
  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ success: true });
  });
});

module.exports = router;
