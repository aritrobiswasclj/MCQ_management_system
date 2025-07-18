import React, { useEffect, useState } from 'react';
import './styles.css';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nowPlaying, setNowPlaying] = useState({
    songName: 'Loading...',
    artistName: 'Loading...',
    musicId: '',
    currentTime: '0:00',
    durationSeconds: 0,
    progressPercent: 0,
    isPlaying: false,
  });
  const [artistInfo, setArtistInfo] = useState({ artistName: 'Loading...' });
  const [leaderboard, setLeaderboard] = useState([]);
  const [progress, setProgress] = useState({
    questionsAnswered: 'Loading...',
    correctAnswers: 'Loading...',
    accuracy: 'Loading...',
  });
  const [userScore, setUserScore] = useState('0');
  const [roleBasedActions, setRoleBasedActions] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Convert seconds to MM:SS format
  const secondsToTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch data on component mount
  useEffect(() => {
    // Fetch Now Playing Data
    fetch('/api/now-playing')
      .then((response) => response.json())
      .then((data) => setNowPlaying(data))
      .catch((error) => {
        console.error('Error fetching now playing:', error);
        setNowPlaying({
          songName: 'Error',
          artistName: 'Error',
          musicId: '',
          currentTime: '0:00',
          durationSeconds: 0,
          progressPercent: 0,
          isPlaying: false,
        });
      });

    // Fetch Artist Info
    fetch('/api/artist')
      .then((response) => response.json())
      .then((data) => setArtistInfo(data))
      .catch((error) => {
        console.error('Error fetching artist info:', error);
        setArtistInfo({ artistName: 'Error' });
      });

    // Fetch Leaderboard Data
    fetch('/api/leaderboard')
      .then((response) => response.json())
      .then((data) => setLeaderboard(data))
      .catch((error) => {
        console.error('Error fetching leaderboard:', error);
        setLeaderboard([]);
      });

    // Fetch Progress Data
    fetch('/api/progress')
      .then((response) => response.json())
      .then((data) => setProgress(data))
      .catch((error) => {
        console.error('Error fetching progress:', error);
        setProgress({
          questionsAnswered: 'Error',
          correctAnswers: 'Error',
          accuracy: 'Error',
        });
      });

    // Fetch User Score
    fetch('/api/user-score')
      .then((response) => response.json())
      .then((data) => setUserScore(data.score))
      .catch((error) => {
        console.error('Error fetching user score:', error);
        setUserScore('Error');
      });

    // Fetch Role-Based Actions
    fetch('/api/role-based-actions')
      .then((response) => response.json())
      .then((data) => setRoleBasedActions(data.actions))
      .catch((error) => {
        console.error('Error fetching role-based actions:', error);
        setRoleBasedActions([]);
      });

    // Fetch Achievements
    fetch('/api/achievements')
      .then((response) => response.json())
      .then((data) => setAchievements(data))
      .catch((error) => {
        console.error('Error fetching achievements:', error);
        setAchievements([]);
      });

    // Fetch Recent Activity
    fetch('/api/recent-activity')
      .then((response) => response.json())
      .then((data) => setRecentActivity(data))
      .catch((error) => {
        console.error('Error fetching recent activity:', error);
        setRecentActivity([]);
      });
  }, []);

  return (
    <div
      className="text-gray-900 dark:text-gray-100 font-sans overflow-x-hidden"
      style={{
        backgroundImage: "url('../pictures/vecteezy_starry-night-background-with-crescent-moon-tree-and-grass_.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'transparent',
      }}
    >
      {/* Sidebar Toggle Button (Visible on Mobile) */}
      <button
        id="sidebar-toggle"
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* Left Sidebar */}
      <div
        id="sidebar"
        className={`fixed top-0 left-0 h-full w-56 bg-gray-800 dark:bg-gray-900 text-white p-4 overflow-y-auto sidebar md:translate-x-0 ${
          sidebarOpen ? '' : 'sidebar-hidden'
        } z-40`}
      >
        {/* Now Playing Section */}
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">Now Playing</h2>
          <div className="bg-gray-700 dark:bg-gray-800 rounded-lg p-4">
            <a id="album-link" href={`/music/${nowPlaying.musicId}`} className="block">
              <h3 id="song-name" className="text-sm font-medium">{nowPlaying.songName}</h3>
              <p id="song-artist" className="text-xs text-gray-400">{nowPlaying.artistName}</p>
            </a>
            {/* Playback Controls */}
            <div className="flex justify-center gap-2 mt-3">
              <button aria-label="Previous" className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7z"></path>
                </svg>
              </button>
              <button
                id="play-pause"
                aria-label={nowPlaying.isPlaying ? 'Pause' : 'Play'}
                className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600"
              >
                <svg
                  id="play-icon"
                  className={`w-6 h-6 ${nowPlaying.isPlaying ? 'hidden' : ''}`}
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288z"></path>
                </svg>
                <svg
                  id="pause-icon"
                  className={`w-6 h-6 ${nowPlaying.isPlaying ? '' : 'hidden'}`}
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
                </svg>
              </button>
              <button aria-label="Next" className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7z"></path>
                </svg>
              </button>
            </div>
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400">
                <span id="current-time">{nowPlaying.currentTime}</span>
                <span id="duration">{secondsToTime(nowPlaying.durationSeconds)}</span>
              </div>
              <div className="h-1 bg-gray-600 rounded-full">
                <div id="progress-bar" className="h-1 bg-blue-500 rounded-full" style={{ width: `${nowPlaying.progressPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        {/* About the Artist Section */}
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">About the Artist</h2>
          <div className="bg-gray-700 dark:bg-gray-800 rounded-lg p-4">
            <a id="artist-link" href={`/artist/${encodeURIComponent(artistInfo.artistName)}`} className="block">
              <h3 id="artist-name" className="text-sm font-medium">{artistInfo.artistName}</h3>
            </a>
          </div>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <div className="top-bar-container fixed top-0 left-0 w-full h-8 z-50">
        <nav className="top-bar bg-blue-600 dark:bg-blue-800 text-white p-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded transition">Dashboard</a>
            <a href="/question-bank" className="hover:bg-blue-700 px-3 py-2 rounded transition">Question Bank</a>
            <a href="/practice-exam" className="hover:bg-blue-700 px-3 py-2 rounded transition">Practice Exam</a>
            <a href="/mock-exam" className="hover:bg-blue-700 px-3 py-2 rounded transition">Mock Exam</a>
            <a href="/leaderboard" className="hover:bg-blue-700 px-3 py-2 rounded transition">Leaderboard</a>
            <a href="/playlists" className="hover:bg-blue-700 px-3 py-2 rounded transition">Playlists</a>
          </div>
          <div>
            <a href="/profile" className="hover:bg-blue-700 px-3 py-2 rounded transition">Profile</a>
            <a href="/logout" className="hover:bg-blue-700 px-3 py-2 rounded transition">Logout</a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 pt-12 md:ml-56 max-w-screen-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-700 pb-4 mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full px-3 py-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
              <path d="M159.3 5.4c7.8-7.3 19.9-7.2 27.7 .1c27.6 25.9 53.5 53.8 77.7 84c11-14.4 23.5-30.1 37-42.9c7.9-7.4 20.1-7.4 28 .1c34.6 33 63.9 76.6 84.5 118c20.3 40.8 33.8 82.5 33.8 111.9C448 404.2 348.2 512 224 512C98.4 512 0 404.1 0 276.5c0-38.4 17.8-85.3 45.4-131.7C73.3 97.7 112.7 48.6 159.3 5.4zM225.7 416c25.3 0 47.7-7 68.8-21c42.1-29.4 53.4-88.2 28.1-134.4c-4.5-9-16-9.6-22.5-2l-25.2 29.3c-6.6 7.6-18.5 7.4-24.7-.5c-16.5-21-46-58.5-62.8-79.8c-6.3-8-18.3-8.1-24.7-.1c-33.8 42.5-50.8 69.3-50.8 99.4C112 375.4 162.6 416 225.7 416z"></path>
            </svg>
            <span id="user-score" className="font-bold">{userScore}</span>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <a href="/question-bank" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition w-full">
            <div className="flex flex-col items-center space-y-2">
              <svg className="w-10 h-10" fill="#AD6928" viewBox="0 0 45 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M35.7269 0H9.06022C5.37832 0 2.39355 2.98477 2.39355 6.66667V33.3333C2.39355 37.0152 5.37832 40 9.06022 40H35.7269C39.4088 40 42.3936 37.0152 42.3936 33.3333V6.66667C42.3936 2.98477 39.4088 0 35.7269 0Z"></path>
                <path d="M3.72656 14.6667H41.0599V30.6667C41.0599 32.258 40.4278 33.7841 39.3025 34.9093C38.1773 36.0345 36.6512 36.6667 35.0599 36.6667H9.72656C8.13526 36.6667 6.60914 36.0345 5.48392 34.9093C4.3587 33.7841 3.72656 32.258 3.72656 30.6667V14.6667Z" fill="#E59724"></path>
              </svg>
              <h4 className="text-center font-medium text-sm">Question Bank</h4>
            </div>
          </a>
          <a href="/practice-exam" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition w-full">
            <div className="flex flex-col items-center space-y-2">
              <svg className="w-10 h-10" fill="#F68C24" viewBox="0 0 29 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M26.808 18.0448L15.8479 39.3784C15.7056 39.6257 15.4824 39.8163 15.2159 39.9182C14.9495 40.0201 14.656 40.027 14.3851 39.9377C14.1141 39.8484 13.8822 39.6685 13.7285 39.4281C13.5748 39.1878 13.5086 38.9018 13.5412 38.6184V26.0383H1.40771C1.15425 26.0409 0.904881 25.9743 0.686454 25.8457C0.468027 25.7171 0.288818 25.5314 0.168117 25.3085C0.0474162 25.0856 -0.0101936 24.834 0.00147855 24.5808C0.0131507 24.3276 0.0936667 24.0824 0.234361 23.8716L13.9479 0.644589C14.0858 0.392634 14.3069 0.196376 14.5735 0.0893293C14.84 -0.017717 15.1354 -0.028909 15.4093 0.0576618C15.6832 0.144233 15.9185 0.323195 16.0751 0.563991C16.2317 0.804787 16.2999 1.09248 16.2679 1.37793L13.0745 16.2048H25.7414C25.9555 16.208 26.1652 16.2666 26.3499 16.3749C26.5347 16.4832 26.6883 16.6375 26.7957 16.8228C26.9031 17.0081 26.9607 17.218 26.9629 17.4322C26.965 17.6463 26.9117 17.8574 26.808 18.0448Z"></path>
              </svg>
              <h4 className="text-center font-medium text-sm">Practice Exam</h4>
            </div>
          </a>
          <a href="/mock-exam" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition w-full">
            <div className="flex flex-col items-center space-y-2">
              <svg className="w-10 h-10" fill="#F15F66" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M33.3333 0H6.66667C2.98477 0 0 2.98477 0 6.66667V33.3333C0 37.0152 2.98477 40 6.66667 40H33.3333C37.0152 40 40 37.0152 40 33.3333V6.66667C40 2.98477 37.0152 0 33.3333 0Z"></path>
              </svg>
              <h4 className="text-center font-medium text-sm">Mock Exam</h4>
            </div>
          </a>
          <a href="/study-guide" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition w-full">
            <div className="flex flex-col items-center space-y-2">
              <svg className="w-10 h-10" fill="#4B5EAA" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 0C8.95 0 0 8.95 0 20s8.95 20 20 20 20-8.95 20-20S31.05 0 20 0zm0 36C11.18 36 4 28.82 4 20S11.18 4 20 4s16 7.18 16 16-7.18 16-16 16z"></path>
              </svg>
              <h4 className="text-center font-medium text-sm">Study Guide</h4>
            </div>
          </a>
          <a href="/flashcards" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition w-full">
            <div className="flex flex-col items-center space-y-2">
              <svg className="w-10 h-10" fill="#2E7D32" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M36 0H4C1.79 0 0 1.79 0 4v32c0 2.21 1.79 4 4 4h32c2.21 0 4-1.79 4-4V4c0-2.21-1.79-4-4-4z"></path>
              </svg>
              <h4 className="text-center font-medium text-sm">Flashcards</h4>
            </div>
          </a>
        </div>

        {/* Role-Based Actions */}
        <div id="role-based-actions" className="mb-6">
          <h2 className="text-xl font-bold mb-4">Your Actions</h2>
          <div id="actions-container" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {roleBasedActions.length > 0 ? (
              roleBasedActions.map((action, index) => (
                <a
                  key={index}
                  href={action.link}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition w-full"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <svg className="w-10 h-10" fill="#1976D2" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 0C8.95 0 0 8.95 0 20s8.95 20 20 20 20-8.95 20-20S31.05 0 20 0zm0 36C11.18 36 4 28.82 4 20S11.18 4 20 4s16 7.18 16 16-7.18 16-16 16z"></path>
                    </svg>
                    <h4 className="text-center font-medium text-sm">{action.title}</h4>
                  </div>
                </a>
              ))
            ) : (
              <p className="text-center text-sm">Error loading actions</p>
            )}
          </div>
        </div>

        {/* Leaderboard and Other Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Leaderboard */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow w-full">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">Leaderboard</h2>
                <h4 className="text-gray-600 dark:text-gray-400 text-sm">Iron League</h4>
              </div>
              <a href="/leaderboard" className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                </svg>
              </a>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <table id="leaderboard-table" className="w-full">
                <tbody>
                  {leaderboard.length > 0 ? (
                    leaderboard.map((user, index) => (
                      <tr key={index} className="flex justify-between items-center p-3">
                        <a href={`/users/${user.userId}`} className="flex items-center space-x-3">
                          <div>
                            <h2 className="text-sm font-medium">{user.username}</h2>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{user.xp} xp</p>
                          </div>
                        </a>
                        <div className="text-sm font-medium">{user.rank}</div>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-center text-sm">Error loading leaderboard</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow w-full">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">Your Progress</h2>
                <h4 className="text-gray-600 dark:text-gray-400 text-sm">Current Stats</h4>
              </div>
              <a href="/progress" className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                </svg>
              </a>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Questions Answered</span>
                  <span id="questions-answered" className="text-sm">{progress.questionsAnswered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Correct Answers</span>
                  <span id="correct-answers" className="text-sm">{progress.correctAnswers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Accuracy</span>
                  <span id="accuracy" className="text-sm">{progress.accuracy}%</span>
                </div>
                <div className="mt-3">
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                    <div id="progress-bar-accuracy" className="h-2 bg-blue-500 rounded-full" style={{ width: `${progress.accuracy}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Section */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow w-full">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">Achievements</h2>
                <h4 className="text-gray-600 dark:text-gray-400 text-sm">Your Badges</h4>
              </div>
              <a href="/achievements" className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                </svg>
              </a>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div id="achievements-list" className="space-y-3">
                {achievements.length > 0 ? (
                  achievements.map((achievement, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium">{achievement.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{achievement.description}</p>
                      </div>
                      <span className="text-xs text-gray-400">{achievement.date}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm">Error loading achievements</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow w-full">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">Recent Activity</h2>
                <h4 className="text-gray-600 dark:text-gray-400 text-sm">Your Actions</h4>
              </div>
              <a href="/recent-activity" className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                </svg>
              </a>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div id="recent-activity-list" className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                      </div>
                      <span className="text-xs text-gray-400">{activity.date}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm">Error loading recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;