import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return {
      token,
      name:        localStorage.getItem('user_name') || 'Student',
      semester:    localStorage.getItem('semester')  || '',
      department:  localStorage.getItem('department') || '',
      college:     localStorage.getItem('college_name') || '',
      is_admin:    localStorage.getItem('is_admin') === 'true',
    };
  });

  const login = (data, extraData = {}) => {
    localStorage.setItem('token',        data.access_token);
    localStorage.setItem('user_name',    data.user_name   || '');
    localStorage.setItem('semester',     data.semester    || '');
    localStorage.setItem('is_admin',     String(data.is_admin || false));
    if (extraData.department)   localStorage.setItem('department',   extraData.department);
    if (extraData.college_name) localStorage.setItem('college_name', extraData.college_name);
    setUser({
      token:      data.access_token,
      name:       data.user_name   || 'Student',
      semester:   data.semester    || '',
      department: extraData.department  || localStorage.getItem('department') || '',
      college:    extraData.college_name || localStorage.getItem('college_name') || '',
      is_admin:   !!data.is_admin,
    });
  };

  const setProfile = (profileData) => {
    if (profileData.department)   localStorage.setItem('department',   profileData.department);
    if (profileData.college_name) localStorage.setItem('college_name', profileData.college_name);
    setUser(prev => prev ? {
      ...prev,
      department: profileData.department   || prev.department,
      college:    profileData.college_name || prev.college,
    } : prev);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
