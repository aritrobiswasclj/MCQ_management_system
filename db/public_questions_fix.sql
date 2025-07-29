-- Drop the existing view
DROP VIEW IF EXISTS public_questions;

-- Create the new view
CREATE VIEW public_questions AS
SELECT 
    q.question_id,
    q.question_text,
    q.explanation,
    q.difficulty_level,
    q.category_id,
    c.category_name,
    s.subject_name,
    q.institution_id,
    i.institution_name,
    u.username AS creator_username
FROM question q
JOIN category c ON q.category_id = c.category_id
JOIN subject s ON c.subject_id = s.subject_id
JOIN institution i ON q.institution_id = i.institution_id
JOIN users u ON q.user_id = u.user_id;