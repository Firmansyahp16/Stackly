const { Pool } = require("pg");

const pool = new Pool({
  database: process.env.DB,
  host: process.env.HOST,
  password: process.env.PASS,
  port: process.env.DB_PORT,
  user: process.env.USER,
});

module.exports = pool;
