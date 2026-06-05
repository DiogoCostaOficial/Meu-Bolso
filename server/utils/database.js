require('dotenv').config();

// Determine which implementation to use
const shouldUseJson = process.env.USE_JSON_STORAGE === 'true';

let dbImpl;
if (shouldUseJson) {
  console.log('📦 Using JSON File Storage');
  dbImpl = require('./databaseJson');
} else {
  console.log('🐘 Using PostgreSQL Storage');
  dbImpl = require('./databasePg');
}

module.exports = dbImpl;
