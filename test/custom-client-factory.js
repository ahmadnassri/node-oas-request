const { test } = require('tap')

const spec = require('./fixtures/httpbin.json')
const OASRequest = require('../lib')(spec)

const fetch = require('isomorphic-unfetch')

const { Response } = require('node-fetch')

const api = new OASRequest({
  server: 'https://httpbin.org:443',

  clientFactory: function (url, options, spec) {
    const { operation: { operationId } } = spec

    if (operationId === 'httpGet') {
      return () => new Response(JSON.stringify({ mock: 'httpGet' }), { status: 599 })
    }

    return fetch
  }
})

test('GET /', async assert => {
  assert.plan(2)

  const response = await api.httpGet()

  const body = await response.json()

  assert.equal(response.status, 599)

  assert.match(body, {
    mock: 'httpGet'
  })
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

  assert.match(body, { data: '{"foo":"bar"}', json: { foo: 'bar' } })
})
