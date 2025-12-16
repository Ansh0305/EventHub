import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const eventApi = {
  getEvents: (params) => api.get('/events', { params }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateEvent: (id, data) => api.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  getMyEvents: () => api.get('/events/user/my-events'),
  getAttendingEvents: () => api.get('/events/user/attending'),
  joinEvent: (id) => api.post(`/events/${id}/join`),
  leaveEvent: (id) => api.post(`/events/${id}/leave`),
  getRsvpStatus: (id) => api.get(`/events/${id}/rsvp-status`),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getEvents: (params) => api.get('/admin/events', { params }),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),
};

export default api;
