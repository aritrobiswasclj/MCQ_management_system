/* SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'public_questions';
 */

SELECT music_id, title, artist, file_path, is_non_copyright FROM background_music WHERE is_non_copyright = TRUE;