const { buttonsConfig } = require('../data/keyboard')
const { testsMenu } = require('../data/tests_keyboard')
const menu = require('../modules/common_menu')
const { textInput } = require('../modules/common_functions')
const { globalBuffer, selectedByUser } = require('../globalBuffer')
const { pinNativeLanguage } = require('../db/putU')
const { getUserData } = require('../db/getU')

require('dotenv').config()

function getCallbackData(text) {
  try {
    for (const buttonSet of Object.values(buttonsConfig)) {
      for (const langButtons of Object.values(buttonSet.buttons)) {
        for (const buttonRow of langButtons) {
          for (const button of buttonRow) {
            if (button.text === text) {
              return button.callback_data
            }
          }
        }
      }
    }
    for (const buttonSet of Object.values(testsMenu)) {
      for (const langButtons of Object.values(buttonSet.buttons)) {
        for (const buttonRow of langButtons) {
          for (const button of buttonRow) {
            if (button.text === text) {
              return button.callback_data
            }
          }
        }
      }
    }
    return null
  } catch (error) { console.log(error) }
}

async function handler(bot, msg) {
  const chatId = msg?.chat?.id
  if (globalBuffer[chatId] === undefined) globalBuffer[chatId] = {}

  if (!chatId || !msg?.text) return

  const data = getCallbackData(msg.text)
  if (!data) return

  if (!selectedByUser[chatId]) selectedByUser[chatId] = await getUserData(chatId)
  if (!globalBuffer[chatId]) globalBuffer[chatId] = {}

  let lang = selectedByUser[chatId]?.language || 'pl'

  console.log('The choice is:', data)

  switch (data) {
    case '0_0':
      await textInput(bot, msg, data)
      await menu.textTranslation(bot, msg)
      break
    case '0_1':
      await textInput(bot, msg, data)
      await menu.commonChoice(bot, msg, lang)
      break
    case '0_2':
      await menu.notTextScene(bot, msg, lang)
      break
    case '0_3':
    case '0_4':
      await menu.commonStartMenu(bot, msg, lang)
      break
    case '0_8':
      await menu.settingsMenu(bot, msg, lang)
      break
    case '0_9':
      if (selectedByUser[chatId]?.changed) return
      pinNativeLanguage(data, msg)
      await menu.settingsMenu(bot, msg, lang)
      break
    case '1_1':
      await menu.downloadPDF(bot, msg, lang, 'regulamin')
      break
    case '1_2':
      await menu.chooseNativeLanguageMenu(bot, msg)
      break
    case '9_1':
    case '9_2':
    case '9_3':
    case '9_4':
      pinNativeLanguage(data, msg)
      break
    case 'download_info':
      await menu.downloadPDF(bot, msg, lang, 'regulamin')
      break
    default:
      await menu.commonStartMenu(bot, msg, lang)
      break
  }
}

module.exports = { handler }