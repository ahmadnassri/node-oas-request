const { test } = require('tap')
const sinon = require('sinon')

// create stub
const http = sinon.stub()

// delete require cache
delete require.cache[require.resolve('../lib/http/')]

// override required module
require.cache[require.resolve('../lib/http/')] = { exports: http }

const spec = require('./fixtures/petstore.json')
const client = require('..')

test('generates methods', assert => {
  assert.plan(3)

  const API = client(spec)
  const api = new API('https://pets.com')

  assert.type(api.listPets, Function)
  assert.type(api.createPets, Function)
  assert.type(api.showPetById, Function)
})

test('methods are callable', assert => {
  assert.plan(1)

  http.callsFake(options => {
    assert.deepEqual(options, {
      protocol: 'https',
      port: '',
      host: 'pets.com',
      method: 'get',
      path: '/pets/%7BpetId%7D',
      headers: {},
      body: undefined
    })
  })

  const API = client(spec)
  const api = new API('https://pets.com')

  api.showPetById()
})

test('methods options', assert => {
  assert.plan(1)

  http.callsFake(options => {
    assert.deepEqual(options, {
      protocol: 'https',
      port: '',
      host: 'pets.com',
      method: 'get',
      path: '/pets/1',
      headers: {},
      body: undefined
    })
  })

  const API = client(spec)
  const api = new API('https://pets.com')

  api.showPetById({
    params: {
      petId: 1
    }
  })
})

test('global defaults', assert => {
  assert.plan(1)

  http.callsFake(options => {
    assert.deepEqual(options, {
      protocol: 'https',
      port: '',
      host: 'pets.com',
      method: 'get',
      path: '/pets/1?name=ruby&is_good=yes',
      headers: { 'x-pet-type': 'dog' },
      body: undefined
    })
  })

  const API = client(spec)

  const api = new API('https://pets.com', {
    headers: { 'x-pet-type': 'dog' },
    params: { petId: 1 },
    query: { name: 'ruby' }
  })

  api.showPetById({
    query: { is_good: 'yes' }
  })
})

test('sub path in server', assert => {
  assert.plan(1)

  http.callsFake(options => {
    assert.deepEqual(options, {
      protocol: 'https',
      port: '',
      host: 'pets.com',
      method: 'get',
      path: '/api/v1-0-0/pets/1?name=ruby&is_good=yes',
      headers: { 'x-pet-type': 'dog' },
      body: undefined
    })
  })

  const API = client(spec)

  const api = new API('https://pets.com/api/v1-0-0', {
    headers: { 'x-pet-type': 'dog' },
    params: { petId: 1 },
    query: { name: 'ruby' }
  })

  api.showPetById({
    query: { is_good: 'yes' }
  })
})

test('sub path in server without slashes', assert => {
  assert.plan(1)

  http.callsFake(options => {
    assert.deepEqual(options, {
      protocol: 'https',
      port: '',
      host: 'pets.com',
      method: 'get',
      path: '/api/v1-0-0/pets/1?name=ruby&is_good=yes',
      headers: { 'x-pet-type': 'dog' },
      body: undefined
    })
  })

  const API = client(spec)

  const api = new API('https://pets.com/api/v1-0-0/', {
    headers: { 'x-pet-type': 'dog' },
    params: { petId: 1 },
    query: { name: 'ruby' }
  })

  api.showPetById({
    query: { is_good: 'yes' }
  })
})
