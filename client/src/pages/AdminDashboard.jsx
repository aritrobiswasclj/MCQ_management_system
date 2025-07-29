import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faMusic, faSearch, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [musicForm, setMusicForm] = useState({
    title: '',
    artist: '',
    file_url: '',
  });
  const [filters, setFilters] = useState({
    category_id: '',
    institution_id: '',
    user_id: '',
    search: '',
  });
  const [categories, setCategories] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login', { replace: true });
          return;
        }

        const [questionsRes, categoriesRes, institutionsRes, teachersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/questions', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/categories', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/institutions', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/admin/teachers', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setQuestions(questionsRes.data);
        setCategories(categoriesRes.data);
        setInstitutions(institutionsRes.data);
        setTeachers(teachersRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const applyFilters = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams(filters).toString();
      const response = await axios.get(`http://localhost:5000/api/admin/questions?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to apply filters');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/questions/${questionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(questions.filter((q) => q.question_id !== questionId));
      setSuccess('Question deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete question');
    }
  };

  const handleDeleteTeacherQuestions = async (userId) => {
    if (!window.confirm('Are you sure you want to delete all questions by this teacher? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/admin/questions/teacher/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(questions.filter((q) => q.user_id !== parseInt(userId)));
      setSuccess(response.data.message);
      setFilters({ ...filters, user_id: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete teacher questions');
    }
  };

  const handleMusicChange = (e) => {
    setMusicForm({
      ...musicForm,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleMusicSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/admin/music', musicForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Music added successfully');
      setMusicForm({ title: '', artist: '', file_url: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add music');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-extrabold text-center mb-10 fade-in">Admin Dashboard</h1>

        {error && (
          <div className="bg-red-500/20 text-red-200 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 text-green-200 p-4 rounded-lg mb-6 text-center">
            {success}
          </div>
        )}

        {/* Teachers Management */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 slide-up">
          <h2 className="text-2xl font-semibold mb-4">Manage Teachers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-3">ID</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length > 0 ? (
                  teachers.map((teacher) => (
                    <tr key={teacher.user_id} className="border-t border-gray-600 hover:bg-gray-700 fade-in-up">
                      <td className="p-3">{teacher.user_id}</td>
                      <td className="p-3">{teacher.username}</td>
                      <td className="p-3">{`${teacher.first_name} ${teacher.last_name}`}</td>
                      <td className="p-3">{teacher.email}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-3 text-center text-gray-400">
                      No teachers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Question Management */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 slide-up">
          <h2 className="text-2xl font-semibold mb-4">Manage Questions</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <select
                name="category_id"
                value={filters.category_id}
                onChange={handleFilterChange}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <select
                name="institution_id"
                value={filters.institution_id}
                onChange={handleFilterChange}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Institutions</option>
                {institutions.map((inst) => (
                  <option key={inst.institution_id} value={inst.institution_id}>
                    {inst.institution_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <select
                name="user_id"
                value={filters.user_id}
                onChange={handleFilterChange}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Teachers</option>
                {teachers.map((teacher) => (
                  <option key={teacher.user_id} value={teacher.user_id}>
                    {teacher.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search questions..."
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2 pl-10 focus:ring-2 focus:ring-red-500"
              />
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
            </div>
            <button
              onClick={applyFilters}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-all"
            >
              Apply Filters
            </button>
          </div>
          {filters.user_id && (
            <div className="mb-4">
              <button
                onClick={() => handleDeleteTeacherQuestions(filters.user_id)}
                className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all flex items-center"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Delete All Questions by Selected Teacher
              </button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-3">ID</th>
                  <th className="p-3">Question</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Institution</th>
                  <th className="p-3">Creator</th>
                  <th className="p-3">Public</th>
                  <th className="p-3">Approved</th>
                  <th className="p-3">Active</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.length > 0 ? (
                  questions.map((q) => (
                    <tr key={q.question_id} className="border-t border-gray-600 hover:bg-gray-700 fade-in-up">
                      <td className="p-3">{q.question_id}</td>
                      <td className="p-3">{q.question_text.substring(0, 50)}...</td>
                      <td className="p-3">{q.category_name || 'N/A'}</td>
                      <td className="p-3">{q.institution_name || 'N/A'}</td>
                      <td className="p-3">{q.creator_username || 'N/A'}</td>
                      <td className="p-3">{q.is_public ? 'Yes' : 'No'}</td>
                      <td className="p-3">{q.is_approved ? 'Yes' : 'No'}</td>
                      <td className="p-3">{q.is_active ? 'Yes' : 'No'}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteQuestion(q.question_id)}
                          className="text-red-400 hover:text-red-600"
                          title="Delete Question"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="p-3 text-center text-gray-400">
                      No questions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Music Upload */}
        <div className="bg-gray-800 rounded-xl p-6 slide-up">
          <h2 className="text-2xl font-semibold mb-4">Add Non-Copyright Music</h2>
          <form onSubmit={handleMusicSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={musicForm.title}
                  onChange={handleMusicChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div className="flex-1">
                <label htmlFor="artist" className="block text-sm font-medium mb-1">
                  Artist (Optional)
                </label>
                <input
                  type="text"
                  id="artist"
                  name="artist"
                  value={musicForm.artist}
                  onChange={handleMusicChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="file_url" className="block text-sm font-medium mb-1">
                File URL
              </label>
              <input
                type="url"
                id="file_url"
                name="file_url"
                value={musicForm.file_url}
                onChange={handleMusicChange}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-500 transition-all flex items-center"
            >
              <FontAwesomeIcon icon={faMusic} className="mr-2" />
              Add Music
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;