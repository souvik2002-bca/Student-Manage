require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const client = require('prom-client');

// Initialize Prometheus Default Metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

// Custom Prometheus Metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code']
});

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: 'http://184.73.120.141', methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Metrics Middleware
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      code: res.statusCode
    });
    end({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      code: res.statusCode
    });
  });
  next();
});

// Static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));
app.use('/api/fees', require('./routes/feeRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date() }));

// Prometheus Metrics Endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Serve SMS Presentation
app.get('/presentation', (req, res) => {
  res.sendFile(path.join(__dirname, '../SMS_Presentation.html'));
});

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});
