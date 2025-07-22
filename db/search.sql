/* SELECT q.question_id,q.question_text,c.category_name,s.subject_name

FROM question q,category c ,subject s
WHERE q.category_id = c.category_id and s.subject_id = c.subject_id; */

SELECT * FROM quiz;

