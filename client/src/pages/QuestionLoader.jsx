import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./QuestionLoader.css";

const playlist = [
  {
    name: "Calm Piano",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    name: "Ambient Night",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    name: "Relaxing Waves",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
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
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const audioRef = useRef(new Audio());
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const shootingStarsRef = useRef([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)")).matches
    ) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
    fetchQuizData();

    if (canvasRef.current) {
      resizeCanvas();
      createStars();
      animate();
      window.addEventListener("resize", resizeCanvas);
    }

    audioRef.current.addEventListener("timeupdate", updateProgressBar);
    audioRef.current.addEventListener("ended", nextTrack);
    audioRef.current.addEventListener("loadedmetadata", updateDuration);
    loadTrack(currentTrackIndex);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      audioRef.current.removeEventListener("timeupdate", updateProgressBar);
      audioRef.current.removeEventListener("ended", nextTrack);
      audioRef.current.removeEventListener("loadedmetadata", updateDuration);
      cancelAnimationFrame(animate);
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

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const attemptResponse = await axios.post(
        "http://localhost:5000/api/quiz-attempt/start",
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

      setLoading(false);
    } catch (err) {
      console.error("Fetch quiz data error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to load quiz data. Please try again."
      );
      setLoading(false);
    }
  };

  const handleOptionClick = async (questionId, option) => {
    if (!hasStarted) return;
    const question = questions.find((q) => q.question_id === questionId);
    if (question.selectedOption !== null) return; // Prevent changing answer

    try {
      const token = localStorage.getItem("token");
      console.log("Submitting response:", {
        attempt_id: attemptId,
        question_id: questionId,
        selected_option_id: option.option_id,
      }); // Add this line
      await axios.post(
        "http://localhost:5000/api/question-response",
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
              showExplanation: true, // Show explanation immediately after selection
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
      console.error("Submit response error:", err);
      setError("Failed to submit response. Please try again.");
    }
  };

  const completeQuiz = async () => {
    try {
      // Check if all questions are answered
      const unansweredQuestions = questions.filter(
        (q) => q.selectedOption === null
      );
      if (unansweredQuestions.length > 0) {
        setError(
          `Please answer all questions before submitting. ${unansweredQuestions.length} questions remaining.`
        );
        return;
      }

      setIsTimerRunning(false);
      const token = localStorage.getItem("token");

      // Complete the quiz attempt
      await axios.post(
        `http://localhost:5000/api/quiz-attempt/${attemptId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Navigate to results page
      navigate(`/quiz-result/${attemptId}`);
    } catch (err) {
      console.error("Complete quiz error:", err);
      setError("Failed to complete quiz. Please try again.");
    }
  };

  const startQuiz = () => {
    setHasStarted(true);
    if (quizDetails?.time_limit) {
      setIsTimerRunning(true);
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

  const loadTrack = (index) => {
    audioRef.current.src = playlist[index].src;
    setCurrentTrackIndex(index);
    audioRef.current.load();
    updateDuration();
  };

  const playTrack = () => {
    if (!hasStarted) return;
    audioRef.current
      .play()
      .catch((err) => console.error("Audio play error:", err));
    setIsPlaying(true);
  };

  const pauseTrack = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const nextTrack = () => {
    if (!hasStarted) return;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    loadTrack(nextIndex);
    if (isPlaying) playTrack();
  };

  const prevTrack = () => {
    if (!hasStarted) return;
    const prevIndex =
      (currentTrackIndex - 1 + playlist.length) % playlist.length;
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
    if (!hasStarted) return;
    const width = e.currentTarget.clientWidth;
    const clickX = e.nativeEvent.offsetX;
    const duration = audioRef.current.duration;
    audioRef.current.currentTime = (clickX / width) * duration;
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
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleCategoryClick = (categoryName) => {
    if (!hasStarted) return;
    setSelectedCategory(categoryName);
  };

  const filteredQuestions = selectedCategory
    ? questions.filter((q) => q.category_name === selectedCategory)
    : questions;

  const handleBookmarkClick = (questionId) => {
    setIsBookmarked(!isBookmarked);
    // Add  API call here
    console.log(
      `Bookmark toggled for question ${questionId}: ${!isBookmarked}`
    );
  };

  const handleLikeClick = (questionId) => {
    setIsLiked(!isLiked);
    console.log(`Like toggled for question ${questionId}: ${!isLiked}`);
    // Add  API call here
  };

  const questionColors = [
    "from-blue-500 to-blue-700",
    "from-purple-500 to-purple-700",
    "from-teal-500 to-teal-700",
    "from-indigo-500 to-indigo-700",
    "from-cyan-500 to-cyan-700",
  ];

  const optionColors = [
    "from-blue-600 to-blue-800",
    "from-purple-600 to-purple-800",
    "from-pink-600 to-pink-800",
    "from-cyan-600 to-cyan-800",
  ];

  return (
    <div className={`min-h-screen ${isDark ? "dark" : ""}`}>
      <canvas
        id="star-canvas"
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full z-[-1]"
      ></canvas>
      <div className="tree-silhouette fixed bottom-0 left-0 w-full h-32 z-1"></div>

      {/* Quiz Content with Blur */}
      <div className={`quiz-content ${hasStarted ? "" : "blurred"}`}>
        {/* Music Player */}
        <aside
          className={`fixed top-0 left-0 h-full bg-gray-900/80 backdrop-blur-lg text-white transition-all duration-300 ease-in-out ${
            isPlayerCollapsed ? "-translate-x-full" : "translate-x-0"
          } w-64 z-20 shadow-2xl rounded-r-2xl`}
        >
          <button
            className="absolute top-4 right-4 p-3 rounded-full hover:bg-gradient-to-r from-gray-700 to-gray-800 transition-all group relative"
            onClick={toggleMusicPlayer}
            aria-label="Collapse music player"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="tooltip group-hover:opacity-95">Close</span>
          </button>
          <div className="p-6 flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-6 text-white">Now Playing</h2>
            <div className="track-info flex-1">
              <a href="#" className="block mb-4 hover:underline">
                <h3 className="text-xl font-semibold text-white">
                  {playlist[currentTrackIndex].name}
                </h3>
                <span className="text-sm text-gray-300">Playlist</span>
              </a>
              <div className="controls flex justify-center gap-6 mb-6">
                <button
                  aria-label="Previous track"
                  onClick={prevTrack}
                  className="p-3 rounded-full hover:bg-gradient-to-r from-gray-700 to-gray-800 transition-all group relative"
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span className="tooltip group-hover:opacity-95">
                    Previous
                  </span>
                </button>
                <button
                  id="play-pause"
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="play-pause bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 transition-all"
                  onClick={() => (isPlaying ? pauseTrack() : playTrack())}
                >
                  {isPlaying ? (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288z" />
                    </svg>
                  )}
                </button>
                <button
                  aria-label="Next track"
                  onClick={nextTrack}
                  className="p-3 rounded-full hover:bg-gradient-to-r from-gray-700 to-gray-800 transition-all group relative"
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <span className="tooltip group-hover:opacity-95">Next</span>
                </button>
              </div>
              <div className="progress-container">
                <div className="time-info flex justify-between text-sm text-gray-300 mb-3">
                  <span id="current-time">{formatTime(currentTime)}</span>
                  <span id="duration">{formatTime(duration)}</span>
                </div>
                <div
                  className="progress-bar-container bg-gray-700/50 h-2 rounded-full cursor-pointer shadow-inner"
                  onClick={setProgress}
                >
                  <div
                    className="progress-bar bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full shadow-lg"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </aside>
        <button
          className={`fixed top-4 left-4 p-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-full hover:bg-gradient-to-r from-blue-500 to-blue-600 transition-all z-20 shadow-lg ${
            isPlayerCollapsed ? "block" : "hidden"
          } group relative`}
          onClick={toggleMusicPlayer}
          aria-label="Expand music player"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="tooltip group-hover:opacity-95">Open Player</span>
        </button>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-16 relative z-10">
          <header className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6">
            <h1 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
              {quizDetails?.quiz_title || "Focus"}
            </h1>
            <div className="flex items-center gap-6">
              <span className="text-xl font-semibold text-white bg-gray-800/70 px-8 py-3 rounded-xl shadow-xl">
                {formatTime(timer)}
              </span>
              <button
                className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl hover:from-blue-700 hover:to-purple-800 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
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
                className="theme-toggle p-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-full hover:bg-gradient-to-r from-blue-500 to-blue-600 transition-all shadow-md hover:scale-110"
                onClick={toggleTheme}
                aria-label={
                  isDark ? "Switch to light theme" : "Switch to dark theme"
                }
              >
                {isDark ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </header>

          {loading && (
            <p className="text-gray-300 text-center text-xl font-semibold">
              Loading quiz...
            </p>
          )}
          {error && (
            <div className="bg-red-600/80 text-white p-6 rounded-2xl mb-8 shadow-lg">
              <p>{error}</p>
            </div>
          )}
          {!loading && !error && questions.length === 0 && (
            <p className="text-gray-500 text-center text-center font-semibold">
              No questions available for this quiz.
            </p>
          )}

          {/* Category Filters */}
          {!loading &&
            !error &&
            questions.length > 0 &&
            categories.length > 0 && (
              <div className="mb-12 flex flex-wrap justify-center gap-4">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    className={`px-8 py-3 rounded-full text-white font-semibold text-sm tracking-wide transition-all transform hover:scale-105 shadow-md ${
                      selectedCategory === category.name
                        ? "bg-gradient-to-r from-blue-600 to-blue-700"
                        : "bg-gradient-to-r from-gray-800 to-gray-900 hover:bg-gradient-to-r from-blue-500 to-blue-600"
                    }`}
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
                <button
                  className={`px-8 py-3 rounded-full text-white font-semibold text-sm tracking-wide transition-all transform hover:scale-105 shadow-md ${
                    selectedCategory === null
                      ? "bg-gradient-to-r from-blue-600 to-blue-700"
                      : "bg-gradient-to-r from-gray-800 to-gray-900 hover:bg-gradient-to-r from-blue-500 to-blue-600"
                  }`}
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </button>
              </div>
            )}

          {/* Questions */}
          {!loading && !error && filteredQuestions.length > 0 && (
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
                      bg-gradient-to-br from-blue-900/60 via-purple-900/40 to-indigo-900/60
                      backdrop-blur-2xl
                      border-0
                      ring-2 ring-blue-500/30
                      transition-all
                      hover:-translate-y-2
                      hover:shadow-[0_8px_40px_10px_rgba(99,102,241,0.25)]
                      animate-fade-in
                    `}
                    style={{
                      boxShadow:
                        "0 8px 40px 10px rgba(99,102,241,0.15), 0 1.5px 8px 0 rgba(0,0,0,0.15)",
                      border: "1.5px solid rgba(99,102,241,0.18)",
                      background:
                        "linear-gradient(135deg, rgba(30,58,138,0.7) 0%, rgba(168,85,247,0.25) 100%)",
                      position: "relative",
                      overflow: "hidden",
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
                      <span className="bg-blue-100/80 text-blue-900 text-sm font-medium px-4 py-1.5 rounded-full shadow-sm">
                        {q.category_name}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          className={`like-button p-2 text-gray-400 hover:text-blue-400 transition-all ${
                            isLiked ? "text-blue-500" : ""
                          }`}
                          onClick={() => handleLikeClick(q.question_id)}
                          aria-label="Like question"
                        >
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            />
                          </svg>
                        </button>
                        <button
                          className={`bookmark-button p-2 text-gray-400 hover:text-blue-400 transition-all ${
                            isBookmarked ? "text-blue-500" : ""
                          }`}
                          onClick={() => handleBookmarkClick(q.question_id)}
                          aria-label="Bookmark question"
                        >
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                          </svg>
                        </button>
                      </div>
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
                            bg-gradient-to-r from-blue-800/60 via-purple-800/40 to-indigo-800/60
                            border-2
                            border-transparent
                            shadow-lg
                            transition-all duration-300
                            hover:scale-105
                            hover:shadow-[0_0_24px_4px_rgba(168,85,247,0.25)]
                            cursor-pointer
                            ${
                              q.selectedOption === opt.option_id
                                ? opt.is_correct
                                  ? "ring-4 ring-green-400/60 bg-gradient-to-r from-green-700/80 to-green-500/60"
                                  : "ring-4 ring-red-400/60 bg-gradient-to-r from-red-700/80 to-red-500/60"
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
                                ? opt.is_correct
                                  ? "0 0 24px 8px rgba(34,197,94,0.25)"
                                  : "0 0 24px 8px rgba(239,68,68,0.25)"
                                : "0 2px 12px 0 rgba(168,85,247,0.10)",
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
                                  ? opt.is_correct
                                    ? "bg-green-500/70 border-green-300"
                                    : "bg-red-500/70 border-red-300"
                                  : "bg-gradient-to-br from-blue-900/80 to-purple-900/60 border-blue-400/40"
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
                      <div className="mt-6 p-5 bg-green-900/30 backdrop-blur-sm rounded-xl flex items-start shadow-inner animate-fade-in">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-green-400 mt-1 mr-3 flex-shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-2 5a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V11z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-green-300 text-base leading-relaxed">
                          {q.explanation || "No explanation provided."}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Start Screen Overlay */}
      {!hasStarted && (
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900/80 backdrop-blur-sm"
          style={{ zIndex: 9999 }}
        >
          <div className="absolute top-1/3 -translate-y-1/2">
            <button
              className="start-button px-16 py-8 text-3xl font-extrabold text-white bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl hover:from-blue-700 hover:to-purple-800 transition-all transform hover:scale-105 hover:shadow-2xl animate-pulse"
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
