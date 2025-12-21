// src/components/Auth/SignupForm.js - Signup form with extended user fields
import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import userPreferencesService from '../../services/userPreferencesService';

const SignupForm = ({ onSuccess, onError }) => {
  const { signUp, updateExtendedProfile, refreshUser } = useAuthContext();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    // Section 1: Software Level
    technicalLevel: '', // Beginner, Intermediate, Advanced
    rosExperience: '', // None, Basic, Experienced
    // Section 2: Hardware Access
    primarySetup: '', // RTX GPU PC / Workstation, No RTX GPU (Laptop / Basic PC), Cloud only
    edgeHardware: '', // Jetson (Orin / Xavier), Other robot hardware, None
    // Section 3: Preferences
    explanationStyle: '', // Simple, Balanced, Deep technical
    preferredLanguage: '' // English, Urdu
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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.name) {
      newErrors.name = 'Full name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    console.log('Signup form submitted', formData); // Debug log
    e.preventDefault();

    if (!validateForm()) {
      console.log('Form validation failed', errors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    console.log('Starting signup process...');

    try {
      // First, create the user with Better Auth
      console.log('Calling signUp with:', {
        email: formData.email,
        name: formData.name
      });

      const result = await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name, // Better Auth expects 'name' field
      });

      console.log('Signup result:', result);

      if (result?.error) {
        console.error('Signup error response:', result.error);
        setErrors({ general: result.error.message || 'Signup failed' });
        onError && onError(result.error.message);
      } else {
        console.log('Signup successful, updating extended profile...');

        try {
          // Format user profile data based on new fields
          const userProfile = {
            fullName: formData.name,
            // Section 1: Software Level
            technicalLevel: formData.technicalLevel,
            rosExperience: formData.rosExperience,
            // Section 2: Hardware Access
            primarySetup: formData.primarySetup,
            edgeHardware: formData.edgeHardware,
            // Section 3: Preferences
            explanationStyle: formData.explanationStyle,
            preferredLanguage: formData.preferredLanguage
          };

          console.log('Updating extended profile with:', userProfile);

          // Update the extended profile - await this to ensure it completes before signup finishes
          const profileResult = await updateExtendedProfile(userProfile);
          console.log('Extended profile updated successfully:', profileResult);

          // Sync user preferences to RAG chatbot
          try {
            // Get the current user to get their ID - use the same ID that was used for profile update
            // The updateExtendedProfile function already ensures we have the userId
            const storedSession = localStorage.getItem('better-auth-session');
            let userId = null;
            if (storedSession) {
              try {
                const sessionData = JSON.parse(storedSession);
                userId = sessionData?.user?.id;
              } catch (parseError) {
                console.error('Error parsing session data:', parseError);
              }
            }

            if (userId) {
              console.log('Syncing user preferences to RAG chatbot for user:', userId);
              await userPreferencesService.syncToRagChatbot(userId, {
                technicalLevel: formData.technicalLevel,
                rosExperience: formData.rosExperience,
                primarySetup: formData.primarySetup,
                edgeHardware: formData.edgeHardware,
                explanationStyle: formData.explanationStyle,
                preferredLanguage: formData.preferredLanguage
              });
              console.log('User preferences synced successfully');
            } else {
              console.warn('Could not get user ID for profile sync');
            }
          } catch (syncError) {
            console.error('Error syncing user preferences to RAG chatbot:', syncError);
            // Don't fail the signup if profile sync fails
          }

          // Refresh the user data to ensure the extended profile is loaded
          await refreshUser();

          console.log('Signup completed successfully with profile data');
        } catch (profileError) {
          console.error('Extended profile update or sync failed:', profileError);
          // Don't fail the signup if extended profile update fails, but log it
        }

        console.log('Signup completed successfully');
        onSuccess && onSuccess(result);
      }
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Full error details:', error);
      setErrors({ general: error.message || 'An error occurred during signup' });
      onError && onError(error.message);
    } finally {
      setIsLoading(false);
      console.log('Signup process finished, loading state:', isLoading);
    }
  };

  return (
    <div className="signup-form">
      <h2>Create Account</h2>
      {errors.general && (
        <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
          {errors.general}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            className="auth-input"
            style={errors.name ? { border: '2px solid #dc3545' } : {}}
          />
          {errors.name && <div style={{ color: 'red', fontSize: '14px' }}>{errors.name}</div>}
        </div>

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
            className="auth-input"
            style={errors.email ? { border: '2px solid #dc3545' } : {}}
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
            className="auth-input"
            style={errors.password ? { border: '2px solid #dc3545' } : {}}
          />
          {errors.password && <div style={{ color: 'red', fontSize: '14px' }}>{errors.password}</div>}
        </div>

        {/* Section 1: Software Level */}
        <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Section 1: Software Level</h3>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="technicalLevel" style={{ display: 'block', marginBottom: '5px' }}>
              1️⃣ Your Technical Level
            </label>
            <select
              id="technicalLevel"
              name="technicalLevel"
              value={formData.technicalLevel}
              onChange={handleChange}
              disabled={isLoading}
              className="auth-select"
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">Select one</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="rosExperience" style={{ display: 'block', marginBottom: '5px' }}>
              2️⃣ Robotics / ROS Experience
            </label>
            <select
              id="rosExperience"
              name="rosExperience"
              value={formData.rosExperience}
              onChange={handleChange}
              disabled={isLoading}
              className="auth-select"
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">Select one</option>
              <option value="None">None</option>
              <option value="Basic">Basic</option>
              <option value="Experienced">Experienced</option>
            </select>
          </div>
        </div>

        {/* Section 2: Hardware Access */}
        <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Section 2: Hardware Access</h3>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="primarySetup" style={{ display: 'block', marginBottom: '5px' }}>
              3️⃣ Your Primary Setup
            </label>
            <select
              id="primarySetup"
              name="primarySetup"
              value={formData.primarySetup}
              onChange={handleChange}
              disabled={isLoading}
              className="auth-select"
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">Select one</option>
              <option value="RTX GPU PC / Workstation">RTX GPU PC / Workstation</option>
              <option value="No RTX GPU (Laptop / Basic PC)">No RTX GPU (Laptop / Basic PC)</option>
              <option value="Cloud only">Cloud only</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="edgeHardware" style={{ display: 'block', marginBottom: '5px' }}>
              4️⃣ Edge / Robot Hardware
            </label>
            <select
              id="edgeHardware"
              name="edgeHardware"
              value={formData.edgeHardware}
              onChange={handleChange}
              disabled={isLoading}
              className="auth-select"
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">Select one</option>
              <option value="Jetson (Orin / Xavier)">Jetson (Orin / Xavier)</option>
              <option value="Other robot hardware">Other robot hardware</option>
              <option value="None">None</option>
            </select>
          </div>
        </div>

        {/* Section 3: Preferences */}
        <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Section 3: Preferences</h3>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="explanationStyle" style={{ display: 'block', marginBottom: '5px' }}>
              5️⃣ Preferred Explanation Style
            </label>
            <select
              id="explanationStyle"
              name="explanationStyle"
              value={formData.explanationStyle}
              onChange={handleChange}
              disabled={isLoading}
              className="auth-select"
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">Select one</option>
              <option value="Simple">Simple</option>
              <option value="Balanced">Balanced</option>
              <option value="Deep technical">Deep technical</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="preferredLanguage" style={{ display: 'block', marginBottom: '5px' }}>
              6️⃣ Preferred Language
            </label>
            <select
              id="preferredLanguage"
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleChange}
              disabled={isLoading}
              className="auth-select"
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">Select one</option>
              <option value="English">English</option>
              <option value="Urdu">Urdu</option>
            </select>
          </div>
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
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default SignupForm;