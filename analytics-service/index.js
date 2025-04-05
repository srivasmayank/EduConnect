const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 4600;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/analytics';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Analytics Service connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const EngagementSchema = new mongoose.Schema({
  userId: String,
  courseId: String,
  duration: Number,
  date: { type: Date, default: Date.now }
});
const Engagement = mongoose.model('Engagement', EngagementSchema);

const RevenueSchema = new mongoose.Schema({
  courseId: String,
  amount: Number,
  date: { type: Date, default: Date.now }
});
const Revenue = mongoose.model('Revenue', RevenueSchema);

app.get('/report/engagement', async (req, res) => {
  try {
    const report = await Engagement.aggregate([
      {
        $group: {
          _id: null,
          totalDuration: { $sum: "$duration" },
          engagementCount: { $sum: 1 },
          avgDuration: { $avg: "$duration" }
        }
      }
    ]);
    res.json(report[0] || { totalDuration: 0, engagementCount: 0, avgDuration: 0 });
  } catch (err) {
    console.error('Engagement aggregation error:', err);
    res.status(500).json({ error: 'Error generating engagement report' });
  }
});

app.get('/report/revenue', async (req, res) => {
  try {
    const report = await Revenue.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          revenueCount: { $sum: 1 },
          avgRevenue: { $avg: "$amount" }
        }
      }
    ]);
    res.json(report[0] || { totalRevenue: 0, revenueCount: 0, avgRevenue: 0 });
  } catch (err) {
    console.error('Revenue aggregation error:', err);
    res.status(500).json({ error: 'Error generating revenue report' });
  }
});

app.post('/engagement', async (req, res) => {
  try {
    const engagement = new Engagement(req.body);
    await engagement.save();
    res.status(201).json(engagement);
  } catch (err) {
    console.error('Error saving engagement data:', err);
    res.status(500).json({ error: 'Error saving engagement data' });
  }
});

app.post('/revenue', async (req, res) => {
  try {
    const revenue = new Revenue(req.body);
    await revenue.save();
    res.status(201).json(revenue);
  } catch (err) {
    console.error('Error saving revenue data:', err);
    res.status(500).json({ error: 'Error saving revenue data' });
  }
});

app.listen(PORT, () => console.log(`Analytics Service running on port ${PORT}`));
