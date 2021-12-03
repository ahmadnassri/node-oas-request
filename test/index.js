const { test } = require('tap')
const sinon = require('sinon')

// create stub
const fetch = sinon.stub()

delete require.cache[require.resolve('isomorphic-unfetch')]

// override required module
require.cache[require.resolve('isomorphic-unfetch')] = { exports: fetch }

const oasRequest = require('..')
const spec = require('./fixtures/petstore.json')
const OASRequestError = require('../lib/error')

test('throws if no spec', assert => {
  assert.plan(2)

  assert.throws(() => oasRequest(), new OASRequestError('missing argument: spec'))
  assert.throws(() => oasRequest({}), new OASRequestError('missing argument: spec'))
})

test('throws if no server', assert => {
  assert.plan(1)

  const API = oasRequest({
    paths: {}
  })
  assert.throws(() => new API(), new OASRequestError('missing argument: server'))
})

test('generates methods', assert => {
  assert.plan(3)

  const API = oasRequest(spec)
  const api = new API({ server: 'https://pets.com' })

  assert.type(api.listPets, Function)
  assert.type(api.createPets, Function)
  assert.type(api.showPetById, Function)
})

test('methods are callable', assert => {
  assert.plan(2)

  fetch.callsFake((url, options) => {
    assert.match(url, new URL('http://pets.com/pets/%7BpetId%7D'))
    assert.same(options, {
      method: 'get',
      headers: {}
    })
  })

  const API = oasRequest(spec)
  const api = new API({ server: 'https://pets.com' })

  api.showPetById()
})

test('methods options', assert => {
  assert.plan(2)

  fetch.callsFake((url, options) => {
    assert.match(url, new URL('https://pets.com/pets/1'))
    assert.same(options, {
      method: 'get',
      headers: {}
    })
  })

  const API = oasRequest(spec)
  const api = new API({ server: 'https://pets.com' })

  api.showPetById({
    params: {
      petId: 1
    }
  })
})

test('global defaults', assert => {
  assert.plan(2)

  fetch.callsFake((url, options) => {
    assert.match(url, new URL('https://pets.com/pets/1?name=ruby&is_good=yes'))
    assert.same(options, {
      method: 'get',
      headers: { 'x-pet-type': 'dog' }
    })
  })

  const API = oasRequest(spec)

  const api = new API({
    server: 'https://pets.com',
    headers: { 'x-pet-type': 'dog' },
    params: { petId: 1 },
    query: { name: 'ruby' }
  })

  api.showPetById({
    query: { is_good: 'yes' }
  })
})
