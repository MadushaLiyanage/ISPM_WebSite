import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  BookOpen
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import './QuizModal.css';

const QuizModal = ({ quiz, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'cybersecurity',
    difficulty: 'beginner',
    timeLimit: 30,
    passingScore: 70,
    questions: [],
    status: 'draft',
    tags: [],
    settings: {
      shuffleQuestions: false,
      shuffleAnswers: true,
      showCorrectAnswers: true,
      allowRetakes: true,
      maxAttempts: 3
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (quiz && (mode === 'edit' || mode === 'view')) {
      setFormData({
        title: quiz.title || '',
        description: quiz.description || '',
        category: quiz.category || 'cybersecurity',
        difficulty: quiz.difficulty || 'beginner',
        timeLimit: quiz.timeLimit || 30,
        passingScore: quiz.passingScore || 70,
        questions: quiz.questions || [],
        status: quiz.status || 'draft',
        tags: quiz.tags || [],
        settings: {
          shuffleQuestions: quiz.settings?.shuffleQuestions || false,
          shuffleAnswers: quiz.settings?.shuffleAnswers || true,
          showCorrectAnswers: quiz.settings?.showCorrectAnswers || true,
          allowRetakes: quiz.settings?.allowRetakes || true,
          maxAttempts: quiz.settings?.maxAttempts || 3
        }
      });
    }
  }, [quiz, mode]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      question: '',
      type: 'multiple-choice',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      explanation: '',
      points: 1
    };
    
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const deleteQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const addOption = (questionIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? {
              ...q,
              options: [...q.options, { text: '', isCorrect: false }]
            }
          : q
      )
    }));
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, qIndex) => 
        qIndex === questionIndex 
          ? {
              ...q,
              options: q.options.map((opt, oIndex) => 
                oIndex === optionIndex 
                  ? { ...opt, [field]: value }
                  : field === 'isCorrect' && value ? { ...opt, isCorrect: false } : opt
              )
            }
          : q
      )
    }));
  };

  const deleteOption = (questionIndex, optionIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? {
              ...q,
              options: q.options.filter((_, oIndex) => oIndex !== optionIndex)
            }
          : q
      )
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mode === 'view') return;
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please enter a quiz description');
      return;
    }
    
    if (formData.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }
    
    // Validate questions
    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];
      if (!question.question.trim()) {
        toast.error(`Question ${i + 1} is missing text`);
        return;
      }
      
      if (question.type === 'multiple-choice') {
        if (question.options.length < 2) {
          toast.error(`Question ${i + 1} needs at least 2 options`);
          return;
        }
        
        const hasCorrectAnswer = question.options.some(opt => opt.isCorrect);
        if (!hasCorrectAnswer) {
          toast.error(`Question ${i + 1} needs at least one correct answer`);
          return;
        }
      }
    }

    setLoading(true);
    
    try {
      if (mode === 'create') {
        await adminAPI.createQuiz(formData);
        toast.success('Quiz created successfully');
      } else if (mode === 'edit') {
        await adminAPI.updateQuiz(quiz._id, formData);
        toast.success('Quiz updated successfully');
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('Failed to save quiz');
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = mode === 'view';

  return (
    <div className="quiz-modal-overlay" onClick={onClose}>
      <div className="quiz-modal" onClick={(e) => e.stopPropagation()}>
        <div className="quiz-modal-header">
          <div className="modal-title">
            <h2>
              {mode === 'create' && 'Create New Quiz'}
              {mode === 'edit' && 'Edit Quiz'}
              {mode === 'view' && 'Quiz Preview'}
            </h2>
            <p>
              {mode === 'create' && 'Create a new cybersecurity awareness quiz'}
              {mode === 'edit' && 'Modify quiz details and questions'}
              {mode === 'view' && 'Review quiz content and settings'}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="quiz-modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            <BookOpen size={16} />
            Basic Info
          </button>
          <button
            className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            <AlertCircle size={16} />
            Questions ({formData.questions.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Clock size={16} />
            Settings
          </button>
        </div>

        <form onSubmit={handleSubmit} className="quiz-modal-form">
          <div className="modal-content">
            {activeTab === 'basic' && (
              <div className="tab-content">
                <div className="form-row">
                  <div className="form-group">
                    <label>Quiz Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Data Classification & Handling Policy"
                      disabled={isViewMode}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what this quiz covers..."
                    rows={3}
                    disabled={isViewMode}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      disabled={isViewMode}
                      required
                    >
                      <option value="cybersecurity">Cybersecurity</option>
                      <option value="compliance">Compliance</option>
                      <option value="phishing">Phishing</option>
                      <option value="policies">Policies</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      disabled={isViewMode}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Time Limit (minutes)</label>
                    <input
                      type="number"
                      value={formData.timeLimit}
                      onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value) || 30)}
                      min="5"
                      max="180"
                      disabled={isViewMode}
                    />
                  </div>

                  <div className="form-group">
                    <label>Passing Score (%)</label>
                    <input
                      type="number"
                      value={formData.passingScore}
                      onChange={(e) => handleInputChange('passingScore', parseInt(e.target.value) || 70)}
                      min="0"
                      max="100"
                      disabled={isViewMode}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Tags</label>
                  <div className="tags-input">
                    <div className="tags-list">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                          {!isViewMode && (
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="tag-remove"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                    {!isViewMode && (
                      <div className="tag-input-container">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          placeholder="Add tag..."
                        />
                        <button type="button" onClick={addTag} className="add-tag-btn">
                          <Plus size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="tab-content">
                <div className="questions-header">
                  <h3>Questions</h3>
                  {!isViewMode && (
                    <button type="button" onClick={addQuestion} className="add-question-btn">
                      <Plus size={16} />
                      Add Question
                    </button>
                  )}
                </div>

                <div className="questions-list">
                  {formData.questions.length === 0 ? (
                    <div className="no-questions">
                      <AlertCircle size={48} />
                      <p>No questions added yet</p>
                      {!isViewMode && (
                        <button type="button" onClick={addQuestion} className="btn-primary">
                          <Plus size={16} />
                          Add First Question
                        </button>
                      )}
                    </div>
                  ) : (
                    formData.questions.map((question, qIndex) => (
                      <div key={qIndex} className="question-card">
                        <div className="question-header">
                          <h4>Question {qIndex + 1}</h4>
                          {!isViewMode && (
                            <button
                              type="button"
                              onClick={() => deleteQuestion(qIndex)}
                              className="delete-question-btn"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        <div className="form-group">
                          <label>Question Text *</label>
                          <textarea
                            value={question.question}
                            onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                            placeholder="Enter your question..."
                            rows={2}
                            disabled={isViewMode}
                            required
                          />
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Question Type</label>
                            <select
                              value={question.type}
                              onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                              disabled={isViewMode}
                            >
                              <option value="multiple-choice">Multiple Choice</option>
                              <option value="true-false">True/False</option>
                              <option value="short-answer">Short Answer</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label>Points</label>
                            <input
                              type="number"
                              value={question.points}
                              onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)}
                              min="1"
                              max="10"
                              disabled={isViewMode}
                            />
                          </div>
                        </div>

                        {question.type === 'multiple-choice' && (
                          <div className="options-section">
                            <div className="options-header">
                              <label>Answer Options</label>
                              {!isViewMode && (
                                <button
                                  type="button"
                                  onClick={() => addOption(qIndex)}
                                  className="add-option-btn"
                                >
                                  <Plus size={14} />
                                  Add Option
                                </button>
                              )}
                            </div>

                            <div className="options-list">
                              {question.options.map((option, oIndex) => (
                                <div key={oIndex} className="option-item">
                                  <div className="option-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={option.isCorrect}
                                      onChange={(e) => updateOption(qIndex, oIndex, 'isCorrect', e.target.checked)}
                                      disabled={isViewMode}
                                    />
                                    <span className="checkmark"></span>
                                  </div>
                                  <input
                                    type="text"
                                    value={option.text}
                                    onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                                    placeholder={`Option ${oIndex + 1}`}
                                    disabled={isViewMode}
                                    className="option-input"
                                  />
                                  {!isViewMode && question.options.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => deleteOption(qIndex, oIndex)}
                                      className="delete-option-btn"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {question.type === 'short-answer' && (
                          <div className="form-group">
                            <label>Correct Answer</label>
                            <input
                              type="text"
                              value={question.correctAnswer || ''}
                              onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                              placeholder="Enter the correct answer..."
                              disabled={isViewMode}
                            />
                          </div>
                        )}

                        <div className="form-group">
                          <label>Explanation (Optional)</label>
                          <textarea
                            value={question.explanation}
                            onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                            placeholder="Explain why this is the correct answer..."
                            rows={2}
                            disabled={isViewMode}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="tab-content">
                <h3>Quiz Settings</h3>

                <div className="settings-grid">
                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={formData.settings.shuffleQuestions}
                        onChange={(e) => handleSettingsChange('shuffleQuestions', e.target.checked)}
                        disabled={isViewMode}
                      />
                      <span className="setting-text">
                        <strong>Shuffle Questions</strong>
                        <small>Randomize question order for each attempt</small>
                      </span>
                    </label>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={formData.settings.shuffleAnswers}
                        onChange={(e) => handleSettingsChange('shuffleAnswers', e.target.checked)}
                        disabled={isViewMode}
                      />
                      <span className="setting-text">
                        <strong>Shuffle Answers</strong>
                        <small>Randomize answer order for multiple choice questions</small>
                      </span>
                    </label>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={formData.settings.showCorrectAnswers}
                        onChange={(e) => handleSettingsChange('showCorrectAnswers', e.target.checked)}
                        disabled={isViewMode}
                      />
                      <span className="setting-text">
                        <strong>Show Correct Answers</strong>
                        <small>Display correct answers after completion</small>
                      </span>
                    </label>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={formData.settings.allowRetakes}
                        onChange={(e) => handleSettingsChange('allowRetakes', e.target.checked)}
                        disabled={isViewMode}
                      />
                      <span className="setting-text">
                        <strong>Allow Retakes</strong>
                        <small>Let users retake the quiz if they fail</small>
                      </span>
                    </label>
                  </div>
                </div>

                {formData.settings.allowRetakes && (
                  <div className="form-group">
                    <label>Maximum Attempts</label>
                    <input
                      type="number"
                      value={formData.settings.maxAttempts}
                      onChange={(e) => handleSettingsChange('maxAttempts', parseInt(e.target.value) || 3)}
                      min="1"
                      max="10"
                      disabled={isViewMode}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="quiz-modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              {isViewMode ? 'Close' : 'Cancel'}
            </button>
            
            {!isViewMode && (
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {mode === 'create' ? 'Create Quiz' : 'Update Quiz'}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizModal;