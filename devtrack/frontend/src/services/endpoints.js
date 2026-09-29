import api from './api'

const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null && v !== 'all'))

export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
}

export const usersApi = {
  update: (data) => api.put('/api/users/me', data),
  changePassword: (data) => api.post('/api/users/me/password', data),
}

export const projectsApi = {
  list: (params) => api.get('/api/projects', { params: clean(params) }),
  get: (id) => api.get(`/api/projects/${id}`),
  create: (data) => api.post('/api/projects', data),
  update: (id, data) => api.put(`/api/projects/${id}`, data),
  remove: (id) => api.delete(`/api/projects/${id}`),
}

export const tasksApi = {
  list: (params) => api.get('/api/tasks', { params: clean(params) }),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.put(`/api/tasks/${id}`, data),
  remove: (id) => api.delete(`/api/tasks/${id}`),
}

export const dashboardApi = { stats: () => api.get('/api/dashboard/stats') }
