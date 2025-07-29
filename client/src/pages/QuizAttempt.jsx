import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faForward, faBackward, faMusic, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Tilt } from 'react-tilt';
import './QuizAttempt.css';

export default function QuizAttempt() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [tags, setTags] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [availableTracks, setAvailableTracks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayerCollapsed, setIsPlayerCollapsed] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPlaylistForm, setShowPlaylistForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedTrackIds, setSelectedTrackIds] = useState([]);
  const audioRef = useRef(new Audio());
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const shootingStarsRef = useRef([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login', { replace: true });
          return;
        }

        // Fetch user profile, categories, institutions, tags, playlists, and available tracks
        const [profileResponse, categoriesResponse, institutionsResponse, tagsResponse, playlistsResponse, tracksResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/profile', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/categories', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/institutions', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/tags', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/playlists', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/music/available', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser(profileResponse.data.user || {});
        setCategories(categoriesResponse.data || []);
        setInstitutions(institutionsResponse.data || []);
        setTags(tagsResponse.data || []);
        setPlaylists(playlistsResponse.data || []);
        setAvailableTracks(tracksResponse.data || []);
        setSelectedPlaylist(playlistsResponse.data.find(p => p.is_default)?.playlist_id || playlistsResponse.data[0]?.playlist_id || null);

        // Fetch quizzes
        await fetchQuizzes();
      } catch (err) {
        console.error('Fetch initial data error:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        setError(err.response?.data?.error || 'Failed to load data. Please try again.');
        setLoading(false);
      }
    };

    fetchInitialData();

    // Star Canvas Setup
    if (canvasRef.current) {
      resizeCanvas();
      createStars();
      animate();
      window.addEventListener('resize', resizeCanvas);
    }

    audioRef.current.addEventListener('timeupdate', updateProgressBar);
    audioRef.current.addEventListener('ended', nextTrack);
    audioRef.current.addEventListener('loadedmetadata', updateDuration);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      audioRef.current.removeEventListener('timeupdate', updateProgressBar);
      audioRef.current.removeEventListener('ended', nextTrack);
      audioRef.current.removeEventListener('loadedmetadata', updateDuration);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [navigate]);

  useEffect(() => {
    fetchQuizzes();
  }, [selectedCategory, selectedInstitution, selectedTag]);

  useEffect(() => {
    const loadTracks = async () => {
      if (selectedPlaylist) {
        const fetchedTracks = await fetchPlaylistTracks(selectedPlaylist);
        setTracks(fetchedTracks);
        if (fetchedTracks.length > 0) {
          loadTrack(0);
        }
      } else {
        setTracks([]);
        setIsPlaying(false);
        audioRef.current.pause();
      }
    };
    loadTracks();
  }, [selectedPlaylist]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = {};
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedInstitution) params.institution_id = selectedInstitution;
      if (selectedTag) params.tags = selectedTag;

      console.log('Fetching quizzes with params:', params); // Debug log
      const quizzesResponse = await axios.get('http://localhost:5000/api/quizzes/available', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      console.log('Quizzes response:', quizzesResponse.data); // Debug log
      setQuizzes(quizzesResponse.data || []);
      setError(null);
    } catch (err) {
      console.error('Fetch quizzes error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        params,
      });
      setError(err.response?.data?.details || err.response?.data?.error || 'Failed to load quizzes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylistTracks = async (playlistId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/playlists/${playlistId}/tracks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data || [];
    } catch (err) {
      console.error('Fetch playlist tracks error:', err.message);
      setError('Failed to load playlist tracks.');
      return [];
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName || selectedTrackIds.length === 0) {
      setError('Playlist name and at least one track are required.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const playlistResponse = await axios.post(
        'http://localhost:5000/api/playlists',
        { playlist_name: newPlaylistName, description: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newPlaylistId = playlistResponse.data.playlist.playlist_id;

      for (let i = 0; i < selectedTrackIds.length; i++) {
        await axios.post(
          `http://localhost:5000/api/playlists/${newPlaylistId}/tracks`,
          { music_id: selectedTrackIds[i] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const updatedPlaylists = await axios.get('http://localhost:5000/api/playlists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists(updatedPlaylists.data || []);
      setSelectedPlaylist(newPlaylistId);
      setNewPlaylistName('');
      setSelectedTrackIds([]);
      setShowPlaylistForm(false);
      setError(null);
    } catch (err) {
      console.error('Create playlist error:', err.message);
      setError(err.response?.data?.error || 'Failed to create playlist.');
    }
  };

  const resizeCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createStars();
  };

  const createStars = () => {
    if (!canvasRef.current) return;
    starsRef.current = [];
    for (let i = 0; i < 200; i++) {
      starsRef.current.push({
        x: Math.random() * canvasRef.current.width,
        y: Math.random() * canvasRef.current.height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.5,
      });
    }
  };

  const createShootingStar = () => {
    if (!canvasRef.current) return;
    const startX = Math.random() * canvasRef.current.width;
    const startY = Math.random() * canvasRef.current.height * 0.3;
    const length = Math.random() * 50 + 50;
    const angle = Math.PI / 4;
    shootingStarsRef.current.push({
      x: startX,
      y: startY,
      endX: startX + length * Math.cos(angle),
      endY: startY + length * Math.sin(angle),
      progress: 0,
      speed: Math.random() * 0.02 + 0.01,
      opacity: 1,
    });
  };

  const drawStars = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = 'white';
    starsRef.current.forEach((star) => {
      ctx.globalAlpha = star.opacity;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    shootingStarsRef.current.forEach((star) => {
      ctx.globalAlpha = star.opacity;
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      const currentX = star.x + (star.endX - star.x) * star.progress;
      const currentY = star.y + (star.endY - star.y) * star.progress;
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  };

  const updateShootingStars = () => {
    shootingStarsRef.current = shootingStarsRef.current.filter((star) => star.progress < 1);
    shootingStarsRef.current.forEach((star) => {
      star.progress += star.speed;
      star.opacity = 1 - star.progress;
    });
    if (Math.random() < 0.005) {
      createShootingStar();
    }
  };

  let animationFrameId = null;
  const animate = () => {
    updateShootingStars();
    drawStars();
    animationFrameId = requestAnimationFrame(animate);
  };

  const loadTrack = (index) => {
    if (tracks.length === 0) return;
    audioRef.current.src = tracks[index].file_path;
    setCurrentTrackIndex(index);
    audioRef.current.load();
    updateDuration();
    if (isPlaying) playTrack();
  };

  const playTrack = () => {
    audioRef.current
      .play()
      .catch((err) => console.error('Audio play error:', err));
    setIsPlaying(true);
  };

  const pauseTrack = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
    loadTrack(nextIndex);
  };

  const prevTrack = () => {
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIndex);
    loadTrack(prevIndex);
  };

  const updateProgressBar = () => {
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration);
  };

  const updateDuration = () => {
    setDuration(audioRef.current.duration);
  };

  const setProgress = (e) => {
    const width = e.currentTarget.clientWidth;
    const clickX = e.nativeEvent.offsetX;
    const duration = audioRef.current.duration;
    audioRef.current.currentTime = (clickX / width) * duration;
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMusicPlayer = () => {
    setIsPlayerCollapsed(!isPlayerCollapsed);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedInstitution('');
    setSelectedTag('');
  };

  const handleQuizSelect = (quizId) => {
    navigate(`/quiz-attempt/${quizId}`, { state: { selectedPlaylist } });
  };

  const toggleTrackSelection = (trackId) => {
    setSelectedTrackIds((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 relative">
      {/* Star Canvas Background */}
      <canvas
        id="star-canvas"
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full z-[-1]"
      ></canvas>

      {/* Music Player */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-900/80 backdrop-blur-lg text-white transition-all duration-300 ease-in-out ${
          isPlayerCollapsed ? '-translate-x-full' : 'translate-x-0'
        } w-64 z-20 shadow-2xl rounded-r-2xl`}
      >
        <button
          className="absolute top-4 right-4 p-3 rounded-full hover:bg-gradient-to-r from-gray-700 to-gray-800 transition-all group relative"
          onClick={toggleMusicPlayer}
          aria-label="Collapse music player"
        >
          <FontAwesomeIcon icon={faMusic} className="w-6 h-6 text-white" />
          <span className="tooltip group-hover:opacity-95">Close</span>
        </button>
        <div className="p-6 flex flex-col h-full">
          <h2 className="text-2xl font-bold mb-6 text-white">Now Playing</h2>
          <div className="track-info flex-1">
            <h3 className="text-xl font-semibold text-white">
              {tracks[currentTrackIndex]?.title || 'Select a Playlist'}
            </h3>
            <p className="text-sm text-gray-300">{tracks[currentTrackIndex]?.artist || ''}</p>
            <div className="controls flex justify-center gap-6 mt-4 mb-6">
              <button
                aria-label="Previous track"
                onClick={prevTrack}
                className="p-3 rounded-full hover:bg-gradient-to-r from-gray-700 to-gray-800 transition-all group relative"
              >
                <FontAwesomeIcon icon={faBackward} className="w-8 h-8 text-white" />
                <span className="tooltip group-hover:opacity-95">Previous</span>
              </button>
              <button
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 transition-all"
                onClick={() => (isPlaying ? pauseTrack() : playTrack())}
              >
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="w-6 h-6" />
              </button>
              <button
                aria-label="Next track"
                onClick={nextTrack}
                className="p-3 rounded-full hover:bg-gradient-to-r from-gray-700 to-gray-800 transition-all group relative"
              >
                <FontAwesomeIcon icon={faForward} className="w-8 h-8 text-white" />
                <span className="tooltip group-hover:opacity-95">Next</span>
              </button>
            </div>
            <div className="progress-container">
              <div className="time-info flex justify-between text-sm text-gray-300 mb-3">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div
                className="progress-bar-container bg-gray-700/50 h-2 rounded-full cursor-pointer shadow-inner"
                onClick={setProgress}
              >
                <div
                  className="progress-bar bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full shadow-lg"
                  style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-gray-400 text-sm mb-2">Select Playlist</label>
              <select
                value={selectedPlaylist || ''}
                onChange={(e) => setSelectedPlaylist(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a Playlist</option>
                {playlists.map((playlist) => (
                  <option key={playlist.playlist_id} value={playlist.playlist_id}>
                    {playlist.playlist_name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowPlaylistForm(!showPlaylistForm)}
                className="mt-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-800 transition-all flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                {showPlaylistForm ? 'Cancel' : 'Create Playlist'}
              </button>
            </div>
            {showPlaylistForm && (
              <div className="mt-4">
                <label className="block text-gray-400 text-sm mb-2">New Playlist Name</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter playlist name"
                />
                <label className="block text-gray-400 text-sm mb-2">Select Tracks</label>
                <div className="max-h-40 overflow-y-auto">
                  {availableTracks.map((track) => (
                    <div key={track.music_id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={selectedTrackIds.includes(track.music_id)}
                        onChange={() => toggleTrackSelection(track.music_id)}
                        className="mr-2"
                      />
                      <span className="text-gray-300">{track.title} - {track.artist || 'Unknown'}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={createPlaylist}
                  className="mt-4 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all"
                >
                  Save Playlist
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
      <button
        className={`fixed top-4 left-4 p-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-full hover:bg-gradient-to-r from-blue-500 to-blue-600 transition-all z-20 shadow-lg ${
          isPlayerCollapsed ? 'block' : 'hidden'
        } group relative`}
        onClick={toggleMusicPlayer}
        aria-label="Expand music player"
      >
        <FontAwesomeIcon icon={faMusic} className="w-6 h-6" />
        <span className="tooltip group-hover:opacity-95">Open Player</span>
      </button>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        <Tilt className="flex justify-between items-center mb-12" options={{ max: 15, scale: 1.02 }}>
          <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
            Select a Quiz to Attempt
          </h1>
        </Tilt>

        {/* Filter Dropdowns */}
        <div className="bg-gradient-to-br from-blue-900/60 to-purple-900/60 backdrop-blur-2xl rounded-3xl p-6 mb-8 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white">Filter Quizzes</h2>
            <button
              onClick={handleClearFilters}
              className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-2 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all shadow-md"
            >
              Clear Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Category</label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Institution</label>
              <select
                value={selectedInstitution || ''}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Institutions</option>
                {institutions.map((inst) => (
                  <option key={inst.institution_id} value={inst.institution_id}>
                    {inst.institution_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Tag</label>
              <select
                value={selectedTag || ''}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Tags</option>
                {tags.map((tag) => (
                  <option key={tag.tag_id} value={tag.tag_id}>
                    {tag.tag_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading && <p className="text-gray-300 text-center text-xl font-semibold">Loading quizzes...</p>}

        {error && (
          <div className="bg-red-600/80 text-white p-6 rounded-2xl mb-8 shadow-lg">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && quizzes.length === 0 && (
          <p className="text-gray-300 text-center text-xl font-semibold">No quizzes available to attempt.</p>
        )}

        {!loading && !error && quizzes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Tilt key={quiz.quiz_id} className="card" options={{ max: 15, scale: 1.02 }}>
                <div
                  className="p-6 bg-gradient-to-br from-blue-900/60 to-purple-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-blue-500/30 transition-all hover:-translate-y-2 hover:shadow-[0_8px_40px_10px_rgba(99,102,241,0.25)]"
                  style={{
                    boxShadow: '0 8px 40px 10px rgba(99,102,241,0.15), 0 1.5px 8px 0 rgba(0,0,0,0.15)',
                    border: '1.5px solid rgba(99,102,241,0.18)',
                  }}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">{quiz.quiz_title}</h3>
                  <p className="text-gray-300 text-sm mb-3">{quiz.description || 'No description'}</p>
                  <p className="text-gray-300 text-sm mb-2">Institution: {quiz.institution_name || 'N/A'}</p>
                  <p className="text-gray-300 text-sm mb-2">
                    Time Limit: {quiz.time_limit ? `${quiz.time_limit} minutes` : 'None'}
                  </p>
                  <p className="text-gray-300 text-sm mb-4">
                    Pass Percentage: {quiz.pass_percentage ? `${quiz.pass_percentage}%` : 'N/A'}
                  </p>
                  <p className="text-gray-300 text-sm mb-4">
                    Match Score: {quiz.match_percentage.toFixed(2)}%
                  </p>
                  <button
                    onClick={() => handleQuizSelect(quiz.quiz_id)}
                    className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-800 transition-all flex items-center shadow-md hover:shadow-xl hover:scale-105"
                  >
                    <FontAwesomeIcon icon={faPlay} className="mr-2" />
                    Attempt Quiz
                  </button>
                </div>
              </Tilt>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}