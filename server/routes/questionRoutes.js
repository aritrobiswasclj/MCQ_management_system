import express from 'express';
import pool from '../config/db.js';
import authenticateToken from './authMiddleware.js';

const router = express.Router();

// Get all categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM category');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching categories:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
  }
});

// Get all institutions
router.get('/institutions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT institution_id, institution_name FROM institution');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching institutions:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch institutions', details: err.message });
  }
});

// Get all tags
router.get('/tags', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT tag_id, tag_name FROM tag');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tags:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch tags', details: err.message });
  }
});

// Create question
router.post('/questions/create', authenticateToken, async (req, res) => {
  try {
    const decoded = req.user;
    if (decoded.role === 'student') {
      return res.status(403).json({ error: 'Unauthorized: Only teachers and admins can create questions' });
    }
    const { question_text, category_id, new_category, institution_id, new_institution, difficulty_level, is_public, options, tags } = req.body;
    if (!question_text || (!category_id && !new_category) || (!institution_id && !new_institution) || !difficulty_level || !options || options.length < 2) {
      return res.status(400).json({ error: 'Missing required fields or insufficient options' });
    }
    if (!options.some(opt => opt.is_correct)) {
      return res.status(400).json({ error: 'At least one option must be marked as correct' });
    }
    // Content validation
    /* const forbiddenWords = [ 'offensive', 'inappropriate'];
    if (forbiddenWords.some(word => question_text.toLowerCase().includes(word))) {
      return res.status(400).json({ error: 'Question content is inappropriate' });
    } */

    await pool.query('BEGIN');

    let finalCategoryId = category_id;
    if (new_category) {
      const categoryResult = await pool.query(
        'INSERT INTO category (subject_id, category_name, description) VALUES ($1, $2, $3) RETURNING category_id',
        [1, new_category, 'Added by teacher']
      );
      finalCategoryId = categoryResult.rows[0].category_id;
    }

    let finalInstitutionId = institution_id;
    if (new_institution) {
      const institutionResult = await pool.query(
        'INSERT INTO institution (institution_name, description) VALUES ($1, $2) RETURNING institution_id',
        [new_institution, 'Added by teacher']
      );
      finalInstitutionId = institutionResult.rows[0].institution_id;
    }

    const questionResult = await pool.query(
      'INSERT INTO question (user_id, category_id, institution_id, question_text, difficulty_level, is_public, is_approved) VALUES ($1, $2, $3, $4, $5, $6, FALSE) RETURNING question_id',
      [decoded.user_id, finalCategoryId, finalInstitutionId, question_text, difficulty_level, is_public]
    );
    const questionId = questionResult.rows[0].question_id;

    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      await pool.query(
        'INSERT INTO question_option (question_id, option_text, is_correct, display_order) VALUES ($1, $2, $3, $4)',
        [questionId, option.option_text, option.is_correct, i + 1]
      );
    }

    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        let tagId;
        const tagResult = await pool.query('SELECT tag_id FROM tag WHERE tag_name = $1', [tagName]);
        if (tagResult.rows.length > 0) {
          tagId = tagResult.rows[0].tag_id;
        } else {
          const newTagResult = await pool.query(
            'INSERT INTO tag (tag_name) VALUES ($1) RETURNING tag_id',
            [tagName]
          );
          tagId = newTagResult.rows[0].tag_id;
        }
        await pool.query(
          'INSERT INTO question_tag (question_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [questionId, tagId]
        );
      }
    }

    await pool.query('COMMIT');
    res.status(201).json({ message: 'Question created successfully', question_id: questionId });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Question creation error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to create question', details: err.message });
  }
});

// Get all questions created by the user
router.get('/questions/my-questions', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const { category_id, institution_id, tags, search } = req.query;
  try {
    let query = `
      SELECT DISTINCT q.question_id, q.question_text, q.difficulty_level, q.is_public, c.category_name, i.institution_name
      FROM question q
      LEFT JOIN category c ON q.category_id = c.category_id
      LEFT JOIN institution i ON q.institution_id = i.institution_id
    `;
    const params = [user_id];
    let paramIndex = 2;
    let joins = '';

    if (tags) {
      joins += ` INNER JOIN question_tag qt ON q.question_id = qt.question_id `;
    } else {
      joins += ` LEFT JOIN question_tag qt ON q.question_id = qt.question_id `;
    }

    query += joins;
    query += ` WHERE q.user_id = $1 AND q.is_active = TRUE`;

    if (category_id) {
      params.push(parseInt(category_id));
      query += ` AND q.category_id = $${paramIndex}`;
      paramIndex++;
    }
    if (institution_id) {
      params.push(parseInt(institution_id));
      query += ` AND q.institution_id = $${paramIndex}`;
      paramIndex++;
    }
    if (tags) {
      const tagArray = tags.split(',').map(Number);
      params.push(tagArray);
      query += ` AND qt.tag_id = ANY($${paramIndex}::int[])`;
      paramIndex++;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND q.question_text ILIKE $${paramIndex}`;
    }

    console.log('Executing my-questions query:', query, 'with params:', params);
    const result = await pool.query(query, params);
    console.log('my-questions result:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user questions:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch user questions', details: err.message });
  }
});

// Filter questions by category, institution, tags, and search term
router.get('/questions/filter', authenticateToken, async (req, res) => {
  const { category_id, institution_id, tags, search } = req.query;
  try {
    let query = `
      SELECT DISTINCT q.question_id, q.question_text, q.difficulty_level, q.is_public, c.category_name, i.institution_name
      FROM question q
      LEFT JOIN category c ON q.category_id = c.category_id
      LEFT JOIN institution i ON q.institution_id = i.institution_id
      LEFT JOIN question_tag qt ON q.question_id = qt.question_id
      WHERE q.is_public = TRUE AND q.is_approved = TRUE AND q.is_active = TRUE
    `;
    const params = [];
    let paramIndex = 1;

    if (category_id) {
      params.push(parseInt(category_id));
      query += ` AND q.category_id = $${paramIndex}`;
      paramIndex++;
    }
    if (institution_id) {
      params.push(parseInt(institution_id));
      query += ` AND q.institution_id = $${paramIndex}`;
      paramIndex++;
    }
    if (tags) {
      const tagArray = tags.split(',').map(Number);
      params.push(tagArray);
      query += ` AND qt.tag_id = ANY($${paramIndex}::int[])`;
      paramIndex++;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND q.question_text ILIKE $${paramIndex}`;
    }

    console.log('Executing filter query:', query, 'with params:', params);
    const result = await pool.query(query, params);
    console.log('filter result:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error filtering questions:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to filter questions', details: err.message });
  }
});

export default router;