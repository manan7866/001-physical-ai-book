// src/contexts/AuthContext.js - Authentication context for Docusaurus
import React, { createContext, useContext, useState, useEffect } from 'react';

// Make the getBaseURL function available globally for use in other functions
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Check for environment variable first
    if (window.AUTH_API_URL) {
      return window.AUTH_API_URL;
    }

    // For development, use the backend server URL
    // For production, we need to handle auth differently since there's no auth server
    const isDev = window.location.hostname === 'localhost' ||
                  window.location.hostname === '127.0.0.1' ||
                  window.location.port !== '' && window.location.port !== '80' && window.location.port !== '443';

    if (isDev) {
      return 'http://localhost:8080'; // Auth server runs on port 8080
    } else {
      // For production, we'll simulate authentication since there's no auth server
      // In a real deployment, you'd want to connect to a real auth service
      return null; // Indicate that auth is not available in this deployment
    }
  }
  // For server-side rendering in production, return null
  return null;
};

// Custom auth client implementation that works with our custom auth server
const createCustomAuthClient = () => {
  const baseURL = getBaseURL();

  return {
    signUp: async ({ email, password, name }) => {
      try {
        // In production, if there's no auth server, we'll simulate a basic auth flow
        if (!baseURL) {
          // Simulate successful signup in production (no real auth server)
          const simulatedUser = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email,
            name,
            emailVerified: false
          };

          const simulatedSession = {
            token: `token_${Math.random().toString(36).substr(2, 16)}`,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          };

          const result = {
            session: simulatedSession,
            user: simulatedUser
          };

          // Store session in localStorage to mimic Better Auth behavior
          const sessionData = {
            session: simulatedSession,
            user: simulatedUser,
            timestamp: Date.now()
          };
          localStorage.setItem('better-auth-session', JSON.stringify(sessionData));

          return result;
        }

        // Safety check: ensure we never make a request if baseURL is null
        if (!baseURL) {
          // This should not be reached if the first condition worked properly
          // But as a safety measure, return a simulated response
          const simulatedUser = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email,
            name,
            emailVerified: false
          };

          const simulatedSession = {
            token: `token_${Math.random().toString(36).substr(2, 16)}`,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          };

          const result = {
            session: simulatedSession,
            user: simulatedUser
          };

          // Store session in localStorage to mimic Better Auth behavior
          const sessionData = {
            session: simulatedSession,
            user: simulatedUser,
            timestamp: Date.now()
          };
          localStorage.setItem('better-auth-session', JSON.stringify(sessionData));

          return result;
        }

        const response = await fetch(`${baseURL}/api/auth/sign-up`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password, name }),
        });

        const result = await response.json();

        if (!response.ok) {
          return { error: { message: result.error || 'Sign up failed' } };
        }

        // Store session in localStorage to mimic Better Auth behavior
        if (result.session && result.user) {
          const sessionData = {
            session: result.session,
            user: result.user,
            timestamp: Date.now()
          };
          localStorage.setItem('better-auth-session', JSON.stringify(sessionData));
        }

        return result;
      } catch (error) {
        return { error: { message: error.message } };
      }
    },

    signIn: async ({ email, password }) => {
      try {
        // In production, if there's no auth server, we'll simulate a basic auth flow
        if (!baseURL) {
          // Simulate successful sign in in production (no real auth server)
          const simulatedUser = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email,
            name: email.split('@')[0], // Use part of email as name
            emailVerified: false
          };

          const simulatedSession = {
            token: `token_${Math.random().toString(36).substr(2, 16)}`,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          };

          const result = {
            session: simulatedSession,
            user: simulatedUser
          };

          // Store session in localStorage to mimic Better Auth behavior
          const sessionData = {
            session: simulatedSession,
            user: simulatedUser,
            timestamp: Date.now()
          };
          localStorage.setItem('better-auth-session', JSON.stringify(sessionData));

          return result;
        }

        // Safety check: ensure we never make a request if baseURL is null
        if (!baseURL) {
          // This should not be reached if the first condition worked properly
          // But as a safety measure, return a simulated response
          const simulatedUser = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email,
            name: email.split('@')[0], // Use part of email as name
            emailVerified: false
          };

          const simulatedSession = {
            token: `token_${Math.random().toString(36).substr(2, 16)}`,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          };

          const result = {
            session: simulatedSession,
            user: simulatedUser
          };

          // Store session in localStorage to mimic Better Auth behavior
          const sessionData = {
            session: simulatedSession,
            user: simulatedUser,
            timestamp: Date.now()
          };
          localStorage.setItem('better-auth-session', JSON.stringify(sessionData));

          return result;
        }

        const response = await fetch(`${baseURL}/api/auth/sign-in`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (!response.ok) {
          return { error: { message: result.error || 'Sign in failed' } };
        }

        // Store session in localStorage to mimic Better Auth behavior
        if (result.session && result.user) {
          const sessionData = {
            session: result.session,
            user: result.user,
            timestamp: Date.now()
          };
          localStorage.setItem('better-auth-session', JSON.stringify(sessionData));
        }

        return result;
      } catch (error) {
        return { error: { message: error.message } };
      }
    },

    signOut: async () => {
      try {
        // In production, if there's no auth server, we'll just clear local storage
        if (!baseURL) {
          // Clear session from localStorage
          localStorage.removeItem('better-auth-session');
          return { success: true };
        }

        // Safety check: ensure we never make a request if baseURL is null
        if (!baseURL) {
          // This should not be reached if the first condition worked properly
          // But as a safety measure, just clear local storage and return success
          localStorage.removeItem('better-auth-session');
          return { success: true };
        }

        const response = await fetch(`${baseURL}/api/auth/sign-out`, {
          method: 'POST',
          credentials: 'include',
        });

        // Clear session from localStorage
        localStorage.removeItem('better-auth-session');

        if (!response.ok) {
          const result = await response.json();
          return { error: { message: result.error || 'Sign out failed' } };
        }

        return { success: true };
      } catch (error) {
        return { error: { message: error.message } };
      }
    },

    getSession: async () => {
      try {
        // Try to get session from localStorage first (client-side cache)
        const sessionData = localStorage.getItem('better-auth-session');
        if (sessionData) {
          try {
            const parsed = JSON.parse(sessionData);
            // Check if we have user data stored
            if (parsed.user) {
              return { session: parsed.session, user: parsed.user };
            }
          } catch (parseError) {
            console.error('Error parsing session data:', parseError);
            // If parsing fails, clear the invalid session data
            localStorage.removeItem('better-auth-session');
          }
        }

        // In production, if there's no auth server, return null since we can't verify session
        if (!baseURL) {
          return null;
        }

        // Safety check: ensure we never make a request if baseURL is null
        if (!baseURL) {
          // This should not be reached if the first condition worked properly
          // But as a safety measure, return null
          return null;
        }

        // Fallback: try to get session from server
        const response = await fetch(`${baseURL}/api/auth/get-session`, {
          credentials: 'include',
        });

        if (!response.ok) {
          // If server request fails, clear local session data
          localStorage.removeItem('better-auth-session');
          return null;
        }

        const result = await response.json();

        // If we got a valid session from server, store it locally
        if (result && result.user) {
          const sessionData = {
            session: result.session,
            user: result.user,
            timestamp: Date.now()
          };
          localStorage.setItem('better-auth-session', JSON.stringify(sessionData));
        } else {
          // No valid session, clear local data
          localStorage.removeItem('better-auth-session');
        }

        return result;
      } catch (error) {
        console.error('Error getting session:', error);
        // Clear local session data if there's an error
        localStorage.removeItem('better-auth-session');
        return null;
      }
    }
  };
};

// Create auth client using our custom implementation
const authClient = createCustomAuthClient();

// Create the authentication context
const AuthContext = createContext();

// AuthProvider component to wrap the application
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [extendedProfile, setExtendedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user session and extended profile on component mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoading(true);
        // Get current session
        const currentSession = await authClient.getSession();
        if (currentSession?.session) {
          // Set basic user info
          const basicUser = {
            ...currentSession.user,
            id: currentSession.user.id,
            email: currentSession.user.email,
            name: currentSession.user.name,
            extendedProfile: extendedProfile || null
          };
          setUser(basicUser);

          // Load extended profile data
          await loadExtendedProfile(currentSession.user.id);

          // Update user object to include extended profile data
          setUser(prevUser => ({
            ...prevUser,
            extendedProfile: prevUser.extendedProfile || extendedProfile
          }));
        } else {
          setUser(null);
          setExtendedProfile(null);
        }
      } catch (err) {
        console.error('Error loading session:', err);
        setError(err.message);
        setUser(null);
        setExtendedProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  // Function to load extended profile data
  const loadExtendedProfile = async (userId) => {
    try {
      const baseURL = getBaseURL();

      // In production, if there's no auth server, skip profile loading
      if (!baseURL) {
        return;
      }

      // Use the same API URL pattern as other services
      let apiUrl = baseURL;
      if (baseURL && !baseURL.startsWith('http')) {
        // If it's a relative path, use it as-is
        apiUrl = baseURL;
      } else if (baseURL && baseURL.startsWith('http')) {
        // If it's an absolute URL, append /api
        apiUrl = baseURL.endsWith('/') ? baseURL + 'api' : baseURL + '/api';
      } else {
        // Default to /api for relative path
        apiUrl = '/api';
      }
      const response = await fetch(`${apiUrl}/profile?userId=${userId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setExtendedProfile(result.data);
          // Update user object to include extended fields and extendedProfile
          setUser(prevUser => ({
            ...prevUser,
            fullName: result.data.full_name,
            softwareBackground: result.data.software_background,
            hardwareBackground: result.data.hardware_background,
            extendedProfile: result.data
          }));
        }
      }
    } catch (err) {
      console.error('Error loading extended profile:', err);
    }
  };

  // Function to update extended profile
  const updateExtendedProfile = async (profileData) => {
    try {
      // Ensure we have a user ID to work with
      let userId = user?.id;

      // If no user ID in context, try to get from localStorage
      if (!userId) {
        const storedSession = localStorage.getItem('better-auth-session');
        if (storedSession) {
          try {
            const sessionData = JSON.parse(storedSession);
            userId = sessionData?.user?.id;
          } catch (parseError) {
            console.error('Error parsing session data:', parseError);
          }
        }
      }

      if (!userId) {
        throw new Error('User ID not available for profile update');
      }

      const baseUrl = getBaseURL();

      // In production, if there's no auth server, skip profile update
      if (!baseUrl) {
        // Simulate successful profile update in localStorage for production
        const extendedProfileData = {
          full_name: profileData.fullName || profileData.name,
          software_background: profileData.softwareBackground,
          hardware_background: profileData.hardwareBackground,
          ...profileData
        };

        setExtendedProfile(extendedProfileData);

        // Update user object to include extended fields
        setUser(prevUser => ({
          ...prevUser,
          fullName: extendedProfileData.full_name,
          softwareBackground: extendedProfileData.software_background,
          hardwareBackground: extendedProfileData.hardware_background,
          extendedProfile: extendedProfileData
        }));

        console.log('Extended profile updated successfully (simulated):', extendedProfileData);
        return { success: true, data: extendedProfileData };
      }
      // Use the same API URL pattern as other services
      let apiUrl = baseUrl;
      if (baseUrl && !baseUrl.startsWith('http')) {
        // If it's a relative path, use it as-is
        apiUrl = baseUrl;
      } else if (baseUrl && baseUrl.startsWith('http')) {
        // If it's an absolute URL, append /api
        apiUrl = baseUrl.endsWith('/') ? baseUrl + 'api' : baseUrl + '/api';
      } else {
        // Default to /api for relative path
        apiUrl = '/api';
      }
      const response = await fetch(`${apiUrl}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: userId,
          ...profileData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Set the extended profile state
          setExtendedProfile(result.data);

          // Update user object to include extended fields and extendedProfile
          // This ensures the user object has the latest extended profile data immediately
          setUser(prevUser => ({
            ...prevUser,
            id: prevUser?.id || userId, // Ensure ID is preserved
            fullName: result.data.full_name,
            softwareBackground: result.data.software_background,
            hardwareBackground: result.data.hardware_background,
            extendedProfile: result.data
          }));

          console.log('Extended profile updated successfully:', result.data);
          return result;
        }
      } else {
        // In production, if the auth server is not available, simulate success
        if (!baseUrl) {
          // Simulate successful profile update in localStorage for production
          const extendedProfileData = {
            full_name: profileData.fullName || profileData.name,
            software_background: profileData.softwareBackground,
            hardware_background: profileData.hardwareBackground,
            ...profileData
          };

          setExtendedProfile(extendedProfileData);

          // Update user object to include extended fields
          setUser(prevUser => ({
            ...prevUser,
            fullName: extendedProfileData.full_name,
            softwareBackground: extendedProfileData.software_background,
            hardwareBackground: extendedProfileData.hardware_background,
            extendedProfile: extendedProfileData
          }));

          console.log('Extended profile updated successfully (simulated):', extendedProfileData);
          return { success: true, data: extendedProfileData };
        } else {
          const error = await response.json();
          console.error('Profile update response error:', error);
          throw new Error(error.error || 'Failed to update profile');
        }
      }
    } catch (err) {
      console.error('Error updating extended profile:', err);
      throw err;
    }
  };

  // Function to manually refresh user data
  const refreshUser = async () => {
    try {
      const currentSession = await authClient.getSession();
      if (currentSession?.session) {
        const basicUser = {
          ...currentSession.user,
          id: currentSession.user.id,
          email: currentSession.user.email,
          name: currentSession.user.name,
        };
        setUser(basicUser);

        // Reload extended profile - this will update the user object with extended profile
        await loadExtendedProfile(currentSession.user.id);
      } else {
        setUser(null);
        setExtendedProfile(null);
      }

      // Dispatch event to update navbar
      window.dispatchEvent(new CustomEvent('authChange'));
    } catch (err) {
      console.error('Error refreshing user:', err);
      setError(err.message);
    }
  };

  const contextValue = {
    user,
    extendedProfile,
    isLoading,
    error,
    signIn: authClient.signIn,
    signUp: authClient.signUp,
    signOut: async () => {
      const result = await authClient.signOut();
      // Dispatch event to update navbar
      window.dispatchEvent(new CustomEvent('authChange'));
      return result;
    },
    refreshUser,
    updateExtendedProfile,
    isAuthenticated: !!user,
    authClient
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};