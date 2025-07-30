import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from "axios";
import "./QuestionLoader.css";
import { faArrowCircleLeft, faBackward, faEarth, faForward, faMoon, faMusic, faPause, faPauseCircle, faPlayCircle, faSackDollar, faSun } from "@fortawesome/free-solid-svg-icons";

const QuestionLoader = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const [quizDetails, setQuizDetails] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [firstAnswerSelected, setFirstAnswerSelected] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme") === "dark" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );


  
  const [isPlayerCollapsed, setIsPlayerCollapsed] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [tracks, setTracks] = useState([]);
  const audioRef = useRef(new Audio());
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const shootingStarsRef = useRef([]);
  const BACKEND_URL = 'http://localhost:5000';

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)")).matches
    ) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
    fetchInitialData();

    if (canvasRef.current) {
      resizeCanvas();
      createStars();
      animate();
      window.addEventListener("resize", resizeCanvas);
    }

    audioRef.current.addEventListener("timeupdate", updateProgressBar);
    audioRef.current.addEventListener("ended", nextTrack);
    audioRef.current.addEventListener("loadedmetadata", updateDuration);
    audioRef.current.addEventListener("error", handleAudioError);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      audioRef.current.removeEventListener("timeupdate", updateProgressBar);
      audioRef.current.removeEventListener("ended", nextTrack);
      audioRef.current.removeEventListener("loadedmetadata", updateDuration);
      audioRef.current.removeEventListener("error", handleAudioError);
      audioRef.current.pause();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      document.documentElement.classList.remove("dark");
    };
  }, []);

  useEffect(() => {
    let timerInterval = null;
    if (isTimerRunning && quizDetails?.time_limit) {
      timerInterval = setInterval(() => {
        setTimer((prev) => {
          const newTime = prev + 1;
          if (newTime >= quizDetails.time_limit * 60) {
            completeQuiz();
            return prev;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [isTimerRunning, quizDetails]);

  useEffect(() => {
    const loadTracks = async () => {
      const selectedPlaylist = location.state?.selectedPlaylist;
      if (!selectedPlaylist) {
        setError('No playlist selected. Please go back and select a playlist.');
        setTracks([]);
        setCurrentTrackIndex(0);
        setIsPlaying(false);
        audioRef.current.pause();
        audioRef.current.src = '';
        return;
      }

      try {
        const fetchedTracks = await fetchPlaylistTracks(selectedPlaylist);
        if (fetchedTracks.length === 0) {
          setError('No tracks found in the selected playlist.');
          setTracks([]);
          setCurrentTrackIndex(0);
          setIsPlaying(false);
          audioRef.current.pause();
          audioRef.current.src = '';
          return;
        }
        setTracks(fetchedTracks);
        setCurrentTrackIndex(0);
        setTimeout(() => {
          if (fetchedTracks.length > 0 && tracks.length > 0) {
            loadTrack(0);
          }
        }, 0);
      } catch (err) {
        console.error('Error loading tracks:', err);
        setError('Failed to load playlist tracks.');
        setTracks([]);
        setCurrentTrackIndex(0);
        setIsPlaying(false);
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
    loadTracks();
  }, [location.state?.selectedPlaylist]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const attemptResponse = await axios.post(
        `${BACKEND_URL}/api/quiz-attempt/start`,
        { quiz_id: quizId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttemptId(attemptResponse.data.attempt_id);

      const [quizResponse, questionsResponse] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BACKEND_URL}/api/quizzes/${quizId}/questions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setQuizDetails(quizResponse.data);

      if (!Array.isArray(questionsResponse.data) || questionsResponse.data.length === 0) {
        setError('No questions available for this quiz.');
        setQuestions([]);
      } else {
        const fetchedQuestions = questionsResponse.data
          .sort((a, b) => a.display_order - b.display_order)
          .map((q) => ({
            ...q,
            selectedOption: null,
            showExplanation: false,
          }));
        setQuestions(fetchedQuestions);

        const categoryCounts = fetchedQuestions.reduce((acc, q) => {
          acc[q.category_name] = (acc[q.category_name] || 0) + 1;
          return acc;
        }, {});
        setCategories(
          Object.entries(categoryCounts).map(([name, count]) => ({ name, count }))
        );
      }

      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          `Failed to load quiz data: ${err.message}. Please try again.`
      );
      setLoading(false);
    }
  };

  const fetchPlaylistTracks = async (playlistId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BACKEND_URL}/api/playlists/${playlistId}/tracks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tracks = response.data || [];
      return tracks;
    } catch (err) {
      throw err;
    }
  };

  const handleOptionClick = async (questionId, option) => {
    if (!hasStarted) return;
    const question = questions.find((q) => q.question_id === questionId);
    if (question.selectedOption !== null) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BACKEND_URL}/api/question-response`,
        {
          attempt_id: attemptId,
          question_id: questionId,
          selected_option_id: option.option_id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQuestions(
        questions.map((q) => {
          if (q.question_id === questionId) {
            return {
              ...q,
              selectedOption: option.option_id,
              showExplanation: false,
            };
          }
          return q;
        })
      );

      if (!firstAnswerSelected) {
        setFirstAnswerSelected(true);
        setIsTimerRunning(true);
      }
    } catch (err) {
      setError("Failed to submit response. Please try again.");
    }
  };

  const completeQuiz = async () => {
    try {
      setIsTimerRunning(false);
      setIsPlaying(false);
      audioRef.current.pause();
      const token = localStorage.getItem("token");

      const updatedQuestions = questions.map((q) => ({
        ...q,
        showExplanation: true,
        selectedOption: q.selectedOption || null,
      }));
      setQuestions(updatedQuestions);

      await axios.post(
        `${BACKEND_URL}/api/quiz-attempt/${attemptId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate(`/quiz-result/${attemptId}`);
    } catch (err) {
      setError("Failed to complete quiz. Please try again.");
    }
  };

  const goBack = () => {
    setIsPlaying(false);
    audioRef.current.pause();
    navigate('/quiz-attempt');
  };

  const startQuiz = () => {
    setHasStarted(true);
    if (quizDetails?.time_limit) {
      setIsTimerRunning(true);
    }
    if (tracks.length > 0) {
      playTrack();
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
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = "white";
    starsRef.current.forEach((star) => {
      ctx.globalAlpha = star.opacity;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = "white";
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
    shootingStarsRef.current = shootingStarsRef.current.filter(
      (star) => star.progress < 1
    );
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

  const handleAudioError = (e) => {
    let status = null;
    let errorMessage = 'Unknown error';
    if (e.target && e.target.error) {
      errorMessage = e.target.error.message || 'Unknown error';
    }
    try {
      fetch(audioRef.current.src).then(response => {
        status = response.status;
        setError(`Failed to load audio: ${errorMessage}${status ? ` (HTTP ${status})` : ''}`);
        if (tracks.length > 0) {
          nextTrack();
        }
      }).catch(fetchErr => {
        setError(`Failed to load audio: ${errorMessage}`);
        if (tracks.length > 0) {
          nextTrack();
        }
      });
    } catch (err) {
      setError(`Failed to load audio: ${errorMessage}`);
      if (tracks.length > 0) {
        nextTrack();
      }
    }
  };

  const loadTrack = (index) => {
    if (!tracks || tracks.length === 0 || index < 0 || index >= tracks.length) {
      setError('No valid tracks available in the playlist.');
      setIsPlaying(false);
      audioRef.current.pause();
      audioRef.current.src = '';
      setCurrentTrackIndex(0);
      return;
    }

    const track = tracks[index];
    if (!track || !track.file_path) {
      setError(`Invalid track: ${track?.title || 'Unknown'} at index ${index}`);
      nextTrack();
      return;
    }

    const filePath = track.file_path.replace(/^db\/assets\/musics\//, '/musics/');
    const audioSrc = `${BACKEND_URL}${filePath}`;
    audioRef.current.src = audioSrc;
    setCurrentTrackIndex(index);
    audioRef.current.load();

    const onCanPlay = () => {
      updateDuration();
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          setError(`Failed to play track: ${track.title || 'Unknown'}`);
          nextTrack();
        });
      }
      audioRef.current.removeEventListener('canplay', onCanPlay);
    };
    audioRef.current.addEventListener('canplay', onCanPlay);
  };

  const playTrack = () => {
    if (!hasStarted) return;
    if (!tracks || tracks.length === 0) {
      setError('No tracks available to play.');
      setIsPlaying(false);
      return;
    }

    if (audioRef.current.src && audioRef.current.readyState >= 2) {
      audioRef.current.play().catch((err) => {
        setError(`Failed to play track: ${tracks[currentTrackIndex]?.title || 'Unknown'}`);
        if (tracks.length > 0) {
          nextTrack();
        }
      });
      setIsPlaying(true);
    } else {
      const onCanPlay = () => {
        audioRef.current.play().catch((err) => {
          setError(`Failed to play track: ${tracks[currentTrackIndex]?.title || 'Unknown'}`);
          if (tracks.length > 0) {
            nextTrack();
          }
        });
        setIsPlaying(true);
        audioRef.current.removeEventListener('canplay', onCanPlay);
      };
      audioRef.current.addEventListener('canplay', onCanPlay);
      if (!audioRef.current.src) {
        loadTrack(currentTrackIndex);
      }
    }
  };

  const pauseTrack = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const nextTrack = () => {
    if (!hasStarted) return;
    if (!tracks || tracks.length === 0) {
      setError('No tracks available to play.');
      setIsPlaying(false);
      audioRef.current.pause();
      audioRef.current.src = '';
      setCurrentTrackIndex(0);
      return;
    }
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
    loadTrack(nextIndex);
    if (isPlaying) {
      setTimeout(() => playTrack(), 100);
    }
  };

  const prevTrack = () => {
    if (!hasStarted) return;
    if (!tracks || tracks.length === 0) {
      setError('No tracks available to play.');
      setIsPlaying(false);
      audioRef.current.pause();
      audioRef.current.src = '';
      setCurrentTrackIndex(0);
      return;
    }
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIndex);
    loadTrack(prevIndex);
    if (isPlaying) {
      setTimeout(() => playTrack(), 100);
    }
  };

  const updateProgressBar = () => {
    if (isFinite(audioRef.current.currentTime)) {
      setCurrentTime(audioRef.current.currentTime);
    }
    if (isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const updateDuration = () => {
    if (isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    } else {
      setDuration(0);
    }
  };

  const setProgress = (e) => {
    if (!hasStarted) return;
    const width = e.currentTarget.clientWidth;
    const clickX = e.nativeEvent.offsetX;
    const duration = audioRef.current.duration;
    if (isFinite(duration) && duration > 0) {
      audioRef.current.currentTime = (clickX / width) * duration;
    }
  };

  const toggleTheme = () => {
    if (!hasStarted) return;
    setIsDark(!isDark);
    localStorage.setItem("theme", !isDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark");
  };

  const toggleMusicPlayer = () => {
    if (!hasStarted) return;
    setIsPlayerCollapsed(!isPlayerCollapsed);
  };

  const formatTime = (seconds) => {
    if (!isFinite(seconds)) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCategoryClick = (categoryName) => {
    if (!hasStarted) return;
    setSelectedCategory(categoryName);
  };

  const filteredQuestions = selectedCategory
    ? questions.filter((q) => q.category_name === selectedCategory)
    : questions;

  const questionColors = [
    "from-blue-500 to-blue-700",
    "from-purple-500 to-purple-700",
    "from-teal-500 to-teal-700",
    "from-indigo-500 to-indigo-700",
    "from-cyan-500 to-cyan-700",
  ];

  return (
    <div className={`min-h-screen ${isDark ? "dark" : ""} bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900`}>
      <canvas
        id="star-canvas"
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full z-[-1]"
      ></canvas>
      <div className="tree-silhouette fixed bottom-0 left-0 w-full h-32 z-1 opacity-40"></div>

      <div className={`quiz-content ${hasStarted ? "" : "blurred"}`}>
        <aside
          className={`fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900/90 to-indigo-900/90 backdrop-blur-xl text-white transition-all duration-500 ease-in-out ${
            isPlayerCollapsed ? "-translate-x-full" : "translate-x-0"
          } w-80 z-20 shadow-2xl rounded-r-3xl`}
        >
          <button
            className="absolute top-4 right-4 p-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all group relative"
            onClick={toggleMusicPlayer}
            aria-label="Collapse music player"
          >
            
            <FontAwesomeIcon icon={faMusic} className="w-8 h-8 text-white" />
            <span className="tooltip group-hover:opacity-95">Close Player</span>
          </button>
          <div className="p-8 flex flex-col h-full">
            <h2 className="text-3xl font-bold mb-8 text-white tracking-wide">Now Playing</h2>
            <div className="track-info flex-1">
              <h3 className="text-2xl font-semibold text-white mb-2">
                {tracks.length > 0 && tracks[currentTrackIndex]?.title
                  ? tracks[currentTrackIndex].title
                  : 'No Track Selected'}
              </h3>
              <p className="text-sm text-indigo-200 mb-6">
                {tracks.length > 0 && tracks[currentTrackIndex]?.artist
                  ? tracks[currentTrackIndex].artist
                  : ''}
              </p>
              <div className="controls flex justify-center gap-4 mb-6">
                <button
                  aria-label="Previous track"
                  onClick={prevTrack}
                  className="p-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 group relative"
                  disabled={tracks.length === 0 || !hasStarted}
                >
                  
                  <FontAwesomeIcon icon={faBackward} className="w-8 h-8 text-white" />
                  <span className="tooltip group-hover:opacity-95">Previous</span>
                </button>
                <button
                  id="play-pause"
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="play-pause p-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all transform hover:scale-110 shadow-lg"
                  onClick={() => (isPlaying ? pauseTrack() : playTrack())}
                  disabled={tracks.length === 0 || !hasStarted}
                >
                  {isPlaying ? (
                    <FontAwesomeIcon icon={faPauseCircle} className="w-8 h-8 text-white" />
                  ) : (
                    <FontAwesomeIcon icon={faPlayCircle} className="w-8 h-8 text-white" />
                  )}
                  
                </button>
                <button
                  aria-label="Next track"
                  onClick={nextTrack}
                  className="p-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 group relative"
                  disabled={tracks.length === 0 || !hasStarted}
                >
                  
                  <FontAwesomeIcon icon={faForward} className="w-8 h-8 text-white" />
                  <span className="tooltip group-hover:opacity-95">Next</span>
                </button>
              </div>
              <div className="progress-container">
                <div className="time-info flex justify-between text-sm text-indigo-200 mb-3">
                  <span id="current-time">{formatTime(currentTime)}</span>
                  <span id="duration">{formatTime(duration)}</span>
                </div>
                <div
                  className="progress-bar-container bg-gray-800/50 h-3 rounded-full cursor-pointer shadow-inner"
                  onClick={setProgress}
                >
                  <div
                    className="progress-bar bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full shadow-lg"
                    style={{ width: `${isFinite(duration) && duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </aside>
        <button
          className={`fixed top-4 left-4 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all z-20 shadow-lg ${
            isPlayerCollapsed ? "block" : "hidden"
          } group relative`}
          onClick={toggleMusicPlayer}
          aria-label="Expand music player"
        >
          
          <FontAwesomeIcon icon={faMusic} className="w-8 h-8 text-white" />
          <span className="tooltip group-hover:opacity-95">Open Player</span>
        </button>

        <main className="container mx-auto px-6 py-16 max-w-5xl relative z-10">
          <header className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6">
            <div className="flex items-center gap-6">
              <button
                className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:scale-105"
                onClick={goBack}
                aria-label="Back to quizzes"
              >
                <FontAwesomeIcon icon={faArrowCircleLeft} className="w-6 h-6" />

                
              </button>
              <h1 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {quizDetails?.quiz_title || "Focus"}
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-xl font-semibold text-white bg-gradient-to-r from-indigo-800/80 to-purple-800/80 px-8 py-3 rounded-xl shadow-xl">
                {formatTime(timer)}
              </span>
              <button
                className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                onClick={completeQuiz}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Submit Quiz (
                {questions.filter((q) => q.selectedOption !== null).length}/
                {questions.length})
              </button>
              <button
                className="theme-toggle p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:scale-105"
                onClick={toggleTheme}
                aria-label={
                  isDark ? "Switch to light theme" : "Switch to dark theme"
                }
              >
                {isDark ? (
                  <FontAwesomeIcon icon={faMoon} className="w-5 h-5" />
                ) : (
                  <FontAwesomeIcon icon={faSun} className="w-5 h-5" />
                )}
              </button>
            </div>
          </header>

          {loading && (
            <p className="text-gray-200 text-center text-xl font-semibold bg-gradient-to-r from-indigo-800/80 to-purple-800/80 p-6 rounded-2xl shadow-lg">
              Loading quiz...
            </p>
          )}
          {error && (
            <div className="bg-red-600/90 text-white p-6 rounded-2xl mb-8 shadow-lg backdrop-blur-sm">
              <p>{error}</p>
            </div>
          )}
          {!loading && !error && questions.length === 0 && (
            <p className="text-gray-200 text-center font-semibold bg-gradient-to-r from-indigo-800/80 to-purple-800/80 p-6 rounded-2xl shadow-lg">
              No questions available for this quiz.
            </p>
          )}
          {!loading && !error && questions.length > 0 && filteredQuestions.length === 0 && (
            <p className="text-gray-200 text-center font-semibold bg-gradient-to-r from-indigo-800/80 to-purple-800/80 p-6 rounded-2xl shadow-lg">
              No questions match the selected category.
            </p>
          )}

          {!loading &&
            !error &&
            filteredQuestions.length > 0 && (
              <>
                {categories.length > 0 && (
                  <div className="mb-12 flex flex-wrap justify-center gap-4">
                    {categories.map((category) => (
                      <button
                        key={category.name}
                        className={`px-8 py-3 rounded-full text-white font-semibold text-sm tracking-wide transition-all transform hover:scale-105 shadow-lg ${
                          selectedCategory === category.name
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                            : "bg-gradient-to-r from-indigo-800 to-purple-800 hover:bg-gradient-to-r from-blue-500 to-indigo-500"
                        }`}
                        onClick={() => handleCategoryClick(category.name)}
                      >
                        {category.name} ({category.count})
                      </button>
                    ))}
                    <button
                      className={`px-8 py-3 rounded-full text-white font-semibold text-sm tracking-wide transition-all transform hover:scale-105 shadow-lg ${
                        selectedCategory === null
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                          : "bg-gradient-to-r from-indigo-800 to-purple-800 hover:bg-gradient-to-r from-blue-500 to-indigo-500"
                      }`}
                      onClick={() => setSelectedCategory(null)}
                    >
                      All
                    </button>
                  </div>
                )}
                <div id="questions-container" className="space-y-8">
                  {filteredQuestions.map((q, index) => {
                    const colorIndex = index % questionColors.length;
                    return (
                      <article
                        key={q.question_id}
                        className={`
                          question-box
                          rounded-3xl
                          p-10
                          shadow-2xl
                          bg-gradient-to-br from-indigo-900/70 via-purple-900/50 to-blue-900/70
                          backdrop-blur-2xl
                          border-0
                          ring-2 ring-indigo-500/40
                          transition-all
                          hover:-translate-y-2
                          hover:shadow-[0_10px_50px_12px_rgba(79,70,229,0.3)]
                          animate-float
                        `}
                        style={{
                          boxShadow:
                            "0 10px 50px 12px rgba(79,70,229,0.2), 0 2px 10px 0 rgba(0,0,0,0.15)",
                          border: "1.5px solid rgba(79,70,229,0.2)",
                        }}
                      >
                        <div className="mb-6">
                          <p className="text-xl font-semibold text-white">
                            <span
                              className={`font-bold text-gradient-${colorIndex} mr-3 text-2xl`}
                            >
                              {index + 1}.
                            </span>{" "}
                            {q.question_text}
                          </p>
                        </div>
                        <div className="flex justify-between items-center mb-6">
                          <span className="bg-indigo-100/80 text-indigo-900 text-sm font-medium px-4 py-1.5 rounded-full shadow-sm">
                            {q.category_name}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-full">
                          {q.options.map((opt, optIndex) => (
                            <div
                              key={opt.option_id}
                              className={`
                                option
                                flex items-center
                                p-5
                                rounded-2xl
                                bg-gradient-to-r from-indigo-800/60 via-purple-800/50 to-blue-800/60
                                border-2
                                border-transparent
                                shadow-lg
                                transition-all duration-300
                                hover:scale-105
                                hover:shadow-[0_0_30px_6px_rgba(99,102,241,0.3)]
                                cursor-pointer
                                ${
                                  q.selectedOption === opt.option_id
                                    ? "ring-4 ring-indigo-400/60 bg-gradient-to-r from-blue-600/80 to-indigo-600/80"
                                    : q.selectedOption !== null
                                    ? "opacity-60 cursor-not-allowed"
                                    : ""
                                }
                                animate-fade-in delay-${optIndex * 100}
                              `}
                              onClick={() =>
                                !q.selectedOption &&
                                handleOptionClick(q.question_id, opt)
                              }
                              style={{
                                boxShadow:
                                  q.selectedOption === opt.option_id
                                    ? "0 0 30px 10px rgba(79,70,229,0.3)"
                                    : "0 2px 15px 0 rgba(99,102,241,0.15)",
                              }}
                            >
                              <div
                                className={`
                                  option-circle
                                  w-10 h-10
                                  rounded-full
                                  border-2
                                  flex items-center justify-center
                                  mr-5
                                  font-bold
                                  text-white
                                  text-lg
                                  shadow-inner
                                  ${
                                    q.selectedOption === opt.option_id
                                      ? "bg-indigo-500/80 border-indigo-300"
                                      : "bg-gradient-to-br from-indigo-900/80 to-purple-900/70 border-indigo-400/50"
                                  }
                                `}
                              >
                                {String.fromCharCode(65 + optIndex)}
                              </div>
                              <p className="text-white text-lg font-medium tracking-wide text-shadow-sm">
                                {opt.option_text}
                              </p>
                            </div>
                          ))}
                        </div>
                        {q.showExplanation && (
                          <div className="mt-4 p-4 bg-indigo-900/40 backdrop-blur-sm rounded-lg flex items-start shadow-inner animate-fade-in">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-indigo-400 mt-0.5 mr-2 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <p className="text-indigo-200 text-sm leading-relaxed">
                              {q.explanation || "No explanation provided."}
                            </p>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </>
            )}
        </main>
      </div>

      {!hasStarted && (
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900/90 to-indigo-900/90 backdrop-blur-sm"
          style={{ zIndex: 9999 }}
        >
          <div className="absolute top-1/3 -translate-y-1/2">
            <button
              className="start-button px-16 py-8 text-3xl font-extrabold text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all transform hover:scale-105 hover:shadow-2xl animate-pulse"
              onClick={startQuiz}
              style={{ position: "relative", zIndex: 10000 }}
            >
              Start Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionLoader;