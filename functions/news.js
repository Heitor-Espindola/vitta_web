const crypto = require('node:crypto')
const { FieldValue, Timestamp } = require('firebase-admin/firestore')

const RETENTION_DAYS = 30
const PAGE_LIMIT = 3
const REQUEST_TIMEOUT_MS = 15000
const DAY_MS = 24 * 60 * 60 * 1000

const sources = [
  ['gov.br', 'Ministério da Saúde', '/saude/', false],
  ['saude.gov.br', 'Ministério da Saúde', null, false],
  ['fiocruz.br', 'Fiocruz', null, true],
  ['butantan.gov.br', 'Instituto Butantan', null, true],
  ['who.int', 'Organização Mundial da Saúde', null, true],
  ['paho.org', 'OPAS', null, true],
  ['agenciabrasil.ebc.com.br', 'Agência Brasil', null, false],
  ['g1.globo.com', 'g1', null, false],
  ['bbc.com', 'BBC News Brasil', '/portuguese/', false],
  ['cnnbrasil.com.br', 'CNN Brasil', null, false],
  ['terra.com.br', 'Terra', null, true],
  ['em.com.br', 'Estado de Minas', null, true],
  ['osaogoncalo.com.br', 'O São Gonçalo', null, false],
  ['alagoas24horas.com.br', 'Alagoas 24 Horas', null, false],
  ['mixvale.com.br', 'Mix Vale', null, false],
]

const relevantTerms = /\b(vacina|vacinas|vacinacao|vacinacoes|vacinal|vacinais|multivacinacao|imunizacao|imunizacoes|imunizar|imunizante|imunizantes|cobertura vacinal|calendario vacinal|doses? (de|da|do) (vacina|imunizante))\b/i
const genericTerms = /\b(eleicao|eleicoes|partido|partidaria|congresso|senado|deputado|economia|mercado financeiro|guerra|conflito|celebridade|famoso|saude|doenca|hospital|bem estar|nutricao|ebola|epidemia|surto)\b/i

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isRelevant(article) {
  const title = normalizeText(article.title)
  const description = normalizeText(article.description)
  if (relevantTerms.test(title)) return true
  if (genericTerms.test(title)) return false
  return relevantTerms.test(description.slice(0, 160))
}

function trustedSource(url) {
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:') return null
  const host = parsed.hostname.toLowerCase()
  for (const [domain, name, pathPrefix, subdomains] of sources) {
    const hostMatches =
      host === domain ||
      host === `www.${domain}` ||
      (subdomains && host.endsWith(`.${domain}`))
    if (!hostMatches) continue
    if (
      pathPrefix &&
      parsed.pathname !== pathPrefix.slice(0, -1) &&
      !parsed.pathname.startsWith(pathPrefix)
    ) {
      continue
    }
    return { name, domain }
  }
  return null
}

function normalizeUrl(value) {
  const url = new URL(value)
  url.hash = ''
  for (const key of [...url.searchParams.keys()]) {
    if (
      key.toLowerCase().startsWith('utm_') ||
      ['fbclid', 'gclid', 'mc_cid', 'mc_eid'].includes(key.toLowerCase())
    ) {
      url.searchParams.delete(key)
    }
  }
  url.searchParams.sort()
  if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, '')
  return url.toString()
}

function articleIdentity(url) {
  return crypto.createHash('sha256').update(normalizeUrl(url)).digest('hex')
}

function dedupeKey(title, domain) {
  return crypto
    .createHash('sha256')
    .update(`${normalizeText(title)}|${domain}`)
    .digest('hex')
}

function normalizeArticle(raw, provider, now) {
  const title = String(raw.title || '').trim()
  const originalUrl = String(raw.url || '').trim()
  const source = trustedSource(originalUrl)
  if (!title || !source) return { reason: 'source' }
  const publishedAt = new Date(raw.publishedAt)
  const cutoff = new Date(now.getTime() - RETENTION_DAYS * DAY_MS)
  if (
    Number.isNaN(publishedAt.getTime()) ||
    publishedAt < cutoff ||
    publishedAt > new Date(now.getTime() + DAY_MS)
  ) {
    return { reason: 'age' }
  }
  const article = {
    title,
    description: String(raw.description || '').trim() || null,
    url: normalizeUrl(originalUrl),
    imageUrl: String(raw.imageUrl || '').trim() || null,
    sourceName: source.name,
    sourceDomain: source.domain,
    publishedAt,
    provider,
    providers: [provider],
    language: 'pt',
    country: 'br',
  }
  if (!isRelevant(article)) return { reason: 'relevance' }
  article.id = articleIdentity(article.url)
  article.dedupeKey = dedupeKey(article.title, article.sourceDomain)
  return { article }
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

async function fetchNewsApi(apiKey, now) {
  const query = '("vacina" OR "vacinas" OR "vacinação" OR "imunização" OR "imunizante" OR "calendário vacinal" OR "cobertura vacinal" OR "campanha de vacinação")'
  const domains = [...new Set(sources.map(([domain]) => domain))].join(',')
  const from = new Date(now.getTime() - 29 * DAY_MS)
    .toISOString()
    .slice(0, 10)
  const results = []
  for (let page = 1; page <= PAGE_LIMIT; page++) {
    const url = new URL('https://newsapi.org/v2/everything')
    url.search = new URLSearchParams({
      q: query,
      searchIn: 'title,description',
      domains,
      language: 'pt',
      sortBy: 'publishedAt',
      from,
      pageSize: '100',
      page: String(page),
    })
    const body = await fetchJson(url, { 'X-Api-Key': apiKey })
    if (body.status !== 'ok' || !Array.isArray(body.articles)) {
      throw new Error('Resposta inválida da NewsAPI')
    }
    results.push(
      ...body.articles.map((item) => ({
        title: item.title,
        description: item.description,
        url: item.url,
        imageUrl: item.urlToImage,
        publishedAt: item.publishedAt,
      })),
    )
    if (body.articles.length < 100) break
  }
  return results
}

async function fetchNewsData(apiKey) {
  const base = new URL('https://newsdata.io/api/1/latest')
  base.search = new URLSearchParams({
    apikey: apiKey,
    q: 'vacina OR vacinação OR imunização OR imunizante OR HPV OR influenza OR "febre amarela" OR BCG',
    language: 'pt',
    country: 'br',
    category: 'health',
  })
  const results = []
  let pageToken
  for (let page = 1; page <= PAGE_LIMIT; page++) {
    const url = new URL(base)
    if (pageToken) url.searchParams.set('page', pageToken)
    const body = await fetchJson(url)
    if (body.status !== 'success' || !Array.isArray(body.results)) {
      throw new Error('Resposta inválida da NewsData.io')
    }
    results.push(
      ...body.results.map((item) => ({
        title: item.title,
        description: item.description,
        url: item.link,
        imageUrl: item.image_url,
        publishedAt: item.pubDate,
      })),
    )
    pageToken = body.nextPage
    if (!pageToken) break
  }
  return results
}

async function collectNews({ newsApiKey, newsDataApiKey, now = new Date() }) {
  const providers = [
    ['newsapi', () => fetchNewsApi(newsApiKey, now)],
    ['newsdata', () => fetchNewsData(newsDataApiKey)],
  ]
  const metrics = {
    returnedByProvider: {},
    providerErrors: {},
    discardedBySource: 0,
    discardedByRelevance: 0,
    discardedByAge: 0,
    duplicates: 0,
  }
  const byIdentity = new Map()
  const byDedupe = new Map()
  for (const [provider, load] of providers) {
    try {
      const rows = await load()
      metrics.returnedByProvider[provider] = rows.length
      for (const row of rows) {
        const normalized = normalizeArticle(row, provider, now)
        if (!normalized.article) {
          metrics[`discardedBy${normalized.reason[0].toUpperCase()}${normalized.reason.slice(1)}`]++
          continue
        }
        const article = normalized.article
        const duplicateId = byDedupe.get(article.dedupeKey) || article.id
        const previous = byIdentity.get(duplicateId)
        if (previous) {
          previous.providers = [...new Set([...previous.providers, provider])].sort()
          metrics.duplicates++
          continue
        }
        byIdentity.set(duplicateId, article)
        byDedupe.set(article.dedupeKey, duplicateId)
      }
    } catch (error) {
      metrics.providerErrors[provider] = String(error.message || error)
    }
  }
  if (byIdentity.size === 0) {
    throw new Error(`Nenhuma fonte retornou notícias válidas: ${JSON.stringify(metrics.providerErrors)}`)
  }
  const articles = [...byIdentity.values()].sort(
    (first, second) => second.publishedAt - first.publishedAt,
  )
  metrics.accepted = articles.length
  return { articles, metrics }
}

async function persistNews(database, articles, now = new Date()) {
  const cutoff = new Date(now.getTime() - RETENTION_DAYS * DAY_MS)
  const collection = database.collection('news_articles')
  const existingSnapshot = await collection
    .where('publishedAt', '>=', Timestamp.fromDate(cutoff))
    .orderBy('publishedAt', 'desc')
    .limit(500)
    .get()
  const existingById = new Map()
  const idByDedupe = new Map()
  for (const document of existingSnapshot.docs) {
    const data = document.data()
    existingById.set(document.id, data)
    if (data.dedupeKey) idByDedupe.set(data.dedupeKey, document.id)
  }

  const writer = database.bulkWriter()
  for (const article of articles) {
    const targetId = idByDedupe.get(article.dedupeKey) || article.id
    const previous = existingById.get(targetId)
    const providers = [
      ...new Set([...(previous?.providers || []), ...article.providers]),
    ].sort()
    writer.set(
      collection.doc(targetId),
      {
        ...article,
        id: targetId,
        publishedAt: Timestamp.fromDate(article.publishedAt),
        fetchedAt: Timestamp.fromDate(now),
        expiresAt: Timestamp.fromDate(
          new Date(article.publishedAt.getTime() + RETENTION_DAYS * DAY_MS),
        ),
        providers,
        createdAt: previous?.createdAt || FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
  }

  const expired = await collection
    .where('publishedAt', '<', Timestamp.fromDate(cutoff))
    .limit(500)
    .get()
  for (const document of expired.docs) writer.delete(document.ref)
  await writer.close()
  return { persisted: articles.length, removedExpired: expired.size }
}

module.exports = {
  RETENTION_DAYS,
  collectNews,
  dedupeKey,
  isRelevant,
  normalizeArticle,
  normalizeText,
  normalizeUrl,
  persistNews,
  trustedSource,
}
