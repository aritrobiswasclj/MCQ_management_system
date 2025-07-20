import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './QuestionCreation.css';

const QuestionCreation = () => {
  const [questionText, setQuestionText] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [newInstitution, setNewInstitution] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [options, setOptions] = useState([{ option_text: '', is_correct: false }]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [categories, setCategories] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserAndData = async () => {
      try {
        const userRes = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.data.role !== 'teacher') {
          navigate('/profile');
          return;
        }

        const requests = [
          axios.get('http://localhost:5000/api/categories', {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(err => ({ error: err })),
          axios.get('http://localhost:5000/api/institutions', {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(err => ({ error: err })),
          axios.get('http://localhost:5000/api/tags', {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(err => ({ error: err })),
        ];

        const [categoriesRes, institutionsRes, tagsRes] = await Promise.all(requests);

        if (categoriesRes.error) {
          console.error('Categories fetch error:', categoriesRes.error.response?.data || categoriesRes.error.message);
        } else {
          setCategories(categoriesRes.data);
        }
        if (institutionsRes.error) {
          console.error('Institutions fetch error:', institutionsRes.error.response?.data || institutionsRes.error.message);
        } else {
          setInstitutions(institutionsRes.data);
        }
        if (tagsRes.error) {
          console.error('Tags fetch error:', tagsRes.error.response?.data || tagsRes.error.message);
        } else {
          setAvailableTags(tagsRes.data);
        }

        if (categoriesRes.error && institutionsRes.error && tagsRes.error) {
          setError('Failed to fetch categories, institutions, or tags');
        }
      } catch (err) {
        console.error('User fetch error:', err.response?.data || err.message);
        setError('Failed to verify user');
        navigate('/login');
      }
    };

    fetchUserAndData();
  }, [navigate]);

  const handleAddOption = () => {
    setOptions([...options, { option_text: '', is_correct: false }]);
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleSelectTag = (e) => {
    const tagName = e.target.value;
    if (tagName && !tags.includes(tagName)) {
      setTags([...tags, tagName]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        'http://localhost:5000/api/questions/create',
        {
          question_text: questionText,
          category_id: categoryId || undefined,
          new_category: newCategory || undefined,
          institution_id: institutionId || undefined,
          new_institution: newInstitution || undefined,
          difficulty_level: parseInt(difficultyLevel),
          is_public: isPublic,
          options,
          tags,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Question added successfully!');
      setQuestionText('');
      setOptions([{ option_text: '', is_correct: false }]);
      setIsPublic(false);
      const [tagsRes, institutionsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tags', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:5000/api/institutions', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setAvailableTags(tagsRes.data);
      setInstitutions(institutionsRes.data);
    } catch (err) {
      console.error('Question submission error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to add question');
    }
  };

  const handleDone = () => {
    navigate('/profile');
  };

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div className="container">
      <motion.div
        className="form-container"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <h2>Create Questions</h2>
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
        <form onSubmit={handleAddQuestion}>
          <div className="form-group">
            <label>Question Text</label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={newCategory}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or enter new category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Institution</label>
            <select
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
              disabled={newInstitution}
            >
              <option value="">Select Institution</option>
              {institutions.map((inst) => (
                <option key={inst.institution_id} value={inst.institution_id}>
                  {inst.institution_name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or enter new institution"
              value={newInstitution}
              onChange={(e) => setNewInstitution(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Difficulty Level (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Tags</label>
            <select
              onChange={handleSelectTag}
              value=""
            >
              <option value="">Select Tag</option>
              {availableTags.map((tag) => (
                <option key={tag.tag_id} value={tag.tag_name}>
                  {tag.tag_name}
                </option>
              ))}
            </select>
            <div className="tag-input-container">
              <input
                type="text"
                placeholder="Enter new tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <motion.button
                type="button"
                className="add-tag-btn"
                onClick={handleAddTag}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add Tag
              </motion.button>
            </div>
            <div className="tag-list">
              {tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Options</label>
            {options.map((option, index) => (
              <div key={index} className="option-container">
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option.option_text}
                  onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                  required
                />
                <input
                  type="checkbox"
                  checked={option.is_correct}
                  onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                />
                <label>Correct</label>
                {options.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveOption(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <motion.button
              type="button"
              className="add-option-btn"
              onClick={handleAddOption}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Option
            </motion.button>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span>Public</span>
            </label>
          </div>
          <div className="button-group">
            <motion.button
              type="submit"
              className="submit-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Question
            </motion.button>
            <motion.button
              type="button"
              className="done-btn"
              onClick={handleDone}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Done
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default QuestionCreation;