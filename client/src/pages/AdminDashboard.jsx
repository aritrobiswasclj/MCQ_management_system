import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [teachers, setTeachers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({ category_id: '', institution_id: '', user_id: '', search: '' });
  const [musicData, setMusicData] = useState({ title: '', artist: '', music_file: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.data.role !== 'admin') {
          navigate('/profile');
          return;
        }

        const teachersRes = await axios.get('http://localhost:5000/api/admin/teachers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeachers(teachersRes.data);

        const questionsRes = await axios.get('http://localhost:5000/api/admin/questions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuestions(questionsRes.data);
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        setError('Failed to load data');
      }
    };

    fetchData();
  }, [navigate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = {};
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.institution_id) params.institution_id = filters.institution_id;
      if (filters.user_id) params.user_id = filters.user_id;
      if (filters.search) params.search = filters.search;

      const questionsRes = await axios.get('http://localhost:5000/api/admin/questions', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setQuestions(questionsRes.data);
    } catch (err) {
      console.error('Filter error:', err.response?.data || err.message);
      setError('Failed to apply filters');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/questions/${questionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(questions.filter((q) => q.question_id !== questionId));
      setSuccess('Question deleted successfully');
    } catch (err) {
      console.error('Delete question error:', err.response?.data || err.message);
      setError('Failed to delete question');
    }
  };

  const handleDeleteTeacherQuestions = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/questions/teacher/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(questions.filter((q) => q.user_id !== userId));
      setSuccess('Teacher questions deleted successfully');
    } catch (err) {
      console.error('Delete teacher questions error:', err.response?.data || err.message);
      setError('Failed to delete teacher questions');
    }
  };

  const handleAddMusic = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('title', musicData.title);
    if (musicData.artist) formData.append('artist', musicData.artist);
    if (musicData.music_file) formData.append('music_file', musicData.music_file);

    try {
      const response = await axios.post('http://localhost:5000/api/admin/music', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Music added successfully!');
      setMusicData({ title: '', artist: '', music_file: null });
      document.getElementById('music_file').value = ''; // Reset file input
    } catch (err) {
      console.error('Music upload error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to add music');
    }
  };

  const handleMusicInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'music_file') {
      setMusicData((prev) => ({ ...prev, music_file: files[0] }));
    } else {
      setMusicData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div className="container">
      <motion.div
        className="dashboard"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2>Admin Dashboard</h2>
        {error && (
          <motion.div
            className="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            className="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {success}
          </motion.div>
        )}

        <section className="section">
          <h3>Add Non-Copyright Music</h3>
          <form onSubmit={handleAddMusic}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={musicData.title}
                onChange={handleMusicInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Artist (Optional)</label>
              <input
                type="text"
                name="artist"
                value={musicData.artist}
                onChange={handleMusicInputChange}
              />
            </div>
            <div className="form-group">
              <label>Upload Music File (MP3/MP4)</label>
              <input
                type="file"
                id="music_file"
                name="music_file"
                accept=".mp3,.mp4"
                onChange={handleMusicInputChange}
                required
              />
            </div>
            <motion.button
              type="submit"
              className="submit-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Music
            </motion.button>
          </form>
        </section>

        <section className="section">
          <h3>Manage Teachers</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.user_id}>
                    <td>{teacher.username}</td>
                    <td>{teacher.email}</td>
                    <td>{teacher.first_name}</td>
                    <td>{teacher.last_name}</td>
                    <td>
                      <motion.button
                        className="delete-btn"
                        onClick={() => handleDeleteTeacherQuestions(teacher.user_id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Delete Questions
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="section">
          <h3>Manage Questions</h3>
          <div className="filter-container">
            <input
              type="text"
              name="search"
              placeholder="Search questions..."
              value={filters.search}
              onChange={handleFilterChange}
            />
            <select name="category_id" value={filters.category_id} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              {/* Add category options dynamically */}
            </select>
            <select name="institution_id" value={filters.institution_id} onChange={handleFilterChange}>
              <option value="">All Institutions</option>
              {/* Add institution options dynamically */}
            </select>
            <select name="user_id" value={filters.user_id} onChange={handleFilterChange}>
              <option value="">All Teachers</option>
              {teachers.map((teacher) => (
                <option key={teacher.user_id} value={teacher.user_id}>
                  {teacher.username}
                </option>
              ))}
            </select>
            <motion.button
              className="filter-btn"
              onClick={handleApplyFilters}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Apply Filters
            </motion.button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Category</th>
                  <th>Institution</th>
                  <th>Creator</th>
                  <th>Difficulty</th>
                  <th>Public</th>
                  <th>Approved</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question.question_id}>
                    <td>{question.question_text}</td>
                    <td>{question.category_name}</td>
                    <td>{question.institution_name}</td>
                    <td>{question.creator_username}</td>
                    <td>{question.difficulty_level}</td>
                    <td>{question.is_public ? 'Yes' : 'No'}</td>
                    <td>{question.is_approved ? 'Yes' : 'No'}</td>
                    <td>
                      <motion.button
                        className="delete-btn"
                        onClick={() => handleDeleteQuestion(question.question_id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Delete
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;