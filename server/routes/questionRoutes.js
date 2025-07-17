import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = express.Router();

// Fetch all categories
router.get('/categories', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    const result = await pool.query('SELECT category_id, category_name FROM category WHERE created_at IS NOT NULL');
    res.json(result.rows);
  } catch (err) {
    console.error('Categories fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create a question
router.post('/questions/create', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    if (decoded.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can create questions' });
    }
    const { question_text, category_id, institution_id, difficulty_level, is_public, options } = req.body;
    if (!question_text || !category_id || !institution_id || !difficulty_level || !options || options.length !== 4) {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }
    if (difficulty_level < 1 || difficulty_level > 10) {
      return res.status(400).json({ error: 'Difficulty level must be between 1 and 10' });
    }
    if (options.some(opt => !opt.option_text)) {
      return res.status(400).json({ error: 'All options must have text' });
    }
    if (!options.some(opt => opt.is_correct)) {
      return res.status(400).json({ error: 'One option must be marked as correct' });
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const questionResult = await client.query(
        'INSERT INTO question (user_id, category_id, institution_id, question_text, difficulty_level, is_public, is_approved) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [decoded.user_id, category_id, institution_id, question_text, difficulty_level, is_public, false]
      );
      const question = questionResult.rows[0];
      const optionPromises = options.map(option =>
        client.query(
          'INSERT INTO question_option (question_id, option_text, is_correct, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
          [question.question_id, option.option_text, option.is_correct, option.display_order]
        )
      );
      const optionResults = await Promise.all(optionPromises);
      await client.query('COMMIT');
      res.json({
        question: {
          ...question,
          options: optionResults.map(result => result.rows[0]),
        },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Question creation error:', err);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

export default router;