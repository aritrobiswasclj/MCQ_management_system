import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = express.Router();

// Fetch active institutions
router.get('/institutions', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    const result = await pool.query('SELECT institution_id, institution_name FROM institution WHERE is_active = TRUE');
    res.json(result.rows);
  } catch (err) {
    console.error('Institutions fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch institutions' });
  }
});

// Create a quiz
router.post('/quizzes/create', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    if (decoded.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can create quizzes' });
    }
    const { quiz_title, description, time_limit, pass_percentage, is_public, question_ids } = req.body;
    if (!quiz_title || !question_ids || question_ids.length === 0) {
      return res.status(400).json({ error: 'Quiz title and at least one question are required' });
    }
    if (time_limit && time_limit <= 0) {
      return res.status(400).json({ error: 'Time limit must be positive' });
    }
    if (pass_percentage < 0 || pass_percentage > 100) {
      return res.status(400).json({ error: 'Pass percentage must be between 0 and 100' });
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const quizResult = await client.query(
        'INSERT INTO quiz (user_id, institution_id, quiz_title, description, time_limit, pass_percentage, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [decoded.user_id, req.body.institution_id || 1, quiz_title, description, time_limit, pass_percentage, is_public]
      );
      const quiz = quizResult.rows[0];
      const questionPromises = question_ids.map((question_id, index) =>
        client.query(
          'INSERT INTO quiz_question (quiz_id, question_id, point_value, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
          [quiz.quiz_id, question_id, 1, index + 1]
        )
      );
      const quizQuestionResults = await Promise.all(questionPromises);
      await client.query('COMMIT');
      res.json({
        quiz: {
          ...quiz,
          questions: quizQuestionResults.map(result => result.rows[0]),
        },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Quiz creation error:', err);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

export default router;