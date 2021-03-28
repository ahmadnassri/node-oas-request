const { test } = require('tap')
const { sep } = require('path')

const OASRequestError = require('../lib/error')

const regex = /error\.js:\d{2}:\d{2}/

test('Empty ExtendableError', assert => {
  assert.plan(5)

  const err = new OASRequestError('foobar')

  assert.type(err, OASRequestError)

  assert.equal(err.name, 'OASRequestError')
  assert.match(err.message, 'foobar')
  assert.match(err.stack, regex)
  assert.equal(err.toString(), 'OASRequestError: foobar')
})
