const OASRequestError = require('./error')
const parsePathTemplate = require('./parse-path-template')

module.exports = function (server, spec) {
  if (!server) throw new OASRequestError('missing argument: server')

  // convert to an object
  if (typeof server === 'string') {
    server = { url: server }
  }

  if (!server.url) throw new OASRequestError('missing argument: server.url')

  let url = server.url

  // create default values from spec
  const variables = {}

  for (const specServers of spec.servers || []) {
    for (const name in specServers.variables || []) {
      variables[name] =
        server.variables
          ? server.variables[name] // the passed server object has a value
          : specServers.variables[name].default // the spec source has a default value
    }
  }

  // process server url template
  url = parsePathTemplate(server.url, variables)

  return url.replace(/\/$/, '')
}
