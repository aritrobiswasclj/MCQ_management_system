import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './QuestionLoader.css';

const playlist = [
  { name: "Calm Piano", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { name: "Ambient Night", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { name: "Relaxing Waves", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

const QuestionLoader = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [quizDetails, setQuizDetails] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [firstAnswerSelected, setFirstAnswerSelected] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [isPlayerCollapsed, setIsPlayerCollapsed] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const audioRef = useRef(new Audio());
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const shootingStarsRef = useRef([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
    fetchQuizData();

    if (canvasRef.current) {
      resizeCanvas();
      createStars();
      animate();
      window.addEventListener('resize', resizeCanvas);
    }

    audioRef.current.addEventListener('timeupdate', updateProgressBar);
    audioRef.current.addEventListener('ended', nextTrack);
    audioRef.current.addEventListener('loadedmetadata', updateDuration);
    loadTrack(currentTrackIndex);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      audioRef.current.removeEventListener('timeupdate', updateProgressBar);
      audioRef.current.removeEventListener('ended', nextTrack);
      audioRef.current.removeEventListener('loadedmetadata', updateDuration);
      cancelAnimationFrame(animate);
      document.documentElement.classList.remove('dark');
    };
  }, []);

  useEffect(() => {
    let timerInterval = null;
    if (isTimerRunning && quizDetails?.time_limit) {
      timerInterval = setInterval(() => {
        setTimer(prev => {
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

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      const attemptResponse = await axios.post(
        'http://localhost:5000/api/quiz-attempt/start',
        { quiz_id: quizId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttemptId(attemptResponse.data.attempt_id);

      const [quizResponse, questionsResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:5000/api/quizzes/${quizId}/questions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setQuizDetails(quizResponse.data);
      const fetchedQuestions = questionsResponse.data.map(q => ({
        ...q,
        selectedOption: null,
        showExplanation: false,
      }));
      setQuestions(fetchedQuestions);

      // Compute categories and counts
      const categoryCounts = fetchedQuestions.reduce((acc, q) => {
        acc[q.category_name] = (acc[q.category_name] || 0) + 1;
        return acc;
      }, {});
      setCategories(Object.entries(categoryCounts).map(([name, count]) => ({ name, count })));

      setLoading(false);
    } catch (err) {
      console.error('Fetch quiz data error:', err);
      setError(err.response?.data?.error || 'Failed to load quiz data. Please try again.');
      setLoading(false);
    }
  };

  const handleOptionClick = async (questionId, option) => {
    if (!firstAnswerSelected) {
      setFirstAnswerSelected(true);
      setIsTimerRunning(true);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/question-response',
        {
          attempt_id: attemptId,
          question_id: questionId,
          selected_option_id: option.option_id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQuestions(questions.map(q => {
        if (q.question_id === questionId) {
          return {
            ...q,
            selectedOption: option.option_id,
            showExplanation: true,
          };
        }
        return q;
      }));
    } catch (err) {
      console.error('Submit response error:', err);
      setError('Failed to submit response. Please try again.');
    }
  };

  const completeQuiz = async () => {
    try {
      setIsTimerRunning(false);
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/quiz-attempt/${attemptId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/quiz-result/${attemptId}`);
    } catch (err) {
      console.error('Complete quiz error:', err);
      setError('Failed to complete quiz. Please try again.');
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
    starsRef.current.forEach(star => {
      ctx.globalAlpha = star.opacity;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    shootingStarsRef.current.forEach(star => {
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
    shootingStarsRef.current = shootingStarsRef.current.filter(star => star.progress < 1);
    shootingStarsRef.current.forEach(star => {
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
    audioRef.current.src = playlist[index].src;
    setCurrentTrackIndex(index);
    audioRef.current.load();
    updateDuration();
  };

  const playTrack = () => {
    audioRef.current.play();
    setIsPlaying(true);
  };

  const pauseTrack = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    loadTrack(nextIndex);
    if (isPlaying) playTrack();
  };

  const prevTrack = () => {
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    setCurrentTrackIndex(prevIndex);
    loadTrack(prevIndex);
    if (isPlaying) playTrack();
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

  const toggleTheme = () => {
    setIsDark(!isDark);
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  const toggleMusicPlayer = () => {
    setIsPlayerCollapsed(!isPlayerCollapsed);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  const filteredQuestions = selectedCategory
    ? questions.filter(q => q.category_name === selectedCategory)
    : questions;

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <canvas id="star-canvas" ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-[-1]"></canvas>
      <div className="tree-silhouette fixed bottom-0 left-0 w-full h-32 z-0"></div>

      {/* Music Player */}
      <aside className={`fixed top-0 left-0 h-full bg-gray-900/95 backdrop-blur-md text-white transition-transform duration-300 ease-in-out ${isPlayerCollapsed ? '-translate-x-full' : 'translate-x-0'} w-72 z-20 shadow-2xl`}>
        <button
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-800 transition-colors"
          onClick={toggleMusicPlayer}
          aria-label="Collapse music player"
        >
          <i className="fas fa-chevron-left text-lg"></i>
        </button>
        <div className="p-6 flex flex-col h-full">
          <h2 className="text-2xl font-bold mb-6">Now Playing</h2>
          <div className="track-info flex-1">
            <a href="#" className="block mb-6 hover:underline">
              <h3 className="text-xl font-semibold">{playlist[currentTrackIndex].name}</h3>
              <p className="text-sm text-gray-400">Unknown Artist</p>
            </a>
            <div className="controls flex justify-center gap-4 mb-6">
              <button aria-label="Previous" onClick={prevTrack} className="p-2 hover:text-blue-400 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 16 16">
                  <path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7z"></path>
                </svg>
              </button>
              <button
                id="play-pause"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="p-2 hover:text-blue-400 transition-colors"
                onClick={() => (isPlaying ? pauseTrack() : playTrack())}
              >
                <svg id="play-icon" className={`w-8 h-8 ${isPlaying ? 'hidden' : ''}`} fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288z"></path>
                </svg>
                <svg id="pause-icon" className={`w-8 h-8 ${!isPlaying ? 'hidden' : ''}`} fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
                </svg>
              </button>
              <button aria-label="Next" onClick={nextTrack} className="p-2 hover:text-blue-400 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 16 16">
                  <path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7z"></path>
                </svg>
              </button>
            </div>
            <div className="progress-container">
              <div className="time-info flex justify-between text-sm text-gray-300 mb-2">
                <span id="current-time">{formatTime(currentTime)}</span>
                <span id="duration">{formatTime(duration)}</span>
              </div>
              <div
                className="progress-bar-container bg-gray-700 h-2 rounded-full cursor-pointer"
                onClick={setProgress}
              >
                <div
                  className="progress-bar bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </aside>
      <button
        className={`fixed top-4 left-4 p-3 bg-gray-900/95 text-white rounded-full hover:bg-gray-800 transition-colors z-20 ${isPlayerCollapsed ? 'block' : 'hidden'}`}
        onClick={toggleMusicPlayer}
        aria-label="Expand music player"
      >
        <i className="fas fa-chevron-right text-lg"></i>
      </button>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 relative z-10">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
          <h1 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-md">{quizDetails?.quiz_title || 'Focus'}</h1>
          <div className="flex items-center gap-4">
            <span className="text-xl font-semibold text-white bg-gray-800/70 px-6 py-2 rounded-full shadow-md">
              {formatTime(timer)}
            </span>
            <button
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full hover:from-blue-600 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
              onClick={completeQuiz}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Submit
            </button>
            <button
              className="p-3 bg-gray-800/70 text-white rounded-full hover:bg-gray-700 transition-all shadow-md"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
            </button>
          </div>
        </header>

        {loading && <p className="text-gray-300 text-center text-xl font-medium">Loading quiz...</p>}
        {error && (
          <div className="bg-red-600/80 text-white p-6 rounded-2xl mb-8 shadow-lg">
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && questions.length === 0 && (
          <p className="text-gray-300 text-center text-xl font-medium">No questions available for this quiz.</p>
        )}

        {/* Category Filters */}
        {!loading && !error && questions.length > 0 && categories.length > 0 && (
          <div className="mb-12 flex flex-wrap justify-center gap-4">
            {categories.map(category => (
              <button
                key={category.name}
                className={`px-6 py-3 rounded-full text-white font-semibold text-sm tracking-wide transition-all transform hover:scale-105 shadow-md ${
                  selectedCategory === category.name
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                    : 'bg-gray-800/70 hover:bg-gray-700/80'
                }`}
                onClick={() => handleCategoryClick(category.name)}
              >
                {category.name} ({category.count})
              </button>
            ))}
            <button
              className={`px-6 py-3 rounded-full text-white font-semibold text-sm tracking-wide transition-all transform hover:scale-105 shadow-md ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                  : 'bg-gray-800/70 hover:bg-gray-700/80'
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </button>
          </div>
        )}

        {/* Questions */}
        {!loading && !error && filteredQuestions.length > 0 && (
          <div className="space-y-10">
            {filteredQuestions.map(q => (
              <article
                key={q.question_id}
                className="question-box bg-gray-800/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-700/30 transition-all hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="mb-6">
                  <p className="text-xl font-semibold text-white leading-relaxed">
                    <span className="text-blue-400 mr-3 font-bold">{q.display_order}.</span> {q.question_text}
                  </p>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="bg-blue-500/20 text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full">
                    {q.category_name}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {q.options.map(opt => (
                    <div
                      key={opt.option_id}
                      className={`option flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                        q.selectedOption === opt.option_id
                          ? opt.is_correct
                            ? 'bg-green-500/10 border-green-500'
                            : 'bg-red-500/10 border-red-500'
                          : 'bg-gray-700/50 border-gray-600 hover:bg-gray-600/70'
                      }`}
                      onClick={() => !q.selectedOption && handleOptionClick(q.question_id, opt)}
                    >
                      <div
                        className={`option-circle w-9 h-9 rounded-full border-2 flex items-center justify-center mr-4 text-white font-semibold transition-all ${
                          q.selectedOption === opt.option_id
                            ? opt.is_correct
                              ? 'border-green-500 bg-green-500/20'
                              : 'border-red-500 bg-red-500/20'
                            : 'border-gray-500'
                        }`}
                      >
                        {opt.display_order}
                      </div>
                      <p className="text-gray-200 text-base">{opt.option_text}</p>
                    </div>
                  ))}
                </div>
                {q.showExplanation && (
                  <div className="mt-6 p-5 bg-green-900/20 rounded-xl flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-green-400 mt-1 mr-3 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-green-300 text-base leading-relaxed">{q.explanation || 'No explanation provided.'}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default QuestionLoader;