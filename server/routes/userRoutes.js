// server/routes/userRoutes.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO users (username, password, role, created_at) 
       VALUES ($1, $2, $3, NOW()) RETURNING user_id`,
      [username, password, role]
    );
    res.json({ message: "User registered", user_id: result.rows[0].user_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
