
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import authenticateToken from './authMiddleware.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('User logged in:', {
      user_id: user.user_id,
      username: user.username,
      role: user.role
    });

    res.json({
      user_id: user.user_id,
      username: user.username,
      role: user.role,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  const { username, email, password, first_name, last_name, role } = req.body;
  try {
    if (!username || !email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Email or username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password, first_name, last_name, role, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [username, email, hashedPassword, first_name, last_name, role]
    );
    const token = jwt.sign(
      { user_id: result.rows[0].user_id, username: result.rows[0].username, role: result.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(201).json({
      user_id: result.rows[0].user_id,
      username: result.rows[0].username,
      role: result.rows[0].role,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const userResult = await pool.query(
      'SELECT user_id, username, first_name, last_name, email, role, created_at, last_login, updated_at FROM users WHERE user_id = $1',
      [userId]
    );
    const user = userResult.rows[0];
    if (!user) {
      console.log('Profile: User not found for user_id:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const quizAttemptResult = await pool.query(
      `SELECT qa.attempt_id, q.quiz_title, qa.start_time, qa.score
       FROM quiz_attempt qa
       JOIN quiz q ON qa.quiz_id = q.quiz_id
       WHERE qa.user_id = $1 AND qa.is_completed = TRUE
       ORDER BY qa.end_time DESC
       LIMIT 10`,
      [userId]
    );
    const examHistory = quizAttemptResult.rows.map((row) => ({
      subject: row.quiz_title,
      date: row.start_time.toISOString().split('T')[0],
      score: row.score ? `${row.score}/100` : 'N/A',
    }));

    const playlistResult = await pool.query(
      `SELECT p.playlist_id, p.playlist_name
       FROM playlist p
       JOIN user_music_setting ums ON p.playlist_id = ums.default_playlist_id
       WHERE p.user_id = $1 AND ums.user_id = $1`,
      [userId]
    );
    let preferredMusic = [];
    if (playlistResult.rows.length > 0) {
      const playlistId = playlistResult.rows[0].playlist_id;
      const musicResult = await pool.query(
        `SELECT bm.title, bm.artist
         FROM playlist_music pm
         JOIN background_music bm ON pm.music_id = bm.music_id
         WHERE pm.playlist_id = $1
         ORDER BY pm.track_order`,
        [playlistId]
      );
      preferredMusic = musicResult.rows.map((row) => ({
        song: row.title,
        artist: row.artist,
      }));
    }

    console.log('Profile: Response data:', { user, examHistory, preferredMusic });
    res.json({
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        created_at: user.created_at,
        last_login: user.last_login,
        updated_at: user.updated_at,
      },
      examHistory,
      preferredMusic,
    });
  } catch (err) {
    console.error('Profile error:', err.stack);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
});

router.get('/users/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const result = await pool.query(
      'SELECT user_id, username, email, role FROM users WHERE user_id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err.message, err.stack);
    res.status(401).json({ error: 'Invalid token', details: err.message });
  }
});

export default router;
