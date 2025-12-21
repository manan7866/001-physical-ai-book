// src/components/Auth/SigninForm.js - Signin form component
import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';

const SigninForm = ({ onSuccess, onError }) => {
  const { signIn } = useAuthContext();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await signIn({
        email: formData.email,
        password: formData.password
      });

      if (result?.error) {
        setErrors({ general: result.error.message });
        onError && onError(result.error.message);
      } else {
        onSuccess && onSuccess(result);
      }
    } catch (error) {
      console.error('Signin error:', error);
      setErrors({ general: error.message });
      onError && onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-form">
      <h2>Sign In</h2>
      {errors.general && (
        <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
          {errors.general}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px',
              border: errors.email ? '1px solid red' : '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          {errors.email && <div style={{ color: 'red', fontSize: '14px' }}>{errors.email}</div>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            Password *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px',
              border: errors.password ? '1px solid red' : '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          {errors.password && <div style={{ color: 'red', fontSize: '14px' }}>{errors.password}</div>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: isLoading ? '#ccc' : '#007cba',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default SigninForm;