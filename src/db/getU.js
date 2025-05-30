const pool = require('./pool')
const { selectedByUser } = require('../globalBuffer')

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

module.exports.getUserData = async function (chatId, toChange = false) {
  if (!selectedByUser[chatId] || toChange) {
    selectedByUser[chatId] = {}
    const user = await module.exports.getUser(chatId)
    if (user) {
      selectedByUser[chatId] = {
        language: user.language_code,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username
      }
    } else {
      selectedByUser[chatId] = {}
    }
  }
  return selectedByUser[chatId]
}

