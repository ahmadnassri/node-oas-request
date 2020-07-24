// node utilities
const querystring = require('querystring')

// modules
const http = require('./http/')
const template = require('./path-template')

// main
module.exports = function (oas) {
  if (!oas) throw new Error('missing argument: oas')

  const client = class {
    constructor (server, { headers = {}, params = {}, query = {} } = {}) {
      if (!server) throw new Error('missing argument: server')

      // TODO analyze oas.servers
      this.server = server

      // default properties
      this.headers = headers
      this.params = params
      this.query = query
    }

    __request (method, url, options = {}) {
      // merge params with global defaults
      const params = Object.assign({}, this.params, options.params)

      // process path template
      const urlPath = template(url, params)

      // construct final host & url parts
      const { protocol, port, host, pathname, searchParams } = new URL(urlPath, this.server)

      // convert query back to regular object
      const searchObj = Object.fromEntries(searchParams.entries())

      // overrides
      const headers = Object.assign({}, this.headers, options.headers)
      const query = Object.assign(searchObj, this.query, options.query)

      // final query string
      const search = querystring.stringify(query)

      return http({
        headers,
        host,
        method,
        port,
        body: options.body,
        path: pathname + (search ? `?${search}` : ''),
        protocol: protocol.replace(':', '')
      })
    }
  }

  // process paths
  for (const [url, methods] of Object.entries(oas.paths)) {
    // filter to paths that contain an operationId
    const operational = Object.entries(methods).filter(([method, spec]) => spec.operationId)

    // process each method
    for (const [method, spec] of operational) {
      Object.defineProperty(client.prototype, spec.operationId, {
        enumerable: true,
        writable: false,
        value: function ({ headers, params, query, body } = {}) {
          return this.__request(method, url, { headers, params, query, body })
        }
      })
    }
  }

  return client
}
