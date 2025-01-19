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

// 1. Update the CORS configuration to allow requests from Netlify
//    and optionally local dev (http://localhost:5173).
//    Replace 'https://your-netlify-site.netlify.app' with your actual Netlify URL.
app.use(
  cors({
    origin: [
      'https://calgary-concert-app.netlify.app', // Netlify production
      'http://localhost:5173' // local dev (if you want to test locally)
    ],
    credentials: true
  })
);

// 2. Session configuration remains the same
app.use(
  session({
    secret: 'YOUR_SECRET_HERE', // Replace with a secure secret
    resave: false,
    saveUninitialized: false
  })
);

// 3. Increment visitor count for each request
app.use((req, res, next) => {
  db.run('UPDATE visitor_count SET count = count + 1 WHERE id = 1');
  next();
});

// 4. Routes
app.use('/auth', authRoutes);
app.use('/concerts', concertRoutes);
app.use('/admin', adminRoutes);

// 5. Basic Terms/Privacy endpoint
app.get('/privacy', (req, res) => {
  res.send(`
    <h1>Privacy & Terms</h1>
    <p>We collect your email for user accounts and do not share your data with third parties.</p>
  `);
});

// 6. Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
