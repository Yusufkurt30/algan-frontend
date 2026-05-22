import axios from 'axios';

// const API_URL = "http://localhost:3000"; // Eskisi
const API_URL = "https://algan-backend.onrender.com"; // Render Linkin

const api = axios.create({
  baseURL: API_URL,
});

export const authService = {
  login: async (username, password) => {
    const res = await api.post('/users/login', { username, password });
    return res.data;
  }
};

export const userService = {
  getAll: async () => {
    const res = await api.get('/users');
    return res.data;
  },
  add: async (userData) => {
    const res = await api.post('/users', userData);
    return res.data;
  },
  update: async (id, userData) => {
    const res = await api.patch(`/users/${id}`, userData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  }
};

export const workdayService = {
  getAll: async () => {
    const res = await api.get('/workdays');
    return res.data;
  },
  addSingle: async (dateData) => {
    const res = await api.post('/workdays', dateData);
    return res.data;
  },
  addMultiple: async (datesArray) => {
    const res = await api.post('/workdays', datesArray);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/workdays/${id}`);
    return res.data;
  }
};

export const logService = {
  getAll: async () => {
    const res = await api.get('/logs');
    return res.data;
  },
  add: async (logData) => {
    const res = await api.post('/logs', logData);
    return res.data;
  },
  update: async (id, logData) => {
    const res = await api.patch(`/logs/${id}`, logData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/logs/${id}`);
    return res.data;
  }
};

export const aiService = {
  analyze: async (logData) => {
    const res = await api.post('/ai/analyze', { logData });
    return res.data;
  }
};

export default api;
