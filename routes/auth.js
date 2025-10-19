const express = require('express');
const passport = require('passport');
const router = express.Router();

// Check if OAuth is enabled
function isOAuthEnabled(req, res, next) {
  if (!req.isOAuthEnabled) {
    return res.status(503).json({
      error: 'OAuth is not configured',
      message: 'Google OAuth is not enabled on this server'
    });
  }
  next();
}

// Google OAuth routes
router.get('/google', isOAuthEnabled, passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', isOAuthEnabled,
  passport.authenticate('google', { failureRedirect: '/?login=failed' }),
  (req, res) => {
    // Successful authentication
    console.log('✓ OAuth callback successful for user:', req.user?.email);
    res.redirect('/?login=success');
  }
);

// Debug route to check if auth routes are working
router.get('/test', (req, res) => {
  res.json({
    message: 'Auth routes are working',
    oauthEnabled: req.isOAuthEnabled,
    authenticated: req.isAuthenticated ? req.isAuthenticated() : false
  });
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.redirect('/');
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  if (!req.isOAuthEnabled) {
    return res.json({ authenticated: false, oauthEnabled: false });
  }

  res.json({
    authenticated: req.isAuthenticated(),
    oauthEnabled: true,
    user: req.isAuthenticated() ? {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      picture: req.user.picture
    } : null
  });
});

module.exports = router;
