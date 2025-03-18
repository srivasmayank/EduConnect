const express = require('express');
const { Worker, Queue } = require('bullmq');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4500;
const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const VIDEO_QUEUE_NAME = 'videoProcessing';

const videoQueue = new Queue(VIDEO_QUEUE_NAME, { 
  connection: { host: REDIS_HOST, port: REDIS_PORT } 
});

// Worker to process video transcoding jobs
const videoWorker = new Worker(VIDEO_QUEUE_NAME, async job => {
  console.log(`Processing video for courseId: ${job.data.courseId}`);
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log(`Video processing completed for courseId: ${job.data.courseId}`);
  return { processed: true };
}, { connection: { host: REDIS_HOST, port: REDIS_PORT } });

// Endpoint to check job status
app.get('/jobs/:jobId', async (req, res) => {
  try {
    const job = await videoQueue.getJob(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const state = await job.getState();
    res.json({ id: job.id, state, data: job.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching job status' });
  }
});

// Health check endpoint
app.get('/', (req, res) => res.send('Video Service Running'));

app.listen(PORT, () => console.log(`Video Service running on port ${PORT}`));
