const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { initCron } = require('./cron');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error('ERROR: MONGO_URI is not defined in environment variables!');
    process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

// Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Warehouse Routing API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Initialize cron jobs
  initCron();
});
