import express from 'express';
import pool from '../config/db.js';
import authenticateToken from './authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Derive __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the musics folder exists at the project root
const uploadDir = path.join(__dirname, '..', '..', 'db', 'assets', 'musics');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/mp4', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only MP3, WAV, and MP4 files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin role required' });
  }
  next();
};

// Get all teachers
router.get('/admin/teachers', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, username, email, first_name, last_name FROM users WHERE role = $1',
      ['teacher']
    );
    console.log('Teachers result:', result.rows.length, 'teachers:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching teachers:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch teachers', details: err.message });
  }
});

// Get all questions (including private and non-approved)
router.get('/admin/questions', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { category_id, institution_id, user_id, search } = req.query;
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
    if (user_id && !isNaN(parseInt(user_id))) {
      query += ` AND q.user_id = $${paramIndex}`;
      params.push(parseInt(user_id));
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
  const deleted_by = req.user.user_id;

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

    // Delete the question, passing deleted_by as trigger argument
    const result = await pool.query(
      `WITH deleted AS (
         DELETE FROM question WHERE question_id = $1 RETURNING question_id
       )
       SELECT question_id, $2 AS deleted_by
       FROM deleted`,
      [questionIdNum, deleted_by]
    );

    if (result.rowCount === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Question not found' });
    }

    await pool.query('COMMIT');
    console.log('Question deleted:', questionIdNum, 'by user:', deleted_by);
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error deleting question:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to delete question', details: err.message });
  }
});

// Delete all questions by a teacher
router.delete('/admin/questions/teacher/:userId', authenticateToken, isAdmin, async (req, res) => {
  const { userId } = req.params;
  const deleted_by = req.user.user_id;

  try {
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Verify user is a teacher
    const userCheck = await pool.query('SELECT role FROM users WHERE user_id = $1', [userIdNum]);
    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'teacher') {
      return res.status(400).json({ error: 'User is not a teacher' });
    }

    await pool.query('BEGIN');

    // Get question IDs to delete
    const questionIdsResult = await pool.query('SELECT question_id FROM question WHERE user_id = $1', [userIdNum]);
    const questionIds = questionIdsResult.rows.map(row => row.question_id);

    if (questionIds.length > 0) {
      // Delete related records
      await pool.query('DELETE FROM question_tag WHERE question_id = ANY($1::int[])', [questionIds]);
      await pool.query('DELETE FROM question_option WHERE question_id = ANY($1::int[])', [questionIds]);
      await pool.query('DELETE FROM question_response WHERE question_id = ANY($1::int[])', [questionIds]);
      await pool.query('DELETE FROM quiz_question WHERE question_id = ANY($1::int[])', [questionIds]);
      // Delete questions, passing deleted_by
      await pool.query(
        `WITH deleted AS (
           DELETE FROM question WHERE user_id = $1 RETURNING question_id
         )
         SELECT question_id, $2 AS deleted_by
         FROM deleted`,
        [userIdNum, deleted_by]
      );
    }

    await pool.query('COMMIT');
    console.log(`Deleted ${questionIds.length} questions for teacher user_id:`, userIdNum, 'by user:', deleted_by);
    res.json({ message: `Deleted ${questionIds.length} questions successfully` });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error deleting teacher questions:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to delete teacher questions', details: err.message });
  }
});

// Add non-copyright music
router.post('/admin/music', authenticateToken, isAdmin, upload.single('music_file'), async (req, res) => {
  const { title, artist } = req.body;
  const user_id = req.user.user_id;
  const file = req.file;

  try {
    if (!title || !file) {
      return res.status(400).json({ error: 'Title and music file are required' });
    }

    const filePath = path.join('db', 'assets', 'musics', file.filename).replace(/\\/g, '/');

    const result = await pool.query(
      'INSERT INTO background_music (title, artist, file_path, uploaded_by, is_non_copyright) VALUES ($1, $2, $3, $4, TRUE) RETURNING music_id',
      [title, artist || null, filePath, user_id]
    );

    console.log('Music added:', { music_id: result.rows[0].music_id, title, artist, filePath });
    res.status(201).json({ message: 'Music added successfully', music_id: result.rows[0].music_id });
  } catch (err) {
    console.error('Error adding music:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to add music', details: err.message });
  }
});

export default router;