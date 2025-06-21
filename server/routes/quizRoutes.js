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
    const result = await pool.query(`
      SELECT 
        q.question_id, 
        q.question_text,
        o.option_id,
        o.option_text,
        o.display_order
      FROM question q
      JOIN question_option o ON q.question_id = o.question_id
      ORDER BY q.question_id, o.display_order
    `);

    const questions = {};
    result.rows.forEach(row => {
      if (!questions[row.question_id]) {
        questions[row.question_id] = {
          question_id: row.question_id,
          question_text: row.question_text,
          options: []
        };
      }
      questions[row.question_id].options.push({
        option_id: row.option_id,
        option_text: row.option_text,
        display_order: row.display_order
      });
    });

    res.json(Object.values(questions));
  } catch (err) {
    console.error('Error loading questions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
