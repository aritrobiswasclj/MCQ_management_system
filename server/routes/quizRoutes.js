import express from 'express';
import pool from '../config/db.js';
import authenticateToken from './authMiddleware.js';

const router = express.Router();

// Create a new quiz
router.post('/quizzes/create', authenticateToken, async (req, res) => {
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

// Get available quizzes for the user with filtering and sorting
router.get('/quizzes/available', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const role = req.user.role;
  const { tags, institution_id, category_id } = req.query;

  try {
    // Initialize params and paramIndex
    const params = [];
    let paramIndex = 1;

    // Build conditions for matched_questions
    const conditions = [];
    if (category_id) {
      conditions.push(`qn.category_id = $${paramIndex}`);
      params.push(parseInt(category_id));
      paramIndex++;
    }
    if (institution_id) {
      conditions.push(`qn.institution_id = $${paramIndex}`);
      params.push(parseInt(institution_id));
      paramIndex++;
    }
    if (tags) {
      conditions.push(`qt.tag_id = ANY($${paramIndex}::int[])`);
      params.push(tags.split(',').map(Number));
      paramIndex++;
    }
    const matchedCondition = conditions.length > 0 ? conditions.join(' OR ') : 'FALSE';

    let query = `
      WITH QuizStats AS (
        SELECT 
          q.quiz_id,
          q.quiz_title,
          q.description,
          q.time_limit,
          q.pass_percentage,
          q.is_public,
          i.institution_name,
          COUNT(DISTINCT qq.question_id) AS total_questions,
          COUNT(DISTINCT CASE 
            WHEN ${matchedCondition} 
            THEN qq.question_id 
            ELSE NULL 
          END) AS matched_questions
        FROM quiz q
        LEFT JOIN institution i ON q.institution_id = i.institution_id
        LEFT JOIN quiz_question qq ON q.quiz_id = qq.quiz_id
        JOIN question qn ON qq.question_id = qn.question_id
        LEFT JOIN question_tag qt ON qn.question_id = qt.question_id
        WHERE qn.is_active = TRUE AND qn.is_approved = TRUE
    `;

    // Role-based access
    if (role === 'student') {
      query += ` AND q.is_public = TRUE`;
    } else if (role === 'teacher') {
      query += ` AND (q.is_public = TRUE OR q.user_id = $${paramIndex})`;
      params.push(user_id);
      paramIndex++;
    } else {
      query += ` AND q.is_public = TRUE`;
    }

    // Apply filters to ensure quizzes match criteria
    let filterIndex = 1; // Reset for filter clauses to reuse parameters
    if (category_id) {
      query += ` AND EXISTS (
        SELECT 1 
        FROM quiz_question qq2 
        JOIN question qn2 ON qq2.question_id = qn2.question_id 
        WHERE qq2.quiz_id = q.quiz_id AND qn2.category_id = $${filterIndex} AND qn2.is_active = TRUE AND qn2.is_approved = TRUE
      )`;
      filterIndex++;
    }
    if (institution_id) {
      query += ` AND EXISTS (
        SELECT 1 
        FROM quiz_question qq2 
        JOIN question qn2 ON qq2.question_id = qn2.question_id 
        WHERE qq2.quiz_id = q.quiz_id AND qn2.institution_id = $${filterIndex} AND qn2.is_active = TRUE AND qn2.is_approved = TRUE
      )`;
      filterIndex++;
    }
    if (tags) {
      query += ` AND EXISTS (
        SELECT 1 
        FROM quiz_question qq2 
        JOIN question qn2 ON qq2.question_id = qn2.question_id 
        JOIN question_tag qt2 ON qn2.question_id = qt2.question_id 
        WHERE qq2.quiz_id = q.quiz_id AND qt2.tag_id = ANY($${filterIndex}::int[]) AND qn2.is_active = TRUE AND qn2.is_approved = TRUE
      )`;
      filterIndex++;
    }

    // Complete the query
    query += `
        GROUP BY q.quiz_id, q.quiz_title, q.description, q.time_limit, q.pass_percentage, q.is_public, i.institution_name
      )
      SELECT 
        quiz_id, 
        quiz_title, 
        description, 
        time_limit, 
        pass_percentage, 
        is_public, 
        institution_name, 
        total_questions, 
        matched_questions,
        CASE 
          WHEN total_questions > 0 THEN (matched_questions::float / total_questions) * 100
          ELSE 0 
        END AS match_percentage
      FROM QuizStats
      WHERE total_questions > 0
      ORDER BY match_percentage DESC, quiz_id DESC
    `;

    console.log('Executing available quizzes query:', query, 'with params:', params);
    const result = await pool.query(query, params);
    console.log('Available quizzes result:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching available quizzes:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch available quizzes', details: err.message });
  }
});

export default router;