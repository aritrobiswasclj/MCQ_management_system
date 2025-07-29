import express from 'express';
import pool from '../config/db.js';
import authenticateToken from './authMiddleware.js';

const router = express.Router();

// Get all playlists for the authenticated user
router.get('/playlists', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const result = await pool.query(
      'SELECT playlist_id, playlist_name, description, is_default FROM playlist WHERE user_id = $1 ORDER BY is_default DESC, playlist_name',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching playlists:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch playlists', details: err.message });
  }
});

// Get tracks for a specific playlist
router.get('/playlists/:playlistId/tracks', authenticateToken, async (req, res) => {
  const { playlistId } = req.params;
  try {
    const playlistIdNum = parseInt(playlistId);
    if (isNaN(playlistIdNum)) {
      return res.status(400).json({ error: 'Invalid playlist ID' });
    }

    // Verify playlist belongs to user
    const playlistCheck = await pool.query(
      'SELECT 1 FROM playlist WHERE playlist_id = $1 AND user_id = $2',
      [playlistIdNum, req.user.user_id]
    );
    if (playlistCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied: Playlist not found or not owned by user' });
    }

    const result = await pool.query(
      `SELECT bm.music_id, bm.title, bm.artist, bm.file_path
       FROM playlist_music pm
       JOIN background_music bm ON pm.music_id = bm.music_id
       WHERE pm.playlist_id = $1
       ORDER BY pm.track_order`,
      [playlistIdNum]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching playlist tracks:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch playlist tracks', details: err.message });
  }
});

// Create a playlist
router.post('/playlists', authenticateToken, async (req, res) => {
  const { playlist_name, description } = req.body;
  const user_id = req.user.user_id;

  try {
    if (!playlist_name) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }

    const result = await pool.query(
      'INSERT INTO playlist (user_id, playlist_name, description, is_default) VALUES ($1, $2, $3, FALSE) RETURNING playlist_id, playlist_name',
      [user_id, playlist_name, description || null]
    );
    res.status(201).json({ message: 'Playlist created successfully', playlist: result.rows[0] });
  } catch (err) {
    console.error('Error creating playlist:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to create playlist', details: err.message });
  }
});

// Add track to playlist
router.post('/playlists/:playlistId/tracks', authenticateToken, async (req, res) => {
  const { playlistId } = req.params;
  const { music_id } = req.body;
  const user_id = req.user.user_id;

  try {
    const playlistIdNum = parseInt(playlistId);
    if (isNaN(playlistIdNum) || !music_id) {
      return res.status(400).json({ error: 'Invalid playlist ID or music ID' });
    }

    // Verify playlist belongs to user
    const playlistCheck = await pool.query(
      'SELECT 1 FROM playlist WHERE playlist_id = $1 AND user_id = $2',
      [playlistIdNum, user_id]
    );
    if (playlistCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied: Playlist not found or not owned by user' });
    }

    // Verify music exists and is non-copyright
    const musicCheck = await pool.query(
      'SELECT 1 FROM background_music WHERE music_id = $1 AND is_non_copyright = TRUE',
      [music_id]
    );
    if (musicCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Music not found or not available' });
    }

    // Get next track order
    const trackOrderResult = await pool.query(
      'SELECT COALESCE(MAX(track_order), 0) + 1 AS next_order FROM playlist_music WHERE playlist_id = $1',
      [playlistIdNum]
    );
    const track_order = trackOrderResult.rows[0].next_order;

    await pool.query(
      'INSERT INTO playlist_music (playlist_id, music_id, track_order) VALUES ($1, $2, $3)',
      [playlistIdNum, music_id, track_order]
    );
    res.status(201).json({ message: 'Track added to playlist successfully' });
  } catch (err) {
    console.error('Error adding track to playlist:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to add track to playlist', details: err.message });
  }
});

// Get all available non-copyright tracks
router.get('/music/available', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT music_id, title, artist, file_path FROM background_music WHERE is_non_copyright = TRUE ORDER BY title'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching available tracks:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch available tracks', details: err.message });
  }
});

export default router;