// Determine API base URL dynamically:
// 1. Explicit environment variable (if set at build time)
// 2. Relative path '/api' when running on Cloud IP / domain behind Nginx single-port proxy
// 3. Fallback to 'http://localhost:8081/api' for local dev
const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // If hosted on Cloud IP / domain (not local dev server at localhost:5173/5174)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:8081/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
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
