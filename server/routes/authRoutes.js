import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query to find user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify password (plain text comparison)
    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret', // Use environment variable for secret
      { expiresIn: '1h' }
    );

    // Log user data for debugging
    console.log('User logged in:', {
      user_id: user.user_id,
      username: user.username,
      role: user.role
    });

    // Send JSON response with user data and token
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

export default router;