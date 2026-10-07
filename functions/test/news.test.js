const assert = require('node:assert/strict')
const test = require('node:test')
const {
  isRelevant,
  normalizeArticle,
  normalizeUrl,
  trustedSource,
} = require('../news')

test('accepts an allowed HTTPS source without accepting lookalike domains', () => {
  assert.equal(
    trustedSource('https://www.gov.br/saude/pt-br/noticias/vacina').name,
    'Ministério da Saúde',
  )
  assert.equal(trustedSource('https://gov.br.evil.test/saude/vacina'), null)
  assert.equal(trustedSource('http://www.gov.br/saude/vacina'), null)
})

test('normalizes tracking URLs to one stable address', () => {
  assert.equal(
    normalizeUrl('https://g1.globo.com/saude/vacina/?utm_source=x&fbclid=y'),
    'https://g1.globo.com/saude/vacina',
  )
})

test('keeps vaccination headlines and rejects incidental health stories', () => {
  assert.equal(
    isRelevant({ title: 'Nova vacina contra HPV', description: '' }),
    true,
  )
  assert.equal(
    isRelevant({
      title: 'Mercado financeiro tem nova alta',
      description: 'A reportagem menciona vacina no fim.',
    }),
    false,
  )
})

test('rejects articles outside the 30-day window', () => {
  const now = new Date('2026-10-06T12:00:00Z')
  const result = normalizeArticle(
    {
      title: 'Campanha de vacinação continua',
      url: 'https://g1.globo.com/saude/vacina',
      publishedAt: '2026-08-01T12:00:00Z',
    },
    'newsapi',
    now,
  )
  assert.equal(result.reason, 'age')
})
