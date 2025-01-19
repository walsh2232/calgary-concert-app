/**
 * models.js
 * Contains SQL setup and table creation for users, concerts, travel times, and more.
 */

const db = require('./db');

// Create tables if they don't exist
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // Concerts table
  db.run(`
    CREATE TABLE IF NOT EXISTS concerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      artist TEXT NOT NULL,
      venue TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      genre TEXT,
      price REAL,
      imageUrl TEXT
    )
  `);

  // Travel times table (store approximate travel time between venues in minutes)
  db.run(`
    CREATE TABLE IF NOT EXISTS travel_times (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fromVenue TEXT NOT NULL,
      toVenue TEXT NOT NULL,
      travelMinutes INTEGER
    )
  `);

  // Visitor count table
  db.run(`
    CREATE TABLE IF NOT EXISTS visitor_count (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      count INTEGER NOT NULL
    )
  `, () => {
    // Initialize visitor count if no entry yet
    db.get(`SELECT count FROM visitor_count WHERE id = 1`, (err, row) => {
      if (!row) {
        db.run(`INSERT INTO visitor_count (count) VALUES (?)`, [0]);
      }
    });
  });
});

module.exports = db;
