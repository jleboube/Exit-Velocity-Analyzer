#!/usr/bin/env node

require('dotenv').config();

console.log('Initializing database...');

try {
  // Database is auto-initialized when the module is loaded
  require('../database/db');
  console.log('✓ Database initialization complete!');
  process.exit(0);
} catch (error) {
  console.error('✗ Database initialization failed:', error);
  process.exit(1);
}
