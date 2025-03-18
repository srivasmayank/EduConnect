const express = require('express');
const redis = require('redis');
const { Worker } = require('bullmq');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4400;
const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

// Setup Redis client for Pub/Sub
const pubClient = redis.createClient({ socket: { host: REDIS_HOST, port: REDIS_PORT } });
pubClient.connect().then(() => console.log('Notification Service connected to Redis Pub/Sub'));

// Setup BullMQ worker for bulk notifications
new Worker('notificationQueue', async job => {
  console.log('Processing bulk notifications for job:', job.data);
  return { sent: true };
}, { connection: { host: REDIS_HOST, port: REDIS_PORT } });

// Setup Socket.io for real-time notifications
const server = http.createServer(app);
const io = new Server(server);
io.on('connection', (socket) => {
  console.log('Client connected for notifications');
});

// Notification endpoint
app.post('/notify', async (req, res) => {
  const { message, teacherId } = req.body;
  try {
    await pubClient.publish('notifications', JSON.stringify({ message, teacherId }));
    io.emit('notification', { message, teacherId });
    res.json({ message: 'Notification sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error sending notification' });
  }
});

// Health check endpoint
app.get('/', (req, res) => res.send('Notification Service Running'));

server.listen(PORT, () => console.log(`Notification Service running on port ${PORT}`));
