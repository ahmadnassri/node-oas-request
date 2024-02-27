// modules
const fetch = require('cross-fetch')
const parseServer = require('./parse-server')
const OASRequestError = require('./error')
const parsePathTemplate = require('./parse-path-template')

// main
module.exports = function (spec) {
  if (!spec || !spec.paths) throw new OASRequestError('missing argument: spec')

  class OASRequest {
    constructor (options = {}) {
      // process spec.servers & options.server
      this.options = {
        clientFactory: options.clientFactory || function () {
          return options.client || fetch
        },
        server: parseServer(options.server, spec),
        // global properties
        headers: options.headers || {},
        params: options.params || {},
        query: options.query || {}
      }
    }

    __request (url, options, spec) {
      const client = this.options.clientFactory(url, options, spec)

      // merge params with global defaults
      const params = { ...this.options.params, ...options.params }

      // cleanup
      delete options.params

      // process path template
      const urlPath = parsePathTemplate(url, params)

      // construct final host & url parts
      const WHATWGURL = new URL(`${this.options.server}${urlPath}`)

      // convert query back to regular object
      WHATWGURL.search = new URLSearchParams({
        ...Object.fromEntries(WHATWGURL.searchParams.entries()),
        ...this.options.query,
        ...options.query
      })

      // cleanup
      delete options.query

      // construct combined headers object
      const headers = { ...this.options.headers, ...options.headers }

      return client(WHATWGURL, {
        ...options,
        headers // use the already combined headers
      })
    }
  }

  // process paths
  for (const [url, methods] of Object.entries(spec.paths)) {
    // filter to paths that contain an operationId
    const withOperationId = Object.entries(methods).filter(([method, operation]) => operation.operationId)

    // create a method for each operation
    for (const [method, operation] of withOperationId) {
      Object.defineProperty(OASRequest.prototype, operation.operationId, {
        enumerable: true,
        writable: false,
        value: function (options) {
          return this.__request(url, { ...options, method }, { method, operation })
        }
      })
    }
  }

  return OASRequest
}
