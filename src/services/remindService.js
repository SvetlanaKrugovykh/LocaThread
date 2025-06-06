const pool = require('../db/pool')
const { bot } = require('../globalBuffer')
const { checkInputData } = require('../modules/dop_menu')
require('dotenv').config()

module.exports.checkAndSendReminders = async function () {
  const reminders = await getActiveUsersWithLang()
  if (!reminders || reminders.length === 0) {
    console.log('No active users found for reminders.')
    return
  }

  for (const { user_id: userId, language_code: lang } of reminders) {
    try {
      const data = await checkInputData(userId, lang)
      if (!data) continue
      await sendWhatReqToAUser(userId, data, lang)
      await bot.sendMessage(userId, texts[lang]['infoWait'], { parse_mode: 'HTML' })
      const dataForUser = await goToExternalService(userId, data)
      if (!dataForUser) {
        await bot.sendMessage(userId, texts[lang]['errorExternal'], { parse_mode: 'HTML' })
        continue
      }
      await sendFullInfoToUser(userId, dataForUser, lang)
    } catch (err) {
      console.error(`Error processing reminder for user ${userId}:`, err)
    }
  }
}


async function getActiveUsersWithLang() {
  const activeDays = Number(process.env.ACTIVE_DAYS) || 3

  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT DISTINCT u.user_id, u.language_code
       FROM user_choices c
       JOIN tg_users u ON c.user_id = u.user_id
       WHERE c.created_at > NOW() - INTERVAL '${activeDays} days'`,
      [],
      (err, res) => {
        if (err) reject(err)
        else resolve(res.rows)
      }
    )
  })
}

