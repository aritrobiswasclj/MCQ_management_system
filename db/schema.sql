-- ENUM types
CREATE TYPE user_role AS ENUM ('teacher', 'student', 'admin');
CREATE TYPE music_mood AS ENUM ('Study', 'Relaxing', 'Energetic','Sleepy','Happy');

-- USERS
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    updated_at TIMESTAMP
);

-- Add index for user role queries
CREATE INDEX idx_users_role ON users(role);

-- INSTITUTION
CREATE TABLE institution (
    institution_id SERIAL PRIMARY KEY,
    institution_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- SUBJECT
CREATE TABLE subject (
    subject_id SERIAL PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- CATEGORY
CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_category_subject FOREIGN KEY (subject_id) REFERENCES subject(subject_id)
);

-- Add index for category-subject relationship
CREATE INDEX idx_category_subject_id ON category(subject_id);

-- TAG
CREATE TABLE tag (
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(50) NOT NULL UNIQUE
);

-- BACKGROUND_MUSIC
CREATE TABLE background_music (
    music_id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    artist VARCHAR(100),
    file_path TEXT NOT NULL,
    duration_seconds INTEGER,
    mood music_mood,
    is_active BOOLEAN DEFAULT TRUE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER,
    is_non_copyright BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_background_music_user FOREIGN KEY (uploaded_by) REFERENCES users(user_id)
);

-- PLAYLIST
CREATE TABLE playlist (
    playlist_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    playlist_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_playlist_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Add index for user playlists
CREATE INDEX idx_playlist_user_id ON playlist(user_id);

-- QUESTION
CREATE TABLE question (
    question_id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    institution_id INTEGER NOT NULL,
    parent_question_id INTEGER,
    approved_by_id INTEGER,
    question_text TEXT NOT NULL,
    explanation TEXT,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
    is_active BOOLEAN DEFAULT TRUE,
    is_variation BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    approved_at TIMESTAMP,
    CONSTRAINT fk_question_category FOREIGN KEY (category_id) REFERENCES category(category_id),
    CONSTRAINT fk_question_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_question_institution FOREIGN KEY (institution_id) REFERENCES institution(institution_id),
    CONSTRAINT fk_question_parent FOREIGN KEY (parent_question_id) REFERENCES question(question_id),
    CONSTRAINT fk_question_approver FOREIGN KEY (approved_by_id) REFERENCES users(user_id)
);

-- Add indexes for question relationships
CREATE INDEX idx_question_category_id ON question(category_id);
CREATE INDEX idx_question_user_id ON question(user_id);
CREATE INDEX idx_question_institution_id ON question(institution_id);
CREATE INDEX idx_question_parent_id ON question(parent_question_id);
CREATE INDEX idx_question_approved_by ON question(approved_by_id);
CREATE INDEX idx_question_is_approved ON question(is_approved);
CREATE INDEX idx_question_is_public ON question(is_public);

-- QUESTION_OPTION
CREATE TABLE question_option (
    option_id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    display_order INTEGER NOT NULL,
    CONSTRAINT fk_question_option_question FOREIGN KEY (question_id) REFERENCES question(question_id) ON DELETE CASCADE
);

-- Add index for question_option-question relationship
CREATE INDEX idx_question_option_question_id ON question_option(question_id);

-- QUIZ
CREATE TABLE quiz (
    quiz_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    institution_id INTEGER NOT NULL,
    quiz_title VARCHAR(150) NOT NULL,
    description TEXT,
    time_limit INTEGER, -- in minutes
    pass_percentage INTEGER CHECK (pass_percentage BETWEEN 0 AND 100),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_quiz_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_quiz_institution FOREIGN KEY (institution_id) REFERENCES institution(institution_id),
    CONSTRAINT check_time_limit_positive CHECK (time_limit IS NULL OR time_limit > 0)
);

-- Add indexes for quiz relationships
CREATE INDEX idx_quiz_user_id ON quiz(user_id);
CREATE INDEX idx_quiz_institution_id ON quiz(institution_id);
CREATE INDEX idx_quiz_is_public ON quiz(is_public);

-- QUIZ_QUESTION
CREATE TABLE quiz_question (
    quiz_question_id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    point_value INTEGER DEFAULT 1,
    display_order INTEGER,
    CONSTRAINT fk_quiz_question_quiz FOREIGN KEY (quiz_id) REFERENCES quiz(quiz_id) ON DELETE CASCADE,
    CONSTRAINT fk_quiz_question_question FOREIGN KEY (question_id) REFERENCES question(question_id)
);

-- Add indexes for quiz_question relationships
CREATE INDEX idx_quiz_question_quiz_id ON quiz_question(quiz_id);
CREATE INDEX idx_quiz_question_question_id ON quiz_question(question_id);

-- PLAYLIST_MUSIC
CREATE TABLE playlist_music (
    playlist_id INTEGER NOT NULL,
    music_id INTEGER NOT NULL,
    track_order INTEGER,
    PRIMARY KEY (playlist_id, music_id),
    CONSTRAINT fk_playlist_music_playlist FOREIGN KEY (playlist_id) REFERENCES playlist(playlist_id) ON DELETE CASCADE,
    CONSTRAINT fk_playlist_music_music FOREIGN KEY (music_id) REFERENCES background_music(music_id) ON DELETE CASCADE
);

-- Add index for track ordering with included columns for better performance
-- Drop the old if not needed
DROP INDEX IF EXISTS idx_playlist_music_order;
-- Create the new composite index
CREATE INDEX idx_playlist_music_full ON playlist_music(playlist_id, track_order, music_id);

-- USER_MUSIC_SETTING
CREATE TABLE user_music_setting (
    user_id INTEGER PRIMARY KEY,
    music_enabled BOOLEAN DEFAULT TRUE,
    default_playlist_id INTEGER,
    volume INTEGER CHECK (volume BETWEEN 0 AND 100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_music_setting_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_music_setting_playlist FOREIGN KEY (default_playlist_id) REFERENCES playlist(playlist_id)
);

-- QUIZ_ATTEMPT (moved after playlist creation to resolve circular reference)
CREATE TABLE quiz_attempt (
    attempt_id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    playlist_id INTEGER,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    score INTEGER,
    is_completed BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_quiz_attempt_quiz FOREIGN KEY (quiz_id) REFERENCES quiz(quiz_id),
    CONSTRAINT fk_quiz_attempt_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_quiz_attempt_playlist FOREIGN KEY (playlist_id) REFERENCES playlist(playlist_id)
);

-- Add indexes for quiz attempt relationships and filtering
CREATE INDEX idx_quiz_attempt_quiz_id ON quiz_attempt(quiz_id);
CREATE INDEX idx_quiz_attempt_user_id ON quiz_attempt(user_id);
CREATE INDEX idx_quiz_attempt_playlist_id ON quiz_attempt(playlist_id);
CREATE INDEX idx_quiz_attempt_completed ON quiz_attempt(is_completed);
CREATE INDEX idx_quiz_attempt_completed_date ON quiz_attempt(user_id, is_completed, end_time);

-- QUESTION_RESPONSE
CREATE TABLE question_response (
    response_id SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    selected_option_id INTEGER,
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_question_response_attempt FOREIGN KEY (attempt_id) REFERENCES quiz_attempt(attempt_id) ON DELETE CASCADE,
    CONSTRAINT fk_question_response_question FOREIGN KEY (question_id) REFERENCES question(question_id),
    CONSTRAINT fk_question_response_option FOREIGN KEY (selected_option_id) REFERENCES question_option(option_id)
);

-- Add indexes for question response relationships
CREATE INDEX idx_question_response_attempt_id ON question_response(attempt_id);
CREATE INDEX idx_question_response_question_id ON question_response(question_id);
CREATE INDEX idx_question_response_option_id ON question_response(selected_option_id);

-- QUESTION_TAG (Many-to-Many)
CREATE TABLE question_tag (
    question_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (question_id, tag_id),
    CONSTRAINT fk_question_tag_question FOREIGN KEY (question_id) REFERENCES question(question_id) ON DELETE CASCADE,
    CONSTRAINT fk_question_tag_tag FOREIGN KEY (tag_id) REFERENCES tag(tag_id) ON DELETE CASCADE
);

-- Add index for tag queries
CREATE INDEX idx_question_tag_tag_id ON question_tag(tag_id);

-- Create views for common queries

-- View for approved public questions
CREATE VIEW public_questions AS
SELECT q.question_id, q.question_text, q.explanation, q.difficulty_level,
       c.category_name, s.subject_name, i.institution_name,
       u.username as creator_username
FROM question q
JOIN category c ON q.category_id = c.category_id
JOIN subject s ON c.subject_id = s.subject_id
JOIN institution i ON q.institution_id = i.institution_id
JOIN users u ON q.user_id = u.user_id
WHERE q.is_approved = TRUE AND q.is_public = TRUE AND q.is_active = TRUE;

-- View for public quizzes with stats
CREATE VIEW public_quiz_stats AS
SELECT q.quiz_id, q.quiz_title, q.description, q.time_limit, q.pass_percentage,
       i.institution_name,
       u.username as creator_username,
       COUNT(qq.question_id) as question_count,
       COUNT(DISTINCT qa.attempt_id) as attempt_count,
       AVG(qa.score) as average_score
FROM quiz q
JOIN institution i ON q.institution_id = i.institution_id
JOIN users u ON q.user_id = u.user_id
LEFT JOIN quiz_question qq ON q.quiz_id = qq.quiz_id
LEFT JOIN quiz_attempt qa ON q.quiz_id = qa.quiz_id AND qa.is_completed = TRUE
WHERE q.is_public = TRUE
GROUP BY q.quiz_id, i.institution_name, u.username;

-- View for user quiz history
CREATE VIEW user_quiz_history AS
SELECT u.user_id, u.username,
       q.quiz_id, q.quiz_title,
       qa.attempt_id, qa.start_time, qa.end_time, qa.score, qa.is_completed,
       CASE WHEN qa.score >= q.pass_percentage THEN TRUE ELSE FALSE END as passed
FROM users u
JOIN quiz_attempt qa ON u.user_id = qa.user_id
JOIN quiz q ON qa.quiz_id = q.quiz_id;




-- Add trigger to update timestamp columns

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tables with updated_at
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_institution_timestamp BEFORE UPDATE ON institution
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_subject_timestamp BEFORE UPDATE ON subject
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_category_timestamp BEFORE UPDATE ON category
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_question_timestamp BEFORE UPDATE ON question
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_quiz_timestamp BEFORE UPDATE ON quiz
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Comments for important tables and columns
COMMENT ON TABLE users IS 'Stores user accounts with role-based permissions';
COMMENT ON COLUMN users.role IS 'Role can be teacher, student, or admin';

COMMENT ON TABLE question IS 'Stores quiz questions with approval workflow';
COMMENT ON COLUMN question.is_approved IS 'Only approved questions can be used in public quizzes';
COMMENT ON COLUMN question.parent_question_id IS 'Self-reference for question variations';

COMMENT ON TABLE quiz IS 'Stores quiz configurations';
COMMENT ON COLUMN quiz.time_limit IS 'Time limit in minutes';
COMMENT ON COLUMN quiz.pass_percentage IS 'Percentage score required to pass the quiz';

COMMENT ON TABLE quiz_attempt IS 'Records of users attempting quizzes';
COMMENT ON COLUMN quiz_attempt.playlist_id IS 'Optional background music playlist used during attempt';

COMMENT ON TABLE background_music IS 'Music tracks for quiz background';
COMMENT ON COLUMN background_music.mood IS 'Categorization of music mood (Study, Relaxing, Energetic)';