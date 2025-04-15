const express = require('express');
const { Client } = require('@elastic/elasticsearch');

const app = express();
app.use(express.json());

const PORT    = process.env.PORT || 4300;
const ES_NODE = process.env.ES_NODE || 'http://elasticsearch:9200';
const esClient = new Client({ node: ES_NODE });

/**
 * Wait for ES cluster to be at least "yellow" before proceeding.
 * Uses the cluster.health API with a timeout.
 */
async function waitForElasticsearch(attempts = 0, maxAttempts = 10) {
  try {
    await esClient.cluster.health({
      wait_for_status: 'yellow',
      timeout: '30s'
    });
    console.log('✅ Elasticsearch cluster is ready');
  } catch (err) {
    if (attempts >= maxAttempts) {
      console.error('❌ Elasticsearch never became ready – giving up');
      throw err;
    }
    console.log(`⏳ Elasticsearch not ready yet (attempt ${attempts + 1})…`);
    await new Promise(res => setTimeout(res, 5000));
    return waitForElasticsearch(attempts + 1, maxAttempts);
  }
}

/**
 * Ensure the "courses" index exists.
 * Note: in ES client v8+, exists() returns a boolean directly,
 * so we do NOT destructure a `body` property here.
 */
async function ensureCoursesIndex() {
  const exists = await esClient.indices.exists({ index: 'courses' });
  if (exists) {
    console.log('🔎 Index "courses" already exists, skipping creation.');
    return;
  }

  console.log('🚧 Index "courses" does not exist. Creating…');
  await esClient.indices.create({
    index: 'courses',
    body: {
      settings: {
        number_of_shards:   1,
        number_of_replicas: 0
      },
      mappings: {
        properties: {
          title:            { type: 'text' },
          description:      { type: 'text' },
          shortDescription: { type: 'text' },
          teacherId:        { type: 'keyword' },
          courseId:         { type: 'keyword' }
        }
      }
    }
  });
  console.log('✅ Index "courses" created successfully.');
}

async function startServer() {
  try {
    // 1) Wait for ES to be ready
    await waitForElasticsearch();

    // 2) Ensure index exists (throws on unrecoverable errors)
    await ensureCoursesIndex();

    // 3) Now safe to bind routes & listen
    app.get('/search', async (req, res) => {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ error: 'Query parameter required' });
      }
      try {
        const result = await esClient.search({
          index: 'courses',
          body: {
            query: {
              multi_match: {
                query,
                fields: ['title','description','shortDescription']
              }
            }
          }
        });
        const hits = result.hits?.hits || [];
        res.json({ results: hits.map(h => h._source) });
      } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Search error' });
      }
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Search Service running on port ${PORT}`);
    });
  } catch (fatal) {
    console.error('Fatal startup error:', fatal);
    process.exit(1);
  }
}

startServer();
