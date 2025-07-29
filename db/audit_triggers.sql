-- Creating audit log table (if not already created)
CREATE TABLE IF NOT EXISTS system_audit_log (
  audit_id SERIAL PRIMARY KEY,
  action_type VARCHAR(50) NOT NULL,
  user_id INTEGER REFERENCES users(user_id),
  action_details JSONB NOT NULL,
  action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creating function for music addition logging
CREATE OR REPLACE FUNCTION log_music_addition()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO system_audit_log (action_type, user_id, action_details)
  VALUES (
    'MUSIC_ADDED',
    NEW.uploaded_by,
    jsonb_build_object(
      'music_id', NEW.music_id,
      'title', NEW.title,
      'artist', NEW.artist,
      'file_path', NEW.file_path
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Creating trigger for music addition
CREATE OR REPLACE TRIGGER music_added_trigger
AFTER INSERT ON background_music
FOR EACH ROW
EXECUTE FUNCTION log_music_addition();

-- Creating function for question deletion logging
CREATE OR REPLACE FUNCTION log_question_deletion()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO system_audit_log (action_type, user_id, action_details)
  VALUES (
    'QUESTION_DELETED',
    OLD.user_id,
    jsonb_build_object(
      'question_id', OLD.question_id,
      'question_text', OLD.question_text,
      'deleted_by', TG_ARGV[0]::INTEGER
    )
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Creating trigger for question deletion
CREATE OR REPLACE TRIGGER question_deleted_trigger
AFTER DELETE ON question
FOR EACH ROW
EXECUTE FUNCTION log_question_deletion();

-- Creating function for question creation logging
CREATE OR REPLACE FUNCTION log_question_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO system_audit_log (action_type, user_id, action_details)
  VALUES (
    'QUESTION_CREATED',
    NEW.user_id,
    jsonb_build_object(
      'question_id', NEW.question_id,
      'question_text', NEW.question_text,
      'category_id', NEW.category_id,
      'institution_id', NEW.institution_id,
      'difficulty_level', NEW.difficulty_level,
      'is_public', NEW.is_public
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Creating trigger for question creation
CREATE OR REPLACE TRIGGER question_created_trigger
AFTER INSERT ON question
FOR EACH ROW
EXECUTE FUNCTION log_question_creation();

-- Creating function for quiz creation logging
CREATE OR REPLACE FUNCTION log_quiz_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO system_audit_log (action_type, user_id, action_details)
  VALUES (
    'QUIZ_CREATED',
    NEW.user_id,
    jsonb_build_object(
      'quiz_id', NEW.quiz_id,
      'title', NEW.quiz_title,
      'institution_id', NEW.institution_id,
      'is_public', NEW.is_public
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Creating trigger for quiz creation
CREATE OR REPLACE TRIGGER quiz_created_trigger
AFTER INSERT ON quiz
FOR EACH ROW
EXECUTE FUNCTION log_quiz_creation();