// src/components/Auth/UserProfile.js - Component to display user profile information
import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import userPreferencesService from '../../services/userPreferencesService';

const UserProfile = () => {
  const { user, isAuthenticated, isLoading, signOut, refreshUser } = useAuthContext();
  const [profile, setProfile] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Parse extended profile data to extract new fields
  const parseExtendedProfile = (extendedProfile) => {
    if (!extendedProfile) return null;

    // If extendedProfile is a string, try to parse it as JSON
    let profileData = extendedProfile;
    if (typeof extendedProfile === 'string') {
      try {
        profileData = JSON.parse(extendedProfile);
      } catch (e) {
        console.error('Error parsing extended profile:', e);
        return null;
      }
    }

    return {
      technicalLevel: profileData.technicalLevel || profileData.softwareExperienceLevel || '',
      rosExperience: profileData.rosExperience || profileData.softwareField || '',
      primarySetup: profileData.primarySetup || profileData.hardwarePlatform || '',
      edgeHardware: profileData.edgeHardware || profileData.hardwareExperienceLevel || '',
      explanationStyle: profileData.explanationStyle || profileData.electronicsBasics || '',
      preferredLanguage: profileData.preferredLanguage || profileData.programmingLanguages || '',
      fullName: profileData.fullName || user.name || user.fullName || user.email || ''
    };
  };

  // Sync user profile to RAG chatbot
  const syncToRagChatbot = async (profileData) => {
    if (!user.id) {
      console.error('User ID not available for sync');
      return;
    }

    setIsSyncing(true);
    try {
      await userPreferencesService.syncToRagChatbot(user.id, {
        technicalLevel: profileData.technicalLevel,
        rosExperience: profileData.rosExperience,
        primarySetup: profileData.primarySetup,
        edgeHardware: profileData.edgeHardware,
        explanationStyle: profileData.explanationStyle,
        preferredLanguage: profileData.preferredLanguage
      });
      console.log('Profile synced to RAG chatbot successfully');
    } catch (error) {
      console.error('Error syncing profile to RAG chatbot:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (user && isAuthenticated) {
      // Parse user profile data to extract the new fields
      const parsedProfile = parseExtendedProfile(user.extendedProfile || {});
      setProfile(parsedProfile);

      // Sync to RAG chatbot if profile exists
      if (parsedProfile && user.id) {
        syncToRagChatbot(parsedProfile);
      }
    }
  }, [user, isAuthenticated]);

  if (isLoading) {
    return <div>Loading user profile...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div>Please sign in to view your profile.</div>;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      // Refresh the user state after sign out
      refreshUser();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Parse the software background string into components
  const parseSoftwareBackground = (background) => {
    if (!background) return null;

    const components = {};
    const items = background.split(', ');

    items.forEach(item => {
      const [key, value] = item.split(': ');
      if (key && value) {
        components[key.toLowerCase()] = value;
      }
    });

    return components;
  };

  // Parse the hardware background string into components
  const parseHardwareBackground = (background) => {
    if (!background) return null;

    const components = {};
    const items = background.split(', ');

    items.forEach(item => {
      const [key, value] = item.split(': ');
      if (key && value) {
        components[key.toLowerCase()] = value;
      }
    });

    return components;
  };

  const softwareData = parseSoftwareBackground(user.softwareBackground);
  const hardwareData = parseHardwareBackground(user.hardwareBackground);

  return (
    <div className="user-profile" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>User Profile</h3>

      {isSyncing && (
        <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
          Syncing profile to RAG chatbot...
        </div>
      )}

      <div style={{ marginBottom: '10px' }}>
        <strong>Name:</strong> {profile?.fullName || user.name || user.fullName || user.email}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Email:</strong> {user.email}
      </div>

      {/* Section 1: Software Level */}
      {(profile?.technicalLevel || profile?.rosExperience) && (
        <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Section 1: Software Level</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {profile?.technicalLevel && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Technical Level</span>
                <span style={{ fontStyle: 'italic' }}>{profile.technicalLevel}</span>
              </div>
            )}
            {profile?.rosExperience && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>ROS Experience</span>
                <span style={{ fontStyle: 'italic' }}>{profile.rosExperience}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section 2: Hardware Access */}
      {(profile?.primarySetup || profile?.edgeHardware) && (
        <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Section 2: Hardware Access</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {profile?.primarySetup && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Primary Setup</span>
                <span style={{ fontStyle: 'italic' }}>{profile.primarySetup}</span>
              </div>
            )}
            {profile?.edgeHardware && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Edge Hardware</span>
                <span style={{ fontStyle: 'italic' }}>{profile.edgeHardware}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section 3: Preferences */}
      {(profile?.explanationStyle || profile?.preferredLanguage) && (
        <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Section 3: Preferences</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {profile?.explanationStyle && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Explanation Style</span>
                <span style={{ fontStyle: 'italic' }}>{profile.explanationStyle}</span>
              </div>
            )}
            {profile?.preferredLanguage && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Preferred Language</span>
                <span style={{ fontStyle: 'italic' }}>{profile.preferredLanguage}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleSignOut}
        style={{
          padding: '8px 16px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Sign Out
      </button>
    </div>
  );
};

export default UserProfile;