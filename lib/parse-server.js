const OASRequestError = require('./error')
const parsePathTemplate = require('./parse-path-template')

module.exports = function (server, spec) {
  // try to find a server from the spec
  if (!server && spec && spec.servers) {
    server = spec.servers[0]
  }

  if (!server) {
    throw new OASRequestError('missing argument: server')
  }

  // convert to an object
  if (typeof server === 'string') {
    server = { url: server }
  }

  if (!server.url) throw new OASRequestError('missing argument: server.url')

  let url = server.url

  let defaults

  if (spec.servers) {
    // find matching server from spec
    const specServer = spec.servers.find(s => s.url === url)

    // exit early
    if (specServer && specServer.variables) {
      // convert spec variables to key=>value
      defaults = Object.fromEntries(
        Object.entries(specServer.variables)
          .map(([name, { default: value }]) => [name, value])
      )
    }
  }

  // process server url template
  url = parsePathTemplate(server.url, server.variables, defaults)

  return url.replace(/\/$/, '')
}
