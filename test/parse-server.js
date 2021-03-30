const { test } = require('tap')

const parseServer = require('../lib/parse-server')
const OASRequestError = require('../lib/error')

test('throws if no server', assert => {
  assert.plan(1)

  assert.throws(() => parseServer(), new OASRequestError('missing argument: server'))
})

test('throws if no server.url', assert => {
  assert.plan(1)

  assert.throws(() => parseServer({}), new OASRequestError('missing argument: server.url'))
})

test('uses the first server in the spec if no server provided', assert => {
  assert.plan(1)

  const spec = {
    servers: [
      { url: 'foo' }
    ]
  }

  const url = parseServer(undefined, spec)

  assert.equal(url, 'foo')
})

test('throws if no server.url', assert => {
  assert.plan(1)
  const spec = {
    servers: []
  }
  assert.throws(() => parseServer(undefined, spec), new OASRequestError('missing argument: server'))
})

test('returns the server.url', assert => {
  assert.plan(1)

  const url = parseServer({ url: 'foo' }, {})

  assert.equal(url, 'foo')
})

test('returns the server if a string', assert => {
  assert.plan(1)

  const url = parseServer('foo', {})

  assert.equal(url, 'foo')
})

test('returns the server.url', assert => {
  assert.plan(1)

  const url = parseServer({ url: 'foo' }, {})

  assert.equal(url, 'foo')
})

test('populates the server.url with a defined spec.servers', assert => {
  assert.plan(1)

  const spec = {
    servers: [{
      url: 'localhost'
    }]
  }

  const url = parseServer({ url: 'foo' }, spec)

  assert.equal(url, 'foo')
})

test('populates the server.url with spec variables', assert => {
  assert.plan(1)

  const spec = {
    servers: [{
      url: 'localhost/{foo}',
      variables: { foo: { default: 'bar' } }
    }]
  }

  const url = parseServer({ url: 'localhost/{foo}' }, spec)

  assert.equal(url, 'localhost/bar')
})

test('populates the server.url with server.variables', assert => {
  assert.plan(1)

  const spec = {
    servers: [{
      url: 'localhost',
      variables: { foo: {} }
    }]
  }

  assert.equal(parseServer({ url: 'localhost/{foo}', variables: { foo: 'bar' } }, spec), 'localhost/bar')
})
