/**
 * src/services/api.js
 *
 * Merkezi API servisi.
 * - Hardcoded URL YOK: import.meta.env.VITE_API_URL kullanılır.
 * - JWT token tüm isteklere otomatik eklenir.
 * - Her modül için ayrı metotlar → Single Responsibility.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─────────────────────────────────────────────────────────────────
// Token yönetimi
// ─────────────────────────────────────────────────────────────────
const TOKEN_KEY = 'algan_token';
const USER_KEY = 'algan_user';

export const tokenStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('algan_active_page');
  },
};

// ─────────────────────────────────────────────────────────────────
// Temel fetch yardımcısı
// ─────────────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = tokenStorage.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token süresi dolmuş veya geçersiz → çıkış yap
    tokenStorage.clear();
    window.location.reload();
    return;
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.message || `HTTP ${response.status}`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  // 204 No Content gibi durumlarda boş body gelebilir
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// ─────────────────────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────────────────────
export const authApi = {
  /**
   * POST /auth/login
   * Returns { access_token, user }
   * Şifre karşılaştırması backend'de bcrypt ile yapılır.
   */
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
};

// ─────────────────────────────────────────────────────────────────
// Users API
// ─────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: () => request('/users'),
  getOne: (id) => request(`/users/${id}`),
  create: (data) =>
    request('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};

// ─────────────────────────────────────────────────────────────────
// Workdays API
// ─────────────────────────────────────────────────────────────────
export const workdaysApi = {
  getAll: () => request('/workdays'),
  create: (data) =>
    request('/workdays', { method: 'POST', body: JSON.stringify(data) }),
  createRange: (data) =>
    request('/workdays/range', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/workdays/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request(`/workdays/${id}`, { method: 'DELETE' }),
};

// ─────────────────────────────────────────────────────────────────
// Logs API
// ─────────────────────────────────────────────────────────────────
export const logsApi = {
  getAll: () => request('/logs'),
  create: (data) =>
    request('/logs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/logs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request(`/logs/${id}`, { method: 'DELETE' }),
};
