// auth-api.js - Better Auth server with custom API endpoints for extended user data
const express = require('express');
const { betterAuth } = require("better-auth");
const cors = require('cors');

const app = express();
const PORT = process.env.AUTH_PORT || 8080;

// Better Auth configuration (duplicated from auth.config.js to avoid import issues)
const auth = betterAuth({
  database: {
    provider: "sqlite",
    url: "./db.sqlite",
  },
  // Email/password authentication only (no third-party providers)
  socialProviders: {},
  // Session configuration
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  // Email verification
  emailVerification: {
    enabled: true,
  },
  // Account verification
  account: {
    accountLinking: {
      enabled: false, // Disable account linking since we're not using social providers
    },
  },
  // Password requirements
  password: {
    enabled: true,
    requireVerification: true,
  },
  // Application URL
  appUrl: process.env.APP_URL || "http://localhost:3000",
});

// Enable CORS for communication with Docusaurus frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Mount Better Auth API routes
app.use('/api/auth', auth);

// Custom endpoint to update user profile with extended fields
app.post('/api/profile', async (req, res) => {
  try {
    const { userId, fullName, softwareBackground, hardwareBackground,
            technicalLevel, rosExperience, primarySetup, edgeHardware,
            explanationStyle, preferredLanguage } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // In a real implementation, you would update the user in the database
    // This is a simplified version that just returns the data
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
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Custom endpoint to get user profile
app.get('/api/profile', (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // Return mock profile data for now
  res.json({
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
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Better Auth Server' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Better Auth server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/auth`);
});

module.exports = app;