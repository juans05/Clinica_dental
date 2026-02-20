const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dental System API is running' });
});

// Future routes will be added here
// app.use('/api/v1', routes);

module.exports = app;
