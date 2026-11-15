import test from 'node:test'
import assert from 'node:assert/strict'
import { classifyEditIntent, hashesMatch, isPortfolioId } from '../src/server/portfolio-auth.ts'

test('only completely missing credentials create a portfolio', () => {
  assert.deepEqual(classifyEditIntent(undefined, undefined), { kind: 'create' })
  assert.deepEqual(classifyEditIntent(null, null), { kind: 'create' })
  assert.equal(classifyEditIntent('abcdef123456', undefined).kind, 'invalid')
  assert.equal(classifyEditIntent(undefined, 'token').kind, 'invalid')
  assert.equal(classifyEditIntent('', '').kind, 'invalid')
})

test('updates need a valid portfolio ID and nonempty token', () => {
  assert.equal(isPortfolioId('abcdef123456'), true)
  assert.equal(isPortfolioId('../../secret'), false)
  assert.equal(classifyEditIntent('abcdef123456', 'token').kind, 'update')
  assert.equal(classifyEditIntent('abcdef123456', '').kind, 'invalid')
  assert.equal(classifyEditIntent('../bad', 'token').kind, 'invalid')
  assert.equal(classifyEditIntent('abcdef123456', 'x'.repeat(257)).kind, 'invalid')
})

test('hashed edit credentials compare without exposing raw tokens', () => {
  assert.equal(hashesMatch('abcdef', 'abcdef'), true)
  assert.equal(hashesMatch('abcdef', 'abcxef'), false)
  assert.equal(hashesMatch('abcdef', 'abc'), false)
})
