const pool = require('./pool')

module.exports.saveUserChoice = async function (userId, action) {
  const [cat1, cat2, value] = action.split('_')
  const category = cat1 + '_' + cat2
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO user_choices (user_id, category, value) VALUES ($1, $2, $3)`,
      [userId, category, value],
      (err, res) => {
        if (err) reject(err)
        else resolve(true)
      }
    )
  })
}