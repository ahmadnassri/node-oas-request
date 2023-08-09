const { test } = require('tap')

const spec = require('./fixtures/mockbin.json')
const OASRequest = require('../lib')(spec)

const fetch = require('isomorphic-unfetch')
const axios = require('axios')

const JSONRequest = new OASRequest({
  client: async function (url, options) {
    const response = await fetch(url, {
      ...options,

      body: JSON.stringify(options.body),

      headers: {
        ...options.headers,
        ...{
          accept: 'application/json',
          'content-type': 'application/json'
        }
      }
    })

    response.data = await response.json()

    return response
  }
})

const axiosRequest = new OASRequest({
  client: async function (URL, options) {
    return axios({
      ...options,
      url: URL.toString()
    })
  }
})

test('JSONRequest', async assert => {
  assert.plan(1)

  const response = await JSONRequest.httpPost({
    body: { foo: 'bar' }
  })

  assert.match(response.data, { postData: { text: '{"foo":"bar"}' } })
})

test('axiosRequest', async assert => {
  assert.plan(1)

  const response = await axiosRequest.httpPost({
    data: { foo: 'bar' }
  })

  assert.match(response.data, { postData: { text: '{"foo":"bar"}' } })
})
