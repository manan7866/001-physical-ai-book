// user-extended-service.js - Service to handle extended user profile data
const express = require('express');
const { auth } = require('./src/auth/auth.config');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

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

// Create extended user data table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS user_extended (
    user_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    software_background TEXT,
    hardware_background TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
  )`);

  // Create trigger to update the updated_at field
  db.run(`CREATE TRIGGER IF NOT EXISTS update_user_extended_updated_at
          BEFORE UPDATE ON user_extended
          FOR EACH ROW
          BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
          END`);
});

// Mount Better Auth API routes
app.use('/api/auth', auth());

// Custom endpoint to get user profile with extended fields
app.get('/api/profile', async (req, res) => {
  try {
    // This would need proper authentication middleware in a real implementation
    // For now, this is a simplified version
    const userId = req.headers['user-id']; // This would come from authentication

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

        if (!row) {
          return res.status(404).json({ error: 'User profile not found' });
        }

        res.json({
          success: true,
          data: row
        });
      }
    );
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Custom endpoint to update user profile with extended fields
app.post('/api/profile', async (req, res) => {
  try {
    // This would need proper authentication middleware in a real implementation
    // For now, this is a simplified version
    const userId = req.headers['user-id']; // This would come from authentication
    const { fullName, softwareBackground, hardwareBackground } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Insert or update extended user data
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO user_extended
      (user_id, full_name, software_background, hardware_background)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run([userId, fullName, softwareBackground, hardwareBackground], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { userId, fullName, softwareBackground, hardwareBackground }
      });
    });

    stmt.finalize();
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'User Extended Service' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`User Extended Service running on port ${PORT}`);
  console.log(`API endpoints available:`);
  console.log(`- http://localhost:${PORT}/api/auth (Better Auth)`);
  console.log(`- http://localhost:${PORT}/api/profile (Extended Profile)`);
});

module.exports = app;