const pool = require('./pool')

module.exports.getAllFromTable = async function (tableName, nameField) {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT ${nameField} FROM ${tableName} ORDER BY id`, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res.rows.map(row => row[nameField]))
      }
    })
  })
}
