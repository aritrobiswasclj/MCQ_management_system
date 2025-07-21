
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
        const [userRes, categoriesRes, institutionsRes, tagsRes, myQuestionsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users/me', {
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
          axios.get('http://localhost:5000/api/questions/my-questions', {
            headers: { Authorization: `Bearer ${token}` },
          }),
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
        setMyQuestions(myQuestionsRes.data);
        setPublicQuestions(myQuestionsRes.data); // Initially show user's questions
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        setError('Failed to load data');
      }
    };

    fetchData();
  }, [navigate]);

  const handleFilterChange = async (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));

    try {
      const token = localStorage.getItem('token');
      const params = { ...filters, [name]: value };
      if (params.tags.length > 0) {
        params.tags = params.tags.join(',');
      }
      const response = await axios.get('http://localhost:5000/api/questions/filter', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setPublicQuestions(response.data);
    } catch (err) {
      console.error('Filter error:', err.response?.data || err.message);
      setError('Failed to filter questions');
    }
  };

  const handleTagToggle = (tag_id) => {
    setFilters((prev) => {
      const newTags = prev.tags.includes(tag_id)
        ? prev.tags.filter((id) => id !== tag_id)
        : [...prev, tag_id];
      return { ...prev, tags: newTags };
    });

    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const params = { ...filters, tags: filters.tags.join(',') };
        const response = await axios.get('http://localhost:5000/api/questions/filter', {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        setPublicQuestions(response.data);
      } catch (err) {
        console.error('Filter error:', err.response?.data || err.message);
        setError('Failed to filter questions');
      }
    }, 0);
  };

  const [filters, setFilters] = useState({
    category_id: '',
    institution_id: '',
    tags: [],
    search: '',
  });

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
    if (quizForm.time_limit && quizForm.time_limit <= 0) {
      setError('Time limit must be positive');
      return;
    }
    if (quizForm.pass_percentage && (quizForm.pass_percentage < 0 || quizForm.pass_percentage > 100)) {
      setError('Pass percentage must be between 0 and 100');
      return;
    }
    if (selectedQuestions.some(q => q.point_value <= 0 || !q.display_order)) {
      setError('Each question must have a positive point value and display order');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/quizzes/create',
        {
          title: quizForm.title,
          institution_id: quizForm.institution_id,
          description: quizForm.description || null,
          time_limit: quizForm.time_limit ? parseInt(quizForm.time_limit) : null,
          pass_percentage: quizForm.pass_percentage ? parseInt(quizForm.pass_percentage) : null,
          is_public: quizForm.is_public,
          questions: selectedQuestions,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Quiz created successfully!');
      setQuizForm({ title: '', institution_id: '', description: '', time_limit: '', pass_percentage: '', is_public: false });
      setSelectedQuestions([]);
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      console.error('Create quiz error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to create quiz');
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

  if (!user) {
    return <div className="min-h-screen bg-gray-800 text-amber-100 font-serif text-center pt-20">Loading...</div>;
  }

  if (user.role !== 'teacher' && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-800 text-amber-100 font-serif text-center pt-20">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center p-4">
      <motion.div
        className="bg-amber-100 border-2 border-amber-300 shadow-xl rounded-lg p-8 max-w-4xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">Create a Quiz</h2>

        {error && (
          <motion.div
            className="text-red-600 bg-red-50 border border-red-200 rounded p-2 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            className="text-green-600 bg-green-50 border border-green-200 rounded p-2 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {success}
          </motion.div>
        )}

        {/* Quiz Form */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-900 font-serif text-lg mb-2">Quiz Title *</label>
            <input
              type="text"
              name="title"
              value={quizForm.title}
              onChange={handleQuizFormChange}
              className="w-full p-2 border border-gray-300 rounded bg-amber-50 text-gray-900"
              placeholder="Enter quiz title"
              required
            />
          </div>
          <div>
            <label className="block text-gray-900 font-serif text-lg mb-2">Institution *</label>
            <select
              name="institution_id"
              value={quizForm.institution_id}
              onChange={handleQuizFormChange}
              className="w-full p-2 border border-gray-300 rounded bg-amber-50 text-gray-900"
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
          <div>
            <label className="block text-gray-900 font-serif text-lg mb-2">Description</label>
            <textarea
              name="description"
              value={quizForm.description}
              onChange={handleQuizFormChange}
              className="w-full p-2 border border-gray-300 rounded bg-amber-50 text-gray-900"
              placeholder="Enter quiz description"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-gray-900 font-serif text-lg mb-2">Time Limit (minutes)</label>
            <input
              type="number"
              name="time_limit"
              value={quizForm.time_limit}
              onChange={handleQuizFormChange}
              className="w-full p-2 border border-gray-300 rounded bg-amber-50 text-gray-900"
              placeholder="Enter time limit"
              min="1"
            />
          </div>
          <div>
            <label className="block text-gray-900 font-serif text-lg mb-2">Pass Percentage (%)</label>
            <input
              type="number"
              name="pass_percentage"
              value={quizForm.pass_percentage}
              onChange={handleQuizFormChange}
              className="w-full p-2 border border-gray-300 rounded bg-amber-50 text-gray-900"
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
              className="mr-2"
            />
            <label className="text-gray-900 font-serif text-lg">Make Quiz Public</label>
          </div>
        </div>

        {/* Filters for Public Questions */}
        <div className="mb-6">
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Filter Public Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-900 font-serif mb-2">Category</label>
              <select
                name="category_id"
                value={filters.category_id}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded bg-amber-50 text-gray-900"
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
              <label className="block text-gray-900 font-serif mb-2">Institution</label>
              <select
                name="institution_id"
                value={filters.institution_id}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded bg-amber-50 text-gray-900"
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
              <label className="block text-gray-900 font-serif mb-2">Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded bg-amber-50 text-gray-900"
                placeholder="Search questions..."
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-gray-900 font-serif mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.tag_id}
                  onClick={() => handleTagToggle(tag.tag_id)}
                  className={`px-3 py-1 rounded ${
                    filters.tags.includes(tag.tag_id)
                      ? 'bg-amber-700 text-white'
                      : 'bg-amber-50 border border-gray-300 text-gray-900'
                  }`}
                >
                  {tag.tag_name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Public Questions */}
        <div className="mb-6">
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Public Questions</h3>
          {publicQuestions.length === 0 ? (
            <p className="text-gray-900 font-serif">No public questions available.</p>
          ) : (
            <ul>
              {publicQuestions.map((question, index) => (
                <motion.li
                  key={`public-${question.question_id}`}
                  className="mb-2 p-3 bg-amber-50 rounded border border-gray-300 flex flex-col"
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
                      className="mr-2"
                    />
                    <div>
                      <p className="text-gray-900 font-serif">{question.question_text}</p>
                      <p className="text-sm text-gray-700">
                        Category: {question.category_name} | Institution: {question.institution_name} | Difficulty: {question.difficulty_level}
                      </p>
                    </div>
                  </div>
                  {selectedQuestions.some((q) => q.question_id === question.question_id) && (
                    <div className="mt-2 flex gap-4">
                      <div>
                        <label className="text-gray-900 font-serif mr-2">Points</label>
                        <input
                          type="number"
                          value={selectedQuestions.find((q) => q.question_id === question.question_id).point_value}
                          onChange={(e) => handleQuestionFieldChange(question.question_id, 'point_value', e.target.value)}
                          className="w-20 p-1 border border-gray-300 rounded bg-amber-50 text-gray-900"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-gray-900 font-serif mr-2">Display Order</label>
                        <input
                          type="number"
                          value={selectedQuestions.find((q) => q.question_id === question.question_id).display_order}
                          onChange={(e) => handleQuestionFieldChange(question.question_id, 'display_order', e.target.value)}
                          className="w-20 p-1 border border-gray-300 rounded bg-amber-50 text-gray-900"
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
        <div className="mb-6">
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">My Questions</h3>
          {myQuestions.length === 0 ? (
            <p className="text-gray-900 font-serif">No questions created yet.</p>
          ) : (
            <ul>
              {myQuestions.map((question, index) => (
                <motion.li
                  key={`my-${question.question_id}`}
                  className="mb-2 p-3 bg-amber-50 rounded border border-gray-300 flex flex-col"
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
                      className="mr-2"
                    />
                    <div>
                      <p className="text-gray-900 font-serif">{question.question_text}</p>
                      <p className="text-sm text-gray-700">
                        Category: {question.category_name} | Institution: {question.institution_name} | Difficulty: {question.difficulty_level} | Public: {question.is_public ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                  {selectedQuestions.some((q) => q.question_id === question.question_id) && (
                    <div className="mt-2 flex gap-4">
                      <div>
                        <label className="text-gray-900 font-serif mr-2">Points</label>
                        <input
                          type="number"
                          value={selectedQuestions.find((q) => q.question_id === question.question_id).point_value}
                          onChange={(e) => handleQuestionFieldChange(question.question_id, 'point_value', e.target.value)}
                          className="w-20 p-1 border border-gray-300 rounded bg-amber-50 text-gray-900"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-gray-900 font-serif mr-2">Display Order</label>
                        <input
                          type="number"
                          value={selectedQuestions.find((q) => q.question_id === question.question_id).display_order}
                          onChange={(e) => handleQuestionFieldChange(question.question_id, 'display_order', e.target.value)}
                          className="w-20 p-1 border border-gray-300 rounded bg-amber-50 text-gray-900"
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
          className="bg-amber-700 text-white px-6 py-3 rounded hover:bg-amber-800 transition duration-200"
          onClick={handleCreateQuiz}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Create Quiz
        </motion.button>
      </motion.div>
    </div>
  );
};

export default QuizCreation;
