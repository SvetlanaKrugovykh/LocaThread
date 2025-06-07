const pool = require('./pool')
const { bot, selectedByUser } = require('../globalBuffer')
const { texts } = require('../data/keyboard')

module.exports.saveUserChoice = async function (userId, action) {
  const [cat1, cat2, value] = action.split('_')
  const category = cat1 + '_' + cat2
  const lang = selectedByUser[userId]?.language || 'pl'

  await bot.sendMessage(userId, `${texts[lang]['0_7']} \n ${value}`, { parse_mode: 'HTML' })

  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO user_choices (user_id, category, value) VALUES ($1, $2, $3)`,
      [userId, category, value],
      (err, res) => {
        if (err) reject(err)
        else resolve(true)
      }
    )
  })
}


module.exports.deleteUserChoicesForPeriod = async function (userId) {
  const activeDays = Number(process.env.ACTIVE_DAYS) || 3

  return new Promise((resolve, reject) => {
    pool.query(
      `DELETE FROM user_choices
       WHERE user_id = $1
         AND created_at > NOW() - INTERVAL '${activeDays} days'
         AND created_at <= NOW()`,
      [userId],
      (err, res) => {
        if (err) reject(err)
        else resolve(true)
      }
    )
  })
}