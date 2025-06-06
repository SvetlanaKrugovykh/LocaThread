const { handler } = require('./controllers/switcher')
const { isThisGroupId } = require('./modules/bot')
const { bot } = require('./globalBuffer')
const getU = require('./db/getU')
const menu = require('./modules/common_menu')
const { globalBuffer } = require('./globalBuffer')
const { handleAdminResponse } = require('./modules/adminMessageHandler')
const fs = require('fs')
const logger = require('./logger')
const updateTables = require('./db/tablesUpdate').updateTables
const saveUserChoice = require('./db/putData').saveUserChoice
const remind = require('./services/remindService')
const cron = require('node-cron')
require('dotenv').config()


const tempDownloadsCatalog = process.env.TEMP_DOWNLOADS_CATALOG
const tempCatalog = process.env.TEMP_CATALOG

try {
  updateTables()
} catch (err) {
  logger.info(err)
}

if (tempDownloadsCatalog) {
  fs.promises.mkdir(tempDownloadsCatalog, { recursive: true })
    .then(() => logger.info(`Directory created or already exists: ${tempDownloadsCatalog}`))
    .catch(err => console.error(`Failed to create directory: ${tempDownloadsCatalog}`, err))
}

if (tempCatalog) {
  fs.promises.mkdir(tempCatalog, { recursive: true })
    .then(() => logger.info(`Directory created or already exists: ${tempCatalog}`))
    .catch(err => console.error(`Failed to create directory: ${tempCatalog}`, err))
}

bot.on('message', async (msg) => {

  if (await isThisGroupId(bot, msg.chat.id, msg)) return

  if (msg.text === '/start') {
    logger.info(new Date())
    logger.info(msg.chat)
    await menu.commonStartMenu(bot, msg)
  } else {
    await handler(bot, msg, undefined)
  }
})

bot.on('text', async (msg) => {

  let lang = await getU.getLanguage(msg.chat.id)
  if (!lang) lang = 'pl'

  if (msg.text.includes('✍')) {
    await handleAdminResponse(bot, msg)
    return
  }
})

bot.on('callback_query', async (callbackQuery) => {
  try {
    const chatId = callbackQuery.message.chat.id
    const action = callbackQuery.data
    const msg = callbackQuery.message

    logger.info('Callback query received:', `${chatId}: ${action}`)

    if (globalBuffer[chatId] === undefined) globalBuffer[chatId] = {}
    if (action.startsWith('select_client_')) {
      const targetChatId = action.split('_')[2]
      logger.info(`Target client ID: ${targetChatId}`)
      let lang = await getU.getLanguage(targetChatId)
      if (!lang) lang = 'pl'
      await menu.notTextScene(bot, msg, lang, true, false, targetChatId)
    } else {
      await saveUserChoice(chatId, action)
    }

  } catch (error) {
    logger.info(error)
  }
})


bot.on('polling_error', (error) => {
  console.error('Polling error:', error.code)
  if (error.code === 'ECONNRESET') {
    logger.info('Connection reset by peer, restarting polling...')
    bot.stopPolling()
      .then(() => bot.startPolling())
      .catch(err => console.error('Failed to restart polling:', err))
  }
})

cron.schedule('0 * * * *', () => {
  const currentHour = new Date().getHours()
  if (currentHour >= 9 && currentHour < 22) {
    remind.checkAndSendReminders()
  }
})

module.exports = { bot }
