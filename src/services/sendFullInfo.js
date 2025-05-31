const { bot } = require("../globalBuffer")

async function sendFullInfoToUser(chatId, dataForUser, lang = 'pl', delayMs = 1200) {
  for (const item of dataForUser) {
    let text =
      `<b>${item.title || ''}</b>\n` +
      `<b>Цена:</b> ${item.price || ''}\n` +
      `<b>Локация:</b> ${item.location || ''}\n` +
      (item.link ? `<a href="${item.link}">Ссылка на объявление</a>\n` : '')

    const messages = splitByLength(text, 4096)

    if (item.photo_base_64) {
      const photoBuffer = Buffer.from(item.photo_base_64, 'base64')
      await bot.sendPhoto(chatId, photoBuffer, {
        caption: messages[0],
        parse_mode: 'HTML'
      })
      for (let i = 1; i < messages.length; i++) {
        await bot.sendMessage(chatId, messages[i], { parse_mode: 'HTML' })
      }
    } else {
      for (const msg of messages) {
        await bot.sendMessage(chatId, msg, { parse_mode: 'HTML' })
      }
    }

    await new Promise(res => setTimeout(res, delayMs))
  }
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

module.exports.sendFullInfoToUser = sendFullInfoToUser