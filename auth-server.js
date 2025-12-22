// auth-server.js - Simplified authentication server for development
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.AUTH_PORT || 8080;

// Enable CORS for communication with Docusaurus frontend
// Allow multiple origins for both development and production
const allowedOrigins = process.env.FRONTEND_URL ?
  [process.env.FRONTEND_URL] :
  [
    'http://localhost:3000',  // Docusaurus default
    'http://localhost:3001',  // Alternative Docusaurus port
    'http://127.0.0.1:3000',  // Alternative localhost
    'http://127.0.0.1:3001',  // Alternative localhost
    'http://localhost:5000',  // Alternative development
    'http://127.0.0.1:5000',  // Alternative development
    'http://localhost:80',     // Production build on localhost
    'http://127.0.0.1:80',     // Production build on localhost
    'http://localhost',        // Production build on localhost
    'http://127.0.0.1',        // Production build on localhost
    'https://abdulmanan04-fastapi-chatbot.hf.space',  // Hugging Face deployment
    'https://*.hf.space',  // Allow any Hugging Face space subdomain
    process.env.HF_SPACE_URL || ''  // Allow Hugging Face space URL if provided
  ].filter(origin => origin !== '');  // Remove empty strings

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.some(allowedOrigin =>
        allowedOrigin === origin ||
        (allowedOrigin.includes('*') && origin.startsWith(allowedOrigin.replace('*', ''))) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:'))) {
      callback(null, true);
    } else {
      console.log('CORS blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Using crypto for password hashing instead of bcrypt to avoid native compilation issues
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

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

  // Ensure the extended_data column exists (in case the table was created with an older schema)
  db.run(`ALTER TABLE user_extended ADD COLUMN extended_data TEXT DEFAULT NULL`, (err) => {
    if (err && err.code !== 'SQLITE_ERROR') { // SQLITE_ERROR is expected if column already exists
      console.log('Note: extended_data column may already exist (this is OK):', err.message);
    } else if (!err) {
      console.log('extended_data column added to user_extended table');
    } else {
      // If it's a SQLITE_ERROR about column already existing, that's fine
      if (err.message.includes('already exists')) {
        console.log('extended_data column already exists in user_extended table');
      }
    }
  });
});

// Helper function to generate user ID
function generateUserId() {
  return 'user_' + Date.now() + '_' + crypto.randomBytes(8).toString('hex');
}

// Simple password hashing function using crypto
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Simple password comparison function
function comparePassword(password, hashedPassword) {
  return hashPassword(password) === hashedPassword;
}

// Sign Up endpoint
app.post('/api/auth/sign-up', (req, res) => {
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
    const hashedPassword = hashPassword(password);

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
          process.env.JWT_SECRET || 'fallback_secret_key_for_dev',
          { expiresIn: '7d' }
        );

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

// Sign In endpoint
app.post('/api/auth/sign-in', (req, res) => {
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

    // Compare passwords
    if (!comparePassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create a session token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret_key_for_dev',
      { expiresIn: '7d' }
    );

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

// Get Session endpoint
app.get('/api/auth/get-session', (req, res) => {
  // Check for token in Authorization header or cookies
  let token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    // If not in header, check for a cookie or query parameter
    // For this implementation, we'll just return null if no token
    return res.json({ session: null, user: null });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_dev');

    // Get user details from database
    db.get('SELECT id, email, name, email_verified FROM users WHERE id = ?', [decoded.userId], (err, user) => {
      if (err || !user) {
        return res.json({ session: null, user: null });
      }

      // Create a fresh token (refreshing the session)
      const newToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback_secret_key_for_dev',
        { expiresIn: '7d' }
      );

      res.json({
        session: {
          token: newToken,
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
  } catch (err) {
    // Token is invalid
    console.error('Token verification error:', err);
    res.json({ session: null, user: null });
  }
});

// Sign Out endpoint
app.post('/api/auth/sign-out', (req, res) => {
  // In a real implementation, you would invalidate the session/token
  // For now, just return success
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
          console.log('Parsed extended data for user', userId, ':', extendedData); // Debug log
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

      console.log('Profile data returned for user', userId, ':', result); // Debug log

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

  console.log('Received profile update request for user:', userId, 'with data:', {
    fullName,
    softwareBackground,
    hardwareBackground,
    technicalLevel,
    rosExperience,
    primarySetup,
    edgeHardware,
    explanationStyle,
    preferredLanguage
  }); // Debug log

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

  console.log('Storing extended data JSON:', extendedData); // Debug log

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

    console.log('Profile updated successfully for user:', userId); // Debug log

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

    // Finalize the statement inside the callback
    stmt.finalize();
  });
});


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Simplified Auth Server', port: PORT });
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Full Auth server running on port ${PORT}`);
  console.log(`API endpoints available:`);
  console.log(`- Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`- Profile API: http://localhost:${PORT}/api/profile`);
  console.log(`- Health check: http://localhost:${PORT}/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;