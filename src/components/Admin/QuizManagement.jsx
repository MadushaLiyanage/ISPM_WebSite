import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit2, 
  Trash2, 
  RefreshCw,
  Calendar,
  Clock,
  Users,
  BarChart3,
  CheckCircle,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import QuizModal from './QuizModal';
import './QuizManagement.css';

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'

  useEffect(() => {
    fetchQuizzes();
  }, [currentPage, searchTerm, filterStatus, filterCategory]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterCategory !== 'all' && { category: filterCategory })
      };
      
      const response = await adminAPI.getQuizzes(params);
      
      if (response.data.success) {
        setQuizzes(response.data.data.quizzes);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = () => {
    setSelectedQuiz(null);
    setModalMode('create');
    setShowQuizModal(true);
  };

  const handleEditQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setModalMode('edit');
    setShowQuizModal(true);
  };

  const handleViewQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setModalMode('view');
    setShowQuizModal(true);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await adminAPI.deleteQuiz(quizId);
        toast.success('Quiz deleted successfully');
        fetchQuizzes();
      } catch (error) {
        console.error('Error deleting quiz:', error);
        toast.error('Failed to delete quiz');
      }
    }
  };

  const handlePublishQuiz = async (quizId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      const publishedAt = newStatus === 'published' ? new Date() : null;
      
      await adminAPI.updateQuiz(quizId, { 
        status: newStatus,
        publishedAt
      });
      
      toast.success(`Quiz ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
      fetchQuizzes();
    } catch (error) {
      console.error('Error updating quiz status:', error);
      toast.error('Failed to update quiz status');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'DRAFT', color: 'gray', icon: Edit2 },
      published: { label: 'PUBLISHED', color: 'green', icon: CheckCircle },
      archived: { label: 'ARCHIVED', color: 'red', icon: AlertCircle }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <span className={`status-badge ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const getCategoryColor = (category) => {
    const colors = {
      cybersecurity: 'blue',
      compliance: 'purple',
      phishing: 'orange',
      policies: 'green',
      general: 'gray'
    };
    return colors[category] || 'gray';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredQuizzes = quizzes;

  return (
    <div className="quiz-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Quiz Management</h1>
            <p>Manage and organize quiz content for employee training.</p>
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={handleCreateQuiz}>
              <Plus size={16} />
              New Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-container">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="cybersecurity">Cybersecurity</option>
            <option value="compliance">Compliance</option>
            <option value="phishing">Phishing</option>
            <option value="policies">Policies</option>
            <option value="general">General</option>
          </select>
          
          <button className="refresh-btn" onClick={fetchQuizzes}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quizzes Section */}
      <div className="quizzes-section">
        <div className="section-header">
          <h2>Quizzes</h2>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading quizzes...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <BarChart3 size={48} />
            </div>
            <h3>No quizzes found</h3>
            <p>Create your first cybersecurity quiz to get started.</p>
            <button className="btn-primary" onClick={handleCreateQuiz}>
              <Plus size={16} />
              Create Quiz
            </button>
          </div>
        ) : (
          <div className="quizzes-grid">
            {filteredQuizzes.map((quiz) => (
              <div key={quiz._id} className="quiz-card">
                <div className="quiz-card-header">
                  <div className="quiz-status">
                    {getStatusBadge(quiz.status)}
                    <span className={`category-badge ${getCategoryColor(quiz.category)}`}>
                      {quiz.category.toUpperCase()}
                    </span>
                  </div>
                  <div className="quiz-meta">
                    <span className="quiz-questions">
                      {quiz.questions?.length || 0} QS
                    </span>
                  </div>
                </div>

                <div className="quiz-card-content">
                  <h3 className="quiz-title">{quiz.title}</h3>
                  <p className="quiz-description">{quiz.description}</p>
                  
                  <div className="quiz-details">
                    <div className="detail-item">
                      <Clock size={14} />
                      <span>{quiz.timeLimit} min</span>
                    </div>
                    <div className="detail-item">
                      <Users size={14} />
                      <span>{quiz.metadata?.totalAttempts || 0} attempts</span>
                    </div>
                    <div className="detail-item">
                      <Calendar size={14} />
                      <span>{formatDate(quiz.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="quiz-card-actions">
                  <button
                    className="action-btn preview"
                    onClick={() => handleViewQuiz(quiz)}
                    title="Preview"
                  >
                    <Eye size={16} />
                    Preview
                  </button>
                  
                  <button
                    className="action-btn edit"
                    onClick={() => handleEditQuiz(quiz)}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  
                  <button
                    className={`action-btn ${quiz.status === 'published' ? 'unpublish' : 'publish'}`}
                    onClick={() => handlePublishQuiz(quiz._id, quiz.status)}
                    title={quiz.status === 'published' ? 'Unpublish' : 'Publish'}
                  >
                    <PlayCircle size={16} />
                    {quiz.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteQuiz(quiz._id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="pagination-btn"
            >
              Previous
            </button>
            
            <div className="page-numbers">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Quiz Modal */}
      {showQuizModal && (
        <QuizModal
          quiz={selectedQuiz}
          mode={modalMode}
          onClose={() => setShowQuizModal(false)}
          onSave={() => {
            setShowQuizModal(false);
            fetchQuizzes();
          }}
        />
      )}
    </div>
  );
};

export default QuizManagement;