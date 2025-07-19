--SELECT setval('users_user_id_seq', (SELECT MAX(user_id) + 1 FROM users), false);
SELECT setval('question_question_id_seq', (SELECT MAX(question_id) + 1 FROM question), false);