async function isThisGroupId(bot, chatId, msg) {
  try {
    const chat = await bot.getChat(chatId)
    return chat.type === 'group' || chat.type === 'supergroup';
  } catch (err) {
    return false
  }
}

module.exports = { isThisGroupId }