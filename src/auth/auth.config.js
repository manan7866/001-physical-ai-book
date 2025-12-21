// Better Auth configuration for standalone server
const { betterAuth } = require("better-auth");

// Create the auth configuration
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

module.exports = auth; // Export the auth function directly