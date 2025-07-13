import express from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Store in .env

// // Register endpoint
// router.post('/register', async (req, res) => {
//   const { username, first_name, last_name, email, password, role } = req.body;

//   if (!username || !first_name || !last_name || !email || !password || !role) {
//     return res.status(400).json({ error: 'Missing fields' });
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const result = await pool.query(
//       `INSERT INTO users (username, first_name, last_name, email, password, role)
//        VALUES ($1, $2, $3, $4, $5, $6)
//        RETURNING user_id, username, first_name, last_name, email, role, created_at, last_login, updated_at`,
//       [username, first_name, last_name, email, hashedPassword, role]
//     );
//     res.json({ message: 'User registered', user: result.rows[0] });
//   } catch (err) {
//     console.error('Registration error:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    console.log('Querying user with email:', email);
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('Query result:', result.rows);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Updating last login for user_id:', user.user_id);
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1', [user.user_id]);
    console.log('Last login updated');

    console.log('Generating JWT...');
    const token = jwt.sign({ user_id: user.user_id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        last_login: user.last_login,
        updated_at: user.updated_at,
      },
    });
  } catch (err) {
    console.error('Login error:', err.stack); // Log full stack trace
    res.status(500).json({ error: 'Server error' });
  }
});

// Profile endpoint
router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.user_id;

    const userResult = await pool.query(
      'SELECT user_id, username, first_name, last_name, email, role, created_at, last_login, updated_at FROM users WHERE user_id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    if (!user) {
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
    console.error('Profile error:', err);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
});

export default router;