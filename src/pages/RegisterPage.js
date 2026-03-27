import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiLock, FiMail, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register, error } = useAuth();
  const navigate = useNavigate();

  // Clear form on component mount
  useEffect(() => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const success = await register(formData.email, formData.password, formData.fullName);
    setIsLoading(false);
    
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="register-container">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <div className="register-box">
        <div className="auth-brand-panel">
          <div className="auth-brand-chip">Create Metro Account</div>
          <h1>Start Smart Metro Travel</h1>
          <p>Sign up once and manage station routes, payments, and QR ticket access effortlessly.</p>
          <div className="auth-brand-icons">
            <span><FiCheckCircle /> Verified Profile</span>
            <span><FiArrowRight /> Instant Booking</span>
          </div>
        </div>

        <div className="register-header">
          <FiUser className="register-header-icon" />
          <h2>Create Account</h2>
          <p>Join Hyderabad Metro digital travel</p>
        </div>

        {error && <div className="register-error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                disabled={isLoading}
                autoComplete="off"
                required
                className={validationErrors.fullName ? 'error' : ''}
              />
            </div>
            {validationErrors.fullName && (
              <span className="field-error">{validationErrors.fullName}</span>
            )}
          </div>

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
                className={validationErrors.email ? 'error' : ''}
              />
            </div>
            {validationErrors.email && (
              <span className="field-error">{validationErrors.email}</span>
            )}
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
                className={validationErrors.password ? 'error' : ''}
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
            {validationErrors.password && (
              <span className="field-error">{validationErrors.password}</span>
            )}
            <div className="password-info">
              <FiCheckCircle />
              <small>Minimum 6 characters</small>
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                disabled={isLoading}
                autoComplete="new-password"
                required
                className={validationErrors.confirmPassword ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                <i className={`fas fa-eye${showConfirmPassword ? '-slash' : ''}`}></i>
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <span className="field-error">{validationErrors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="register-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Creating Account...
              </>
            ) : (
              <>
                Create Account <FiArrowRight />
              </>
            )}
          </button>
        </form>

        <div className="register-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
