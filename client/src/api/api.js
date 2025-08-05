// src/api/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // your backend base URL
  withCredentials: true // to support cookies/session if needed
});

// --- Auth endpoints ---
export const registerUser = (userData) => API.post('/signup', userData);
export const loginUser = (credentials) => API.post('/login', credentials);

// --- Mood entry ---
export const createMoodEntry = (moodData, token) => {
  return API.post('/create-mood-entry', moodData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// --- Get user info (optional protected route) ---
export const getUserInfo = (token) => {
  return API.get('/users/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getMoodEntries = (token) => {
  return API.get('/moods-history', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export default API;
