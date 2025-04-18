const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const redis = require('redis');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/auth';
const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Auth Service connected to MongoDB'))
  .catch(err => console.error(err));

// Setup Redis client
const redisClient = redis.createClient({ socket: { host: REDIS_HOST, port: REDIS_PORT } });
redisClient.connect().then(() => console.log('Auth Service connected to Redis'));

// Define User Schema and Model
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
  name: String,
  bio: String
});
const User = mongoose.model('User', UserSchema);

// Signup Endpoint
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, role, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, role, name });
    res.status(201).json({ message: 'User created', userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Signup error' });
  }
});

// Login Endpoint
// Login Endpoint
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '2d' });
    await redisClient.setEx(`session:${user._id}`, 172800, token);
    res.json({ token, role: user.role, userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login error' });
  }
});


// Profile Endpoint
app.get('/auth/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
