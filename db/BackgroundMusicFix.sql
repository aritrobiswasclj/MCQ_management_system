/* ALTER TABLE background_music
ADD COLUMN uploaded_by INTEGER,
ADD CONSTRAINT fk_background_music_user FOREIGN KEY (uploaded_by) REFERENCES users(user_id); */

/* ALTER TABLE background_music
ADD COLUMN is_non_copyright BOOLEAN DEFAULT TRUE; */

update background_music

set file_path  = 'db/' || file_path

where file_path not like 'db/%';
commit;