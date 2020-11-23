const jwt = require('jsonwebtoken')
const parseSecurity = require('../lib/security')
const { test } = require('tap')

test('simple case', async (assert) => {
  assert.plan(1)

  const mockOasSecuritySchemes = {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer'
    },
    ApiKeyAuthHeader: {
      type: 'apiKey',
      in: 'header',
      name: 'X-API-KEY'
    },
    ApiKeyAuthQuery: {
      type: 'apiKey',
      in: 'query',
      name: 'X-API-KEY'
    },
    BearerAuthJWT: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    }
  }

  const mockSecret = '__secret__'
  const result =
    await parseSecurity(mockOasSecuritySchemes,
      {
        BearerAuth: [],
        ApiKeyAuthHeader: [],
        ApiKeyAuthQuery: []
      },
      {
        secret: mockSecret,
        jwt: {
          exp: '5m'
        }
      })

  assert.deepEqual(result, {
    headers: {
      authorization: [`Bearer ${mockSecret}`],
      'X-API-KEY': [mockSecret]
    },
    queries: {
      'X-API-KEY': [mockSecret]
    }
  })
})

test('api key with multiple values case', async (assert) => {
  assert.plan(1)

  const mockOasSecuritySchemes = {
    ApiKeyAuthHeader: {
      type: 'apiKey',
      in: 'header',
      name: 'X-API-KEY'
    },
    ApiKeyAuthQuery: {
      type: 'apiKey',
      in: 'query',
      name: 'X-API-KEY'
    },
    ApiKeyAuthHeaderAnother: {
      type: 'apiKey',
      in: 'header',
      name: 'X-API-KEY'
    },
    ApiKeyAuthQueryAnother: {
      type: 'apiKey',
      in: 'query',
      name: 'X-API-KEY'
    }
  }

  const mockSecret = '__secret__'
  const result =
    await parseSecurity(mockOasSecuritySchemes,
      {
        ApiKeyAuthHeader: [],
        ApiKeyAuthQuery: [],
        ApiKeyAuthHeaderAnother: [],
        ApiKeyAuthQueryAnother: []
      },
      {
        secret: mockSecret,
        jwt: {
          exp: '5m'
        }
      })

  assert.deepEqual(result, {
    headers: {
      'X-API-KEY': [mockSecret, mockSecret]
    },
    queries: {
      'X-API-KEY': [mockSecret, mockSecret]
    }
  })
})

test('bearer with multiple values case', async (assert) => {
  assert.plan(2)

  const mockOasSecuritySchemes = {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer'
    },
    BearerAuthJWT: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    }
  }

  const mockSecret = '__secret__'
  const result =
    await parseSecurity(mockOasSecuritySchemes,
      {
        BearerAuth: [],
        BearerAuthJWT: []
      },
      {
        secret: mockSecret,
        jwt: {
          exp: '5m'
        }
      })

  assert.equal(result.headers.authorization[0], `Bearer ${mockSecret}`)
  assert.ok(result.headers.authorization[1] !== `Bearer ${mockSecret}`)
})

test('http basic is not supported', async (assert) => {
  assert.plan(1)

  const mockOasSecuritySchemes = {
    BasicAuth: {
      type: 'http',
      scheme: 'basic'
    }
  }

  const mockSecret = '__secret__'

  try {
    await parseSecurity(mockOasSecuritySchemes,
      {
        BasicAuth: []
      },
      {
        secret: mockSecret
      })
  } catch (err) {
    assert.equal(err.message, 'basic scheme type not implemented.')
  }
})

test('oauth2 is not supported', async (assert) => {
  assert.plan(1)

  const mockOasSecuritySchemes = {
    OauthAuth: {
      type: 'oauth2'
    }
  }

  const mockSecret = '__secret__'

  try {
    await parseSecurity(mockOasSecuritySchemes,
      {
        OauthAuth: []
      },
      {
        secret: mockSecret
      })
  } catch (err) {
    assert.equal(err.message, 'oauth2 type not implemented.')
  }
})

test('openIdConnect is not supported', async (assert) => {
  assert.plan(1)

  const mockOasSecuritySchemes = {
    OpenIdConnectAuth: {
      type: 'openIdConnect'
    }
  }

  const mockSecret = '__secret__'

  try {
    await parseSecurity(mockOasSecuritySchemes,
      {
        OpenIdConnectAuth: []
      },
      {
        secret: mockSecret
      })
  } catch (err) {
    assert.equal(err.message, 'openIdConnect type not implemented.')
  }
})

test('apiKey in cookie is not supported', async (assert) => {
  assert.plan(1)

  const mockOasSecuritySchemes = {
    CookieAuth: {
      type: 'apiKey',
      in: 'cookie'
    }
  }

  const mockSecret = '__secret__'

  try {
    await parseSecurity(mockOasSecuritySchemes,
      {
        CookieAuth: []
      },
      {
        secret: mockSecret
      })
  } catch (err) {
    assert.equal(err.message, 'cookie in type not implemented.')
  }
})

test('jwt with invalid options', async (assert) => {
  assert.plan(1)

  const mockOasSecuritySchemes = {
    BearerAuthJWT: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    }
  }

  const mockSecret = '__secret__'

  try {
    await parseSecurity(mockOasSecuritySchemes,
      {
        BearerAuthJWT: []
      },
      {
        secret: mockSecret,
        jwt: {
          exp: 'some invalid value'
        }
      })
  } catch (err) {
    assert.equal(err.message, '"expiresIn" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60')
  }
})

test('jwt with exp time', async (assert) => {
  assert.plan(2)

  const mockOasSecuritySchemes = {
    BearerAuthJWT: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    }
  }

  const mockSecret = '__secret__'
  const now = Math.floor(Date.now() / 1000)

  const result =
    await parseSecurity(mockOasSecuritySchemes,
      {
        BearerAuthJWT: []
      },
      {
        secret: mockSecret,
        jwt: {
          exp: '5m'
        }
      })

  const jwtToken = result.headers.authorization[0].split('Bearer ')[1]

  const decoded = jwt.decode(jwtToken, { complete: true })

  assert.ok(now + (5 * 60) + 1 >= decoded.payload.exp)
  assert.ok(now + (5 * 60) - 1 <= decoded.payload.exp)
})

test('jwt without exp time', async (assert) => {
  assert.plan(1)

  const mockOasSecuritySchemes = {
    BearerAuthJWT: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    }
  }

  const mockSecret = '__secret__'

  const result =
    await parseSecurity(mockOasSecuritySchemes,
      {
        BearerAuthJWT: []
      },
      {
        secret: mockSecret,
        jwt: {}
      })

  const jwtToken = result.headers.authorization[0].split('Bearer ')[1]

  const decoded = jwt.decode(jwtToken, { complete: true })

  assert.equal(decoded.payload.exp, undefined)
})

test('jwt without options', async (assert) => {
  assert.plan(1)

  const mockOasSecuritySchemes = {
    BearerAuthJWT: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    }
  }

  const mockSecret = '__secret__'

  const result =
    await parseSecurity(mockOasSecuritySchemes,
      {
        BearerAuthJWT: []
      },
      {
        secret: mockSecret
      })

  const jwtToken = result.headers.authorization[0].split('Bearer ')[1]

  const decoded = jwt.decode(jwtToken, { complete: true })

  assert.equal(decoded.payload.exp, undefined)
})
