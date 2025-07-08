// Simple client-side router for hash-based navigation
const mainContent = document.getElementById('main-content');

const pageMap = {
  'my-car-overview': 'my-car-overview.html',
  'next-mainten-alert': 'next-mainten-alert.html',
  'next-repair-alert': 'next-repair-alert.html',
  'next-mainten-list': 'next-mainten-list.html',
  'next-repair-list': 'next-repair-list.html',
  'mainten-history': 'mainten-history.html',
  'repair-history': 'repair-history.html',
  'service-card': 'service-card.html',
  'oils': 'oils.html',
  'spares': 'spares.html',
  'shops': 'shops.html',
};

function loadPage(hash) {
  const page = hash.replace('#', '');
  const file = pageMap[page] || 'my-car-overview.html';
  mainContent.innerHTML = '<div class="loading">Загрузка...</div>';
  fetch(file)
    .then(resp => {
      if (!resp.ok) throw new Error('Страница не найдена');
      return resp.text();
    })
    .then(html => {
      mainContent.innerHTML = html;
    })
    .catch(() => {
      mainContent.innerHTML = '<div class="error">Страница не найдена</div>';
    });
}

window.addEventListener('hashchange', () => loadPage(location.hash));
window.addEventListener('DOMContentLoaded', () => loadPage(location.hash || '#my-car-overview'));

// --- Redirect unauthorised users to cover page (only on app pages) ---
// To disable redirect for development, run in browser console: localStorage.setItem('devMode', 'true')
const publicPages = [
  'cover.html',
  'login.html',
  'register.html',
  'contacts.html',
  'privacy.html'
];
const isPublic = publicPages.some(page => window.location.pathname.endsWith(page));
const devMode = localStorage.getItem('devMode') === 'true';
if (!isPublic && !devMode) {
  if (localStorage.getItem('auth') !== 'true') {
    window.location.href = 'cover.html';
  }
}

// --- Cookie popup logic ---
(function() {
  const popup = document.getElementById('cookie-popup');
  if (!popup) return;
  if (localStorage.getItem('cookieConsent')) {
    popup.style.display = 'none';
    return;
  }
  popup.style.display = 'flex';
  document.getElementById('cookie-accept').onclick = function() {
    localStorage.setItem('cookieConsent', 'accepted');
    popup.style.display = 'none';
  };
  document.getElementById('cookie-reject').onclick = function() {
    localStorage.setItem('cookieConsent', 'rejected');
    popup.style.display = 'none';
  };
})();

// --- Logout button logic ---
(function() {
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('auth');
      window.location.href = 'cover.html';
    });
  }
})(); 