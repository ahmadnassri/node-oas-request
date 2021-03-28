// node utilities
const querystring = require('querystring')

// modules
const http = require('./http/')
const parseServer = require('./parse-server')
const OASRequestError = require('./error')
const parsePathTemplate = require('./parse-path-template')

// main
module.exports = function (spec) {
  if (!spec || !spec.paths) throw new OASRequestError('missing argument: spec')

  const client = class {
    constructor (options = {}) {
      // process spec.servers & options.server
      this.options = {
        server: parseServer(options.server, spec),
        // global properties
        headers: options.headers || {},
        params: options.params || {},
        query: options.query || {}
      }
    }

    __request (method, url, options) {
      // merge params with global defaults
      const params = { ...this.options.params, ...options.params }

      // process path template
      const urlPath = parsePathTemplate(url, params)

      // construct final host & url parts
      const { protocol, port, hostname, pathname, searchParams } = new URL(`${this.options.server}${urlPath}`)

      // convert query back to regular object
      const searchObj = Object.fromEntries(searchParams.entries())

      // overrides
      const headers = { ...this.options.headers, ...options.headers }
      const query = Object.assign(searchObj, this.options.query, options.query)

      // final query string
      const search = querystring.stringify(query)

      return http({
        headers,
        hostname,
        method,
        port,
        body: options.body,
        path: pathname + (search ? `?${search}` : ''),
        protocol: protocol.replace(':', '')
      })
    }
  }

  // process paths
  for (const [url, methods] of Object.entries(spec.paths)) {
    // filter to paths that contain an operationId
    const withOperationId = Object.entries(methods).filter(([method, operation]) => operation.operationId)

    // create a method for each operation
    for (const [method, operation] of withOperationId) {
      Object.defineProperty(client.prototype, operation.operationId, {
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
