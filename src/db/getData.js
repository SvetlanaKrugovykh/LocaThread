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

  const lastTimeRes = await new Promise((resolve, reject) => {
    pool.query(
      `SELECT created_at FROM user_choices
       WHERE user_id = $1 AND category = $2
         AND created_at > NOW() - INTERVAL '${activeDays} days'
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, category],
      (err, res) => {
        if (err) reject(err)
        else resolve(res)
      }
    )
  })

  if (!lastTimeRes.rows.length) return []

  const lastTime = lastTimeRes.rows[0].created_at

  const result = await new Promise((resolve, reject) => {
    pool.query(
      `SELECT value FROM user_choices
       WHERE user_id = $1 AND category = $2
         AND created_at BETWEEN ($3::timestamp - INTERVAL '1 hour') AND $3::timestamp
         AND created_at > NOW() - INTERVAL '${activeDays} days'
       ORDER BY created_at DESC`,
      [userId, category, lastTime],
      (err, res) => {
        if (err) reject(err)
        else resolve(res.rows)
      }
    )
  })

  if (!result.length) {
    const lastValueRes = await new Promise((resolve, reject) => {
      pool.query(
        `SELECT value FROM user_choices
         WHERE user_id = $1 AND category = $2
           AND created_at > NOW() - INTERVAL '${activeDays} days'
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId, category],
        (err, res) => {
          if (err) reject(err)
          else resolve(res.rows)
        }
      )
    })
    if (category === '5_2') {
      return lastValueRes.map(row => Number(row.value))
    } else {
      return lastValueRes.map(row => row.value)
    }
  }

  if (category === '5_2') {
    return result.map(row => Number(row.value))
  } else {
    return result.map(row => row.value)
  }
}

module.exports.getLatestUserChoices = getLatestUserChoices
