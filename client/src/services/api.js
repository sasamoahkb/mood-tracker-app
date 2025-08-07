// src/services/api.js
import axios from "axios";

const API_URL = "http://localhost:5000"; // Backend URL

// Create Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Automatically attach token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ------------------------
// AUTHENTICATION
// ------------------------
export const signup = async ({ username, email, password }) => {
  const res = await api.post("/signup", { username, email, password });
  if (res.data.success) {
    const token = res.data.token;
    const user = res.data.data || res.data.user;
    if (token) localStorage.setItem("authToken", token);
    return { token, user };
  }
  throw new Error(res.data.error || "Signup failed");
};

export const login = async ({ email, password }) => {
  const res = await api.post("/login", { email, password });
  if (res.data.success) {
    const token = res.data.token;
    const user = res.data.data || res.data.user;
    if (token) localStorage.setItem("authToken", token);
    return { token, user };
  }
  throw new Error(res.data.error || "Login failed");
};

export const logout = () => {
  localStorage.removeItem("authToken");
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/me');
  return data;
};

// ------------------------
// MOOD ENTRIES
// ------------------------
export const createMoodEntry = async (moodData) => {
  const res = await api.post("/create-mood-entry", moodData);
  if (res.data.success) return res.data.data;
  throw new Error(res.data.error || "Failed to create mood entry");
};

export const getMoodHistory = async (filters = {}) => {
  const res = await api.get("/mood-history", { params: filters });
  if (res.data.success) return res.data.data;
  throw new Error(res.data.error || "Failed to fetch mood history");
};

export const getLatestMoodEntries = async (limit = 5) => {
  const { data } = await api.get('/mood-history', { params: { limit } });
  return data;
};


export const updateMoodEntry = async (entryId, updates) => {
  const res = await api.put(`/update-mood-entry/${entryId}`, updates);
  if (res.data.success) return res.data.data;
  throw new Error(res.data.error || "Failed to update mood entry");
};

export const deleteMoodEntry = async (entryId) => {
  const res = await api.delete(`/delete-mood-entry/${entryId}`);
  if (res.data.success) return true;
  throw new Error(res.data.error || "Failed to delete mood entry");
};

// ------------------------
// JOURNAL ENTRIES
// ------------------------
export const createJournalEntry = async (entryId, content) => {
  const res = await api.post("/create-journal-entry", { entry_id: entryId, content });
  if (res.data.success) return res.data.data;
  throw new Error(res.data.error || "Failed to create journal entry");
};

export const getJournalHistory = async (filters = {}) => {
  const res = await api.get("/journal-history", { params: filters });
  if (res.data.success) return res.data.data;
  throw new Error(res.data.error || "Failed to fetch journal history");
};

export const updateJournalEntry = async (journalId, content) => {
  const res = await api.put(`/update-journal-entry/${journalId}`, { content });
  if (res.data.success) return res.data.data;
  throw new Error(res.data.error || "Failed to update journal entry");
};

export const deleteJournalEntry = async (journalId) => {
  const res = await api.delete(`/delete-journal-entry/${journalId}`);
  if (res.data.success) return true;
  throw new Error(res.data.error || "Failed to delete journal entry");
};

// ------------------------
// FACTORS
// ------------------------
export const getAllFactors = async () => {
  const res = await api.get("/factors");
  if (res.data.success) return res.data.data;
  throw new Error(res.data.error || "Failed to fetch factors");
};

export const createFactor = async (factorData) => {
  const res = await api.post("/factors", factorData);
  if (res.data.success) return res.data.data;
  throw new Error(res.data.error || "Failed to create factor");
};

export const updateFactor = async (factorId, updates) => {
  const res = await api.put(`/factors/${factorId}`, updates);
  if (res.data.success) return res.data.data;
  throw new Error(res.data.error || "Failed to update factor");
};

export const deleteFactor = async (factorId) => {
  const res = await api.delete(`/factors/${factorId}`);
  if (res.data.success) return true;
  throw new Error(res.data.error || "Failed to delete factor");
};

export default api;
