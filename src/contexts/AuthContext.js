// src/contexts/AuthContext.js - Authentication context for Docusaurus
import React, { createContext, useContext, useState, useEffect } from 'react';

// Custom auth client implementation that works with our custom auth server
const createCustomAuthClient = () => {
  const getBaseURL = () => {
    if (typeof window !== 'undefined') {
      // Check for environment variable first
      if (window.AUTH_API_URL) {
        return window.AUTH_API_URL;
      }

      // For development, use the backend server URL
      // For production, use relative path to same host
      const isDev = window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.port !== '' && window.location.port !== '80' && window.location.port !== '443';

      if (isDev) {
        return 'http://localhost:8080'; // Auth server runs on port 8080
      } else {
        return ''; // Use relative path (same host as frontend) in production
      }
    }
    // For server-side rendering in production, use relative path
    return '';
  };

  const baseURL = getBaseURL();

  return {
    signUp: async ({ email, password, name }) => {
      try {
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
      const getBaseUrl = () => {
        if (typeof window !== 'undefined') {
          // Check for environment variable first
          if (window.AUTH_API_URL) {
            return window.AUTH_API_URL;
          }

          // For development, use the backend server URL
          // For production, use relative path to same host
          const isDev = window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1' ||
                        window.location.port !== '' && window.location.port !== '80' && window.location.port !== '443';

          if (isDev) {
            return 'http://localhost:8080'; // Auth server runs on port 8080
          } else {
            return ''; // Use relative path (same host as frontend) in production
          }
        }
        // For server-side rendering in production, use relative path
        return '';
      };

      const baseUrl = getBaseUrl();
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

      const getBaseUrl = () => {
        if (typeof window !== 'undefined') {
          // Check for environment variable first
          if (window.AUTH_API_URL) {
            return window.AUTH_API_URL;
          }

          // For development, use the backend server URL
          // For production, use relative path to same host
          const isDev = window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1' ||
                        window.location.port !== '' && window.location.port !== '80' && window.location.port !== '443';

          if (isDev) {
            return 'http://localhost:8080'; // Auth server runs on port 8080
          } else {
            return ''; // Use relative path (same host as frontend) in production
          }
        }
        // For server-side rendering in production, use relative path
        return '';
      };

      const baseUrl = getBaseUrl();
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
        const error = await response.json();
        console.error('Profile update response error:', error);
        throw new Error(error.error || 'Failed to update profile');
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