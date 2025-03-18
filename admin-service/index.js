const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4700;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/admin';

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Admin Service connected to MongoDB'))
  .catch(err => console.error(err));

// Define a simple User schema for admin management
const AdminUserSchema = new mongoose.Schema({
  email: String,
  role: { type: String, enum: ['admin', 'teacher', 'student'] },
  status: { type: String, enum: ['pending', 'approved', 'banned'], default: 'pending' }
});
const AdminUser = mongoose.model('AdminUser', AdminUserSchema);

// Define a Transaction schema for admin oversight
const TransactionSchema = new mongoose.Schema({
  userId: String,
  courseId: String,
  amount: Number,
  date: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', TransactionSchema);

// GET pending users
app.get('/pending-users', async (req, res) => {
  try {
    const pendingUsers = await AdminUser.find({ status: 'pending' });
    res.json({ pendingUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching pending users' });
  }
});

// GET all users
app.get('/users', async (req, res) => {
  try {
    const users = await AdminUser.find();
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// PUT update user status
app.put('/users/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const user = await AdminUser.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ message: 'User status updated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating user' });
  }
});

// GET transactions
app.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching transactions' });
  }
});

// POST create transaction (for testing)
app.post('/transactions', async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating transaction' });
  }
});

// New Endpoint: GET /metrics - aggregates admin metrics
app.get('/metrics', async (req, res) => {
  try {
    const totalUsers = await AdminUser.countDocuments();
    const pendingUsers = await AdminUser.countDocuments({ status: 'pending' });
    const totalTransactions = await Transaction.countDocuments();
    const totalRevenueAgg = await Transaction.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
    ]);
    const totalRevenue = totalRevenueAgg[0] ? totalRevenueAgg[0].totalRevenue : 0;
    res.json({ totalUsers, pendingUsers, totalTransactions, totalRevenue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching metrics' });
  }
});

app.listen(PORT, () => console.log(`Admin Service running on port ${PORT}`));
