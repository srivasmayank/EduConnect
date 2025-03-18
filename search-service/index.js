const express = require('express');
const { Client } = require('@elastic/elasticsearch');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4300;
// Ensure ES_NODE points to your Elasticsearch service. In Docker, this may be "http://elasticsearch:9200"
const ES_NODE = process.env.ES_NODE || 'http://elasticsearch:9200';
const esClient = new Client({ node: ES_NODE });

// Function to ensure the "courses" index exists
async function ensureCoursesIndex() {
  try {
    const { body: exists } = await esClient.indices.exists({ index: 'courses' });
    if (!exists) {
      console.log('Index "courses" does not exist. Creating index...');
      await esClient.indices.create({
        index: 'courses',
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0
          },
          mappings: {
            properties: {
              title: { type: 'text' },
              description: { type: 'text' },
              shortDescription: { type: 'text' },
              teacherId: { type: 'keyword' },
              courseId:  { type: 'keyword' }
              // Add additional fields as needed.
            }
          }
        }
      });
      console.log('Index "courses" created successfully.');
    } else {
      console.log('Index "courses" already exists.');
    }
  } catch (error) {
    console.error('Error ensuring courses index:', error);
    throw error;
  }
}

// Start the server after ensuring the index exists, with retry logic
async function startServer() {
  let attempts = 0;
  const maxAttempts = 5;
  while (attempts < maxAttempts) {
    try {
      await ensureCoursesIndex();
      break;
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} - Error ensuring courses index: ${error.message}`);
      if (attempts === maxAttempts) {
        console.error('Max attempts reached. Exiting.');
        process.exit(1);
      }
      // Wait 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Dynamic search endpoint
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
              fields: ['title', 'description', 'shortDescription']
            }
          }
        }
      });
      
      // Log the full response for debugging if needed
      console.log('Elasticsearch search response:', JSON.stringify(result, null, 2));
      
      // Safely extract hits
      const hits = (result?.hits?.hits) || [];
      console.log('Elasticsearch response:', hits);

      res.json({ results: hits.map(hit => hit._source) });
    } catch (err) {
      console.error('Search error:', JSON.stringify(err, null, 2));
      res.status(500).json({ error: 'Search error' });
    }
  });

  // Bind to 0.0.0.0 so that the container is accessible from other containers (like your API gateway)
  app.listen(PORT, '0.0.0.0', () => console.log(`Search Service running on port ${PORT}`));
}

startServer();
