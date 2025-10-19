const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../database/db');

module.exports = function(passport) {
  // Only configure if credentials are available
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('Skipping Google OAuth configuration - credentials not provided');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = db.getUserByGoogleId(profile.id);

          if (!user) {
            // Create new user
            const userId = db.createUser({
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              picture: profile.photos[0]?.value
            });
            user = db.getUserById(userId);
          } else {
            // Update last login
            db.updateUserLastLogin(user.id);
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    try {
      const user = db.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
