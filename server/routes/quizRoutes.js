import express from 'express';
import pool from '../db.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quiz LIMIT 10');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ ADD THIS ROUTE
router.get('/questions', async (req, res) => {
  try {
    const { institution_id, tag } = req.query;
    let baseQuery = `
      SELECT 
        q.question_id, 
        q.question_text,
        o.option_id,
        o.option_text,
        o.display_order
      FROM question q
      JOIN question_option o ON q.question_id = o.question_id
      JOIN institution i ON q.institution_id = i.institution_id
      LEFT JOIN question_tag qt ON q.question_id = qt.question_id
      LEFT JOIN tag t ON qt.tag_id = t.tag_id
    `;
    const where = [];
    const params = [];

    if (institution_id) {
      where.push('q.institution_id = $' + (params.length + 1));
      params.push(institution_id);
    }
    if (tag) {
      where.push('t.tag_name = $' + (params.length + 1));
      params.push(tag);
    }
    if (where.length) {
      baseQuery += ' WHERE ' + where.join(' AND ');
    }
    baseQuery += ' ORDER BY q.question_id, o.display_order';

    const result = await pool.query(baseQuery, params);

    // Use a Set to avoid duplicate options per question
    const questions = {};
    result.rows.forEach(row => {
      if (!questions[row.question_id]) {
        questions[row.question_id] = {
          question_id: row.question_id,
          question_text: row.question_text,
          options: [],
          optionIds: new Set()
        };
      }
      // Only add option if not already added
      if (!questions[row.question_id].optionIds.has(row.option_id)) {
        questions[row.question_id].options.push({
          option_id: row.option_id,
          option_text: row.option_text,
          display_order: row.display_order
        });
        questions[row.question_id].optionIds.add(row.option_id);
      }
    });

    // Remove the helper Set before sending
    const response = Object.values(questions).map(q => ({
      question_id: q.question_id,
      question_text: q.question_text,
      options: q.options
    }));

    res.json(response);
  } catch (err) {
    console.error('Error loading questions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;
