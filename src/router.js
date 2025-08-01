export const pageMap = {
  '': 'index.html', // Root page - fleet overview
  'my-car-overview': 'cars/my-car-overview.html',
  'next-mainten-alert': 'maintenance/next-mainten-alert.html',
  'next-repair-alert': 'repair/next-repair-alert.html',
  'next-mainten-list': 'maintenance/next-mainten-list.html',
  'next-repair-list': 'repair/next-repair-list.html',
  'mainten-history': 'maintenance/mainten-history.html',
  'repair-history': 'repair/repair-history.html',
  'maintenance-plan': 'maintenance/maintenance-plan.html',
  'service-history': 'service-history.html', // stays in public/

  'user-alert': 'user-alert.html',
  'alert-list': 'alert-list.html', // stays in public/
  'service-card': 'service-card.html', // stays in public/
  'oils': 'info/oils.html',
  'spares': 'info/spares.html',
  'shops': 'info/shops.html',
  'my-cars': 'cars/my-cars.html',
  'add-car': 'cars/add-car.html',
  'login': 'auth/login.html',
  'register': 'auth/register.html',
  'contacts': 'info/contacts.html',
  'privacy': 'info/privacy.html',
  'reglament': 'car-info/reglament.html',
  'maintenance-guide': 'car-info/maintenance-guide.html',
  'cover': 'cover.html', // stays in public/
};

export function loadPage(hash, mainContent, initializePageUI) {
  // Extract page name before '?' (for hash like #add-car?edit=123)
  const hashValue = hash.replace('#', '');
  const page = hashValue.split('?')[0];
  
  // For root page (empty hash), show fleet overview directly
  if (page === '') {
    mainContent.innerHTML = `
      <div id="fleet-overview" class="fleet-overview">
        <div class="fleet-header">
          <h1>Мой автопарк</h1>
          <p>Обзор всех автомобилей в вашем парке</p>
        </div>
        <div id="fleet-cars-list" class="fleet-cars-list">
          <!-- Cars will be loaded here dynamically -->
        </div>
      </div>
    `;
    if (initializePageUI) initializePageUI('');
    return;
  }
  
  const file = pageMap[page] || 'cars/my-car-overview.html';
  mainContent.innerHTML = '<div class="loading">Загрузка...</div>';
  fetch(file)
    .then(resp => {
      if (!resp.ok) throw new Error('Страница не найдена');
      return resp.text();
    })
    .then(html => {
      mainContent.innerHTML = html;
      // Initialize page-specific UI after content loads
      if (initializePageUI) initializePageUI(page);
    })
    .catch(() => {
      mainContent.innerHTML = '<div class="error">Страница не найдена</div>';
    });
} 