import { useState, useEffect } from 'react';
import authApi from '../api/authApi';
import { AuthContext } from './authContextInstance';

const persistAuthSession = (data) => {
  const { accessToken, refreshToken, ...userData } = data;
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
  localStorage.setItem('user', JSON.stringify(userData));
  return userData;
};

const clearAuthSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authApi.getProfile();
        if (res?.data) {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        }
      } catch {
        clearAuthSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();

    const handleForceLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    setUser(persistAuthSession(res.data));
    return res;
  };

  const register = async (payload) => {
    return authApi.register(payload);
  };

  const verifyRegisterOtp = async (payload) => {
    const res = await authApi.verifyRegisterOtp(payload);
    setUser(persistAuthSession(res.data));
    return res;
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await authApi.logout(refreshToken);
    } catch {
      // Bỏ qua lỗi mạng khi đăng xuất
    } finally {
      clearAuthSession();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin',
        login,
        register,
        verifyRegisterOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
