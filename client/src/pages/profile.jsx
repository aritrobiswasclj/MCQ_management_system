import React from 'react';
import './profile.css';
import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';

const Profile = () => {
  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen relative">
      {/* Jungle Silhouette Animation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="jungle-animation"></div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl relative z-10">
        {/* Header Section */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Focus: Your Profile</h1>
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-800 px-3 py-1 rounded-full text-white">
            <i className="fas fa-fire text-sm"></i>
            <span className="font-bold">০</span>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-gray-800 rounded-2xl shadow-lg p-8 mb-6 transform hover:scale-[1.01] transition-transform duration-300">
          <div className="flex flex-col md:flex-row justify-center items-center">
            {/* Profile Info */}
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <div className="relative">
                <img
                  src="https://www.gravatar.com/avatar/db9308896981e4a8224adccafe190b31?s=500&d=robohash"
                  className="w-28 h-28 rounded-full border-4 border-gray-700 shadow-lg"
                  alt="Profile"
                />
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-700 rounded-full p-2">
                  <i className="fas fa-crown text-amber-900 text-base"></i>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-100">Abu Shaekh</h2>
                <span className="inline-block mt-2 px-4 py-1 bg-gradient-to-r from-amber-600 to-amber-800 text-white rounded-full text-sm font-bold">
                  Student
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Layout for Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-min">
          {/* Past Exam Archives */}
          <div className="bg-gray-800 rounded-2xl shadow-lg p-8 transform hover:scale-[1.01] transition-transform duration-300 md:col-span-2">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">পূর্ববর্তী পরীক্ষার আর্কাইভ</h3>
            <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
              <div className="space-y-4">
                {[
                  { subject: 'Physics Exam', date: 'Jul 10, 2025', score: '85/100' },
                  { subject: 'Chemistry Exam', date: 'Jul 8, 2025', score: '78/100' },
                  { subject: 'Math Exam', date: 'Jul 5, 2025', score: '92/100' },
                  { subject: 'Physics Exam', date: 'Jul 2, 2025', score: '80/100' },
                  { subject: 'Chemistry Exam', date: 'Jun 30, 2025', score: '88/100' },
                  { subject: 'Math Exam', date: 'Jun 25, 2025', score: '90/100' },
                  { subject: 'Physics Exam', date: 'Jun 20, 2025', score: '82/100' },
                ].map((exam, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-100">{exam.subject} - {exam.date}</p>
                    <p className="text-sm text-gray-400">Score: {exam.score}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Past Mistakes */}
          <div className="bg-gray-800 rounded-2xl shadow-lg p-8 transform hover:scale-[1.01] transition-transform duration-300">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">পূর্ববর্তী ভুল</h3>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-2xl text-gray-400"></i>
              </div>
              <p className="text-gray-400">এখনো কোনো ভুল রেকর্ড করা হয়নি</p>
            </div>
          </div>

          {/* Your Preferred Questions */}
          <div className="bg-gray-800 rounded-2xl shadow-lg p-8 transform hover:scale-[1.01] transition-transform duration-300">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">আপনার পছন্দের প্রশ্ন</h3>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center">
                <i className="fas fa-star text-2xl text-gray-400"></i>
              </div>
              <p className="text-gray-400">এখনো কোনো প্রশ্ন পছন্দ করা হয়নি</p>
            </div>
          </div>

          {/* Weekly Points */}
          <div className="bg-gray-800 rounded-2xl shadow-lg p-8 transform hover:scale-[1.01] transition-transform duration-300 md:col-span-2">
            <div className="flex justify-center relative mb-6">
              <h3 className="text-xl font-semibold text-gray-100">সাপ্তাহিক পয়েন্ট</h3>
              <div className="absolute right-0 top-0">
                <button className="text-gray-400 hover:text-amber-500 relative group">
                  <i className="fas fa-info-circle"></i>
                  <div className="absolute hidden group-hover:block bg-gray-700 p-3 rounded-lg shadow-lg z-10 w-64 right-0">
                    <h4 className="font-bold mb-1 text-gray-100">সাপ্তাহিক পয়েন্ট</h4>
                    <p className="text-sm text-gray-400">প্রতি সপ্তাহে শনিবার সাপ্তাহিক পয়েন্ট রিসেট হয়ে যায়</p>
                  </div>
                </button>
              </div>
            </div>
            <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
              <p className="text-gray-400">Weekly points chart would appear here</p>
            </div>
            <div className="text-center">
              <span className="text-gray-400 font-medium">Jul 13 - Jul 19, 2025</span>
            </div>
          </div>

          {/* Preferred Music */}
          <div className="bg-gray-800 rounded-2xl shadow-lg p-8 transform hover:scale-[1.01] transition-transform duration-300">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">পছন্দের সঙ্গীত</h3>
            <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
              <div className="space-y-4">
                {[
                  { song: 'Moonlight Sonata', artist: 'Beethoven' },
                  { song: 'Bohemian Rhapsody', artist: 'Queen' },
                  { song: 'Hotel California', artist: 'Eagles' },
                  { song: 'Imagine', artist: 'John Lennon' },
                ].map((music, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-100">Song: {music.song}</p>
                    <p className="text-sm text-gray-400">Artist: {music.artist}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Streak Calendar */}
          <div className="bg-gray-800 rounded-2xl shadow-lg p-8 transform hover:scale-[1.01] transition-transform duration-300">
            <div className="flex justify-between items-center mb-4">
              <button className="text-gray-400 hover:text-amber-500">
                <i className="fas fa-chevron-left"></i>
              </button>
              <h3 className="text-xl font-semibold text-gray-100">স্ট্রিক July 2025</h3>
              <button className="text-gray-400 hover:text-amber-500">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'].map((day, index) => (
                <div key={index} className="text-sm font-bold text-gray-400">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              {['29', '30', '1', '2', '3', '4', '5', '13', '31', '1', '2'].map((day, index) => (
                <div
                  key={index}
                  className={`day ${index < 2 || index > 8 ? 'inactive' : ''} ${day === '13' ? 'active' : ''}`}
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="border-t border-gray-700 pt-4 mt-4 text-center">
              <p className="font-bold text-gray-300">এই মাসে তুমি ০ দিন প্র্যাকটিস করেছো</p>
            </div>
          </div>

          {/* Progress Report */}
          <div className="bg-gray-800 rounded-2xl shadow-lg p-8 transform hover:scale-[1.01] transition-transform duration-300 md:col-span-2">
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-100">প্রোগ্রেস রিপোর্ট</h3>
            <div className="space-y-3">
              {[
                { subject: 'পদার্থবিজ্ঞান', progress: 3 },
                { subject: 'রসায়ন', progress: 3 },
                { subject: 'উচ্চতর গণিত', progress: 2 },
              ].map((item, index) => (
                <div key={index} className="progress-item">
                  <div className="flex justify-between items-center">
                    <span>{item.subject}</span>
                    <span className="text-xs font-bold text-amber-500">{item.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${item.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;