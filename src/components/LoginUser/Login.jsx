import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: '',
    position: ''
  });

  // Handle input changes for login
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.id]: e.target.value
    });
    setError(''); // Clear error when user starts typing
  };

  // Handle input changes for sign up
  const handleSignUpChange = (e) => {
    const field = e.target.id.replace('signup-', '');
    setSignUpData({
      ...signUpData,
      [field]: e.target.value
    });
    setError(''); // Clear error when user starts typing
  };

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (data.success) {
        // Use AuthContext login method
        authLogin(data.data, data.token);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle sign up form submission
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signUpData),
      });

      const data = await response.json();

      if (data.success) {
        // Use AuthContext login method
        authLogin(data.data, data.token);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle between login and sign up forms
  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setLoginData({ email: '', password: '' });
    setSignUpData({ name: '', email: '', password: '', role: '', department: '', position: '' });
  };
  return (
    <div id="login-page" className="page-container" role="main" aria-labelledby="login-heading">
        <div className="login-container">
            <div className="card">
                <div className="card__body">
                    <div className="login-header">
                        <h1 id="login-heading">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
                        <p>{isSignUp ? 'Sign up to get started' : 'Sign in to access your dashboard'}</p>
                    </div>
                    
                    {/* Login Form */}
                    {!isSignUp && (
                      <form onSubmit={handleLogin} className="login-form" autoComplete="on">
                          <div className="form-group">
                              <label htmlFor="email" className="form-label">Email</label>
                              <input 
                                type="email" 
                                id="email" 
                                className="form-control" 
                                required 
                                autoComplete="email"
                                value={loginData.email}
                                onChange={handleLoginChange}
                                disabled={loading}
                              />
                          </div>
                          
                          <div className="form-group">
                              <label htmlFor="password" className="form-label">Password</label>
                              <input 
                                type="password" 
                                id="password" 
                                className="form-control" 
                                required 
                                autoComplete="current-password"
                                value={loginData.password}
                                onChange={handleLoginChange}
                                disabled={loading}
                              />
                          </div>
                          
                          {error && (
                            <div className="error-message" role="alert" aria-live="polite">
                              {error}
                            </div>
                          )}
                          
                          <div className="form-actions">
                              <button 
                                type="submit" 
                                className="btn btn--primary btn--full-width"
                                disabled={loading}
                              >
                                  {loading ? 'Signing In...' : 'Sign In'}
                              </button>
                          </div>
                          
                          <div className="form-footer">
                              <p>Don't have an account? 
                                <button type="button" onClick={toggleForm} className="link-button">
                                  Sign up
                                </button>
                              </p>
                          </div>
                      </form>
                    )}
                    
                    {/* Sign Up Form */}
                    {isSignUp && (
                      <form onSubmit={handleSignUp} className="login-form" autoComplete="on">
                          <div className="form-group">
                              <label htmlFor="signup-name" className="form-label">Full Name</label>
                              <input 
                                type="text" 
                                id="signup-name" 
                                className="form-control" 
                                required 
                                autoComplete="name"
                                value={signUpData.name}
                                onChange={handleSignUpChange}
                                disabled={loading}
                              />
                          </div>
                          
                          <div className="form-group">
                              <label htmlFor="signup-email" className="form-label">Email</label>
                              <input 
                                type="email" 
                                id="signup-email" 
                                className="form-control" 
                                required 
                                autoComplete="email"
                                value={signUpData.email}
                                onChange={handleSignUpChange}
                                disabled={loading}
                              />
                          </div>
                          
                          <div className="form-group">
                              <label htmlFor="signup-password" className="form-label">Password</label>
                              <input 
                                type="password" 
                                id="signup-password" 
                                className="form-control" 
                                required 
                                autoComplete="new-password"
                                minLength="6"
                                value={signUpData.password}
                                onChange={handleSignUpChange}
                                disabled={loading}
                              />
                          </div>
                          
                          <div className="form-group">
                              <label htmlFor="signup-role" className="form-label">Role</label>
                              <select 
                                id="signup-role" 
                                className="form-control" 
                                required
                                value={signUpData.role}
                                onChange={handleSignUpChange}
                                disabled={loading}
                              >
                                  <option value="">Select a role</option>
                                  <option value="user">Employee</option>
                                  <option value="manager">Manager</option>
                                  <option value="admin">Admin</option>
                              </select>
                          </div>
                          
                          <div className="form-group">
                              <label htmlFor="signup-department" className="form-label">Department (Optional)</label>
                              <input 
                                type="text" 
                                id="signup-department" 
                                className="form-control" 
                                autoComplete="organization-title"
                                value={signUpData.department}
                                onChange={handleSignUpChange}
                                disabled={loading}
                              />
                          </div>
                          
                          <div className="form-group">
                              <label htmlFor="signup-position" className="form-label">Position (Optional)</label>
                              <input 
                                type="text" 
                                id="signup-position" 
                                className="form-control" 
                                autoComplete="organization-title"
                                value={signUpData.position}
                                onChange={handleSignUpChange}
                                disabled={loading}
                              />
                          </div>
                          
                          {error && (
                            <div className="error-message" role="alert" aria-live="polite">
                              {error}
                            </div>
                          )}
                          
                          <div className="form-actions">
                              <button 
                                type="submit" 
                                className="btn btn--primary btn--full-width"
                                disabled={loading}
                              >
                                  {loading ? 'Creating Account...' : 'Sign Up'}
                              </button>
                          </div>
                          
                          <div className="form-footer">
                              <p>Already have an account? 
                                <button type="button" onClick={toggleForm} className="link-button">
                                  Sign in
                                </button>
                              </p>
                          </div>
                      </form>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Login;