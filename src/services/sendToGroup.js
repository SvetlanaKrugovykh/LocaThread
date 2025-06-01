const { getUser } = require("../db/getU")
const { globalBuffer, selectedByUser, bot } = require('../globalBuffer')
const { texts } = require('../data/keyboard')
require('dotenv').config()
const GROUP_ID = process.env.GROUP_ID

async function sendRequestToAdmins(chatId, data, lang = 'pl') {
  const user = await getUser(chatId)
  if (!user) {
    console.error(`User with chatId ${chatId} not found`)
    return
  }
  const input = selectedByUser[chatId]?.text || texts[lang]['noInput']
  let userInfo = `<b>${texts[lang]['newMsg']}</b>\n`
  userInfo += `<b>${texts[lang]['name']}</b> ${user?.first_name || ''} ${user?.last_name || ''}\n`
  userInfo += `<b>Username:</b> @${user?.username || '-'}\n`
  userInfo += `<b>user_id:</b> <code>${chatId}</code>\n\n`
  userInfo += `<b>${texts[lang]['requestText']}</b>\n${input}\n\n`
  userInfo += `<b>${texts[lang]['userChoices']}</b>\n`
  userInfo += `<b>${texts[lang]['districts']}</b> ${data.districts && data.districts.length ? data.districts.join(', ') : '-'}\n`
  userInfo += `<b>${texts[lang]['rooms']}</b> ${data.rooms && data.rooms.length ? data.rooms.join(', ') : '-'}\n`
  userInfo += `<b>${texts[lang]['priceRange']}</b> ${data.minPrice || '-'} - ${data.maxPrice || '-'} PLN\n`

  const messages = splitByLength(userInfo, 4096)
  for (const msg of messages) {
    await bot.sendMessage(GROUP_ID, msg, { parse_mode: 'HTML' })
  }

  if (!globalBuffer.msgQueue) globalBuffer.msgQueue = {}
  if (!globalBuffer.msgQueue[chatId]) globalBuffer.msgQueue[chatId] = []
  globalBuffer.msgQueue[chatId].push({ type: 'text', content: input })
}

function splitByLength(text, maxLen) {
  const result = []
  let i = 0
  while (i < text.length) {
    result.push(text.slice(i, i + maxLen))
    i += maxLen
  }
  return result
}

module.exports.sendRequestToAdmins = sendRequestToAdmins