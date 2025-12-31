import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
    // Do NOT perform navigation here; let the caller (Login component) navigate.
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    // Do NOT navigate here; let the caller (Navbar or others) navigate.
  };

  // Normalize role checks to handle both uppercase and lowercase
  const normalizedRole = user?.role?.toLowerCase();

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: normalizedRole === 'admin' || normalizedRole === 'owner',
    isWorker: normalizedRole === 'worker',
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};