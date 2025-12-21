// auth-full-server.js - Complete authentication server with both custom profile API and basic auth endpoints
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const PORT = process.env.AUTH_PORT || 8080;

// Enable CORS for communication with Docusaurus frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Initialize SQLite database
const dbPath = process.env.DATABASE_PATH || './db.sqlite';
const db = new sqlite3.Database(dbPath);

// Create users table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create extended user data table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS user_extended (
    user_id TEXT PRIMARY KEY,
    full_name TEXT,
    software_background TEXT,
    hardware_background TEXT,
    extended_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// In-memory storage for sessions (in production, use Redis or similar)
const sessions = new Map();

// Helper function to generate user ID
function generateUserId() {
  return 'user_' + Date.now() + '_' + crypto.randomBytes(8).toString('hex');
}

// Better Auth compatible endpoints
// Sign Up endpoint
app.post('/api/auth/sign-up', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Check if user already exists
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      console.error('Database error during sign-up check:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (row) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash the password
    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error('Password hashing error:', hashErr);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Generate user ID
      const userId = generateUserId();

      // Insert the new user
      db.run(
        'INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)',
        [userId, email, hashedPassword, name],
        function (insertErr) {
          if (insertErr) {
            console.error('Database error during user creation:', insertErr);
            return res.status(500).json({ error: 'Database error' });
          }

          // Create a session token
          const token = jwt.sign(
            { userId: userId, email: email },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '7d' }
          );

          // Store session
          sessions.set(token, { userId, email, name });

          // Set cookie (simulate Better Auth behavior)
          res.cookie('better-auth-session', token, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'lax'
          });

          res.json({
            session: {
              token: token,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            user: {
              id: userId,
              email: email,
              name: name,
              emailVerified: false
            }
          });
        }
      );
    });
  });
});

// Sign In endpoint
app.post('/api/auth/sign-in', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('Database error during sign-in:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    bcrypt.compare(password, user.password, (compareErr, isMatch) => {
      if (compareErr) {
        console.error('Password comparison error:', compareErr);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Create a session token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '7d' }
      );

      // Store session
      sessions.set(token, { userId: user.id, email: user.email, name: user.name });

      // Set cookie (simulate Better Auth behavior)
      res.cookie('better-auth-session', token, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax'
      });

      res.json({
        session: {
          token: token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: Boolean(user.email_verified)
        }
      });
    });
  });
});

// Get Session endpoint
app.get('/api/auth/get-session', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') ||
                req.cookies?.['better-auth-session'] ||
                req.query.token;

  if (!token) {
    return res.status(200).json({ session: null, user: null });
  }

  // Check in-memory sessions first
  const session = sessions.get(token);
  if (session) {
    // Verify token is still valid
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

      // Get user details from database
      db.get('SELECT * FROM users WHERE id = ?', [session.userId], (err, user) => {
        if (err || !user) {
          return res.status(200).json({ session: null, user: null });
        }

        res.json({
          session: {
            token: token,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          },
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: Boolean(user.email_verified)
          }
        });
      });
    } catch (verifyErr) {
      // Token is invalid/expired
      sessions.delete(token);
      return res.status(200).json({ session: null, user: null });
    }
  } else {
    // Token not found in sessions
    return res.status(200).json({ session: null, user: null });
  }
});

// Sign Out endpoint
app.post('/api/auth/sign-out', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') ||
                req.cookies?.['better-auth-session'];

  if (token) {
    sessions.delete(token);
  }

  // Clear cookie
  res.clearCookie('better-auth-session');

  res.json({ success: true });
});

// Custom endpoint to get user profile with extended fields
app.get('/api/profile', (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // Get extended user data
  db.get(
    'SELECT * FROM user_extended WHERE user_id = ?',
    [userId],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      // If no extended profile exists, return basic user info with null extended fields
      if (!row) {
        return res.json({
          success: true,
          data: {
            user_id: userId,
            full_name: null,
            software_background: null,
            hardware_background: null,
            technicalLevel: null,
            rosExperience: null,
            primarySetup: null,
            edgeHardware: null,
            explanationStyle: null,
            preferredLanguage: null
          }
        });
      }

      // Parse the extended_data JSON if it exists
      let extendedData = {};
      if (row.extended_data) {
        try {
          extendedData = JSON.parse(row.extended_data);
        } catch (parseErr) {
          console.error('Error parsing extended data:', parseErr);
          extendedData = {};
        }
      }

      // Merge the row data with the parsed extended data
      const result = {
        user_id: row.user_id,
        full_name: row.full_name,
        software_background: row.software_background,
        hardware_background: row.hardware_background,
        ...extendedData  // Spread the parsed extended data
      };

      res.json({
        success: true,
        data: result
      });
    }
  );
});

// Custom endpoint to update user profile with extended fields
app.post('/api/profile', (req, res) => {
  const {
    userId,
    fullName,
    softwareBackground,
    hardwareBackground,
    // New fields for the updated signup form
    technicalLevel,
    rosExperience,
    primarySetup,
    edgeHardware,
    explanationStyle,
    preferredLanguage
  } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // Create a JSON string to store all the extended profile data
  const extendedData = JSON.stringify({
    fullName,
    softwareBackground,
    hardwareBackground,
    technicalLevel,
    rosExperience,
    primarySetup,
    edgeHardware,
    explanationStyle,
    preferredLanguage
  });

  // Insert or update extended user data
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO user_extended
    (user_id, full_name, software_background, hardware_background, extended_data, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  stmt.run([userId, fullName, softwareBackground, hardwareBackground, extendedData], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        userId,
        fullName,
        softwareBackground,
        hardwareBackground,
        technicalLevel,
        rosExperience,
        primarySetup,
        edgeHardware,
        explanationStyle,
        preferredLanguage
      }
    });
  });

  stmt.finalize();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Full Auth Server' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Full Auth server running on port ${PORT}`);
  console.log(`API endpoints available:`);
  console.log(`- Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`- Profile API: http://localhost:${PORT}/api/profile`);
});

module.exports = app;