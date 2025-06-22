-- Questions

INSERT INTO question (question_id, category_id, user_id, institution_id, question_text, is_approved, is_active, is_public, created_at)
VALUES
(24, 2, 1, 2, 'In the above case maximum moment at section 8 m from left support occurs when', TRUE, TRUE, TRUE, NOW()),
(25, 2, 1, 2, 'The moment which makes all the fibres at the section to yield is known as', TRUE, TRUE, TRUE, NOW()),
(26, 2, 1, 2, 'Which one of the following is wrong with respect to strain energy method for finding deflection?', TRUE, TRUE, TRUE, NOW()),
(27, 2, 1, 2, 'The point in the cross section of beam through which if load acts there will not be any twisting of the beam but there will be only bending is known as', TRUE, TRUE, TRUE, NOW()),
(28, 2, 1, 2, 'The shape factor of a diamond shaped section for bending about its diametral arise is', TRUE, TRUE, TRUE, NOW()),
(29, 3, 1, 2, 'The background colour of the informatory sign board is', TRUE, TRUE, TRUE, NOW()),
(30, 3, 1, 2, 'The most efficient traffic signal system is', TRUE, TRUE, TRUE, NOW()),
(31, 3, 1, 2, 'The main function of prime coat is to', TRUE, TRUE, TRUE, NOW()),
(32, 3, 1, 2, 'Rapid curing cutback bitumen is produced by blending bitumen with', TRUE, TRUE, TRUE, NOW()),
(33, 3, 1, 2, 'When the speed of traffic flow becomes zero, then', TRUE, TRUE, TRUE, NOW()),
(34, 3, 1, 2, 'Nagpur road plan formulae were prepared by assuming', TRUE, TRUE, TRUE, NOW()),
(35, 3, 1, 2, 'In a national highway the minimum width of road and shoulder on each side are ____ respectively.', TRUE, TRUE, TRUE, NOW()),
(36, 3, 1, 2, 'For an excellent base material CBR value is', TRUE, TRUE, TRUE, NOW()),
(37, 3, 1, 2, 'The type of bituminous road construction includes', TRUE, TRUE, TRUE, NOW()),
(38, 3, 1, 2, 'The shape of the camber, best suited for cement concrete pavements is', TRUE, TRUE, TRUE, NOW());

-- Options
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (121, 24, 'First 15 kN load is on the section', TRUE, 1);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (122, 24, 'Second 15 kN is on the section', FALSE, 2);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (123, 24, '8 kN load is on the section', FALSE, 3);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (124, 24, '10 kN load is on the section', FALSE, 4);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (125, 25, 'moment of resistance', FALSE, 1);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (126, 25, 'plastic moment capacity', TRUE, 2);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (127, 25, 'yield moment', FALSE, 3);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (128, 25, 'flexural rigidity', FALSE, 4);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (129, 26, 'Structure should be subjected to a single concentrated load', FALSE, 1);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (130, 26, 'Deflection can be found at any point in desired direction', TRUE, 2);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (131, 26, 'Deflection can be found only in direction of load', FALSE, 3);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (132, 26, 'Deflection can be found only at the loaded point', FALSE, 4);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (133, 27, 'shear centre', TRUE, 1);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (134, 27, 'centre of gravity', FALSE, 2);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (135, 27, 'centroid', FALSE, 3);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (136, 27, 'all the above', FALSE, 4);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (137, 28, '1.2', FALSE, 1);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (138, 28, '1.5', FALSE, 2);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (139, 28, '2.0', TRUE, 3);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (140, 28, '3.0', FALSE, 4);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (141, 29, 'red', FALSE, 1);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (142, 29, 'white', FALSE, 2);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (143, 29, 'green', FALSE, 3);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (144, 29, 'yellow', TRUE, 4);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (145, 30, 'simple progressive system', FALSE, 1);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (146, 30, 'flexible progressive system', TRUE, 2);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (147, 30, 'alternate system', FALSE, 3);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (148, 30, 'simultaneous system', FALSE, 4);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (149, 31, 'control dust nuisance', FALSE, 1);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (150, 31, 'provide bond between the existing base and surfacing of new construction', TRUE, 2);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (151, 31, 'improve riding quality of pavement', FALSE, 3);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (152, 31, 'provide bond between old and new surfacing', FALSE, 4);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (153, 32, 'petrol', TRUE, 1);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (154, 32, 'diesel', FALSE, 2);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (155, 32, 'benzene', FALSE, 3);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (156, 32, 'kerosene', FALSE, 4);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (157, 33, 'traffic density attains maximum value whereas traffic volume becomes zero', TRUE, 1);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (158, 33, 'traffic density becomes zero whereas traffic volume attains maximum value', FALSE, 2);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (159, 33, 'traffic density and traffic volume both', FALSE, 3);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (160, 33, 'traffic density and traffic volume both attain maximum value', FALSE, 4);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (161, 34, 'radial or star and grid road pattern', TRUE, 1);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (162, 34, 'radial or star and circular road pattern', FALSE, 2);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (163, 34, 'radial or star and block road pattern', FALSE, 3);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (164, 34, 'rectangular or block road system', FALSE, 4);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (165, 35, '8 m to 1.5 m', FALSE, 1);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (166, 35, '8 m and 2 m', TRUE, 2);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (167, 35, '10 m and 1.5 m', FALSE, 3);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (168, 35, '10 m and 2.0 m', FALSE, 4);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (169, 36, '50%', FALSE, 1);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (170, 36, '60%', FALSE, 2);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (171, 36, '100%', TRUE, 3);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (172, 36, '150%', FALSE, 4);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (173, 37, 'built up spray grout', FALSE, 1);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (174, 37, 'grouted or penetrations macadam', FALSE, 2);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (175, 37, 'surface dressing', FALSE, 3);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (176, 37, 'all the above', TRUE, 4);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (177, 38, 'combination of straight and parabolic', FALSE, 1);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (178, 38, 'elliptical', FALSE, 2);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (179, 38, 'parabolic', FALSE, 3);
INSERT INTO question_option (option_id, question_id, option_text, is_correct, display_order) VALUES (180, 38, 'straight line', TRUE, 4);

-- Tags
INSERT INTO question_tag (question_id, tag_id) VALUES (24, 1);
INSERT INTO question_tag (question_id, tag_id) VALUES (24, 2);
INSERT INTO question_tag (question_id, tag_id) VALUES (24, 3);
INSERT INTO question_tag (question_id, tag_id) VALUES (25, 1);
INSERT INTO question_tag (question_id, tag_id) VALUES (25, 2);
INSERT INTO question_tag (question_id, tag_id) VALUES (25, 3);
INSERT INTO question_tag (question_id, tag_id) VALUES (26, 1);
INSERT INTO question_tag (question_id, tag_id) VALUES (26, 2);
INSERT INTO question_tag (question_id, tag_id) VALUES (26, 3);
INSERT INTO question_tag (question_id, tag_id) VALUES (27, 1);
INSERT INTO question_tag (question_id, tag_id) VALUES (27, 2);
INSERT INTO question_tag (question_id, tag_id) VALUES (27, 3);
INSERT INTO question_tag (question_id, tag_id) VALUES (28, 1);
INSERT INTO question_tag (question_id, tag_id) VALUES (28, 2);
INSERT INTO question_tag (question_id, tag_id) VALUES (28, 3);
INSERT INTO question_tag (question_id, tag_id) VALUES (29, 1);
INSERT INTO question_tag (question_id, tag_id) VALUES (29, 2);
INSERT INTO question_tag (question_id, tag_id) VALUES (29, 3);
INSERT INTO question_tag (question_id, tag_id) VALUES (30, 1);
INSERT INTO question_tag (question_id, tag_id) VALUES (30, 2);
INSERT INTO question_tag (question_id, tag_id) VALUES (30, 3);
INSERT INTO question_tag (question_id, tag_id) VALUES (31, 1);
INSERT INTO question_tag (question_id, tag_id) VALUES (31, 2);
INSERT INTO question_tag (question_id, tag_id) VALUES (31, 3);
INSERT INTO question_tag (question_id, tag_id) VALUES (32, 1);
INSERT INTO question_tag (question_id, tag_id) VALUES (32, 2);
INSERT INTO question_tag (question_id, tag_id) VALUES (32, 3);
INSERT INTO question_tag (question_id, tag_id) VALUES (33, 1);
INSERT INTO question_tag (question_id, tag_id) VALUES (33, 2);
INSERT INTO question_tag (question_id, tag_id) VALUES (33, 3);
INSERT INTO question_tag (question_id, tag_id) VALUES (34, 1);
INSERT INTO question_tag (question_id, tag_id) VALUES (34, 2);
INSERT INTO question_tag (question_id, tag_id) VALUES (34, 3);
INSERT INTO question_tag (question_id, tag_id) VALUES (35, 1);
INSERT INTO question_tag (question_id, tag_id) VALUES (35, 2);
INSERT INTO question_tag (question_id, tag_id) VALUES (35, 3);
INSERT INTO question_tag (question_id, tag_id) VALUES (36, 1);
INSERT INTO question_tag (question_id, tag_id) VALUES (36, 2);
INSERT INTO question_tag (question_id, tag_id) VALUES (36, 3);
INSERT INTO question_tag (question_id, tag_id) VALUES (37, 1);
INSERT INTO question_tag (question_id, tag_id) VALUES (37, 2);
INSERT INTO question_tag (question_id, tag_id) VALUES (37, 3);
INSERT INTO question_tag (question_id, tag_id) VALUES (38, 1);
INSERT INTO question_tag (question_id, tag_id) VALUES (38, 2);
INSERT INTO question_tag (question_id, tag_id) VALUES (38, 3);
