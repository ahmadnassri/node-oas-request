const jwt = require('jsonwebtoken')

module.exports = async function (payload, secret, options) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        return reject(err)
      }
      return resolve(token)
    })
  })
}
