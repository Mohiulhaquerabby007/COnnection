import React, { createContext, useContext, useState, useEffect } from 'react';
import API, { setAccessToken, getAccessToken } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear states on user logout or session expiry
  const clearSession = () => {
    setUser(null);
    setAccessToken('');
    setLoading(false);
  };

  // 1. Authenticate user session on boot
  const loadUser = async () => {
    try {
      // Prompt a token refresh to acquire access token
      const res = await API.post('/auth/refresh');
      const { accessToken } = res.data;
      setAccessToken(accessToken);

      // Fetch user profile details
      const meRes = await API.get('/auth/me');
      setUser(meRes.data.user);
    } catch (err) {
      console.log('No active session identified.');
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Listen for axios token expiry redirections
    const handleExpiry = () => {
      clearSession();
      setError('Your session has expired. Please log in again.');
    };
    window.addEventListener('auth_session_expired', handleExpiry);

    return () => {
      window.removeEventListener('auth_session_expired', handleExpiry);
    };
  }, []);

  // 2. User Sign Up
  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post('/auth/register', formData);
      const { user: userRecord, accessToken } = res.data;
      setAccessToken(accessToken);
      setUser(userRecord);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Registration failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // 3. User Login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post('/auth/login', { email, password });
      const { user: userRecord, accessToken } = res.data;
      setAccessToken(accessToken);
      setUser(userRecord);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Incorrect email or password.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // 4. User Logout
  const logout = async () => {
    setLoading(true);
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err.message);
    } finally {
      clearSession();
    }
  };

  // 5. Update Profile details
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await API.put('/users/profile', profileData);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // 6. Add Profile Photo
  const addPhoto = async (photoFile) => {
    setError(null);
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);

      const res = await API.post('/users/profile/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Photo upload failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // 7. Delete Profile Photo
  const removePhoto = async (photoId) => {
    setError(null);
    try {
      const res = await API.delete(`/users/profile/photos/${photoId}`);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Photo deletion failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // 8. Change Password
  const changePassword = async (currentPassword, newPassword) => {
    setError(null);
    try {
      const res = await API.put('/users/profile/password', { currentPassword, newPassword });
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Password change failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // 9. Update Privacy Settings
  const updatePrivacy = async (showInDiscovery) => {
    setError(null);
    try {
      const res = await API.put('/users/profile/privacy', { showInDiscovery });
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update privacy settings';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // 10. Delete Account
  const deleteAccount = async () => {
    setError(null);
    try {
      await API.delete('/users/profile/account');
      clearSession();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete account';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    addPhoto,
    removePhoto,
    changePassword,
    updatePrivacy,
    deleteAccount,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be nested within AuthProvider');
  }
  return context;
};
export default AuthContext;
