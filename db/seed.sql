TRUNCATE TABLE
    question_response,
    quiz_attempt,
    quiz_question,
    quiz,
    question_option,
    question_tag,
    question,
    category,
    tag,
    subject,
    institution,
    users,
    user_music_setting,
    background_music,
    playlist
RESTART IDENTITY CASCADE;




INSERT INTO institution (institution_id, institution_name, description, is_active, created_at)
VALUES
(1, 'BUET', 'Bangladesh University of Engineering and Technology', TRUE, NOW()),
(2, 'CUET', 'Chittagong University of Engineering and Technology', TRUE, NOW()),
(3, 'Dhaka University', 'University of Dhaka', TRUE, NOW());

-- 📚 Insert Subjects
INSERT INTO subject (subject_id, subject_name, description, created_at)
VALUES
(1, 'Electrical and Electronic Engineering', 'EEE core subjects', NOW()),
(2, 'Civil Engineering', 'Civil engineering domain', NOW()),
(3, 'Computer Science Engineering', 'CSE core programming & systems', NOW());

-- 🏷️ Insert Tags
INSERT INTO tag (tag_id, tag_name)
VALUES
(1, 'easy'), (2, 'beginner'), (3, 'intermediate');

-- 📂 Insert Categories
INSERT INTO category (category_id, subject_id, category_name, description, created_at)
VALUES
(1, 1, 'Electricity and Magnetism', 'EEE electromagnetics category', NOW()),
(2, 2, 'Structural Analysis', 'Analysis of structures', NOW()),
(3, 2, 'Highway Engineering', 'Roads and traffic systems', NOW()),
(4, 3, 'C++', 'OOP in C++', NOW()),
(5, 3, 'ASP.NET', 'Web programming with ASP.NET', NOW());

-- ✅ Next step: insert questions and options linked to these institution_id, subject_id, category_id and tag_ids
-- Let me know when you're ready and I'll continue from this point


INSERT INTO users (user_id, username, password, email, first_name, last_name, role, created_at)
VALUES (2, 'student01', 'hashed_pw', 'student01@email.com', 'Student', 'One', 'student', NOW());


-- 📦 Insert Users (admins, teachers, students)
INSERT INTO users (user_id, username, password, email, first_name, last_name, role, created_at)
VALUES
(1, 'aritro', 'hashed_pw1', 'aritro@email.com', 'Aritro', 'Roy', 'admin', NOW()),
(7, 'abid', 'hashed_pw2', 'abid@email.com', 'Abid', 'Hasan', 'admin', NOW()),
(3, 'shankar', 'hashed_pw3', 'shankar@email.com', 'Shankar', 'Sen', 'teacher', NOW()),
(4, 'yeasin', 'hashed_pw4', 'yeasin@email.com', 'Yeasin', 'Ahmed', 'teacher', NOW()),
(5, 'biswas', 'hashed_pw5', 'biswas@email.com', 'Biswas', 'Kumar', 'student', NOW()),
(6, 'tahmidul', 'hashed_pw6', 'tahmidul@email.com', 'Tahmidul', 'Islam', 'student', NOW());


-- Insert questions
INSERT INTO question (question_id, category_id, user_id, institution_id, question_text, is_approved, is_active, is_public, created_at)
VALUES 
(1, 1, 1, 1, 'Particles having positive charge occasionally come with high velocity from sky towards the earth. On account of the magnetic field of earth, they would be deflected toward', TRUE, TRUE, TRUE, NOW()),
(2, 1, 1, 1, 'A charged particle enters a magnetic field perpendicular to the magnetic lines of force. The path of the particle is', TRUE, TRUE, TRUE, NOW()),
(3, 1, 1, 1, 'The magnetic material used in permanent magnet is', TRUE, TRUE, TRUE, NOW()),
(4, 1, 1, 1, 'Tesla is a unit of', TRUE, TRUE, TRUE, NOW()),
(5, 1, 1, 1, 'Which of the following materials are diamagnetic?', TRUE, TRUE, TRUE, NOW()),
(6, 1, 1, 1, 'The magneto-motive force is', TRUE, TRUE, TRUE, NOW()),
(7, 1, 1, 1, 'A permanent magnet', TRUE, TRUE, TRUE, NOW()),
(8, 1, 1, 1, 'Unit for quantity of electricity is', TRUE, TRUE, TRUE, NOW()),
(9, 1, 1, 1, 'The magnetism left in the iron after exciting field has been removed is known as', TRUE, TRUE, TRUE, NOW()),
(10, 1, 1, 1, 'Ferrites are a sub group of', TRUE, TRUE, TRUE, NOW()),
(11, 1, 1, 1, 'Substances which have permeability less than the permeability of free space are known as', TRUE, TRUE, TRUE, NOW()),
(12, 1, 1, 1, 'The force between two long parallel conductors is inversely proportional to', TRUE, TRUE, TRUE, NOW()),
(13, 1, 1, 1, 'Which of the following is a vector quantity?', TRUE, TRUE, TRUE, NOW());

-- Insert options
INSERT INTO question_option (question_id, option_text, is_correct, display_order) VALUES
(1, 'west', FALSE, 1),
(1, 'south', FALSE, 2),
(1, 'east', TRUE, 3),
(1, 'north', FALSE, 4),

(2, 'spiral', FALSE, 1),
(2, 'ellipse', FALSE, 2),
(2, 'straight line', FALSE, 3),
(2, 'circular', TRUE, 4),

(3, 'hardened steel', TRUE, 1),
(3, 'nickel', FALSE, 2),
(3, 'soft steel', FALSE, 3),
(3, 'iron', FALSE, 4),

(4, 'field strength', FALSE, 1),
(4, 'magnetic flux density', TRUE, 2),
(4, 'inductance', FALSE, 3),
(4, 'flux', FALSE, 4),

(5, 'iron', FALSE, 1),
(5, 'silver and copper', TRUE, 2),
(5, 'copper', FALSE, 3),
(5, 'silver', FALSE, 4),

(6, 'passage of magnetic field through an exciting coil', FALSE, 1),
(6, 'sum of all currents embraced by one line of magnetic field', TRUE, 2),
(6, 'flow of an electric current', FALSE, 3),
(6, 'voltage across the two ends of exciting coil', FALSE, 4),

(7, 'attracts ferromagnetic substances and repels all others', FALSE, 1),
(7, 'attracts only ferromagnetic substances', FALSE, 2),
(7, 'attracts all paramagnetic substances and repels other', FALSE, 3),
(7, 'attracts some substances and repels others', TRUE, 4),

(8, 'ampere-hour', FALSE, 1),
(8, 'coulomb', TRUE, 2),
(8, 'joule', FALSE, 3),
(8, 'watt', FALSE, 4),

(9, 'reluctance', FALSE, 1),
(9, 'susceptance', FALSE, 2),
(9, 'residual magnetism', TRUE, 3),
(9, 'permeance', FALSE, 4),

(10, 'ferri-magnetic materials', TRUE, 1),
(10, 'paramagnetic materials', FALSE, 2),
(10, 'ferro-magnetic materials', FALSE, 3),
(10, 'non magnetic materials', FALSE, 4),

(11, 'bipolar', FALSE, 1),
(11, 'diamagnetic', TRUE, 2),
(11, 'paramagnetic', FALSE, 3),
(11, 'ferromagnetic', FALSE, 4),

(12, 'distance between the conductors', TRUE, 1),
(12, 'product of current in two conductors', FALSE, 2),
(12, 'current in one conductor', FALSE, 3),
(12, 'radius of conductors', FALSE, 4),

(13, 'magnetic potential', FALSE, 1),
(13, 'flux density', FALSE, 2),
(13, 'magnetic field intensity', TRUE, 3),
(13, 'relative permeability', FALSE, 4);



-- ✅ SEED DATA for MCQ Platform
-- Assumptions: quiz_id = 1, user_id = 2 (student), institution_id = 1

-- Insert a quiz
INSERT INTO quiz (quiz_id, user_id, institution_id, quiz_title, description, time_limit, pass_percentage, is_public, created_at)
VALUES
(1, 1, 1, 'Electricity & Magnetism Quiz - BUET', 'Core EEE quiz from BUET question bank', 20, 50, TRUE, NOW());

-- Insert quiz_attempt (attempt_id = 1)
INSERT INTO quiz_attempt (attempt_id, quiz_id, user_id, playlist_id, start_time, end_time, score, is_completed)
VALUES (1, 1, 2, NULL, NOW(), NOW(), 9, TRUE);

-- Insert 13 question_responses for student user_id = 2
-- Format: (attempt_id, question_id, selected_option_id, is_correct, points_earned, answered_at)
INSERT INTO question_response (attempt_id, question_id, selected_option_id, is_correct, points_earned, answered_at) VALUES
(1, 1, 3,  TRUE, 1, NOW()),  -- Q1: C
(1, 2, 8,  TRUE, 1, NOW()),  -- Q2: D
(1, 3, 10, FALSE, 0, NOW()), -- Q3: B
(1, 4, 15, FALSE, 0, NOW()), -- Q4: C
(1, 5, 18, TRUE, 1, NOW()),  -- Q5: B
(1, 6, 21, FALSE, 0, NOW()), -- Q6: A
(1, 7, 28, TRUE, 1, NOW()),  -- Q7: D
(1, 8, 30, TRUE, 1, NOW()),  -- Q8: B
(1, 9, 36, FALSE, 0, NOW()), -- Q9: D
(1,10, 37, TRUE, 1, NOW()),  -- Q10: A
(1,11, 42, TRUE, 1, NOW()),  -- Q11: B
(1,12, 45, TRUE, 1, NOW()),  -- Q12: A
(1,13, 51, TRUE, 1, NOW());  -- Q13: C

-- Note: selected_option_id values must match your actual question_option.option_id values in the DB.
-- If you want I can write a lookup insert that automatically resolves option_id by question_id + display_order.

-- Optionally, insert the student


-- 🎧 Insert User Music Settings (preferred volumes & default playlists placeholder)
INSERT INTO user_music_setting (user_id, music_enabled, default_playlist_id, volume, updated_at)
VALUES
(1, TRUE, NULL, 70, NOW()),
(2, TRUE, NULL, 80, NOW()),
(3, TRUE, NULL, 60, NOW()),
(4, TRUE, NULL, 50, NOW()),
(5, TRUE, NULL, 65, NOW()),
(6, TRUE, NULL, 71, NOW());

-- 🎶 Insert Background Music
INSERT INTO background_music (music_id, title, artist, file_path, duration_seconds, mood, is_active, added_at) VALUES
(1, 'Morning Breeze', 'Kevin MacLeod', '/assets/music/morning_breeze.mp3', 180, 'Relaxing', TRUE, '2024-01-15 10:30:00'),
(2, 'Focus Flow', 'AudioNautix', '/assets/music/focus_flow.mp3', 240, 'Study', TRUE, '2024-01-16 14:20:00'),
(3, 'Upbeat Journey', 'Bensound', '/assets/music/upbeat_journey.mp3', 195, 'Energetic', TRUE, '2024-01-17 09:15:00'),
(4, 'Peaceful Waters', 'Free Music Archive', '/assets/music/peaceful_waters.mp3', 220, 'Relaxing', TRUE, '2024-01-18 16:45:00'),
(5, 'Study Session', 'Kevin MacLeod', '/assets/music/study_session.mp3', 300, 'Study', TRUE, '2024-01-19 11:30:00'),
(6, 'Energy Boost', 'AudioNautix', '/assets/music/energy_boost.mp3', 165, 'Energetic', TRUE, '2024-01-20 08:00:00'),
(7, 'Calm Meditation', 'Bensound', '/assets/music/calm_meditation.mp3', 280, 'Relaxing', TRUE, '2024-01-21 19:20:00'),
(8, 'Concentration Zone', 'Free Music Archive', '/assets/music/concentration_zone.mp3', 210, 'Study', TRUE, '2024-01-22 13:10:00'),
(9, 'Dynamic Pulse', 'Kevin MacLeod', '/assets/music/dynamic_pulse.mp3', 185, 'Energetic', TRUE, '2024-01-23 07:45:00'),
(10, 'Gentle Waves', 'AudioNautix', '/assets/music/gentle_waves.mp3', 250, 'Relaxing', TRUE, '2024-01-24 20:30:00'),
(11, 'Brain Power', 'Bensound', '/assets/music/brain_power.mp3', 275, 'Study', TRUE, '2024-01-25 12:15:00'),
(12, 'High Voltage', 'Free Music Archive', '/assets/music/high_voltage.mp3', 155, 'Energetic', TRUE, '2024-01-26 15:50:00'),
(13, 'Serenity Now', 'Kevin MacLeod', '/assets/music/serenity_now.mp3', 290, 'Relaxing', TRUE, '2024-01-27 18:25:00'),
(14, 'Mental Clarity', 'AudioNautix', '/assets/music/mental_clarity.mp3', 230, 'Study', TRUE, '2024-01-28 10:40:00'),
(15, 'Power Drive', 'Bensound', '/assets/music/power_drive.mp3', 175, 'Energetic', TRUE, '2024-01-29 06:55:00'),
(16, 'Soft Harmony', 'Free Music Archive', '/assets/music/soft_harmony.mp3', 260, 'Relaxing', TRUE, '2024-01-30 21:10:00'),
(17, 'Deep Focus', 'Kevin MacLeod', '/assets/music/deep_focus.mp3', 320, 'Study', TRUE, '2024-02-01 14:35:00'),
(18, 'Adrenaline Rush', 'AudioNautix', '/assets/music/adrenaline_rush.mp3', 145, 'Energetic', TRUE, '2024-02-02 09:20:00'),
(19, 'Tranquil Moments', 'Bensound', '/assets/music/tranquil_moments.mp3', 285, 'Relaxing', TRUE, '2024-02-03 17:45:00'),
(20, 'Study Rhythm', 'Free Music Archive', '/assets/music/study_rhythm.mp3', 205, 'Study', TRUE, '2024-02-04 11:55:00');

-- 🎵 Insert Playlists (total: 15 = 3+2+4+1+2+3)
INSERT INTO playlist (playlist_id, user_id, playlist_name, description, is_default, created_at) VALUES
-- Aritro (1) → 3 playlists
(1, 1, 'Aritro Focus', 'Study tunes', FALSE, NOW()),
(2, 1, 'Aritro Chill', 'Relaxing vibes', FALSE, NOW()),
(3, 1, 'Aritro Energy', 'Upbeat mix', FALSE, NOW()),
-- Abid (2) → 2 playlists
(4, 2, 'Abid Focus', 'Exam mode', FALSE, NOW()),
(5, 2, 'Abid Rush', 'Power beats', FALSE, NOW()),
-- Shankar (3) → 4 playlists
(6, 3, 'Shankar Study', 'Long session playlist', FALSE, NOW()),
(7, 3, 'Shankar Meditation', 'Relaxing tones', FALSE, NOW()),
(8, 3, 'Shankar Energizer', 'Keep moving', FALSE, NOW()),
(9, 3, 'Shankar Waves', 'Brainwave music', FALSE, NOW()),
-- Yeasin (4) → 1 playlist
(10, 4, 'Yeasin Focus', 'All-in-one', FALSE, NOW()),
-- Biswas (5) → 2 playlists
(11, 5, 'Biswas Mode', 'Lecture loop', FALSE, NOW()),
(12, 5, 'Biswas Drift', 'Evening music', FALSE, NOW()),
-- Tahmidul (6) → 3 playlists
(13, 6, 'Tahmidul Chill', 'Weekend recovery', FALSE, NOW()),
(14, 6, 'Tahmidul Energetic', 'Motivation pack', FALSE, NOW()),
(15, 6, 'Tahmidul Intense', 'Deep study', FALSE, NOW());




INSERT INTO QUESTION (question_id, category_id, user_id, institution_id, parent_question_id, approved_by_id, question_text, explanation, difficulty_level, is_active, is_variation, is_public, is_approved, created_at, updated_at, approved_at) VALUES

(14, 1, 1, 1, NULL, 1, 'A program that predicts the exact sequence in which events will take place is said to be', 'procedural', 1, TRUE, FALSE, TRUE, TRUE, NOW(), NOW(), NOW()),

(15, 1, 1, 1, NULL, 1, 'Many programmers separate a class into two files', 'one for the declarations and one for the implementation', 1, TRUE, FALSE, TRUE, TRUE, NOW(), NOW(), NOW()),

(16, 1, 1, 1, NULL, 1, 'The features that allows you to use the same function name for separate functions that have different argument lists is called', 'overloading', 2, TRUE, FALSE, TRUE, TRUE, NOW(), NOW(), NOW()),

(17, 1, 1, 1, NULL, 1, 'An auxiliary function', 'performs an action or service', 1, TRUE, FALSE, TRUE, TRUE, NOW(), NOW(), NOW()),

(18, 1, 1, 1, NULL, 1, 'The generic name used for unexpected errors that occur during the execution of a program is', 'exceptions', 2, TRUE, FALSE, TRUE, TRUE, NOW(), NOW(), NOW()),

(19, 1, 1, 1, NULL, 1, 'Procedural cohesion is similar to sequential cohesion, except that with procedural cohesion', 'the tasks do not share data', 2, TRUE, FALSE, TRUE, TRUE, NOW(), NOW(), NOW()),

(20, 1, 1, 1, NULL, 1, 'The return type you code for all constructors is', 'the same type as the first data member defined in the class', 3, TRUE, FALSE, TRUE, TRUE, NOW(), NOW(), NOW()),

(21, 1, 1, 1, NULL, 1, 'A pattern for creating an object is called an', 'class', 1, TRUE, FALSE, TRUE, TRUE, NOW(), NOW(), NOW()),

(22, 1, 1, 1, NULL, 1, 'Any exception specification appears in', 'the header of a function that throws an exception', 3, TRUE, FALSE, TRUE, TRUE, NOW(), NOW(), NOW()),

(23, 1, 1, 1, NULL, 1, 'A constructor initialisation list is preceded by', 'a colon', 2, TRUE, FALSE, TRUE, TRUE, NOW(), NOW(), NOW());


-- Options for question 14
INSERT INTO QUESTION_OPTION (option_id, question_id, option_text, is_correct, display_order) VALUES
(81, 14, 'object oriented', FALSE, 1),
(82, 14, 'procedural', TRUE, 2),
(83, 14, 'interpreted', FALSE, 3),
(84, 14, 'compiled', FALSE, 4);

-- Options for question 15
INSERT INTO QUESTION_OPTION (option_id, question_id, option_text, is_correct, display_order) VALUES
(85, 15, 'one for the primary functions and one for the auxiliary functions', FALSE, 1),
(86, 15, 'one for the public data and one for the private data', FALSE, 2),
(87, 15, 'one for the void functions and one for the other functions', FALSE, 3),
(88, 15, 'one for the declarations and one for the implementation', TRUE, 4);

-- Options for question 16
INSERT INTO QUESTION_OPTION (option_id, question_id, option_text, is_correct, display_order) VALUES
(89, 16, 'constructing', FALSE, 1),
(90, 16, 'destructing', FALSE, 2),
(91, 16, 'overriding', FALSE, 3),
(92, 16, 'overloading', TRUE, 4);

-- Options for question 17
INSERT INTO QUESTION_OPTION (option_id, question_id, option_text, is_correct, display_order) VALUES
(93, 17, 'creates and destroys objects', FALSE, 1),
(94, 17, 'changes the state of data members', FALSE, 2),
(95, 17, 'return information about data members', FALSE, 3),
(96, 17, 'performs an action or service', TRUE, 4);

-- Options for question 18
INSERT INTO QUESTION_OPTION (option_id, question_id, option_text, is_correct, display_order) VALUES
(97, 18, 'anomalies', FALSE, 1),
(98, 18, 'deviations', FALSE, 2),
(99, 18, 'exceptions', TRUE, 3),
(100, 18, 'infractions', FALSE, 4);

-- Options for question 19
INSERT INTO QUESTION_OPTION (option_id, question_id, option_text, is_correct, display_order) VALUES
(101, 19, 'the tasks do not share data', TRUE, 1),
(102, 19, 'the tasks share data', FALSE, 2),
(103, 19, 'the tasks are simpler', FALSE, 3),
(104, 19, 'the tasks are not done in order', FALSE, 4);

-- Options for question 20
INSERT INTO QUESTION_OPTION (option_id, question_id, option_text, is_correct, display_order) VALUES
(105, 20, 'the same type as the first data member defined in the class', TRUE, 1),
(106, 20, 'void', FALSE, 2),
(107, 20, 'no type', FALSE, 3),
(108, 20, 'the class type', FALSE, 4);

-- Options for question 21
INSERT INTO QUESTION_OPTION (option_id, question_id, option_text, is_correct, display_order) VALUES
(109, 21, 'private', FALSE, 1),
(110, 21, 'public', FALSE, 2),
(111, 21, 'attributes', FALSE, 3),
(112, 21, 'class', TRUE, 4);

-- Options for question 22
INSERT INTO QUESTION_OPTION (option_id, question_id, option_text, is_correct, display_order) VALUES
(113, 22, 'the header of a function that throws an exception', TRUE, 1),
(114, 22, 'a try block', FALSE, 2),
(115, 22, 'a catch block', FALSE, 3),
(116, 22, 'the main() program', FALSE, 4);

-- Options for question 23
INSERT INTO QUESTION_OPTION (option_id, question_id, option_text, is_correct, display_order) VALUES
(117, 23, 'a space', FALSE, 1),
(118, 23, 'a semicolon', FALSE, 2),
(119, 23, 'a colon', TRUE, 3),
(120, 23, 'two colons', FALSE, 4);
