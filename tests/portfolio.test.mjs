import test from 'node:test'
import assert from 'node:assert/strict'
import { safeUrl, safeImage, normalizePortfolio, blankPortfolio, PALETTES } from '../src/lib/portfolio.ts'

test('only safe protocols become public links', () => {
  assert.equal(safeUrl('javascript:alert(1)'), undefined)
  assert.equal(safeUrl('data:text/html,<script>'), undefined)
  assert.equal(safeUrl('https://example.com').startsWith('https://'), true)
  assert.equal(safeUrl('example.com'), 'https://example.com/')
  assert.equal(safeUrl('mailto:person@example.com'), 'mailto:person@example.com')
})

test('image URLs are restricted to internal immutable keys', () => {
  const id = 'abcdef0123456789'
  assert.equal(safeImage('/img/' + id), '/img/' + id)
  assert.equal(safeImage('/img/../../secret'), '')
  assert.equal(safeImage('https://evil.example/picture.png'), '')
  assert.equal(safeImage('/img/not-valid'), '')
})

test('untrusted portfolio content is normalised before persistence', () => {
  const p = normalizePortfolio({
    name: 'N'.repeat(200),
    photo: 'javascript:alert(1)',
    projects: [{ title: 'Demo', image: 'https://evil.example/image.svg' }],
    theme: { palette: 'unlisted' },
    skills: Array.from({length: 100}, (_, i) => 'skill' + i),
  })
  assert.equal(p.name.length, 80)
  assert.equal(p.photo, '')
  assert.equal(p.projects[0].image, '')
  assert.equal(p.skills.length, 40)
  assert.equal(p.theme.palette, 'ink')
})

test('fresh portfolios are structurally valid', () => {
  const p = normalizePortfolio(blankPortfolio())
  assert.equal(typeof p.name, 'string')
  assert.equal(p.projects.length, 1)
  assert.equal(Object.keys(PALETTES).length, 5)
})
