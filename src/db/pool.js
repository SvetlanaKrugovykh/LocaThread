const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  user: process.env.WAW_RENT_DB_USER,
  host: process.env.WAW_RENT_DB_HOST,
  database: process.env.WAW_RENT_DB_NAME,
  password: process.env.WAW_RENT_DB_PASSWORD,
  port: process.env.WAW_RENT_DB_PORT,
})

module.exports = pool