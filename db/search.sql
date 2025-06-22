SELECT DISTINCT
  q.question_id, 
  q.question_text,
  o.option_id,
  o.option_text,
  o.display_order
FROM question q
JOIN question_option o ON q.question_id = o.question_id
JOIN institution i ON q.institution_id = i.institution_id
LEFT JOIN question_tag qt ON q.question_id = qt.question_id
LEFT JOIN tag t ON qt.tag_id = t.tag_id;