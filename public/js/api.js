const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('aven_token');
}
function setSession(token, user) {
  localStorage.setItem('aven_token', token);
  localStorage.setItem('aven_user', JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem('aven_token');
  localStorage.removeItem('aven_user');
}
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('aven_user')); } catch (e) { return null; }
}
function isLoggedIn() {
  return !!getToken();
}
function requireAuth() {
  if (!isLoggedIn()) window.location.href = '/login.html';
}
function redirectIfLoggedIn() {
  if (isLoggedIn()) window.location.href = '/dashboard.html';
}
function logout() {
  clearSession();
  window.location.href = '/index.html';
}

async function apiFetch(path, options = {}) {
  const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + path, Object.assign({}, options, { headers }));

  if (res.status === 401) {
    clearSession();
    window.location.href = '/login.html';
    return null;
  }

  let data = {};
  try { data = await res.json(); } catch (e) { /* no body */ }

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }
  return data;
}

function showToast(message) {
  let toast = document.getElementById('aven-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'aven-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
