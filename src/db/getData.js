const pool = require('./pool')

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

  const lastTimeRes = await new Promise((resolve, reject) => {
    pool.query(
      `SELECT created_at FROM user_choices
       WHERE user_id = $1 AND category = $2
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

  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT value FROM user_choices
       WHERE user_id = $1 AND category = $2
         AND created_at BETWEEN ($3::timestamp - INTERVAL '1 hour') AND $3::timestamp
       ORDER BY created_at DESC`,
      [userId, category, lastTime],
      (err, res) => {
        if (err) reject(err)
        else resolve(res.rows.map(row => row.value))
      }
    )
  })
}

module.exports.getLatestUserChoices = getLatestUserChoices
