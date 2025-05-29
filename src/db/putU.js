const pool = require('./pool')

module.exports.upsertUser = async function upsertUser(user) {
  const { user_id, first_name, last_name, username, language_code } = user
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO tg_users (user_id, first_name, last_name, username, language_code)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         username = EXCLUDED.username,
         language_code = EXCLUDED.language_code`,
      [user_id, first_name, last_name, username, language_code],
      (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(true)
        }
      }
    )
  })
}

module.exports.pinNativeLanguage = async function pinNativeLanguage(data, msg) {
  const langNum = data.split('_')[1]
  const user =
  {
    user_id: msg.chat.id,
    first_name: msg.chat.first_name,
    last_name: msg.chat.last_name,
    username: msg.chat.username,
    language_code: getLanguageCode(langNum)
  }
  await module.exports.upsertUser(user)
}

function getLanguageCode(langNum) {
  switch (String(langNum)) {
    case '1': return 'en'
    case '2': return 'ru'
    case '3': return 'uk'
    case '4': return 'pl'
    default: return 'pl'
  }
}
