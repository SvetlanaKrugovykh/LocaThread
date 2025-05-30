const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { menuStarter } = require('../controllers/clientsAdmin')
const { respondToSelectedClient } = require('../modules/adminMessageHandler')
require('dotenv').config()
const { buttonsConfig, texts } = require('../data/keyboard')
const { globalBuffer } = require('../globalBuffer')
const getU = require('../db/getU')
const getAllFromTable = require('../db/getData').getAllFromTable

const ADMINS = process.env.ADMINS
  ? process.env.ADMINS.split(',').map(id => id.trim())
  : []

function isAdmin(userId) {
  return ADMINS.includes(String(userId))
}

module.exports.choiceFromBD = async function (bot, msg, lang = 'pl', choice) {
  let tableName, nameField, prefix

  switch (choice) {
    case '5_1':
      tableName = 'districts'
      nameField = 'name'
      prefix = '5_1'
      break
    case '5_2':
      tableName = 'apartment_types'
      nameField = 'name_pl'
      prefix = '5_2'
      break
    case '5_3':
      tableName = 'price_ranges'
      nameField = 'range_pl'
      prefix = '5_3'
      break
    default:
      await bot.sendMessage(msg.chat.id, texts[lang]['0_25'])
      return
  }

  let items
  try {
    items = await getAllFromTable(tableName, nameField)
  } catch (err) {
    await bot.sendMessage(msg.chat.id, texts[lang]['0_27'])
    return
  }

  const buttons = items.map(item => ([{
    text: item,
    callback_data: `${prefix}_${item}`
  }]))

  await bot.sendMessage(msg.chat.id, texts[lang]['0_28'], {
    reply_markup: {
      inline_keyboard: buttons
    }
  })
}

module.exports.commonStartMenu = async function (bot, msg, lang = 'pl') {
  console.log(`/start at ${new Date()} tg_user_id: ${msg.chat.id}`)

  const user = await getU.getUser(msg.chat.id)
  console.log(user)

  if (isAdmin(msg.chat.id)) {
    let lang = 'pl'
    if (user) lang = user?.language_code || 'pl'
    await menuStarter(bot, msg, lang)
  } else {
    if (user) {
      const lang = user?.language_code || 'pl'
      await menuStarter(bot, msg, lang)
    } else {
      await module.exports.settingsMenu(bot, msg)
      await blockMenu(bot, msg)
    }
  }
}

module.exports.commonSecondMenu = async function (bot, msg, lang = 'pl') {
  await bot.sendMessage(msg.chat.id, buttonsConfig["forSearchingButtons"].title[lang], {
    reply_markup: {
      keyboard: buttonsConfig["forSearchingButtons"].buttons[lang],
      resize_keyboard: true
    }
  })
}

module.exports.settingsMenu = async function (bot, msg, lang = 'en') {
  await bot.sendMessage(msg.chat.id, buttonsConfig["settingsButtons"].title[lang], {
    reply_markup: {
      keyboard: buttonsConfig["settingsButtons"].buttons[lang],
      resize_keyboard: true
    }
  })
}


module.exports.commonChoice = async function (bot, msg, lang = 'pl') {
  const chatId = msg?.chat?.id
  if (!chatId || !msg?.text) return
  await bot.sendMessage(msg.chat.id, buttonsConfig["confirmTextInput"].title[lang], {
    reply_markup: {
      keyboard: buttonsConfig["confirmTextInput"].buttons[lang],
      resize_keyboard: true
    }
  })

}

module.exports.chooseNativeLanguageMenu = async function (bot, msg, lang = "en") {
  await bot.sendMessage(msg.chat.id, buttonsConfig["chooseNativeLanguage"].title[lang], {
    reply_markup: {
      keyboard: buttonsConfig["chooseNativeLanguage"].buttons[lang],
      resize_keyboard: true
    }
  })
}

module.exports.notTextScene = async function (bot, msg, lang = "en", toSend = true, voice = false, toChatID = null) {
  const GROUP_ID = toChatID || process.env.GROUP_ID
  try {
    const chatId = msg.chat.id
    await bot.sendMessage(chatId, `<i>${texts[lang]['0_2']}\n</i>`, { parse_mode: "HTML" })

    const collectedMessages = []

    const handleMessage = async (message) => {
      if (message.chat.id === chatId) {
        if (message.text) {
          collectedMessages.push({ type: 'text', content: message.text })
        } else if (message.photo) {
          const fileId = message.photo[message.photo.length - 1].file_id
          collectedMessages.push({ type: 'photo', fileId })
        } else if (message.document) {
          const fileId = message.document.file_id
          collectedMessages.push({ type: 'document', fileId })
        } else if (message.audio) {
          const fileId = message.audio.file_id
          collectedMessages.push({ type: 'audio', fileId })
        } else if (message.voice) {
          const fileId = message.voice.file_id
          collectedMessages.push({ type: 'voice', fileId })
        }
      }
    }

    bot.on('message', handleMessage)

    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        bot.removeListener('message', handleMessage)
        resolve()
      }, 30000)

      bot.on('message', (message) => {
        if (message.chat.id === chatId) {
          clearTimeout(timeout)
          bot.removeListener('message', handleMessage)
          resolve()
        }
      })
    })

    for (const message of collectedMessages) {
      if (!toChatID) {
        if (!globalBuffer.msgQueue) globalBuffer.msgQueue = {}
        if (!globalBuffer.msgQueue[msg.chat.id]) globalBuffer.msgQueue[msg.chat.id] = []
      } else {
        respondToSelectedClient(bot, msg, toChatID)
      }

      if (message.type === 'text') {
        if (!toChatID) {
          globalBuffer.msgQueue[msg.chat.id].push({ type: 'text', content: message.content })
          if (toSend) {
            await bot.sendMessage(
              GROUP_ID,
              `${texts[lang]['0_25']} ${msg.chat.first_name} ${msg.chat.last_name} (ID: ${msg.chat.id}):\n${message.content}`,
              { parse_mode: "HTML" }
            )
          }
        } else {
          await bot.sendMessage(
            GROUP_ID,
            `${texts[lang]['0_24']}\n${message.content}`,
            { parse_mode: "HTML" }
          )
        }
      } else {
        if (toSend) {
          const header = !toChatID
            ? `${texts[lang]['0_25']} ${msg.chat.first_name} ${msg.chat.last_name} (ID: ${msg.chat.id}):`
            : `${texts[lang]['0_24']}\n`
          await bot.sendMessage(GROUP_ID, header, { parse_mode: "HTML" })
        }
        if (message.type === 'photo') {
          if (!toChatID) globalBuffer.msgQueue[msg.chat.id].push({ type: 'photo', fileId: message.fileId })
          await bot.sendPhoto(GROUP_ID, message.fileId)
        } else if (message.type === 'document') {
          if (!toChatID) globalBuffer.msgQueue[msg.chat.id].push({ type: 'document', fileId: message.fileId })
          await bot.sendDocument(GROUP_ID, message.fileId)
        } else if (message.type === 'audio') {
          if (!toChatID) globalBuffer.msgQueue[msg.chat.id].push({ type: 'audio', fileId: message.fileId })
          await bot.sendAudio(GROUP_ID, message.fileId)
        } else if (message.type === 'voice') {
          const dirPath = process.env.TEMP_DOWNLOADS_CATALOG
          fs.mkdirSync(dirPath, { recursive: true })
          const filePath = path.join(dirPath, `${message.fileId}.ogg`)
          await downloadFile(bot, message.fileId, filePath)
          if (!toChatID) globalBuffer.msgQueue[msg.chat.id].push({ type: 'voice', filePath })
          return filePath
        }
      }
    }

    if (toSend && !toChatID) {
      await bot.sendMessage(chatId, texts[lang]['0_4'], { parse_mode: "HTML" })
    }
  } catch (err) {
    console.log(err)
    await bot.sendMessage(msg.chat.id, texts[lang]['0_1'])
  }
}


async function blockMenu(bot, msg, lang = "pl") {
  await bot.sendMessage(msg.chat.id, texts[lang]['block'], {})
}

async function downloadFile(bot, fileId, dest) {
  const file = await bot.getFile(fileId)
  const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(dest)
    response.data.pipe(writer)
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

module.exports.downloadPDF = async function (bot, msg, lang = 'pl', fileN) {
  try {
    const filePath = path.join(__dirname, '../../assets/pdf', `${fileN}.pdf`)
    await bot.sendDocument(msg.chat.id, filePath, {}, {
      filename: `${lang}.pdf`,
      contentType: 'application/pdf'
    })
  } catch (err) {
    console.log(err)
    await bot.sendMessage(msg.chat.id, texts[lang]['0_1'])
  }
}

module.exports.textTranslation = async function (bot, msg) {
  await translateS.callTranslate(bot, msg)
}