require('dotenv').config()
const { inputLineScene, inputLineAdminScene } = require('../controllers/inputLine')
const { buttonsConfig } = require('../data/keyboard')
const GROUP_ID = Number(process.env.GROUP_ID)
const { globalBuffer, selectedByUser } = require('../globalBuffer')
require('dotenv').config()

async function actionsOnId(bot, msg, inputLine) {
  if (inputLine !== undefined) {
    if (inputLine.includes('id#')) {
      let id = inputLine.split('id#')[1]
      let msgtext = inputLine.split('id#')[2]
      console.log('id', id)
      console.log('msgtext', msgtext)
      try {
        await bot.sendMessage(id, `Дякуємо за звернення, відповідь: \n ${msgtext}`, { parse_mode: 'HTML' })
        await bot.sendMessage(msg.chat.id, `🥎🥎 id# request sent\n`, { parse_mode: 'HTML' })
      } catch (err) {
        console.log(err)
      }
    }
  }
}

module.exports.clientsAdmin = async function (bot, msg) {
  await module.exports.menuStarter(bot, msg)
}

module.exports.menuStarter = async function (bot, msg, lang = 'pl') {
  await module.exports.sendstarterButtons(bot, msg, lang)
  console.log(((new Date()).toLocaleTimeString()))
}

module.exports.sendstarterButtons = async function (bot, msg) {
  const { title, buttons } = buttonsConfig["starterButtons"]
  const lang = selectedByUser[msg.chat.id]?.language || 'pl'
  const adminIds = process.env.ADMINS.split(',').map(id => id.trim())
  const userButtons = [...buttons[lang]]

  if (adminIds.includes(String(msg.chat.id))) {
    userButtons.push([{ text: '✍ for Reply on demand', callback_data: '0_99' }])
  }
  await bot.sendMessage(msg.chat.id, title[lang], {
    reply_markup: {
      keyboard: userButtons,
      resize_keyboard: true
    }
  })

}

module.exports.clientsAdminResponseToRequest = async function (bot, msg) {
  await bot.sendMessage(msg.chat.id, 'Введіть <i>id чата для відправки відповіді клієнту </i>\n', { parse_mode: 'HTML' })
  const codeChat = await inputLineScene(bot, msg)
  if (codeChat.length < 7) {
    await bot.sendMessage(msg.chat.id, 'Wrong id. Операцію скасовано\n', { parse_mode: 'HTML' })
    return null
  }
  const commandHtmlText = 'Введіть <i>text відповіді клієнту </i>\n'
  await bot.sendMessage(msg.chat.id, commandHtmlText, { parse_mode: 'HTML' })
  const txtCommand = await inputLineScene(bot, msg)
  if (txtCommand.length < 7) {
    await bot.sendMessage(msg.chat.id, 'Незрозуміла відповідь. Операцію скасовано\n', { parse_mode: 'HTML' })
    return null
  }
  const txtCommandForSend = 'id#' + codeChat + 'id#' + txtCommand
  await actionsOnId(bot, msg, txtCommandForSend)
}


