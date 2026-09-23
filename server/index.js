require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const userBookRoutes = require('./routes/userBooks');
const recommendationRoutes = require('./routes/recommendations');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/user-books', userBookRoutes);
app.use('/api/recommendations', recommendationRoutes);

app.use(express.static(path.join(__dirname, '..', 'public')));

// Any unknown non-API route falls back to the landing page
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AVEN is running at http://localhost:${PORT}`);
});
