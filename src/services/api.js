import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('iams_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const saveSession = (data) => {
  localStorage.setItem('iams_token', data.token);
  localStorage.setItem('iams_user', JSON.stringify(data.user));
};

export const getUser = () => {
  const user = localStorage.getItem('iams_user');
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem('iams_token');
  localStorage.removeItem('iams_user');
};

export default api;
