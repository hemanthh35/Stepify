import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from '../lib/api.js';
import { AuthContext } from './authContext.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthToken(null);
    api.post('/auth/logout').catch(() => {});
  }, []);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      api
        .get('/auth/profile')
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setAuthToken(null);
      setUser(null);
      setLoading(false);
    }
  }, [token, logout]);

  const refreshProfile = useCallback(async () => {
    const res = await api.get('/auth/profile');
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const nextToken = res.data.token;
    localStorage.setItem('token', nextToken);
    setToken(nextToken);
    setUser(res.data.user);
    return res.data;
  }, []);

  const signup = useCallback(async (email, password, confirmPassword) => {
    const res = await api.post('/auth/signup', { email, password, confirmPassword });
    const nextToken = res.data.token;
    localStorage.setItem('token', nextToken);
    setToken(nextToken);
    setUser(res.data.user);
    return res.data;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const res = await api.put('/auth/profile', payload);
    if (res.data?.user) {
      setUser(res.data.user);
    }
    return res.data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      signup,
      refreshProfile,
      updateProfile,
      logout,
      isAuthenticated: Boolean(token && user),
    }),
    [user, token, loading, login, signup, refreshProfile, updateProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
