import express from 'express';
import bcrypt from 'bcrypt';          // 👉 new dependency
import pool from '../db.js';

const router = express.Router();

// POST /api/users  → Create a new user
router.post('/', async (req, res) => {
  try {
    const {
      username,
      password,
      email,
      first_name,
      last_name,
      role = 'student',        // default role
    } = req.body;

    // Simple validation
    if (!username || !password || !email)
      return res.status(400).json({ error: 'Required fields missing' });

    // Hash password (10 salt rounds)
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
       (username, password, email, first_name, last_name, role, created_at)
       VALUES ($1,$2,$3,$4,$5,$6, NOW())
       RETURNING user_id, username, role`,
      [username, hashed, email, first_name, last_name, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create‑user error:', err);
    if (err.code === '23505') {
      // unique_violation
      return res.status(409).json({ error: 'Username or e‑mail already taken' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
