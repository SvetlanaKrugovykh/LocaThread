const pool = require('./pool')
require('dotenv').config()

module.exports.getAllFromTable = async function (tableName, nameField) {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT ${nameField} FROM ${tableName} ORDER BY id`, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res.rows.map(row => row[nameField]))
      }
    })
  })
}

async function getLatestUserChoices(userId, category) {
  const activeDays = Number(process.env.ACTIVE_DAYS) || 3

  const result = await new Promise((resolve, reject) => {
    pool.query(
      `SELECT value FROM user_choices
       WHERE user_id = $1 AND category = $2
         AND created_at > NOW() - INTERVAL '${activeDays} days'
       ORDER BY created_at DESC
       LIMIT 3`,
      [userId, category],
      (err, res) => {
        if (err) reject(err)
        else resolve(res.rows)
      }
    )
  })

  if (category === '5_2') {
    return result.map(row => Number(row.value))
  } else {
    return result.map(row => row.value)
  }
}

module.exports.getLatestUserChoices = getLatestUserChoices
