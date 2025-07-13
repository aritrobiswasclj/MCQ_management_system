import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import quizRoutes from './routes/quizRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', quizRoutes);

// Test database connection route
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ time: result.rows[0].now });
  } catch (err) {
    console.error('DB test error:', err.stack);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.get('/', (req, res) => {
  res.send('Backend running — API only.');
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});