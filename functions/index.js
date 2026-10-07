const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const { logger } = require('firebase-functions')
const { defineSecret } = require('firebase-functions/params')
const { onSchedule } = require('firebase-functions/v2/scheduler')
const { collectNews, persistNews } = require('./news')

initializeApp()

const newsApiKey = defineSecret('NEWS_API_KEY')
const newsDataApiKey = defineSecret('NEWSDATA_API_KEY')

exports.syncVaccinationNews = onSchedule(
  {
    schedule: 'every 6 hours',
    timeZone: 'America/Sao_Paulo',
    region: 'southamerica-east1',
    timeoutSeconds: 300,
    memory: '256MiB',
    maxInstances: 1,
    secrets: [newsApiKey, newsDataApiKey],
  },
  async () => {
    const report = await collectNews({
      newsApiKey: newsApiKey.value(),
      newsDataApiKey: newsDataApiKey.value(),
    })
    const persistence = await persistNews(getFirestore(), report.articles)
    logger.info('Sincronização editorial concluída.', {
      ...report.metrics,
      ...persistence,
    })
  },
)
