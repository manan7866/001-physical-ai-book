// src/pages/auth/index.js - Authentication page with signup and signin forms
import React, { useState } from 'react';
import Layout from '@theme/Layout';
import SignupForm from '../../components/Auth/SignupForm';
import SigninForm from '../../components/Auth/SigninForm';
import UserProfile from '../../components/Auth/UserProfile';
import { useAuthContext } from '../../contexts/AuthContext';

function AuthPage() {
  const { isAuthenticated } = useAuthContext();
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'

  return (
    <Layout title="Authentication" description="User authentication page">
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Authentication</h1>

        {isAuthenticated ? (
          <div>
            <h2>Your Profile</h2>
            <UserProfile />
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #eee' }}>
              <button
                onClick={() => setActiveTab('signin')}
                style={{
                  padding: '10px 20px',
                  border: activeTab === 'signin' ? '2px solid #007cba' : '1px solid #ddd',
                  borderBottom: activeTab === 'signin' ? 'none' : '1px solid #ddd',
                  backgroundColor: activeTab === 'signin' ? '#f0f8ff' : 'white',
                  cursor: 'pointer',
                  marginRight: '5px',
                  borderRadius: '4px 4px 0 0'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                style={{
                  padding: '10px 20px',
                  border: activeTab === 'signup' ? '2px solid #007cba' : '1px solid #ddd',
                  borderBottom: activeTab === 'signup' ? 'none' : '1px solid #ddd',
                  backgroundColor: activeTab === 'signup' ? '#f0f8ff' : 'white',
                  cursor: 'pointer',
                  borderRadius: '4px 4px 0 0'
                }}
              >
                Sign Up
              </button>
            </div>

            {activeTab === 'signin' ? (
              <SigninForm
                onSuccess={() => console.log('Sign in successful')}
                onError={(error) => console.error('Sign in error:', error)}
              />
            ) : (
              <SignupForm
                onSuccess={() => console.log('Sign up successful')}
                onError={(error) => console.error('Sign up error:', error)}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AuthPage;