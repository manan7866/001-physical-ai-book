// src/components/Auth/AuthNavbar.js - Authentication-aware navbar component
import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';

const AuthNavbar = () => {
  const { user, isAuthenticated, isLoading, signOut } = useAuthContext();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
      }}>
        <span style={{ fontSize: '14px', color: '#666' }}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '4px 8px',
    }}>
      {isAuthenticated && user ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'white',
          fontSize: '14px'
        }}>
          <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={user.email}>
            {user.name || user.email}
          </span>
          <button
            onClick={handleSignOut}
            style={{
              padding: '4px 8px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <a
          href="/auth"
          style={{
            padding: '6px 12px',
            backgroundColor: '#007cba',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          Sign In
        </a>
      )}
    </div>
  );
};

export default AuthNavbar;