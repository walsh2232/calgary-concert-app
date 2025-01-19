/**
 * concerts.js
 * Routes for getting concerts, filtering, and overlap checking.
 */

const express = require('express');
const db = require('../db');
const router = express.Router();

/**
 * GET /concerts
 * Query params can include dateRange, venue, genre, etc.
 */
router.get('/', (req, res) => {
  let { venue, genre, priceMin, priceMax, dateStart, dateEnd } = req.query;
  let query = `SELECT * FROM concerts WHERE 1=1`;
  const params = [];

  if (venue) {
    query += ` AND venue = ?`;
    params.push(venue);
  }
  if (genre) {
    query += ` AND genre = ?`;
    params.push(genre);
  }
  if (priceMin) {
    query += ` AND price >= ?`;
    params.push(priceMin);
  }
  if (priceMax) {
    query += ` AND price <= ?`;
    params.push(priceMax);
  }
  if (dateStart) {
    // Assuming date is stored as YYYY-MM-DD
    query += ` AND date >= ?`;
    params.push(dateStart);
  }
  if (dateEnd) {
    query += ` AND date <= ?`;
    params.push(dateEnd);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(rows);
  });
});

/**
 * GET /concerts/overlap
 * Example approach: pass two concert IDs, return travel time info or overlap status.
 */
router.get('/overlap', (req, res) => {
  const { fromConcertId, toConcertId } = req.query;
  // Simple demonstration (we’d need to compare date/time from each concert and travel time)
  // For brevity, we’ll just illustrate returning travel time info here.
  const sql = `
    SELECT c1.venue as fromVenue, c2.venue as toVenue, t.travelMinutes
    FROM concerts c1
    JOIN concerts c2
      ON c2.id = ?
    LEFT JOIN travel_times t
      ON t.fromVenue = c1.venue AND t.toVenue = c2.venue
    WHERE c1.id = ?
  `;
  db.get(sql, [toConcertId, fromConcertId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(row || {});
  });
});

module.exports = router;
