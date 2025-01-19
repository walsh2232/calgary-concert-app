/**
 * admin.js
 * Routes for adding/editing/deleting concerts.
 * Anyone can now create/update/delete concerts—no admin check.
 */

const express = require('express');
const db = require('../db');
const router = express.Router();

/**
 * POST /admin/concerts
 * Body: { artist, venue, date, time, genre, price, imageUrl }
 */
router.post('/concerts', (req, res) => {
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
 */
router.put('/concerts/:id', (req, res) => {
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
router.delete('/concerts/:id', (req, res) => {
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
