/* istanbul ignore file */

module.exports = function (response) {
  const { unzip, brotliDecompress } = require('zlib')

  return new Promise((resolve, reject) => {
    const encoding = response.headers['content-encoding']

    const isBrotli = encoding === 'br'

    // TODO: Remove this when targeting Node.js 12.
    if (isBrotli && typeof brotliDecompress !== 'function') {
      reject(new Error('Brotli is not supported on Node.js < 12'))
    }

    const decompress = isBrotli ? brotliDecompress : unzip

    decompress(response.body, (err, buffer) => {
      if (err) reject(new Error('An error occurred:', err))

      resolve(buffer.toString())
    })
  })
}
