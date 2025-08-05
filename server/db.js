const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD type:", typeof process.env.DB_PASSWORD);

module.exports = pool;
