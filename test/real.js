const { test } = require('tap')

const spec = require('./fixtures/mockbin.json')
const client = require('../lib')

const API = client(spec)
const api = new API()

test('generates methods', assert => {
  assert.plan(2)

  assert.type(api.httpGet, Function)
  assert.type(api.httpPost, Function)
})

test('GET /', async assert => {
  assert.plan(5)

  const response = await api.httpGet()

  const body = await response.json()

  assert.ok(response.ok)
  assert.equal(response.status, 200)
  assert.equal(response.statusText, 'OK')
  assert.match(response.headers.raw(), {
    connection: ['close'],
    'content-type': ['application/json'],
    'access-control-allow-origin': ['*'],
    'access-control-allow-credentials': ['true']
  })

  assert.match(body, {
    url: 'https://mockbin.org/request',
    queryString: {},
    headers: {
      accept: '*/*',
      host: 'ockbin.org'
    }
  })
})

test('POST plain', async assert => {
  assert.plan(1)

  const response = await api.httpPost({ body: 'foo' })

  const body = await response.json()

  assert.match(body, { postData: { text: 'foo' } })
})

test('POST json', async assert => {
  assert.plan(1)

  const response = await api.httpPost({
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ foo: 'bar' })
  })

  const body = await response.json()

  assert.match(body, { postData: { text: '{"foo":"bar"}' } })
})
