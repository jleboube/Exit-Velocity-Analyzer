const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.dirname(process.env.DATABASE_PATH || './data/analytics.db');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(process.env.DATABASE_PATH || './data/analytics.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables immediately
// This must happen before preparing any statements that reference these tables
(function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      google_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      name TEXT,
      picture TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Analyses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      video_filename TEXT NOT NULL,
      fps REAL NOT NULL,
      exit_velocity REAL NOT NULL,
      calibration_distance_pixels REAL NOT NULL,
      ball_distance_pixels REAL NOT NULL,
      cal_point1_x REAL NOT NULL,
      cal_point1_y REAL NOT NULL,
      cal_point2_x REAL NOT NULL,
      cal_point2_y REAL NOT NULL,
      ball_point1_x REAL NOT NULL,
      ball_point1_y REAL NOT NULL,
      ball_point2_x REAL NOT NULL,
      ball_point2_y REAL NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
    CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
  `);

  console.log('✓ Database tables initialized');
})();

// User operations
const getUserByGoogleId = db.prepare('SELECT * FROM users WHERE google_id = ?');
const getUserById = db.prepare('SELECT * FROM users WHERE id = ?');
const createUser = db.prepare(`
  INSERT INTO users (google_id, email, name, picture)
  VALUES (@googleId, @email, @name, @picture)
`);
const updateUserLastLogin = db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?');

// Analysis operations
const createAnalysis = db.prepare(`
  INSERT INTO analyses (
    user_id, video_filename, fps, exit_velocity,
    calibration_distance_pixels, ball_distance_pixels,
    cal_point1_x, cal_point1_y, cal_point2_x, cal_point2_y,
    ball_point1_x, ball_point1_y, ball_point2_x, ball_point2_y,
    notes
  ) VALUES (
    @userId, @videoFilename, @fps, @exitVelocity,
    @calibrationDistancePixels, @ballDistancePixels,
    @calPoint1X, @calPoint1Y, @calPoint2X, @calPoint2Y,
    @ballPoint1X, @ballPoint1Y, @ballPoint2X, @ballPoint2Y,
    @notes
  )
`);

const getAnalysesByUserId = db.prepare(`
  SELECT * FROM analyses
  WHERE user_id = ?
  ORDER BY created_at DESC
`);

const getAnalysisById = db.prepare(`
  SELECT a.*, u.name as user_name, u.email as user_email
  FROM analyses a
  JOIN users u ON a.user_id = u.id
  WHERE a.id = ?
`);

const deleteAnalysis = db.prepare('DELETE FROM analyses WHERE id = ? AND user_id = ?');

const getAnalysisStats = db.prepare(`
  SELECT
    COUNT(*) as total_analyses,
    AVG(exit_velocity) as avg_velocity,
    MAX(exit_velocity) as max_velocity,
    MIN(exit_velocity) as min_velocity
  FROM analyses
  WHERE user_id = ?
`);

module.exports = {
  getUserByGoogleId: (googleId) => getUserByGoogleId.get(googleId),
  getUserById: (id) => getUserById.get(id),
  createUser: (data) => createUser.run(data).lastInsertRowid,
  updateUserLastLogin: (id) => updateUserLastLogin.run(id),
  createAnalysis: (data) => createAnalysis.run(data).lastInsertRowid,
  getAnalysesByUserId: (userId) => getAnalysesByUserId.all(userId),
  getAnalysisById: (id) => getAnalysisById.get(id),
  deleteAnalysis: (id, userId) => deleteAnalysis.run(id, userId),
  getAnalysisStats: (userId) => getAnalysisStats.get(userId),
  close: () => db.close()
};
