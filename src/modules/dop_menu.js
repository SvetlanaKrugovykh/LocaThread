const { bot } = require("../globalBuffer")

module.exports.dopMenuBez = async function (msg, lang = 'pl') {
  const data = checkInputData(msg)
  if (!data) return null

}

module.exports.dopMenuZ = async function (msg, lang = 'pl') {
  const data = checkInputData(msg)
  if (!data) return null

}


async function checkInputData(msg, lang = 'pl') {
  const userId = msg.chat.id
  const districts = await getLatestUserChoices(userId, '5_1')
  const rooms = await getLatestUserChoices(userId, '5_2')
  const priceRanges = await getLatestUserChoices(userId, '5_3')
  if (!districts.length || !rooms.length || !priceRanges.length) {
    await bot.sendMessage(msg.chat.id, texts[lang]['noData'], { parse_mode: 'HTML' })
    return null
  }

  return {
    districts,
    rooms,
    priceRanges
  }
}