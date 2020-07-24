const { test } = require('tap')

const spec = require('./fixtures/petstore.json')
const client = require('../lib')

test('throws if no spec', assert => {
  assert.plan(1)

  assert.throws(() => client(), new Error('missing argument: oas'))
})

test('throws if no server', assert => {
  assert.plan(1)

  const API = client(spec)
  assert.throws(() => new API(), new Error('missing argument: server'))
})
