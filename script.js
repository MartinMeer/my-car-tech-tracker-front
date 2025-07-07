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