// node utilities
const querystring = require('querystring')

// modules
const http = require('./http/')
const template = require('./path-template')
const { parseSecurity } = require('./security/')

// main
module.exports = function (oas) {
  if (!oas) throw new Error('missing argument: oas')

  const oasSecuritySchemes = (oas.components && oas.components.securitySchemes) ? oas.components.securitySchemes : undefined

  const client = class {
    constructor (server, { headers = {}, params = {}, query = {}, secret = undefined, jwt = {} } = {}) {
      if (!server) throw new Error('missing argument: server')

      // TODO analyze oas.servers
      this.server = server.replace(/\/$/, '')

      // default properties
      this.headers = headers
      this.params = params
      this.query = query
      this.secret = secret
      this.jwt = jwt
    }

    async __request (method, url, securityRequirements, options) {
      // merge params with global defaults
      const params = Object.assign({}, this.params, options.params)

      // process path template
      const urlPath = template(url, params)

      // construct final host & url parts
      const { protocol, port, host, pathname, searchParams } = new URL(`${this.server}${urlPath}`)

      // Get security options from global config and per API method config

      const methodSecurity = {}
      if (options.secret) {
        methodSecurity.secret = options.secret
      }
      if (options.jwt) {
        methodSecurity.jwt = options.jwt
      }

      const securityOptions = Object.assign({}, {
        secret: this.secret,
        jwt: this.jwt
      }, methodSecurity)

      // Get security values in headers and queries from the required security schemas, and the given security options
      const {
        headers: securityHeaders,
        queries: securityQueries
      } = await parseSecurity(oasSecuritySchemes, securityRequirements, securityOptions)

      // convert query back to regular object
      const searchObj = Object.fromEntries(searchParams.entries())

      // overrides
      const headers = Object.assign({}, this.headers, securityHeaders, options.headers)
      const query = Object.assign(searchObj, this.query, securityQueries, options.query)

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

  const globalSecurity = oas.security ? oas.security[0] || {} : {}

  // process paths
  for (const [url, methods] of Object.entries(oas.paths)) {
    // filter to paths that contain an operationId
    const operational = Object.entries(methods).filter(([method, spec]) => spec.operationId)

    // process each method
    for (const [method, spec] of operational) {
      const methodSecurity = spec.security ? spec.security[0] || {} : {}

      // Get the global security requirements, followed by the per method security requirements
      const securityRequirements = {
        ...globalSecurity,
        ...methodSecurity
      }

      Object.defineProperty(client.prototype, spec.operationId, {
        enumerable: true,
        writable: false,
        value: function ({ headers, params, query, body, secret, jwt } = {}) {
          return this.__request(method, url, securityRequirements, {
            headers,
            params,
            query,
            body,
            secret,
            jwt
          })
        }
      })
    }
  }

  return client
}
