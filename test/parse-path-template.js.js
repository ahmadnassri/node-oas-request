const { test } = require('tap')

const parsePathTemplate = require('../lib/parse-path-template')

test('parse path templates', assert => {
  assert.plan(4)

  assert.equal(parsePathTemplate('/pets/{petId}'), '/pets/{petId}', 'keep variable template if no variables present')
  assert.equal(parsePathTemplate('/pets/{petId}', { petId: 'foo' }), '/pets/foo', 'replaces one value')
  assert.equal(parsePathTemplate('/{entity}/{id}', { entity: 'pet', id: '123' }), '/pet/123', 'replaces all the value')
  assert.equal(parsePathTemplate('/{entity}/{id}/{id}', { entity: 'pet', id: '123' }), '/pet/123/123', 'replaces the same value multiple times')
})

test('parse path templates with defaults', assert => {
  assert.plan(3)

  assert.equal(parsePathTemplate('/pets/{petId}', { petId: 'foo' }, { petId: 'bar' }), '/pets/foo', 'replaces one value')
  assert.equal(parsePathTemplate('/{entity}/{id}', {}, { entity: 'pet', id: '123' }), '/pet/123', 'replaces all the value')
  assert.equal(parsePathTemplate('/{entity}/{id}/{id}', {}, { entity: 'pet', id: '123' }), '/pet/123/123', 'replaces the same value multiple times')
})
