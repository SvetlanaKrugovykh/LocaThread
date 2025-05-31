const { bot } = require("../globalBuffer")
const { getLatestUserChoices } = require("../db/getData")
const texts = require('../data/keyboard').texts
const { goToExternalService } = require('../services/goToExtSErvice')
const { sendFullInfoToUser } = require('../services/sendFullInfo')

module.exports.dopMenuBez = async function (msg, lang = 'pl') {
  const data = await checkInputData(msg, lang)
  if (!data) return null
  await bot.sendMessage(msg.chat.id, texts[lang]['infoWait'], { parse_mode: 'HTML' })
  const dataForUser = await goToExternalService(msg.chat.id, data)
  if (!dataForUser) {
    await bot.sendMessage(msg.chat.id, texts[lang]['noData'], { parse_mode: 'HTML' })
    return null
  }
  await sendFullInfoToUser(msg.chat.id, dataForUser, lang)
}

module.exports.dopMenuZ = async function (msg, lang = 'pl') {
  const data = await checkInputData(msg, lang)
  if (!data) return null
  await bot.sendMessage(msg.chat.id, texts[lang]['needInfo'], { parse_mode: 'HTML' })
}


async function checkInputData(msg, lang = 'pl') {
  const userId = msg.chat.id
  const districts = await getLatestUserChoices(userId, '5_1')
  const rooms = await getLatestUserChoices(userId, '5_2')
  const priceRanges = await getLatestUserChoices(userId, '5_3')
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