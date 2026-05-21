/**
 * src/hooks/useAuth.js
 *
 * Kimlik doğrulama state'ini ve işlemlerini tek bir yerde yönetir.
 * Single Responsibility: sadece auth ile ilgilenir.
 */
import { useState } from 'react';
import { authApi, tokenStorage } from '../services/api';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(() => tokenStorage.getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (username, password) => {
    setLoading(true);
    setError('');
    try {
      // Backend'e POST /auth/login → bcrypt karşılaştırması orada yapılır
      const data = await authApi.login(username, password);
      tokenStorage.setToken(data.access_token);
      tokenStorage.setUser(data.user);
      setCurrentUser(data.user);
      return true;
    } catch (err) {
      setError(err.message || 'Giriş başarısız');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    tokenStorage.clear();
    setCurrentUser(null);
    setError('');
  };

  return { currentUser, login, logout, loading, error };
}
