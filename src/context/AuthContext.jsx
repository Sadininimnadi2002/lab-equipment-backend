import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from '../utils/constants';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage if saved
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('unilab_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return currentUser?.role || null;
  });

  const [authLoading, setAuthLoading] = useState(true);

  // Sync token and role when currentUser updates
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('unilab_current_user', JSON.stringify(currentUser));
      setCurrentRole(currentUser.role);
    } else {
      localStorage.removeItem('unilab_current_user');
      localStorage.removeItem('unilab_auth_token');
      localStorage.removeItem('token');
      setCurrentRole(null);
    }
    setAuthLoading(false);
  }, [currentUser]);

  // Optionally verify token on mount with /api/auth/profile
  useEffect(() => {
    const token =
      localStorage.getItem('unilab_auth_token') || localStorage.getItem('token');
    if (token && !currentUser) {
      authService
        .getProfile()
        .then((res) => {
          if (res?.user) {
            setCurrentUser(res.user);
            setCurrentRole(res.user.role);
          }
        })
        .catch(() => {
          // Token expired or invalid
          authService.logout();
          setCurrentUser(null);
          setCurrentRole(null);
        })
        .finally(() => {
          setAuthLoading(false);
        });
    } else {
      setAuthLoading(false);
    }
  }, []);

  /**
   * Real backend authentication login
   */
  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    if (!response || !response.token || !response.user) {
      throw new Error('Invalid login response received from server.');
    }

    // Save JWT token
    localStorage.setItem('unilab_auth_token', response.token);
    localStorage.setItem('token', response.token);

    // Save authenticated user
    localStorage.setItem('unilab_current_user', JSON.stringify(response.user));
    setCurrentUser(response.user);
    setCurrentRole(response.user.role);

    return response.user;
  };

  /**
   * Real backend user registration
   */
  const register = async (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'student',
      department: data.department || 'General Engineering',
      studentId: data.studentId || data.studentOrStaffId || '',
      phone: data.phone || '',
    };

    const response = await authService.register(payload);
    if (!response || !response.token || !response.user) {
      throw new Error('Registration failed.');
    }

    localStorage.setItem('unilab_auth_token', response.token);
    localStorage.setItem('token', response.token);
    localStorage.setItem('unilab_current_user', JSON.stringify(response.user));
    setCurrentUser(response.user);
    setCurrentRole(response.user.role);

    return response.user;
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentRole(null);
  };

  const isStudent = currentRole === 'student';
  const isStaff = currentRole === 'staff' || currentRole === 'admin';
  const isAdmin = currentRole === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        authLoading,
        isStudent,
        isStaff,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
