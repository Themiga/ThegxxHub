// api.js - All API calls go through here
const api = (() => {
  let _token = null;
  let _supabaseUrl = null;
  let _supabaseAnonKey = null;

  const BASE = '/api';

  async function init() {
    const res = await fetch('/api/config');
    if (!res.ok) {
      throw new Error('Nao foi possivel carregar a configuracao do backend. Inicie o servidor com npm run dev.');
    }
    const cfg = await res.json();
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
      throw new Error('As variaveis publicas do Supabase nao foram carregadas corretamente.');
    }
    _supabaseUrl = cfg.supabaseUrl;
    _supabaseAnonKey = cfg.supabaseAnonKey;
  }

  function setToken(token) { _token = token; }
  function clearToken() { _token = null; }
  function getAnonKey() { return _supabaseAnonKey; }
  function getUrl() { return _supabaseUrl; }

  function headers(extra = {}) {
    const h = { 'Content-Type': 'application/json', ...extra };
    if (_token) h['Authorization'] = `Bearer ${_token}`;
    return h;
  }

  async function request(path, options = {}) {
    const response = await fetch(`${BASE}${path}`, {
      ...options,
      headers: { ...headers(), ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    return data;
  }

  async function requestForm(path, formData, method = 'POST') {
    const h = {};
    if (_token) h['Authorization'] = `Bearer ${_token}`;
    const response = await fetch(`${BASE}${path}`, {
      method,
      headers: h,
      body: formData
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  }

  return {
    init,
    setToken,
    clearToken,
    getAnonKey,
    getUrl,

    // Posts
    getPosts: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/posts${q ? '?' + q : ''}`);
    },
    getPost: (id) => request(`/posts/${id}`),
    createPost: (formData) => requestForm('/posts', formData, 'POST'),
    updatePost: (id, formData) => requestForm(`/posts/${id}`, formData, 'PUT'),
    deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
    likePost: (id, type) => request(`/posts/${id}/like`, { method: 'POST', body: JSON.stringify({ type }) }),
    ratePost: (id, rating) => request(`/posts/${id}/rating`, { method: 'POST', body: JSON.stringify({ rating }) }),

    // Profile
    getMe: () => request('/profile/me'),
    updateProfile: (data) => request('/profile/me', { method: 'PATCH', body: JSON.stringify(data) }),

    // Executors
    getExecutors: () => request('/executors'),
    createExecutor: (data) => request('/executors', { method: 'POST', body: JSON.stringify(data) }),
    updateExecutor: (id, data) => request(`/executors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteExecutor: (id) => request(`/executors/${id}`, { method: 'DELETE' }),

    // Admin
    getStats: () => request('/admin/stats'),
    getPublicStats: () => fetch('/api/stats').then(r => r.json()),
    getUsers: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/admin/users${q ? '?' + q : ''}`);
    },
    setUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
    banUser: (id, banned) => request(`/admin/users/${id}/ban`, { method: 'PATCH', body: JSON.stringify({ banned }) }),
  };
})();
