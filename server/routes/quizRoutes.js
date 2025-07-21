
import express from 'express';
import pool from '../config/db.js';
import authenticateToken from './authMiddleware.js';

const router = express.Router();

// Create a new quiz
router.post('/create', authenticateToken, async (req, res) => {
  const { title, institution_id, description, time_limit, pass_percentage, is_public, questions } = req.body;
  const user_id = req.user.user_id;

  // Validate required fields
  if (!title || !institution_id || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Title, institution_id, and at least one question are required' });
  }
  if (title.length > 150) {
    return res.status(400).json({ error: 'Title must be 150 characters or less' });
  }
  if (time_limit && time_limit <= 0) {
    return res.status(400).json({ error: 'Time limit must be positive' });
  }
  if (pass_percentage && (pass_percentage < 0 || pass_percentage > 100)) {
    return res.status(400).json({ error: 'Pass percentage must be between 0 and 100' });
  }
  if (questions.some(q => !q.question_id || q.point_value == null || q.point_value <= 0 || q.display_order == null)) {
    return res.status(400).json({ error: 'Each question must have a valid question_id, positive point_value, and display_order' });
  }

  try {
    const client = await pool.connect();
    await client.query('BEGIN');

    // Insert quiz
    const quizRes = await client.query(
      'INSERT INTO quiz (user_id, institution_id, quiz_title, description, time_limit, pass_percentage, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING quiz_id',
      [user_id, institution_id, title, description || null, time_limit || null, pass_percentage || null, is_public || false]
    );
    const quiz_id = quizRes.rows[0].quiz_id;

    // Insert quiz questions with point_value and display_order
    for (const { question_id, point_value, display_order } of questions) {
      await client.query(
        'INSERT INTO quiz_question (quiz_id, question_id, point_value, display_order) VALUES ($1, $2, $3, $4)',
        [quiz_id, question_id, point_value, display_order]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Quiz created successfully', quiz_id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating quiz:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  } finally {
    client.release();
  }
});

export default router;
