import axios from 'axios';

// Create an axios instance with base URL and default headers
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/users/register', { username, email, password });
    localStorage.setItem('token', response.data.token);
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    const response = await api.post('/users/login', { email, password });
    localStorage.setItem('token', response.data.token);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  getCurrentUser: async () => {
    return await api.get('/users/me');
  },
  
  updatePreferences: async (preferences: any) => {
    return await api.put('/users/preferences', { preferences });
  },
  
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  }
};

// Notes services
export const noteService = {
  getAllNotes: async () => {
    const response = await api.get('/notes');
    return response.data;
  },
  
  getNoteById: async (id: string) => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },
  
  createNote: async (note: any) => {
    const response = await api.post('/notes', note);
    return response.data;
  },
  
  updateNote: async (id: string, note: any) => {
    const response = await api.put(`/notes/${id}`, note);
    return response.data;
  },
  
  deleteNote: async (id: string) => {
    await api.delete(`/notes/${id}`);
  },
  
  getNotesByTag: async (tag: string) => {
    const response = await api.get(`/notes/tags/${tag}`);
    return response.data;
  },
  
  getNotesByCategory: async (category: string) => {
    const response = await api.get(`/notes/categories/${category}`);
    return response.data;
  }
};

export default api;
