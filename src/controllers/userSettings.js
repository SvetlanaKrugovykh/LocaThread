const { selectedByUser } = require('../globalBuffer')
const fs = require('fs')
const path = require('path')
const { getFromUserFile } = require('../services/userGetterServices')


module.exports.isEmptyObject = function (obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}

module.exports.pinToUserFile = async function (chatId) {
  try {
    if (!selectedByUser[chatId]) return
    const dirPath = path.join(__dirname, '../../../users/settings')
    const filePath = path.join(dirPath, `${chatId}.json`)

    fs.mkdirSync(dirPath, { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify(selectedByUser[chatId], null, 2))
  } catch (error) {
    console.log('Error pinning to user file:', error)
  }
}

module.exports.userSettings = async function (msg, operation = 'read', lang = 'pl') {
  try {
    const chatId = msg.chat.id

    if (!selectedByUser[chatId] || operation === 're_read' || operation === 'authorize' || operation === 'changed') {
      const data = await getFromUserFile(msg.chat.id)
      if (module.exports.isEmptyObject(data)) {
        selectedByUser[chatId] = {}
        if (operation === 'authorize') {
          selectedByUser[chatId].authorized = true
        } else {
          selectedByUser[chatId].authorized = false
        }
        selectedByUser[chatId].language = lang
        selectedByUser[chatId].text = ''
        selectedByUser[chatId].changed = false
        selectedByUser[chatId].username = msg.chat.username
        selectedByUser[chatId].first_name = msg.chat.first_name
        selectedByUser[chatId].last_name = msg.chat.last_name
        selectedByUser[chatId].id = msg.chat.id
        await module.exports.pinToUserFile(chatId)
      } else {
        selectedByUser[chatId] = data
      }
      if (operation !== 'changed' && operation !== 'authorize') return selectedByUser[chatId]
    }

    if (operation === 'changed') {
      selectedByUser[chatId].changed = false
      await module.exports.pinToUserFile(chatId)
      return selectedByUser[chatId]
    }

    if (operation === 'authorize') {
      selectedByUser[chatId].authorized = true
      await module.exports.pinToUserFile(chatId)
      return selectedByUser[chatId]
    }

    if (operation === 'write') {
      selectedByUser[chatId].language = lang
      selectedByUser[chatId].changed = true
      await module.exports.pinToUserFile(chatId)
      return selectedByUser[chatId]
    }

  } catch (error) {
    console.log('Error in userSettings:', error)
  }
}

module.exports.saveLanguage = async function (bot, msg, menuItem) {
  try {
    let txtLanguage = 'pl'

    switch (menuItem) {
      case '0_7':
        txtLanguage = 'en'
        break
      case '0_8':
        txtLanguage = 'de'
        break
      case '0_9':
        txtLanguage = 'uk'
        break
      default:
        break
    }
    const data = await module.exports.userSettings(msg, 'write', txtLanguage)
    selectedByUser[msg.chat.id] = data
  } catch (err) {
    console.log(err)
  }
}

