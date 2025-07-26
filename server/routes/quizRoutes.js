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

router.get('/quizzes/:quizId', authenticateToken, async (req, res) => {
  const { quizId } = req.params;
  const user_id = req.user.user_id;
  const role = req.user.role;

  try {
    let query = `
      SELECT q.quiz_id, q.quiz_title, q.description, q.time_limit, q.pass_percentage, q.is_public, i.institution_name
      FROM quiz q
      JOIN institution i ON q.institution_id = i.institution_id
      WHERE q.quiz_id = $1
    `;
    const params = [parseInt(quizId)];

    if (role === 'student') {
      query += ` AND q.is_public = TRUE`;
    } else if (role === 'teacher') {
      query += ` AND (q.is_public = TRUE OR q.user_id = $2)`;
      params.push(user_id);
    } else {
      query += ` AND q.is_public = TRUE`;
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found or access denied' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching quiz:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch quiz', details: err.message });
  }
});

router.get('/quizzes/:quizId/questions', authenticateToken, async (req, res) => {
  const { quizId } = req.params;
  const user_id = req.user.user_id;
  const role = req.user.role;

  try {
    let query = `
      SELECT 
        qq.quiz_question_id, qq.quiz_id, qq.question_id, qq.point_value, qq.display_order,
        q.question_text, q.explanation, q.difficulty_level, q.is_public, q.is_approved,
        c.category_id, c.category_name, i.institution_id, i.institution_name
      FROM quiz_question qq
      JOIN question q ON qq.question_id = q.question_id
      JOIN category c ON q.category_id = c.category_id
      JOIN institution i ON q.institution_id = i.institution_id
      JOIN quiz qz ON qq.quiz_id = qz.quiz_id
      WHERE qq.quiz_id = $1 AND q.is_active = TRUE AND q.is_approved = TRUE
    `;
    const params = [parseInt(quizId)];

    if (role === 'student') {
      query += ` AND qz.is_public = TRUE`;
    } else if (role === 'teacher') {
      query += ` AND (qz.is_public = TRUE OR qz.user_id = $2)`;
      params.push(user_id);
    } else {
      query += ` AND qz.is_public = TRUE`;
    }

    query += ` ORDER BY qq.display_order`;

    const questionResult = await pool.query(query, params);
    if (questionResult.rows.length === 0) {
      return res.json([]);
    }

    const questionIds = questionResult.rows.map(row => row.question_id);
    const optionsResult = await pool.query(
      `SELECT option_id, question_id, option_text, is_correct, display_order
       FROM question_option
       WHERE question_id = ANY($1::int[])
       ORDER BY question_id, display_order`,
      [questionIds]
    );

    const questions = questionResult.rows.map(q => ({
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
    console.error('Error fetching quiz questions:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch quiz questions', details: err.message });
  }
});

router.post('/quiz-attempt/start', authenticateToken, async (req, res) => {
  const { quiz_id } = req.body;
  const user_id = req.user.user_id;

  try {
    const quizCheck = await pool.query(
      `SELECT is_public, user_id FROM quiz WHERE quiz_id = $1`,
      [parseInt(quiz_id)]
    );
    if (quizCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    const quiz = quizCheck.rows[0];
    if (!quiz.is_public && quiz.user_id !== user_id) {
      return res.status(403).json({ error: 'Access denied to private quiz' });
    }

    const result = await pool.query(
      `INSERT INTO quiz_attempt (quiz_id, user_id, start_time, is_completed)
       VALUES ($1, $2, CURRENT_TIMESTAMP, FALSE)
       RETURNING attempt_id`,
      [parseInt(quiz_id), user_id]
    );
    res.status(201).json({ attempt_id: result.rows[0].attempt_id });
  } catch (err) {
    console.error('Error starting quiz attempt:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to start quiz attempt', details: err.message });
  }
});

router.post('/question-response', authenticateToken, async (req, res) => {
  const { attempt_id, question_id, selected_option_id } = req.body;
  const user_id = req.user.user_id;

  try {
    const attemptCheck = await pool.query(
      `SELECT quiz_id FROM quiz_attempt WHERE attempt_id = $1 AND user_id = $2 AND is_completed = FALSE`,
      [parseInt(attempt_id), user_id]
    );
    if (attemptCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz attempt not found or already completed' });
    }

    const optionCheck = await pool.query(
      `SELECT is_correct, q.quiz_id
       FROM question_option qo
       JOIN quiz_question qq ON qo.question_id = qq.question_id
       WHERE qo.option_id = $1 AND qq.quiz_id = $2`,
      [parseInt(selected_option_id), attemptCheck.rows[0].quiz_id]
    );
    if (optionCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid option selected' });
    }

    const { is_correct } = optionCheck.rows[0];
    const points_earned = is_correct ? 1 : 0; // Adjust based on quiz_question.point_value if needed

    await pool.query(
      `INSERT INTO question_response (attempt_id, question_id, selected_option_id, is_correct, points_earned, answered_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (attempt_id, question_id) DO UPDATE
       SET selected_option_id = EXCLUDED.selected_option_id,
           is_correct = EXCLUDED.is_correct,
           points_earned = EXCLUDED.points_earned,
           answered_at = EXCLUDED.answered_at`,
      [parseInt(attempt_id), parseInt(question_id), parseInt(selected_option_id), is_correct, points_earned]
    );

    res.status(201).json({ message: 'Response recorded' });
  } catch (err) {
    console.error('Error recording question response:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to record response', details: err.message });
  }
});

router.post('/quiz-attempt/:attemptId/complete', authenticateToken, async (req, res) => {
  const { attemptId } = req.params;
  const user_id = req.user.user_id;

  try {
    const attemptCheck = await pool.query(
      `SELECT quiz_id FROM quiz_attempt WHERE attempt_id = $1 AND user_id = $2 AND is_completed = FALSE`,
      [parseInt(attemptId), user_id]
    );
    if (attemptCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz attempt not found or already completed' });
    }

    const scoreResult = await pool.query(
      `SELECT SUM(qr.points_earned) as total_score, COUNT(qr.response_id) as total_responses
       FROM question_response qr
       WHERE qr.attempt_id = $1`,
      [parseInt(attemptId)]
    );
    const { total_score, total_responses } = scoreResult.rows[0];

    await pool.query(
      `UPDATE quiz_attempt
       SET is_completed = TRUE, end_time = CURRENT_TIMESTAMP, score = $1
       WHERE attempt_id = $2`,
      [total_score || 0, parseInt(attemptId)]
    );

    res.json({ message: 'Quiz attempt completed', score: total_score || 0, total_responses });
  } catch (err) {
    console.error('Error completing quiz attempt:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to complete quiz attempt', details: err.message });
  }
});

router.get('/quiz-attempt/:attemptId/result', authenticateToken, async (req, res) => {
  const { attemptId } = req.params;
  const user_id = req.user.user_id;

  try {
    const result = await pool.query(
      `SELECT qa.score, q.pass_percentage,
              COUNT(qq.quiz_question_id) as total_questions,
              SUM(qq.point_value) as total_points,
              CASE WHEN qa.score >= q.pass_percentage THEN TRUE ELSE FALSE END as passed
       FROM quiz_attempt qa
       JOIN quiz q ON qa.quiz_id = q.quiz_id
       JOIN quiz_question qq ON q.quiz_id = qq.quiz_id
       WHERE qa.attempt_id = $1 AND qa.user_id = $2 AND qa.is_completed = TRUE
       GROUP BY qa.score, q.pass_percentage`,
      [parseInt(attemptId), user_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz attempt not found or not completed' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching quiz result:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch quiz result', details: err.message });
  }
});

export default router;