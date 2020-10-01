const jwt = require('jsonwebtoken')
const { test } = require('tap')
const sinon = require('sinon')

// create stub
const http = sinon.stub()

// delete require cache
delete require.cache[require.resolve('../lib/http/')]

// override required module
require.cache[require.resolve('../lib/http/')] = { exports: http }

const globalSecuritySpec = require('./fixtures/global-security.json')
const methodSecuritySpec = require('./fixtures/method-security.json')
const missingSecuritySpec = require('./fixtures/missing-security.json')
const emptySecuritySpec = require('./fixtures/empty-security.json')

const client = require('..')

test('per method overrides security values', async (assert) => {
  assert.plan(1)

  http.callsFake(options => {
    assert.deepEqual(options, {
      protocol: 'http',
      port: '',
      host: 'example.com',
      method: 'get',
      path: '/method-specific-security?API-Key=per-method-override-query',
      headers: {
        'X-API-KEY': 'per-method-override-header'
      },
      body: undefined
    })
  })

  const API = client(globalSecuritySpec)
  const api = new API('http://example.com', { secret: 'secret' })

  await api.testMethodSpecific({
    secret: 'method-secret',
    query: {
      'API-Key': 'per-method-override-query'
    },
    headers: {
      'X-API-KEY': 'per-method-override-header'
    }
  })
})

test('global security is applied', async (assert) => {
  assert.plan(1)

  http.callsFake(options => {
    assert.deepEqual(options, {
      protocol: 'http',
      port: '',
      host: 'example.com',
      method: 'get',
      path: '/global-security',
      headers: {
        'X-API-KEY': [
          'secret'
        ]
      },
      body: undefined
    })
  })

  const API = client(globalSecuritySpec)
  const api = new API('http://example.com', { secret: 'secret' })

  await api.testGlobal()
})

test('global security with method security is applied', async (assert) => {
  assert.plan(1)

  http.callsFake(options => {
    assert.deepEqual(options, {
      protocol: 'http',
      port: '',
      host: 'example.com',
      method: 'get',
      path: '/method-specific-security?API-Key=secret',
      headers: {
        'X-API-KEY': [
          'secret'
        ]
      },
      body: undefined
    })
  })

  const API = client(globalSecuritySpec)
  const api = new API('http://example.com', { secret: 'secret' })

  await api.testMethodSpecific()
})

test('global security with method security override', async (assert) => {
  assert.plan(1)

  http.callsFake(options => {
    assert.deepEqual(options, {
      protocol: 'http',
      port: '',
      host: 'example.com',
      method: 'get',
      path: '/method-specific-security?API-Key=method-secret',
      headers: {
        'X-API-KEY': [
          'method-secret'
        ]
      },
      body: undefined
    })
  })

  const API = client(globalSecuritySpec)
  const api = new API('http://example.com', { secret: 'secret' })

  await api.testMethodSpecific({ secret: 'method-secret' })
})

test('method security is applied', async (assert) => {
  assert.plan(1)

  http.callsFake(options => {
    assert.deepEqual(options, {
      protocol: 'http',
      port: '',
      host: 'example.com',
      method: 'get',
      path: '/global-security',
      headers: {},
      body: undefined
    })
  })

  const API = client(methodSecuritySpec)
  const api = new API('http://example.com', { secret: 'secret' })

  await api.testGlobal()
})

test('method security with method security is applied', async (assert) => {
  assert.plan(2)

  http.callsFake(options => {
    assert.deepEqual(options.path, '/method-specific-security')
    const jwtToken = options.headers.authorization[0].split('Bearer ')[1]

    const decoded = jwt.verify(jwtToken, 'secret', { complete: true })

    assert.equal(decoded.payload.exp, undefined)
  })

  const API = client(methodSecuritySpec)
  const api = new API('http://example.com', { secret: 'secret' })

  await api.testMethodSpecific()
})

test('method security with method security override', async (assert) => {
  assert.plan(3)

  const now = Math.floor(Date.now() / 1000)

  http.callsFake(options => {
    assert.deepEqual(options.path, '/method-specific-security')
    const jwtToken = options.headers.authorization[0].split('Bearer ')[1]

    const decoded = jwt.verify(jwtToken, 'another-secret', { complete: true })

    assert.ok(now + (5 * 60) + 1 >= decoded.payload.exp)
    assert.ok(now + (5 * 60) - 1 <= decoded.payload.exp)
  })

  const API = client(methodSecuritySpec)
  const api = new API('http://example.com', { secret: 'secret' })

  await api.testMethodSpecific({ secret: 'another-secret', jwt: { exp: '5m' } })
})

test('missing security raise error', async (assert) => {
  assert.plan(1)

  const API = client(missingSecuritySpec)
  const api = new API('http://example.com', { secret: 'secret' })

  try {
    await api.testGlobal()
  } catch (err) {
    assert.equal(err.message, 'Security scheme MissingSecurityMethod not defined in spec.')
  }
})

test('empty security global method', async (assert) => {
  assert.plan(1)

  http.callsFake(options => {
    assert.deepEqual(options, {
      protocol: 'http',
      port: '',
      host: 'example.com',
      method: 'get',
      path: '/global-security',
      headers: {},
      body: undefined
    })
  })

  const API = client(emptySecuritySpec)
  const api = new API('http://example.com')

  await api.testGlobal()
})

test('empty security per method', async (assert) => {
  assert.plan(1)

  http.callsFake(options => {
    assert.deepEqual(options, {
      protocol: 'http',
      port: '',
      host: 'example.com',
      method: 'get',
      path: '/method-specific-security',
      headers: {},
      body: undefined
    })
  })

  const API = client(emptySecuritySpec)
  const api = new API('http://example.com')

  await api.testMethodSpecific()
})
