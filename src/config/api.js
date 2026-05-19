// Markazlashtirilgan API konfiguratsiyasi
const API_BASE = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ''
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://localhost:5001' : '');

export const API = `${API_BASE}/api`;
export const UPLOADS = `${API_BASE}/uploads`;
export const API_URL = API_BASE;

// Token boshqaruvi
export const getToken = () => localStorage.getItem('token');
export const getAdminToken = () => localStorage.getItem('adminToken');

export const setAuth = (token, user) => {
  localStorage.removeItem('adminToken'); // Student kirganda admin tokenni tozalash
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('adminToken');
};

export const getUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// Autentifikatsiyali fetch
export const authFetch = async (url, options = {}) => {
  const isAdminPath = window.location.pathname.startsWith('/admin');
  const token = isAdminPath ? (getAdminToken() || getToken()) : (getToken() || getAdminToken());
  const headers = { ...options.headers };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    // Adminlar uchun xavfsizlik cheklovlarini chetlab o'tish (rate limit)
    if (token === getAdminToken()) {
      headers['x-admin-bypass'] = 'true';
    }
  }
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  
  const response = await fetch(url, { ...options, headers });
  
  // Token muddati tugagan bo'lsa
  if (response.status === 401) {
    clearAuth();
    window.location.href = '/login';
    return response;
  }
  
  return response;
};
