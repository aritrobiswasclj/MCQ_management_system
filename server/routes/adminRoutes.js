
import express from 'express';
import pool from '../config/db.js';
import authenticateToken from './authMiddleware.js';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin role required' });
  }
  next();
};

// Get all questions (including private and non-approved)
router.get('/admin/questions', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { category_id, institution_id, search } = req.query;
    let query = `
      SELECT 
        q.question_id, q.question_text, q.difficulty_level, q.is_public, q.is_approved, q.is_active,
        c.category_name, i.institution_name, u.username AS creator_username
      FROM question q
      LEFT JOIN category c ON q.category_id = c.category_id
      LEFT JOIN institution i ON q.institution_id = i.institution_id
      LEFT JOIN users u ON q.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (category_id && !isNaN(parseInt(category_id))) {
      query += ` AND q.category_id = $${paramIndex}`;
      params.push(parseInt(category_id));
      paramIndex++;
    }
    if (institution_id && !isNaN(parseInt(institution_id))) {
      query += ` AND q.institution_id = $${paramIndex}`;
      params.push(parseInt(institution_id));
      paramIndex++;
    }
    if (search && search.trim()) {
      query += ` AND q.question_text ILIKE $${paramIndex}`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    query += ' ORDER BY q.question_id DESC';

    console.log('Executing admin questions query:', query, 'with params:', params);
    const result = await pool.query(query, params);
    console.log('Admin questions result:', result.rows.length, 'questions:', result.rows);

    const questionIds = result.rows.map(row => row.question_id);
    const optionsResult = await pool.query(
      `SELECT option_id, question_id, option_text, is_correct, display_order
       FROM question_option
       WHERE question_id = ANY($1::int[])
       ORDER BY question_id, display_order`,
      [questionIds]
    );

    const questions = result.rows.map(q => ({
      ...q,
      options: optionsResult.rows
        .filter(opt => opt.question_id === q.question_id)
        .map(opt => ({
          option_id: opt.option_id,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
          display_order: opt.display_order,
        })),
    }));

    res.json(questions);
  } catch (err) {
    console.error('Error fetching admin questions:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch questions', details: err.message });
  }
});

// Delete a question
router.delete('/admin/questions/:questionId', authenticateToken, isAdmin, async (req, res) => {
  const { questionId } = req.params;

  try {
    const questionIdNum = parseInt(questionId);
    if (isNaN(questionIdNum)) {
      return res.status(400).json({ error: 'Invalid question ID' });
    }

    await pool.query('BEGIN');

    // Delete related records
    await pool.query('DELETE FROM question_tag WHERE question_id = $1', [questionIdNum]);
    await pool.query('DELETE FROM question_option WHERE question_id = $1', [questionIdNum]);
    await pool.query('DELETE FROM question_response WHERE question_id = $1', [questionIdNum]);
    await pool.query('DELETE FROM quiz_question WHERE question_id = $1', [questionIdNum]);

    // Delete the question
    const result = await pool.query('DELETE FROM question WHERE question_id = $1 RETURNING question_id', [questionIdNum]);
    if (result.rowCount === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Question not found' });
    }

    await pool.query('COMMIT');
    console.log('Question deleted:', questionIdNum);
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error deleting question:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to delete question', details: err.message });
  }
});

// Add non-copyright music
router.post('/admin/music', authenticateToken, isAdmin, async (req, res) => {
  const { title, artist, file_url } = req.body;
  const user_id = req.user.user_id;

  try {
    if (!title || !file_url) {
      return res.status(400).json({ error: 'Title and file URL are required' });
    }

    const result = await pool.query(
      'INSERT INTO background_music (title, artist, file_url, uploaded_by, is_non_copyright) VALUES ($1, $2, $3, $4, TRUE) RETURNING music_id',
      [title, artist || null, file_url, user_id]
    );

    console.log('Music added:', { music_id: result.rows[0].music_id, title, artist, file_url });
    res.status(201).json({ message: 'Music added successfully', music_id: result.rows[0].music_id });
  } catch (err) {
    console.error('Error adding music:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to add music', details: err.message });
  }
});

export default router;
