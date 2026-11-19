import axios from 'axios';
import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Перехватчик для добавления токена авторизации в каждый запрос
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const getNotes = () => api.get('/notes').then(r => r.data);
export const createNote = (data) => api.post('/notes', data).then(r => r.data);
export const deleteNote = (id) => api.delete(`/notes/${id}`).then(r => r.data);
export const getCollections = () => api.get('/collections').then(r => r.data);
export const createCollection = (data) => api.post('/collections', data).then(r => r.data);

export default api;