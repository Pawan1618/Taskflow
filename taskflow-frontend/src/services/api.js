import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ── Users ────────────────────────────────────────────────────────
export const getUsers    = ()        => api.get('/users');
export const createUser  = (data)    => api.post('/users', data);
export const updateUser  = (id, data)=> api.put(`/users/${id}`, data);
export const deleteUser  = (id)      => api.delete(`/users/${id}`);

// ── Auth ─────────────────────────────────────────────────────────
export const loginUser   = (data) => api.post('/auth/login', data);
export const signupUser  = (data) => api.post('/auth/signup', data);
export const logoutUser  = ()     => api.post('/auth/logout');
export const getMe       = ()     => api.get('/auth/me');

// ── Projects ─────────────────────────────────────────────────────
export const getProjects    = ()        => api.get('/projects');
export const getProjectById = (id)      => api.get(`/projects/${id}`);
export const createProject  = (data)    => api.post('/projects', data);
export const updateProject  = (id, data)=> api.put(`/projects/${id}`, data);
export const deleteProject  = (id)      => api.delete(`/projects/${id}`);

// ── Tasks ─────────────────────────────────────────────────────────
export const getTasks          = ()              => api.get('/tasks');
export const getTasksByProject = (projectId)     => api.get(`/tasks/project/${projectId}`);
export const getTasksByUser    = (userId)        => api.get(`/tasks/user/${userId}`);
export const createTask        = (data, projectId, assignedToId) => {
  let url = `/tasks?projectId=${projectId}`;
  if (assignedToId) url += `&assignedToId=${assignedToId}`;
  return api.post(url, data);
};
export const updateTask  = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask  = (id)       => api.delete(`/tasks/${id}`);

export default api;
