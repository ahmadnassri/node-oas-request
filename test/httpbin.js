const { test } = require('tap')

const spec = require('./fixtures/httpbin.json')
const client = require('../lib')

const API = client(spec)
const api = new API('https://httpbin.org:443')

test('generates methods', assert => {
  assert.plan(4)

  assert.type(api.getIP, Function)
  assert.type(api.httpGet, Function)
  assert.type(api.httpPost, Function)
  assert.type(api.httpDelete, Function)
})

test('GET /', async assert => {
  assert.plan(1)

  const result = await api.httpGet()

  assert.match(result, {
    headers: {
      'content-type': 'application/json',
      connection: 'close',
      'access-control-allow-origin': '*',
      'access-control-allow-credentials': 'true'
    },
    statusCode: 200,
    statusMessage: 'OK',
    body: {
      args: {},
      headers: {
        Accept: 'application/json',
        Host: 'httpbin.org'
      },
      url: 'https://httpbin.org/get'
    }
  })
})

test('POST plain', async assert => {
  assert.plan(1)

  const result = await api.httpPost({ body: 'foo' })

  assert.match(result.body, { data: '"foo"' })
})

test('POST json', async assert => {
  assert.plan(1)

  const result = await api.httpPost({ body: { foo: 'bar' } })

  assert.match(result.body, { data: '{"foo":"bar"}', json: { foo: 'bar' } })
})
