const express = require('express');
const mongoose = require('mongoose');
const { Queue } = require('bullmq');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const { Client } = require('@elastic/elasticsearch');

const app = express();
app.use(express.json());

// Configure Multer for temporary file storage
const upload = multer({ dest: 'uploads/' });

const PORT = process.env.PORT || 4100;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/course';
const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Elasticsearch configuration for indexing courses
const ES_NODE = process.env.ES_NODE || 'http://elasticsearch:9200';
const esClient = new Client({ node: ES_NODE });

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect to MongoDB dynamically
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Course Service connected to MongoDB'))
  .catch(err => console.error(err));

// Initialize BullMQ queue for video processing
const VIDEO_QUEUE = new Queue('videoProcessing', { 
  connection: { host: REDIS_HOST, port: REDIS_PORT } 
});

// Define Course Schema and Model (including demoVideoUrl, lectures, and ratings)
const CourseSchema = new mongoose.Schema({
  title: String,
  description: String,
  teacherId: String,
  videoUrl: String,       // Full course video (for enrolled students)
  demoVideoUrl: String,   // Demo/preview video available to all users
  lectures: [{
    title: String,
    videoUrl: String,
    thumbnail: String,
  }],
  resources: [String],
  thumbnail: String,
  shortDescription: String,
  ratings: [{
    studentId: String,
    rating: Number
  }],
  averageRating: { type: Number, default: 0 }
});
const Course = mongoose.model('Course', CourseSchema);

// Define Enrollment Schema and Model
const EnrollmentSchema = new mongoose.Schema({
  studentId: String,
  courseId: String,
  enrolledAt: { type: Date, default: Date.now }
});
const Enrollment = mongoose.model('Enrollment', EnrollmentSchema);

// Endpoint: Upload video to Cloudinary (for full and demo videos)
app.post('/courses/upload', upload.single('video'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'video',
      folder: 'courses'
    });
    res.json({ videoUrl: result.secure_url });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ error: 'Video upload failed' });
  }
});

// Endpoint: Rate a Course (only if student is enrolled)
app.post('/courses/:courseId/rate', async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
    }
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const studentId = decoded.id;
    const courseId = req.params.courseId;
  
    // Check enrollment: student must be enrolled to rate
    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
      return res.status(403).json({ error: 'You must purchase the course to rate it' });
    }
  
    // Find course and update rating (if already rated, update; else add new)
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
  
    const existingRatingIndex = course.ratings.findIndex(r => r.studentId === studentId);
    if (existingRatingIndex !== -1) {
      // Update the existing rating
      course.ratings[existingRatingIndex].rating = rating;
    } else {
      // Add new rating
      course.ratings.push({ studentId, rating });
    }
  
    // Recalculate average rating
    const totalRatings = course.ratings.reduce((sum, r) => sum + r.rating, 0);
    course.averageRating = totalRatings / course.ratings.length;
  
    await course.save();
    res.json({ message: 'Rating submitted successfully', averageRating: course.averageRating, ratings: course.ratings });
  } catch (error) {
    console.error('Error rating course:', error);
    res.status(500).json({ error: 'Error rating course' });
  }
});

// Create a Course Endpoint with Elasticsearch indexing
app.post('/courses', async (req, res) => {
  try {
    const { title, description, teacherId, videoUrl, demoVideoUrl, thumbnail, shortDescription, lectures, resources } = req.body;
    const course = await Course.create({ title, description, teacherId, videoUrl, demoVideoUrl, thumbnail, shortDescription, lectures, resources });
    
    // Enqueue video processing if full video URL exists
    if (videoUrl) {
      await VIDEO_QUEUE.add('processVideo', { courseId: course._id, videoUrl });
    }
    
    // Index the newly created course in Elasticsearch
    try {
      await esClient.index({
        index: 'courses',
        id: course._id.toString(),
        body: {
          title: course.title,
          description: course.description,
          shortDescription: course.shortDescription,
          teacherId: course.teacherId,
          courseId: course._id,
          // Add additional fields as needed
        }
      });
      // Refresh the index so that the document is searchable immediately
      await esClient.indices.refresh({ index: 'courses' });
      console.log('Course indexed in Elasticsearch');
    } catch (indexError) {
      console.error('Error indexing course in Elasticsearch:', indexError);
    }
    
    res.status(201).json({ message: 'Course created and video queued', course });
  } catch (error) {
    console.error('Course creation error:', error);
    res.status(500).json({ error: 'Course creation error' });
  }
});

// Endpoint: Enroll a student in a course
app.post('/courses/:courseId/enroll', async (req, res) => {
  try {
    const { studentId } = req.body;
    const courseId = req.params.courseId;
    const existing = await Enrollment.findOne({ studentId, courseId });
    if (existing) {
      return res.status(400).json({ message: 'Student already enrolled' });
    }
    const enrollment = await Enrollment.create({ studentId, courseId });
    res.status(201).json({ message: 'Enrollment successful', enrollment });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: 'Enrollment failed' });
  }
});

// GET /courses Endpoint: Return all courses or filter by teacherId if provided
app.get('/courses', async (req, res) => {
  try {
    const { teacherId } = req.query;
    let courses;
    if (teacherId) {
      courses = await Course.find({ teacherId });
    } else {
      courses = await Course.find();
    }
    res.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Error fetching courses' });
  }
});

// Get Single Course Details with Enrollment Check
app.get('/courses/:courseId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    let access = 'demo';
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const enrollment = await Enrollment.findOne({ studentId: decoded.id, courseId: course._id });
        if (enrollment) {
          access = 'full';
        }
      } catch (err) {
        console.error('JWT verification error:', err);
      }
    }

    if (access === 'full') {
      return res.json({ ...course.toObject(), access });
    } else {
      return res.json({
        title: course.title,
        description: course.description,
        demoVideoUrl: course.demoVideoUrl,
        shortDescription: course.shortDescription,
        resources: course.resources,
        access
      });
    }
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ error: 'Error fetching course details' });
  }
});

app.listen(PORT, () => console.log(`Course Service running on port ${PORT}`));
