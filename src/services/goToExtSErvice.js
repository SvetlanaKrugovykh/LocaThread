const axios = require('axios')
const { getLatestUserChoices } = require('../db/getData')

async function goToExternalService(userId, url) {


  let minPrice = null
  let maxPrice = null
  if (priceRanges.length > 0) {
    const match = priceRanges[0].match(/(\d+)[^\d]+(\d+)?/)
    if (match) {
      minPrice = parseInt(match[1])
      maxPrice = match[2] ? parseInt(match[2]) : null
    } else if (priceRanges[0].includes('do')) {
      maxPrice = parseInt(priceRanges[0].replace(/\D/g, ''))
    } else if (priceRanges[0].includes('powyżej')) {
      minPrice = parseInt(priceRanges[0].replace(/\D/g, ''))
    }
  }

  const body = {
    minPrice,
    maxPrice,
    rooms,
    districts,
    chatID: userId
  }

  try {
    const response = await axios.post(url, body)
    return response.data
  } catch (err) {
    console.error('Error sending user choices:', err)
    throw err
  }
}

module.exports = { goToExternalService }