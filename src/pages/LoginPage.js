import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowRight, FiLock, FiMail, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  // Clear form on component mount
  useEffect(() => {
    setFormData({
      email: '',
      password: ''
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      alert('Please fill all fields');
      return;
    }

    setIsLoading(true);
    const success = await login(formData.email, formData.password);
    setIsLoading(false);
    
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-container">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <div className="login-box">
        <div className="auth-brand-panel">
          <div className="auth-brand-chip">Hyderabad Metro</div>
          <h1>Metro Smart Access</h1>
          <p>Sign in to book, pay, and scan your QR ticket with one smooth flow.</p>
          <div className="auth-brand-icons">
            <span><FiShield /> Secure</span>
            <span><FiArrowRight /> Fast Boarding</span>
          </div>
        </div>

        <div className="login-header">
          <FiLock className="login-header-icon" />
          <h2>Welcome Back</h2>
          <p>Continue your journey</p>
        </div>

        {error && <div className="login-error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                disabled={isLoading}
                autoComplete="new-email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Logging in...
              </>
            ) : (
              <>
                Login <FiArrowRight />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
          <a href="#forgot" className="forgot-password">Forgot password?</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
