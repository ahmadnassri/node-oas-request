/* istanbul ignore file */

module.exports = function config (options = {}) {
  // set default options
  if (!options.host) options.host = 'localhost'
  if (!options.path) options.path = '/'
  if (!options.port) options.port = 443
  if (!options.protocol) options.protocol = 'https'
  if (!options.headers) options.headers = {}

  // set standard header values
  Object.assign(options.headers, { accept: 'application/json' })

  // only set content-type header when body is present
  if (options.body) Object.assign(options.headers, { 'content-type': 'application/json' })

  // ensure body is in JSON format
  if (options.body) options.body = JSON.stringify(options.body)

  return options
}
