import axios from 'axios';
import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) config.headers.Authorization = `Bearer ${session.access_token}`;
  return config;
});

export const getNotes = () => api.get('/notes').then(r => r.data);
export const getNote = (id) => api.get(`/notes/${id}`).then(r => r.data);
export const createNote = (data) => api.post('/notes', data).then(r => r.data);
export const updateNote = (id, data) => api.put(`/notes/${id}`, data).then(r => r.data);
export const deleteNote = (id) => api.delete(`/notes/${id}`).then(r => r.data);
export const getCollections = () => api.get('/collections').then(r => r.data);
export const getCollection = (id) => api.get(`/collections/${id}`).then(r => r.data);
export const createCollection = (data) => api.post('/collections', data).then(r => r.data);
export const deleteCollection = (id) => api.delete(`/collections/${id}`).then(r => r.data);
export const getTags = () => api.get('/tags').then(r => r.data);
export const getNotesByTag = (tagId) => api.get(`/tags/${tagId}/notes`).then(r => r.data);
export const updateProfile = (data) => api.put('/profile', data).then(r => r.data);

export default api;