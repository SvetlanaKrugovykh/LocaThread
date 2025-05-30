const pool = require('./pool')
const dotenv = require('dotenv')
const { districts, types, ranges } = require('../data/consts')
dotenv.config()

const tableQueries = {
  'tg_users': `
    CREATE TABLE tg_users (
      id SERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL UNIQUE,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255),
      username VARCHAR(255),
      language_code VARCHAR(2)
    )`,
  'tg_msgs': `
    CREATE TABLE tg_msgs (
      id SERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL,
      msg_id INTEGER NOT NULL,
      msg_text TEXT NOT NULL,
      msg_date TIMESTAMP NOT NULL
    )`,
  'districts': `
      CREATE TABLE districts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(64) NOT NULL UNIQUE
      )`,
  'apartment_types': `
      CREATE TABLE apartment_types (
        id SERIAL PRIMARY KEY,
        name_pl VARCHAR(64) NOT NULL UNIQUE
      )`,
  'price_ranges': `
      CREATE TABLE price_ranges (
        id SERIAL PRIMARY KEY,
        range_pl VARCHAR(64) NOT NULL UNIQUE
      )`,
  'user_choices': `
    CREATE TABLE user_choices (
      id SERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL,
      category VARCHAR(32) NOT NULL,      
      value VARCHAR(128) NOT NULL,        
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
}


module.exports.updateTables = function () {
  checkAndCreateTable('tg_users')
    .then(() => checkAndCreateTable('tg_msgs'))
    .then(() => checkAndCreateTable('districts', true))
    .then(() => checkAndCreateTable('apartment_types', true))
    .then(() => checkAndCreateTable('price_ranges', true))
    .then(() => checkAndCreateTable('user_choices'))
    .then(() => {
      console.log('All tables created or already exist.')
    })
    .catch((err) => {
      console.error('Error in table creation sequence:', err)
    })
}

function checkAndCreateTable(tableName, fillInitialData = false) {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = $1
      )`,
      [tableName],
      (err, res) => {
        if (err) {
          console.error(`Error checking if table ${tableName} exists:`, err)
          reject(new Error(err))
          return
        }
        const tableExists = res.rows[0].exists
        if (!tableExists) {
          createTable(tableName)
            .then(() => {
              if (fillInitialData && tableName === 'districts') {
                return fillDistrictsTable()
              }
              if (fillInitialData && tableName === 'apartment_types') {
                return fillApartmentTypesTable()
              }
              if (fillInitialData && tableName === 'price_ranges') {
                return fillPriceRangesTable()
              }
            })
            .then(resolve)
            .catch(reject)
        } else {
          console.log(`Table ${tableName} already exists.`)
          resolve()
        }
      }
    )
  })
}


function createTable(tableName) {
  return new Promise((resolve, reject) => {
    const query = tableQueries[tableName]
    if (!query) {
      console.error(`No query found for table ${tableName}`)
      reject(new Error(`No query found for table ${tableName}`))
      return
    }

    pool.query(query, (err, res) => {
      if (err) {
        console.error(`Error creating table ${tableName}:`, err)
        reject(err)
      } else {
        console.log(`Table ${tableName} created successfully.`)
        resolve()
      }
    })
  })
}

function fillDistrictsTable() {
  const values = districts.map((name) => `('${name.replace("'", "''")}')`).join(',')
  const query = `INSERT INTO districts (name) VALUES ${values};`
  return new Promise((resolve, reject) => {
    pool.query(query, (err, res) => {
      if (err) {
        console.error('Error filling districts table:', err)
        reject(err)
      } else {
        console.log('Districts table filled with initial data.')
        resolve()
      }
    })
  })
}

function fillApartmentTypesTable() {
  const values = types.map((name) => `('${name.replace("'", "''")}')`).join(',')
  const query = `INSERT INTO apartment_types (name_pl) VALUES ${values};`
  return new Promise((resolve, reject) => {
    pool.query(query, (err, res) => {
      if (err) {
        console.error('Error filling apartment_types table:', err)
        reject(err)
      } else {
        console.log('apartment_types table filled with initial data.')
        resolve()
      }
    })
  })
}

function fillPriceRangesTable() {
  const values = ranges.map((range) => `('${range.replace("'", "''")}')`).join(',')
  const query = `INSERT INTO price_ranges (range_pl) VALUES ${values};`
  return new Promise((resolve, reject) => {
    pool.query(query, (err, res) => {
      if (err) {
        console.error('Error filling price_ranges table:', err)
        reject(err)
      } else {
        console.log('price_ranges table filled with initial data.')
        resolve()
      }
    })
  })
}