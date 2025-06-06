const { bot } = require("../globalBuffer")
const { getLatestUserChoices } = require("../db/getData")
const texts = require('../data/keyboard').texts
const { goToExternalService } = require('../services/goToExtSErvice')
const { sendFullInfoToUser } = require('../services/sendFullInfo')
const { textInput } = require('../modules/common_functions')
const { sendRequestToAdmins, sendWhatReqToAUser } = require('../services/sendToGroup')

module.exports.dopMenuBez = async function (msg, lang = 'pl') {
  const data = await module.exports.checkInputData(msg.chat.id, lang)
  if (!data) return null
  await sendWhatReqToAUser(msg.chat.id, data, lang)
  await bot.sendMessage(msg.chat.id, texts[lang]['infoWait'], { parse_mode: 'HTML' })
  const dataForUser = await goToExternalService(msg.chat.id, data)
  if (!dataForUser) {
    await bot.sendMessage(msg.chat.id, texts[lang]['errorExternal'], { parse_mode: 'HTML' })
    return null
  }
  await sendFullInfoToUser(msg.chat.id, dataForUser, lang)
}

module.exports.dopMenuZ = async function (msg, lang = 'pl') {
  const data = await module.exports.checkInputData(msg.chat.id, lang)
  if (!data) return null
  await bot.sendMessage(msg.chat.id, texts[lang]['needInfo'], { parse_mode: 'HTML' })
  await textInput(bot, msg)
  await sendRequestToAdmins(msg.chat.id, data, lang)
}


module.exports.checkInputData = async function (userId, lang = 'pl', isScheduled = false) {
  const districts = [...new Set(await getLatestUserChoices(userId, '5_1'))]
  const rooms = [...new Set(await getLatestUserChoices(userId, '5_2'))]
  const priceRanges = [...new Set(await getLatestUserChoices(userId, '5_3'))]

  if (!districts.length || !priceRanges.length) {
    if (!isScheduled) await bot.sendMessage(userId, texts[lang]['noData'], { parse_mode: 'HTML' })
    return null
  }

  const { minPrice, maxPrice } = parsePriceRange(priceRanges)
  if (minPrice === null || maxPrice === null) {
    if (!isScheduled) await bot.sendMessage(userId, texts[lang]['noPriceRange'], { parse_mode: 'HTML' })
    return null
  }

  return {
    districts,
    rooms,
    minPrice,
    maxPrice
  }
}

function parsePriceRange(priceRanges) {
  if (!priceRanges || !priceRanges.length) return { minPrice: null, maxPrice: null }

  let minPrice = null
  let maxPrice = null

  for (const str of priceRanges) {
    const match = str.match(/(\d+)[^\d]+(\d+)/)
    if (match) {
      const min = parseInt(match[1])
      const max = parseInt(match[2])
      if (minPrice === null || min < minPrice) minPrice = min
      if (maxPrice === null || max > maxPrice) maxPrice = max
    }
  }

  return { minPrice, maxPrice }
}