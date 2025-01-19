/**
 * db.js
 * Initializes and exports a connection to the SQLite database.
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or open the SQLite database file
const dbPath = path.join(__dirname, 'concerts.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

module.exports = db;
