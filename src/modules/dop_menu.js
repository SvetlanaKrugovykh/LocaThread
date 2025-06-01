const { bot } = require("../globalBuffer")
const { getLatestUserChoices } = require("../db/getData")
const texts = require('../data/keyboard').texts
const { goToExternalService } = require('../services/goToExtSErvice')
const { sendFullInfoToUser } = require('../services/sendFullInfo')
const { textInput } = require('../modules/common_functions')
const { sendRequestToAdmins, sendWhatReqToAUser } = require('../services/sendToGroup')

module.exports.dopMenuBez = async function (msg, lang = 'pl') {
  const data = await checkInputData(msg, lang)
  if (!data) return null
  sendWhatReqToAUser(msg.chat.id, data, lang)
  await bot.sendMessage(msg.chat.id, texts[lang]['infoWait'], { parse_mode: 'HTML' })
  const dataForUser = await goToExternalService(msg.chat.id, data)
  if (!dataForUser) {
    await bot.sendMessage(msg.chat.id, texts[lang]['errorExternal'], { parse_mode: 'HTML' })
    return null
  }
  await sendFullInfoToUser(msg.chat.id, dataForUser, lang)
}

module.exports.dopMenuZ = async function (msg, lang = 'pl') {
  const data = await checkInputData(msg, lang)
  if (!data) return null
  await bot.sendMessage(msg.chat.id, texts[lang]['needInfo'], { parse_mode: 'HTML' })
  await textInput(bot, msg)
  await sendRequestToAdmins(msg.chat.id, data, lang)
}


async function checkInputData(msg, lang = 'pl') {
  const userId = msg.chat.id
  const districts = [...new Set(await getLatestUserChoices(userId, '5_1'))]
  const rooms = [...new Set(await getLatestUserChoices(userId, '5_2'))]
  const priceRanges = [...new Set(await getLatestUserChoices(userId, '5_3'))]

  if (!districts.length || !priceRanges.length) {
    await bot.sendMessage(msg.chat.id, texts[lang]['noData'], { parse_mode: 'HTML' })
    return null
  }

  const { minPrice, maxPrice } = parsePriceRange(priceRanges)
  if (minPrice === null || maxPrice === null) {
    await bot.sendMessage(msg.chat.id, texts[lang]['noPriceRange'], { parse_mode: 'HTML' })
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
  const str = priceRanges[0]

  let minPrice = null
  let maxPrice = null

  const match = str.match(/(\d+)[^\d]+(\d+)?/)
  if (match) {
    minPrice = parseInt(match[1])
    maxPrice = match[2] ? parseInt(match[2]) : null
  } else if (str.includes('do')) {
    maxPrice = parseInt(str.replace(/\D/g, ''))
  } else if (str.includes('powyżej')) {
    minPrice = parseInt(str.replace(/\D/g, ''))
  }

  return { minPrice, maxPrice }
}