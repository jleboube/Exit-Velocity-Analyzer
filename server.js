require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SqliteStore = require('better-sqlite3-session-store')(session);
const Database = require('better-sqlite3');
const passport = require('passport');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 6923;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

// Trust proxy - required for Cloudflare Tunnels and reverse proxies
app.set('trust proxy', 1);

// Check if OAuth is configured
const isOAuthEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

if (isOAuthEnabled) {
  console.log('✓ Google OAuth is enabled');
  console.log('  Public URL:', PUBLIC_URL);
  console.log('  Callback URL:', process.env.GOOGLE_CALLBACK_URL || `${PUBLIC_URL}/auth/google/callback`);
} else {
  console.log('⚠ Google OAuth is not configured - running without authentication features');
  console.log('  To enable OAuth, set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
}

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Ensure sessions directory exists
const sessionsDir = path.join(__dirname, 'data', 'sessions');
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

// Session configuration with SQLite store
const sessionDb = new Database(path.join(sessionsDir, 'sessions.db'));

// Determine if we're behind HTTPS (Cloudflare Tunnel, reverse proxy, etc.)
const isHttps = PUBLIC_URL.startsWith('https://');

app.use(session({
  store: new SqliteStore({
    client: sessionDb,
    expired: {
      clear: true,
      intervalMs: 900000 // Clean up expired sessions every 15 minutes
    }
  }),
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  proxy: true, // Trust the reverse proxy
  cookie: {
    secure: isHttps, // Use secure cookies if behind HTTPS
    httpOnly: true,
    sameSite: isHttps ? 'none' : 'lax', // 'none' required for OAuth with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport only if OAuth is enabled
if (isOAuthEnabled) {
  require('./config/passport')(passport);
  app.use(passport.initialize());
  app.use(passport.session());
}

// Middleware to check OAuth status
app.use((req, res, next) => {
  req.isOAuthEnabled = isOAuthEnabled;
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'terms.html'));
});

app.get('/analyses', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'analyses.html'));
});

// API endpoint to check OAuth status
app.get('/api/oauth-status', (req, res) => {
  res.json({
    enabled: isOAuthEnabled,
    authenticated: req.isAuthenticated ? req.isAuthenticated() : false,
    user: req.user || null
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  if (!isOAuthEnabled) {
    console.log('📝 Create a .env file based on .env.example to enable Google OAuth');
  }
});
