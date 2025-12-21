// Simple test to verify database connection
const sqlite3 = require('sqlite3').verbose();
const { betterAuth } = require("better-auth");

console.log('Testing database connection...');

// Create a test database connection
const db = new sqlite3.Database('./db.sqlite');

// Test the connection
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS test (info TEXT)");

  const stmt = db.prepare("INSERT INTO test VALUES (?)");
  stmt.run("Hello World!");
  stmt.finalize();

  db.each("SELECT rowid AS id, info FROM test", (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return;
    }
    console.log(row.id + ": " + row.info);
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('Database connection test completed successfully');
  }
});

// Test Better Auth config
try {
  console.log('Testing Better Auth configuration...');
  const auth = betterAuth({
    database: {
      provider: "sqlite",
      url: "./db.sqlite",
    },
    socialProviders: {},
    session: {
      expiresIn: 7 * 24 * 60 * 60, // 7 days
      updateAge: 24 * 60 * 60, // 24 hours
    },
    emailVerification: {
      enabled: true,
    },
    account: {
      accountLinking: {
        enabled: false,
      },
    },
    password: {
      enabled: true,
      requireVerification: true,
    },
    appUrl: "http://localhost:3000",
  });

  console.log('Better Auth configuration successful');
} catch (error) {
  console.error('Better Auth configuration failed:', error.message);
}