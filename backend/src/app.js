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

// Routes
const routes = require('./routes');
app.use('/api', routes);

module.exports = app;
