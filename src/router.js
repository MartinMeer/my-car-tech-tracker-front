export const pageMap = {
  'my-car-overview': '/cars/my-car-overview',
  'next-mainten-alert': '/maintenance/next-mainten-alert',
  'next-repair-alert': '/repair/next-repair-alert',
  'next-mainten-list': '/maintenance/next-mainten-list',
  'next-repair-list': '/repair/next-repair-list',
  'mainten-history': '/maintenance/mainten-history',
  'repair-history': '/repair/repair-history',
  'service-history': '/service-history',

  'user-alert': '/user-alert',
  'alert-list': '/alert-list',
  'service-card': '/service-card',
  'oils': '/info/oils',
  'spares': '/info/spares',
  'shops': '/info/shops',
  'my-cars': '/cars/my-cars',
  'add-car': '/cars/add-car',
  'login': '/auth/login',
  'register': '/auth/register',
  'cover': '/cover',
  'contacts': '/info/contacts',
  'privacy': '/info/privacy'
};

export function loadPage(hash, mainContent, initializePageUI) {
  // Extract page name before '?' (for hash like #add-car?edit=123)
  const hashValue = hash.replace('#', '');
  let page = hashValue.split('?')[0];
  
  // Handle empty hash case
  if (!page) {
    page = 'my-cars';
  }
  
  const file = pageMap[page] || '/cars/my-car-overview';
  console.log('Loading page:', { hash, page, file });
  
  mainContent.innerHTML = '<div class="loading">Загрузка...</div>';
  
  return fetch(file)
    .then(resp => {
      if (!resp.ok) throw new Error('Страница не найдена');
      return resp.text();
    })
    .then(html => {
      mainContent.innerHTML = html;
      // Initialize page-specific UI after content loads
      if (initializePageUI) initializePageUI(page);
    })
    .catch((error) => {
      console.error('Error loading page:', error);
      mainContent.innerHTML = '<div class="error">Страница не найдена</div>';
    });
} 