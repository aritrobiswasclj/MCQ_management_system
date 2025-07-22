SELECT setval('users_user_id_seq', (SELECT MAX(user_id) + 1 FROM users), false);
--SELECT setval('question_question_id_seq', (SELECT MAX(question_id) + 1 FROM question), false);
--SELECT setval('category_category_id_seq', (SELECT MAX(category_id) + 1 FROM category), false);
--SELECT setval('institution_institution_id_seq', (SELECT MAX(institution_id) + 1 FROM institution), false);
--SELECT setval('tag_tag_id_seq', (SELECT MAX(tag_id) + 1 FROM tag), false);
<<<<<<< HEAD
SELECT setval('subject_subject_id_seq', (SELECT MAX(subject_id) + 1 FROM subject), false);
=======

>>>>>>> b00746abeed70aa1b59704f2008f35f6473c512b
