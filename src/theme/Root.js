import React, { useEffect } from 'react';
import GlobalKeyboardShortcut from '../components/GlobalKeyboardShortcut';
import { AuthProvider, useAuthContext } from '../contexts/AuthContext';

// Component to handle auth navbar updates
function AuthNavbarUpdater() {
  const { user, isAuthenticated, isLoading, signOut } = useAuthContext();

  useEffect(() => {
    const updateAuthNavbar = () => {
      const placeholder = document.getElementById('auth-navbar-placeholder');
      if (!placeholder) return;

      if (isLoading) {
        placeholder.innerHTML = '<span style="font-size: 12px; color: #666;">Loading...</span>';
        return;
      }

      if (isAuthenticated && user) {
        placeholder.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px; color: white; font-size: 14px;">
            <span title="${user.email || ''}" style="max-width: 100px; overflow: hidden; text-overflow: ellipsis;">
              ${user.name || user.email || 'User'}
            </span>
            <button
              onclick="handleSignOut()"
              style="padding: 4px 8px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
            >
              Sign Out
            </button>
          </div>
        `;
      } else {
        placeholder.innerHTML = `
          <a href="/auth" style="padding: 6px 12px; background-color: #007cba; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">
            Sign In
          </a>
        `;
      }
    };

    // Add sign out function to window
    window.handleSignOut = async () => {
      try {
        await signOut();
      } catch (error) {
        console.error('Sign out error:', error);
      }
    };

    updateAuthNavbar();

    // Listen for auth changes to update the navbar
    const handleAuthChange = () => {
      updateAuthNavbar();
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [isAuthenticated, user, isLoading, signOut]);

  return null;
}

export default function Root({ children }) {
  return (
    <AuthProvider>
      <GlobalKeyboardShortcut />
      <AuthNavbarUpdater />
      {children}
    </AuthProvider>
  );
}