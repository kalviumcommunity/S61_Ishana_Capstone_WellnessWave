const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to WellnessWave API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      categories: '/api/categories'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

app.listen(PORT, () => {
  console.log(`WellnessWave API server running on http://localhost:${PORT}`);
});

module.exports = app;
