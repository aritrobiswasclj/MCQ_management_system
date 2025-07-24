-- Check public_questions view
--SELECT * FROM public_questions;

-- Check your questions
/* SELECT q.question_id, q.question_text, q.is_public, q.is_approved, q.is_active, 
       q.category_id, q.institution_id, q.user_id,
       c.category_name, s.subject_name, i.institution_name, u.username
FROM question q
LEFT JOIN category c ON q.category_id = c.category_id
LEFT JOIN subject s ON c.subject_id = s.subject_id
LEFT JOIN institution i ON q.institution_id = i.institution_id
LEFT JOIN users u ON q.user_id = u.user_id
WHERE q.user_id = 10 AND q.is_active = TRUE; */

-- Verify related tables
--SELECT * FROM category WHERE category_id IN (SELECT category_id FROM question WHERE user_id = 10);
--SELECT * FROM subject WHERE subject_id IN (SELECT subject_id FROM category WHERE category_id IN (SELECT category_id FROM question WHERE user_id = 10));
--SELECT * FROM institution WHERE institution_id IN (SELECT institution_id FROM question WHERE user_id = 10);
--SELECT * FROM users WHERE user_id = 10;

SELECT * FROM public_questions 
WHERE question_id IN (SELECT question_id FROM question WHERE user_id = 10);