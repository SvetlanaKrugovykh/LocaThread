const pool = require('./pool')

module.exports.getLanguage = async function (chatId) {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT language_code FROM tg_users WHERE user_id = $1 LIMIT 1',
      [chatId],
      (err, res) => {
        if (err) {
          reject(err)
        } else if (res.rows.length > 0) {
          resolve(res.rows[0].language_code)
        } else {
          resolve(null)
        }
      }
    )
  })
}

module.exports.getUser = async function (chatId) {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT * FROM tg_users WHERE user_id = $1 LIMIT 1',
      [chatId],
      (err, res) => {
        if (err) {
          reject(err)
        } else if (res.rows.length > 0) {
          resolve(res.rows[0])
        } else {
          resolve(null)
        }
      }
    )
  })
}

