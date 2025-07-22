import React, { useState, useEffect, useRef } from 'react';
import './Questionloader.css';

const questionsDB = [
  {
    id: 1,
    question: "What is the SI unit of force?",
    category: "Physics",
    tag: "Physics 101",
    options: [
      { label: "A", text: "Newton", isCorrect: true },
      { label: "B", text: "Joule", isCorrect: false },
      { label: "C", text: "Watt", isCorrect: false },
      { label: "D", text: "Pascal", isCorrect: false }
    ],
    explanation: "The correct answer is Newton (A). Force is measured in Newtons according to the International System of Units."
  },
  {
    id: 2,
    question: "Which of the following is not a primary color of light?",
    category: "Physics",
    tag: "Physics 102",
    options: [
      { label: "A", text: "Red", isCorrect: false },
      { label: "B", text: "Green", isCorrect: false },
      { label: "C", text: "Yellow", isCorrect: true },
      { label: "D", text: "Blue", isCorrect: false }
    ],
    explanation: "The primary colors of light are red, green, and blue (RGB). Yellow is a secondary color formed by mixing red and green light."
  },
  {
    id: 3,
    question: "What is the chemical symbol for gold?",
    category: "Chemistry",
    tag: "Chemistry 101",
    options: [
      { label: "A", text: "Au", isCorrect: true },
      { label: "B", text: "Ag", isCorrect: false },
      { label: "C", text: "Fe", isCorrect: false },
      { label: "D", text: "Cu", isCorrect: false }
    ],
    explanation: "The correct answer is Au (A). Au is the chemical symbol for gold on the periodic table."
  },
  {
    id: 4,
    question: "What is the derivative of sin(x)?",
    category: "Mathematics",
    tag: "Calculus 101",
    options: [
      { label: "A", text: "cos(x)", isCorrect: true },
      { label: "B", text: "-sin(x)", isCorrect: false },
      { label: "C", text: "sin(x)", isCorrect: false },
      { label: "D", text: "-cos(x)", isCorrect: false }
    ],
    explanation: "The correct answer is cos(x) (A). The derivative of sin(x) is cos(x) according to the rules of calculus."
  },
  {
    id: 5,
    question: "Which organelle is known as the powerhouse of the cell?",
    category: "Biology",
    tag: "Biology 101",
    options: [
      { label: "A", text: "Nucleus", isCorrect: false },
      { label: "B", text: "Mitochondrion", isCorrect: true },
      { label: "C", text: "Ribosome", isCorrect: false },
      { label: "D", text: "Golgi Apparatus", isCorrect: false }
    ],
    explanation: "The correct answer is Mitochondrion (B). The mitochondrion is responsible for producing energy in the form of ATP."
  }
];

const playlist = [
  { name: "Calm Piano", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { name: "Ambient Night", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { name: "Relaxing Waves", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [firstAnswerSelected, setFirstAnswerSelected] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [isPlayerCollapsed, setIsPlayerCollapsed] = useState(false);
  const audioRef = useRef(new Audio());
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const shootingStarsRef = useRef([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
    }
    fetchQuestions();
    resizeCanvas();
    createStars();
    animate();
    window.addEventListener('resize', () => {
      resizeCanvas();
      createStars();
    });
    audioRef.current.addEventListener('timeupdate', updateProgressBar);
    audioRef.current.addEventListener('ended', nextTrack);
    audioRef.current.addEventListener('loadedmetadata', updateDuration);
    loadTrack(currentTrackIndex);
    return () => {
      window.removeEventListener('resize', () => {});
      audioRef.current.removeEventListener('timeupdate', updateProgressBar);
      audioRef.current.removeEventListener('ended', nextTrack);
      audioRef.current.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  useEffect(() => {
    let timerInterval = null;
    if (isTimerRunning) {
      timerInterval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [isTimerRunning]);

  const fetchQuestions = (category = null) => {
    let filteredQuestions = category ? questionsDB.filter(q => q.category === category) : questionsDB;
    if (filteredQuestions.length === 0) {
      filteredQuestions = questionsDB.slice(0, 5);
    }
    setQuestions(filteredQuestions);
    setTimer(0);
    setIsTimerRunning(false);
    setFirstAnswerSelected(false);
  };

  const startTimer = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const createStars = () => {
    starsRef.current = [];
    for (let i = 0; i < 200; i++) {
      starsRef.current.push({
        x: Math.random() * canvasRef.current.width,
        y: Math.random() * canvasRef.current.height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.5
      });
    }
  };

  const createShootingStar = () => {
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
      opacity: 1
    });
  };

  const drawStars = () => {
    const ctx = canvasRef.current.getContext('2d');
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

  const animate = () => {
    updateShootingStars();
    drawStars();
    requestAnimationFrame(animate);
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
  };

  const toggleMusicPlayer = () => {
    setIsPlayerCollapsed(!isPlayerCollapsed);
  };

  const handleOptionClick = (questionId, option) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          selectedOption: option.label,
          showExplanation: true
        };
      }
      return q;
    }));
    if (!firstAnswerSelected) {
      setFirstAnswerSelected(true);
      startTimer();
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <canvas id="star-canvas" ref={canvasRef}></canvas>
      <div className="tree-silhouette"></div>
      <div className={`music-player ${isPlayerCollapsed ? 'collapsed' : ''}`} id="music-player">
        <button className="collapse-btn" onClick={toggleMusicPlayer}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <h2>Now Playing</h2>
        <div className="track-info">
          <a id="album-link" href="#" className="block">
            <h3 className="track-name">{playlist[currentTrackIndex].name}</h3>
            <p className="track-artist">Unknown Artist</p>
          </a>
          <div className="controls">
            <button aria-label="Previous" onClick={prevTrack}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7z"></path>
              </svg>
            </button>
            <button id="play-pause" aria-label={isPlaying ? 'Pause' : 'Play'} className="play-pause" onClick={() => isPlaying ? pauseTrack() : playTrack()}>
              <svg id="play-icon" className={`w-6 h-6 ${isPlaying ? 'hidden' : ''}`} fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288z"></path>
              </svg>
              <svg id="pause-icon" className={`w-6 h-6 ${!isPlaying ? 'hidden' : ''}`} fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
              </svg>
            </button>
            <button aria-label="Next" onClick={nextTrack}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7z"></path>
              </svg>
            </button>
          </div>
          <div className="progress-container">
            <div className="time-info">
              <span id="current-time">{formatTime(currentTime)}</span>
              <span id="duration">{formatTime(duration)}</span>
            </div>
            <div className="progress-bar-container" onClick={setProgress}>
              <div className="progress-bar" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>
      <button className="expand-btn" style={{ display: isPlayerCollapsed ? 'block' : 'none' }} onClick={toggleMusicPlayer}>
        <i className="fas fa-chevron-right"></i>
      </button>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-2xl font-bold text-white">Focus</h1>
          <div className="flex items-center space-x-4">
            <div className="text-white font-medium">{formatTime(timer)}</div>
            <button className="btn btn-primary px-4 py-2 bg-blue-600 text-white rounded-md flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Practice
            </button>
            <button className="p-2 bg-gray-200 rounded-full text-gray-800" onClick={toggleTheme}>
              <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
          </div>
        </div>
        <div className="sticky top-0 z-40 bg-gray-800 pt-2 pb-4 shadow-sm mb-4">
          <div className="relative flex items-center overflow-x-auto">
            <div className="flex space-x-2 py-1 scrollbar-hide">
              {['Physics', 'Chemistry', 'Mathematics', 'Biology'].map(category => (
                <button
                  key={category}
                  className="category-btn shrink-0 bg-gray-700 hover:bg-gray-600 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition-all border border-gray-600 flex items-center space-x-2"
                  onClick={() => fetchQuestions(category)}
                >
                  <span className="text-white">{category}</span>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-black">
                    {questionsDB.filter(q => q.category === category).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-12">
          {questions.map(q => (
            <div key={q.id} className="question-box rounded-xl p-6 shadow border border-gray-600">
              <div className="mb-4">
                <p className="text-lg font-medium text-gray-200">
                  <span className="font-bold">{q.id}.</span> {q.question}
                </p>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{q.tag}</span>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                  </button>
                  <button className="text-gray-400 hover:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {q.options.map(opt => (
                  <div
                    key={opt.label}
                    className={`option ${q.selectedOption === opt.label ? 'selected' : ''}`}
                    onClick={() => handleOptionClick(q.id, opt)}
                  >
                    <div className="flex items-center p-3 bg-gray-700 rounded-lg cursor-pointer">
                      <div className={`option-circle w-6 h-6 rounded-full border-2 ${q.selectedOption === opt.label ? 'border-green-500' : 'border-gray-400'} flex items-center justify-center mr-3`}>
                        {opt.label}
                      </div>
                      <p className="text-gray-200">{opt.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              {q.showExplanation && (
                <div className="mt-4 p-3 bg-green-900 rounded-lg flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-300 mt-1 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-200">{q.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center"
          onClick={() => fetchQuestions()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Load More Questions
        </button>
      </div>
      <div className="fixed bottom-8 right-8 z-10">
        <button className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default QuestionLoader;