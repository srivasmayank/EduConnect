const express = require('express');
const mongoose = require('mongoose');
const { Queue } = require('bullmq');
const axios = require('axios');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4200;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/payment';
const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Payment Service connected to MongoDB'))
  .catch(err => console.error(err));

// Initialize BullMQ queue for payment processing
const PAYMENT_QUEUE = new Queue('paymentProcessing', { 
  connection: { host: REDIS_HOST, port: REDIS_PORT } 
});

// Define Payment Schema and Model
const PaymentSchema = new mongoose.Schema({
  userId: String,
  courseId: String,
  amount: Number,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
const Payment = mongoose.model('Payment', PaymentSchema);

// Payment Processing Endpoint
app.post('/payments', async (req, res) => {
  const { userId, courseId, amount } = req.body;
  try {
    const payment = await Payment.create({ userId, courseId, amount });
    await PAYMENT_QUEUE.add('generateInvoice', { paymentId: payment._id, userId, courseId, amount });
    
    // Enroll the student after payment
    try {
      await axios.post(`http://course-service:4100/courses/${courseId}/enroll`, { studentId: userId });
      console.log('Enrollment record created successfully');
    } catch (enrollError) {
      console.error("Error creating enrollment record:", enrollError);
    }
    
    // Notify teacher about purchase
    try {
      const courseResponse = await axios.get(`http://course-service:4100/courses/${courseId}`);
      const course = courseResponse.data;
      if (course && course.teacherId) {
        const message = `A student has purchased your course: ${course.title}`;
        await axios.post('http://notification-service:4400/notify', { message, teacherId: course.teacherId });
      }
    } catch (notificationError) {
      console.error("Error sending purchase notification:", notificationError);
    }
    
    res.status(201).json({ message: 'Payment processed, enrollment created, and invoice queued', payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment processing error' });
  }
});

// Get Payment History
app.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json({ payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching payments' });
  }
});

app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
