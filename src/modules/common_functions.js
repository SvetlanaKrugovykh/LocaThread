const { inputLineScene } = require('../controllers/inputLine')
const { globalBuffer, selectedByUser } = require('../globalBuffer')

module.exports.textInput = async function (bot, msg) {
  try {
    let inputLength = 3
    const txtCommand = (await inputLineScene(bot, msg)).trim()

    if (!txtCommand || txtCommand.length < inputLength) {
      await bot.sendMessage(msg.chat.id, 'that`s not enough\n', { parse_mode: 'HTML' })
      return
    }
    selectedByUser[msg.chat.id].text = txtCommand
    console.log('Text:', txtCommand)
  } catch (err) {
    console.log(err)
  }
}