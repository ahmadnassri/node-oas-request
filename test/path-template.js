const template = require('../lib/path-template')
const { test } = require('tap')

test('path templates', assert => {
  assert.plan(2)

  assert.equal(template('/pets/{petId}', { petId: 'foo' }), '/pets/foo')
  assert.equal(template('/{entity}/{id}', { entity: 'pet', id: '123' }), '/pet/123')
})
