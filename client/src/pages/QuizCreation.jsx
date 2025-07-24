import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Custom debounce function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-amber-100 font-serif text-center pt-20">
          <h2 className="text-3xl font-bold">Something went wrong.</h2>
          <p>{this.state.error?.message || 'Unknown error'}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const QuizCreation = () => {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [tags, setTags] = useState([]);
  const [publicQuestions, setPublicQuestions] = useState([]);
  const [myQuestions, setMyQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [quizForm, setQuizForm] = useState({
    title: '',
    institution_id: '',
    description: '',
    time_limit: '',
    pass_percentage: '',
    is_public: false,
  });
  const [filters, setFilters] = useState({
    category_id: '',
    institution_id: '',
    tags: [],
    search: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Debounced function to fetch questions
  const fetchQuestions = useCallback(
    debounce(async (filterParams, type) => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        const params = {};
        if (filterParams.category_id) {
          params.category_id = parseInt(filterParams.category_id);
        }
        if (filterParams.institution_id) {
          params.institution_id = parseInt(filterParams.institution_id);
        }
        if (filterParams.search) {
          params.search = filterParams.search;
        }
        if (filterParams.tags.length > 0) {
          params.tags = filterParams.tags.join(',');
        }
        console.log(`Fetching ${type} questions with params:`, params);
        const endpoint = type === 'public' ? '/api/questions/filter' : '/api/questions/my-questions';
        const response = await axios.get(`http://localhost:5000${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        console.log(`${type} questions response:`, response.data);
        if (type === 'public') {
          setPublicQuestions(response.data || []);
        } else {
          setMyQuestions(response.data || []);
        }
      } catch (err) {
        console.error(`${type} filter error:`, err.response?.data || err.message);
        setError(`Failed to filter ${type} questions: ${err.response?.data?.error || err.message}`);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, categoriesRes, institutionsRes, tagsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users/me', { headers:

 { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/categories', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/institutions', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/tags', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const userData = userRes.data;
        if (userData.role !== 'teacher' && userData.role !== 'admin') {
          setError('Only teachers or admins can create quizzes');
          setTimeout(() => navigate('/profile'), 2000);
          return;
        }

        setUser(userData);
        setCategories(categoriesRes.data);
        setInstitutions(institutionsRes.data);
        setTags(tagsRes.data);

        // Fetch initial questions
        fetchQuestions(filters, 'public');
        fetchQuestions(filters, 'my');
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        setError('Failed to load data');
      }
    };

    fetchData();
  }, [navigate, fetchQuestions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      if (process.env.NODE_ENV !== 'production') {
        console.log('Updated filters:', newFilters);
      }
      fetchQuestions(newFilters, 'public');
      fetchQuestions(newFilters, 'my');
      return newFilters;
    });
  };

  const handleTagToggle = (tag_id) => {
    setFilters((prev) => {
      const tags = Array.isArray(prev.tags) ? prev.tags : [];
      const newTags = tags.includes(tag_id)
        ? tags.filter((id) => id !== tag_id)
        : [...tags, tag_id];
      const newFilters = { ...prev, tags: newTags };
      if (process.env.NODE_ENV !== 'production') {
        console.log('Updated filters with tag:', newFilters);
      }
      fetchQuestions(newFilters, 'public');
      fetchQuestions(newFilters, 'my');
      return newFilters;
    });
  };

  const handleQuestionSelect = (question_id) => {
    setSelectedQuestions((prev) => {
      const existing = prev.find((q) => q.question_id === question_id);
      if (existing) {
        return prev.filter((q) => q.question_id !== question_id);
      } else {
        return [...prev, { question_id, point_value: 1, display_order: prev.length + 1 }];
      }
    });
  };

  const handleQuestionFieldChange = (question_id, field, value) => {
    setSelectedQuestions((prev) =>
      prev.map((q) =>
        q.question_id === question_id ? { ...q, [field]: parseInt(value) || 1 } : q
      )
    );
  };

  const handleQuizFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateQuiz = async () => {
    if (!quizForm.title || !quizForm.institution_id || selectedQuestions.length === 0) {
      setError('Quiz title, institution, and at least one question are required');
      return;
    }
    if (quizForm.title.length > 150) {
      setError('Quiz title must be 150 characters or less');
      return;
    }
    if (quizForm.time_limit && parseInt(quizForm.time_limit) <= 0) {
      setError('Time limit must be positive');
      return;
    }
    if (quizForm.pass_percentage && (parseInt(quizForm.pass_percentage) < 0 || parseInt(quizForm.pass_percentage) > 100)) {
      setError('Pass percentage must be between 0 and 100');
      return;
    }
    if (selectedQuestions.some((q) => q.point_value <= 0 || !q.display_order)) {
      setError('Each question must have a positive point value and display order');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const payload = {
        title: quizForm.title,
        institution_id: parseInt(quizForm.institution_id),
        description: quizForm.description || null,
        time_limit: quizForm.time_limit ? parseInt(quizForm.time_limit) : null,
        pass_percentage: quizForm.pass_percentage ? parseInt(quizForm.pass_percentage) : null,
        is_public: quizForm.is_public,
        questions: selectedQuestions,
      };
      const response = await axios.post(
        'http://localhost:5000/api/quizzes/create',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Quiz created successfully!');
      setQuizForm({ title: '', institution_id: '', description: '', time_limit: '', pass_percentage: '', is_public: false });
      setSelectedQuestions([]);
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      console.error('Create quiz error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center p-8">
        {(!user || (user.role !== 'teacher' && user.role !== 'admin')) ? (
          <div className="text-amber-100 font-serif text-center pt-20 text-3xl">
            {error || 'Loading...'}
          </div>
        ) : (
          <motion.div
            className="bg-gradient-to-br from-amber-100 to-amber-50 border-4 border-amber-400 shadow-2xl rounded-2xl p-12 max-w-7xl w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-5xl font-serif font-extrabold text-gray-900 mb-12 tracking-tighter">Create a Quiz</h2>

            {error && (
              <motion.div
                className="text-red-600 bg-red-50 border-2 border-red-400 rounded-lg p-4 mb-8 shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                className="text-green-600 bg-green-50 border-2 border-green-400 rounded-lg p-4 mb-8 shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {success}
              </motion.div>
            )}
            {loading && (
              <motion.div
                className="text-amber-600 bg-amber-50 border-2 border-amber-400 rounded-lg p-4 mb-8 shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                Loading...
              </motion.div>
            )}

            {/* Quiz Form */}
            <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-gray-900 font-serif text-2xl mb-3 font-extrabold tracking-tight">Quiz Title *</label>
                <input
                  type="text"
                  name="title"
                  value={quizForm.title}
                  onChange={handleQuizFormChange}
                  className="w-full p-4 border-2 border-amber-400 rounded-xl bg-amber-50 text-gray-900 focus:ring-4 focus:ring-amber-500 transition shadow-md hover:shadow-lg"
                  placeholder="Enter quiz title"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-900 font-serif text-2xl mb-3 font-extrabold tracking-tight">Institution *</label>
                <select
                  name="institution_id"
                  value={quizForm.institution_id}
                  onChange={handleQuizFormChange}
                  className="w-full p-4 border-2 border-amber-400 rounded-xl bg-amber-50 text-gray-900 focus:ring-4 focus:ring-amber-500 transition shadow-md hover:shadow-lg"
                  required
                >
                  <option value="">Select Institution</option>
                  {institutions.map((inst) => (
                    <option key={inst.institution_id} value={inst.institution_id}>
                      {inst.institution_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-900 font-serif text-2xl mb-3 font-extrabold tracking-tight">Description</label>
                <textarea
                  name="description"
                  value={quizForm.description}
                  onChange={handleQuizFormChange}
                  className="w-full p-4 border-2 border-amber-400 rounded-xl bg-amber-50 text-gray-900 focus:ring-4 focus:ring-amber-500 transition shadow-md hover:shadow-lg"
                  placeholder="Enter quiz description"
                  rows="5"
                />
              </div>
              <div>
                <label className="block text-gray-900 font-serif text-2xl mb-3 font-extrabold tracking-tight">Time Limit (minutes)</label>
                <input
                  type="number"
                  name="time_limit"
                  value={quizForm.time_limit}
                  onChange={handleQuizFormChange}
                  className="w-full p-4 border-2 border-amber-400 rounded-xl bg-amber-50 text-gray-900 focus:ring-4 focus:ring-amber-500 transition shadow-md hover:shadow-lg"
                  placeholder="Enter time limit"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-gray-900 font-serif text-2xl mb-3 font-extrabold tracking-tight">Pass Percentage (%)</label>
                <input
                  type="number"
                  name="pass_percentage"
                  value={quizForm.pass_percentage}
                  onChange={handleQuizFormChange}
                  className="w-full p-4 border-2 border-amber-400 rounded-xl bg-amber-50 text-gray-900 focus:ring-4 focus:ring-amber-500 transition shadow-md hover:shadow-lg"
                  placeholder="Enter pass percentage"
                  min="0"
                  max="100"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_public"
                  checked={quizForm.is_public}
                  onChange={handleQuizFormChange}
                  className="w-6 h-6 text-amber-700 border-amber-400 rounded focus:ring-amber-500"
                />
                <label className="ml-4 text-gray-900 font-serif text-2xl font-extrabold tracking-tight">Make Quiz Public</label>
              </div>
            </div>

            {/* Filters for Questions */}
            <div className="mb-12">
              <h3 className="text-4xl font-serif font-extrabold text-gray-900 mb-8 tracking-tighter">Filter Questions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <label className="block text-gray-900 font-serif text-2xl mb-3 font-extrabold tracking-tight">Category</label>
                  <select
                    name="category_id"
                    value={filters.category_id}
                    onChange={handleFilterChange}
                    className="w-full p-4 border-2 border-amber-400 rounded-xl bg-amber-50 text-gray-900 focus:ring-4 focus:ring-amber-500 transition shadow-md hover:shadow-lg"
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
                  <label className="block text-gray-900 font-serif text-2xl mb-3 font-extrabold tracking-tight">Institution</label>
                  <select
                    name="institution_id"
                    value={filters.institution_id}
                    onChange={handleFilterChange}
                    className="w-full p-4 border-2 border-amber-400 rounded-xl bg-amber-50 text-gray-900 focus:ring-4 focus:ring-amber-500 transition shadow-md hover:shadow-lg"
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
                  <label className="block text-gray-900 font-serif text-2xl mb-3 font-extrabold tracking-tight">Search</label>
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="w-full p-4 border-2 border-amber-400 rounded-xl bg-amber-50 text-gray-900 focus:ring-4 focus:ring-amber-500 transition shadow-md hover:shadow-lg"
                    placeholder="Search questions..."
                  />
                </div>
              </div>
              <div className="mt-8">
                <label className="block text-gray-900 font-serif text-2xl mb-3 font-extrabold tracking-tight">Tags</label>
                <div className="flex flex-wrap gap-4">
                  {tags.map((tag) => (
                    <motion.button
                      key={tag.tag_id}
                      onClick={() => handleTagToggle(tag.tag_id)}
                      className={`px-6 py-3 rounded-xl shadow-lg ${
                        filters.tags.includes(tag.tag_id)
                          ? 'bg-gradient-to-r from-amber-700 to-amber-600 text-white'
                          : 'bg-amber-50 border-2 border-amber-400 text-gray-900 hover:bg-gradient-to-r hover:from-amber-200 hover:to-amber-100'
                      } transition font-serif text-lg font-bold tracking-tight`}
                      whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {tag.tag_name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Public Questions */}
            <div className="mb-12">
              <h3 className="text-4xl font-serif font-extrabold text-gray-900 mb-8 tracking-tighter">Public Questions</h3>
              {loading ? (
                <p className="text-amber-600 font-serif text-xl">Loading questions...</p>
              ) : publicQuestions.length === 0 ? (
                <p className="text-gray-900 font-serif text-xl">
                  {filters.category_id || filters.institution_id || filters.search || filters.tags.length > 0
                    ? 'No public questions match the selected filters. Try adjusting your filters.'
                    : 'No approved public questions are available. Create and approve some questions first.'}
                </p>
              ) : (
                <ul className="space-y-6">
                  {publicQuestions.map((question, index) => (
                    <motion.li
                      key={`public-${question.question_id}`}
                      className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-400 shadow-xl hover:shadow-2xl transition"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.some((q) => q.question_id === question.question_id)}
                          onChange={() => handleQuestionSelect(question.question_id)}
                          className="w-6 h-6 text-amber-700 border-amber-400 rounded focus:ring-amber-500"
                        />
                        <div className="ml-4 flex-1">
                          <p className="text-gray-900 font-serif text-xl font-bold tracking-tight">{question.question_text}</p>
                          <p className="text-sm text-gray-700 mt-2">
                            Category: {question.category_name} | Institution: {question.institution_name} | Difficulty: {question.difficulty_level}
                          </p>
                        </div>
                      </div>
                      {selectedQuestions.some((q) => q.question_id === question.question_id) && (
                        <div className="mt-4 flex flex-col sm:flex-row gap-6">
                          <div>
                            <label className="text-gray-900 font-serif text-base font-bold tracking-tight mr-3">Points</label>
                            <input
                              type="number"
                              value={selectedQuestions.find((q) => q.question_id === question.question_id).point_value}
                              onChange={(e) => handleQuestionFieldChange(question.question_id, 'point_value', e.target.value)}
                              className="w-32 p-3 border-2 border-amber-400 rounded-lg bg-amber-50 text-gray-900 focus:ring-4 focus:ring-amber-500 transition shadow-md hover:shadow-lg"
                              min="1"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-gray-900 font-serif text-base font-bold tracking-tight mr-3">Display Order</label>
                            <input
                              type="number"
                              value={selectedQuestions.find((q) => q.question_id === question.question_id).display_order}
                              onChange={(e) => handleQuestionFieldChange(question.question_id, 'display_order', e.target.value)}
                              className="w-32 p-3 border-2 border-amber-400 rounded-lg bg-amber-50 text-gray-900 focus:ring-4 focus:ring-amber-500 transition shadow-md hover:shadow-lg"
                              min="1"
                              required
                            />
                          </div>
                        </div>
                      )}
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* User's Questions */}
            <div className="mb-12">
              <h3 className="text-4xl font-serif font-extrabold text-gray-900 mb-8 tracking-tighter">My Questions</h3>
              {loading ? (
                <p className="text-amber-600 font-serif text-xl">Loading questions...</p>
              ) : myQuestions.length === 0 ? (
                <p className="text-gray-900 font-serif text-xl">
                  {filters.category_id || filters.institution_id || filters.search || filters.tags.length > 0
                    ? 'No questions match the selected filters. Try adjusting your filters.'
                    : 'No questions created yet. Create some questions to get started.'}
                </p>
              ) : (
                <ul className="space-y-6">
                  {myQuestions.map((question, index) => (
                    <motion.li
                      key={`my-${question.question_id}`}
                      className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-400 shadow-xl hover:shadow-2xl transition"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.some((q) => q.question_id === question.question_id)}
                          onChange={() => handleQuestionSelect(question.question_id)}
                          className="w-6 h-6 text-amber-700 border-amber-400 rounded focus:ring-amber-500"
                        />
                        <div className="ml-4 flex-1">
                          <p className="text-gray-900 font-serif text-xl font-bold tracking-tight">{question.question_text}</p>
                          <p className="text-sm text-gray-700 mt-2">
                            Category: {question.category_name} | Institution: {question.institution_name} | Difficulty: {question.difficulty_level} | Public: {question.is_public ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </div>
                      {selectedQuestions.some((q) => q.question_id === question.question_id) && (
                        <div className="mt-4 flex flex-col sm:flex-row gap-6">
                          <div>
                            <label className="text-gray-900 font-serif text-base font-bold tracking-tight mr-3">Points</label>
                            <input
                              type="number"
                              value={selectedQuestions.find((q) => q.question_id === question.question_id).point_value}
                              onChange={(e) => handleQuestionFieldChange(question.question_id, 'point_value', e.target.value)}
                              className="w-32 p-3 border-2 border-amber-400 rounded-lg bg-amber-50 text-gray-900 focus:ring-4 focus:ring-amber-500 transition shadow-md hover:shadow-lg"
                              min="1"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-gray-900 font-serif text-base font-bold tracking-tight mr-3">Display Order</label>
                            <input
                              type="number"
                              value={selectedQuestions.find((q) => q.question_id === question.question_id).display_order}
                              onChange={(e) => handleQuestionFieldChange(question.question_id, 'display_order', e.target.value)}
                              className="w-32 p-3 border-2 border-amber-400 rounded-lg bg-amber-50 text-gray-900 focus:ring-4 focus:ring-amber-500 transition shadow-md hover:shadow-lg"
                              min="1"
                              required
                            />
                          </div>
                        </div>
                      )}
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Create Quiz Button */}
            <motion.button
              className="bg-gradient-to-r from-amber-700 to-amber-600 text-white px-12 py-4 rounded-xl shadow-xl hover:bg-gradient-to-r hover:from-amber-800 hover:to-amber-700 transition duration-300 font-serif text-2xl font-extrabold tracking-tight"
              onClick={handleCreateQuiz}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Quiz'}
            </motion.button>
          </motion.div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default QuizCreation;