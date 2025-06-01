const axios = require('axios')
require('dotenv').config()

async function goToExternalService(userId, data) {

  const { districts, rooms, minPrice, maxPrice } = data
  const DEBUG_LEVEL = parseInt(process.env.DEBUG_LEVEL) || 0
  const url = process.env.EXTERNAL_SERVICE_URL

  const body = {
    minPrice,
    maxPrice,
    rooms,
    districts,
    chatID: userId
  }

  try {
    const response = await axios.post(url, body, { timeout: 900000 })
    if (response.status !== 200) {
      throw new Error(`External service returned status ${response.status}`)
    }
    if (DEBUG_LEVEL > 5) {
      console.log('Response from external service:', response.data)
    }
    return response.data
  } catch (err) {
    console.error('Error sending user choices:', err)
    return null
  }
}

module.exports = { goToExternalService }