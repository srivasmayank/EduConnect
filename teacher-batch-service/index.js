const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 4800;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/teacher_batches';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Teacher Batch Service connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const BatchSchema = new mongoose.Schema({
  courseTitle: String,
  batchTitle: String,
  scheduledDate: String,
  scheduledTime: String,
  capacity: Number,
  description: String,
  teacherId: String,
  createdAt: { type: Date, default: Date.now }
});
const Batch = mongoose.model('Batch', BatchSchema);

app.get('/teacher/batches', async (req, res) => {
  try {
    const teacherId = req.query.teacherId;
    const batches = teacherId ? await Batch.find({ teacherId }) : await Batch.find();
    res.json({ batches });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching batches' });
  }
});

app.post('/teacher/batches', async (req, res) => {
  try {
    const batch = await Batch.create(req.body);
    res.status(201).json({ message: 'Batch created successfully', batch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating batch' });
  }
});

app.put('/teacher/batches/:id', async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    res.json({ message: 'Batch updated successfully', batch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating batch' });
  }
});

app.delete('/teacher/batches/:id', async (req, res) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting batch' });
  }
});

app.listen(PORT, () => console.log(`Teacher Batch Service running on port ${PORT}`));
