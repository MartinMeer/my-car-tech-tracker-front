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
  'my-cars': 'my-cars.html',
  'add-car': 'add-car.html',
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
      // Initialize page-specific UI after content loads
      initializePageUI(page);
    })
    .catch(() => {
      mainContent.innerHTML = '<div class="error">Страница не найдена</div>';
    });
}

// --- UI Initialization Functions (View Logic Only) ---
function initializePageUI(page) {
  switch(page) {
    case 'my-cars':
      initializeMyCarsUI();
      break;
    case 'add-car':
      initializeAddCarUI();
      break;
    case 'my-car-overview':
      initializeCarOverviewUI();
      break;
    default:
      // Other pages will be initialized here
      break;
  }
}

// --- Confirmation Dialog UI ---
function showConfirmationDialog(message, onConfirm, onCancel) {
  // Create dialog overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  // Create dialog box
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    width: 90%;
    text-align: center;
  `;
  
  dialog.innerHTML = `
    <p style="margin-bottom: 1.5rem; font-size: 1.1rem; color: #2d3e50;">${message}</p>
    <div style="display: flex; gap: 1rem; justify-content: center;">
      <button id="confirm-yes" style="
        background: #2d3e50;
        color: white;
        border: none;
        padding: 0.5rem 1.5rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
      ">Да</button>
      <button id="confirm-no" style="
        background: #e0e0e0;
        color: #2d3e50;
        border: none;
        padding: 0.5rem 1.5rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
      ">Нет</button>
    </div>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // Add event listeners
  dialog.querySelector('#confirm-yes').onclick = () => {
    document.body.removeChild(overlay);
    if (onConfirm) onConfirm();
  };
  
  dialog.querySelector('#confirm-no').onclick = () => {
    document.body.removeChild(overlay);
    if (onCancel) onCancel();
  };
  
  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
      if (onCancel) onCancel();
    }
  };
  
  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      document.body.removeChild(overlay);
      document.removeEventListener('keydown', handleEscape);
      if (onCancel) onCancel();
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// --- My Cars Page UI Logic ---
function initializeMyCarsUI() {
  renderCarsList();
  setupAddCarForm();
}

function renderCarsList() {
  const listDiv = document.getElementById('cars-list');
  if (!listDiv) return;
  
  // Show loading state
  listDiv.innerHTML = '<div class="loading">Загрузка списка автомобилей...</div>';
  
  // Fetch cars from backend (placeholder)
  fetchCarsFromBackend()
    .then(cars => {
      if (cars.length === 0) {
        listDiv.innerHTML = '<p>Нет добавленных автомобилей.</p>';
        return;
      }
      listDiv.innerHTML = cars.map(car =>
        `<div class="car-list-item" data-car-id="${car.id}" style="display:flex;align-items:center;gap:1rem;margin-bottom:0.7rem;cursor:pointer;">
          <span style="font-size:1.5rem;">${car.img}</span>
          <span>${car.name}</span>
          <button data-car-id="${car.id}" data-car-name="${car.name}" class="remove-car-btn" style="margin-left:auto;">Удалить</button>
        </div>`
      ).join('');
      
      // Add event listeners for car selection
      Array.from(listDiv.querySelectorAll('.car-list-item')).forEach(item => {
        item.onclick = function(e) {
          // Prevent click if remove button was clicked
          if (e.target.classList.contains('remove-car-btn')) return;
          const carId = this.getAttribute('data-car-id');
          localStorage.setItem('selectedCarId', carId);
          window.location.hash = '#my-car-overview';
        };
      });


      // Add event listeners for remove buttons
      Array.from(listDiv.querySelectorAll('.remove-car-btn')).forEach(btn => {
        btn.onclick = function(e) {
          e.stopPropagation();
          const id = parseInt(this.getAttribute('data-car-id'));
          const carName = this.getAttribute('data-car-name');
          showConfirmationDialog(
            `Вы уверены, что хотите удалить автомобиль "${carName}"?`,
            () => {
              // User confirmed - proceed with removal
              removeCarFromBackend(id).then(() => {
                renderCarsList();
                updateCarSelectionUI();
              }).catch(error => {
                alert('Ошибка удаления: ' + error.message);
              });
            },
            () => {
              // User cancelled - do nothing
            }
          );
        };
      });
    })
    .catch(error => {
      listDiv.innerHTML = '<div class="error">Ошибка загрузки: ' + error.message + '</div>';
    });
}

function setupAddCarForm() {
  const form = document.getElementById('add-car-form');
  if (!form) return;
  
  form.onsubmit = function(e) {
    e.preventDefault();
    const name = form['car-name'].value.trim();
    const img = form['car-img'].value.trim() || '🚗';
    if (!name) return;
    
    showConfirmationDialog(
      `Вы уверены, что хотите добавить автомобиль "${name}"?`,
      () => {
        // User confirmed - proceed with addition
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Добавление...';
        submitBtn.disabled = true;
        
        addCarToBackend({ name, img })
          .then(() => {
            form.reset();
            renderCarsList();
            updateCarSelectionUI();
          })
          .catch(error => {
            alert('Ошибка добавления: ' + error.message);
          })
          .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
          });
      },
      () => {
        // User cancelled - do nothing
      }
    );
  };
}

// --- Add Car Page UI Logic ---
function initializeAddCarUI() {
  setupAddCarForm();
  setupImagePreview();
  setupCancelButton();
}

function setupAddCarForm() {
  const form = document.getElementById('add-car-form');
  if (!form) return;
  
  form.onsubmit = function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(form);
    const carData = {
      brand: formData.get('brand').trim(),
      model: formData.get('model').trim(),
      year: parseInt(formData.get('year')),
      vin: formData.get('vin').trim(),
      mileage: parseInt(formData.get('mileage')),
      price: formData.get('price') ? parseInt(formData.get('price')) : null,
      nickname: formData.get('nickname').trim() || null,
      image: formData.get('image')
    };
    
    // Basic validation
    if (!carData.brand || !carData.model || !carData.year || !carData.vin || !carData.mileage) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    if (carData.year < 1900 || carData.year > 2030) {
      alert('Год выпуска должен быть между 1900 и 2030');
      return;
    }
    
    if (carData.mileage < 0) {
      alert('Пробег не может быть отрицательным');
      return;
    }
    
    // Show confirmation dialog
    const carName = carData.nickname || `${carData.brand} ${carData.model}`;
    showConfirmationDialog(
      `Вы уверены, что хотите добавить автомобиль "${carName}"?`,
      () => {
        // User confirmed - proceed with addition
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Добавление...';
        submitBtn.disabled = true;
        
        addCarToBackend(carData)
          .then(() => {
            // Redirect to my-cars page
            window.location.hash = '#my-cars';
          })
          .catch(error => {
            alert('Ошибка добавления: ' + error.message);
          })
          .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
          });
      },
      () => {
        // User cancelled - do nothing
      }
    );
  };
}

function setupImagePreview() {
  const imageInput = document.getElementById('car-image');
  const imagePreview = document.getElementById('image-preview');
  
  if (!imageInput || !imagePreview) return;
  
  imageInput.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) {
      imagePreview.innerHTML = '';
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      imageInput.value = '';
      imagePreview.innerHTML = '';
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      imageInput.value = '';
      imagePreview.innerHTML = '';
      return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  };
}

function setupCancelButton() {
  const cancelBtn = document.getElementById('cancel-btn');
  if (!cancelBtn) return;
  
  cancelBtn.onclick = function() {
    // Check if form has any data
    const form = document.getElementById('add-car-form');
    const formData = new FormData(form);
    const hasData = Array.from(formData.values()).some(value => value && value.toString().trim() !== '');
    
    if (hasData) {
      showConfirmationDialog(
        'Вы уверены, что хотите отменить? Все введенные данные будут потеряны.',
        () => {
          window.location.hash = '#my-cars';
        },
        () => {
          // User cancelled - stay on page
        }
      );
    } else {
      window.location.hash = '#my-cars';
    }
  };
}

// --- Car Selection UI Logic ---
function updateCarSelectionUI() {
  renderCurrentCar();
  renderCarsMenu();
}

function renderCurrentCar() {
  const carNameDiv = document.getElementById('current-car-name');
  const carImgDiv = document.getElementById('current-car-img');
  
  if (!carNameDiv || !carImgDiv) return;
  
  // Show loading state
  carNameDiv.textContent = 'Загрузка...';
  carImgDiv.textContent = '⏳';
  
  // Fetch current car from backend
  getCurrentCarFromBackend()
    .then(car => {
      if (car) {
        carNameDiv.textContent = car.name;
        carImgDiv.textContent = car.img;
      } else {
        carNameDiv.textContent = 'Автомобиль не выбран';
        carImgDiv.textContent = '🚗';
      }
    })
    .catch(error => {
      carNameDiv.textContent = 'Ошибка загрузки';
      carImgDiv.textContent = '❌';
    });
}

function renderCarsMenu() {
  const menu = document.getElementById('car-select-menu');
  if (!menu) return;
  
  // Show loading state
  menu.innerHTML = '<div class="loading">Загрузка...</div>';
  
  // Fetch cars from backend
  fetchCarsFromBackend()
    .then(cars => {
      menu.innerHTML = cars.map(car =>
        `<div class="car-menu-item" data-car-id="${car.id}">${car.img} ${car.name}</div>`
      ).join('');
      
      // Add event listeners
      Array.from(menu.querySelectorAll('.car-menu-item')).forEach(item => {
        item.onclick = function() {
          const carId = this.getAttribute('data-car-id');
          setCurrentCarInBackend(carId).then(() => {
            updateCarSelectionUI();
            menu.style.display = 'none';
          });
        };
      });
    })
    .catch(error => {
      menu.innerHTML = '<div class="error">Ошибка загрузки</div>';
    });
}

function initializeCarOverviewUI() {
  // Get selected car ID
  const carId = localStorage.getItem('selectedCarId');
  if (!carId) return;
  fetchCarsFromBackend().then(cars => {
    const car = cars.find(c => c.id == carId);
    if (!car) return;
    // Fill in car details
    const title = document.getElementById('car-title');
    const vin = document.getElementById('car-vin');
    const mileage = document.getElementById('car-mileage');
    if (title) title.textContent = `${car.brand || ''} ${car.model || ''} ${car.nickname || ''}`.trim() || car.name;
    if (vin) vin.textContent = `VIN: ${car.vin || '-'}`;
    if (mileage) mileage.textContent = `Пробег: ${car.mileage != null ? car.mileage + ' км' : '-'}`;
  });
}

// --- Backend API Placeholders (Replace with real API calls) ---
async function fetchCarsFromBackend() {
  // TODO: Replace with actual API call
  // return fetch('/api/cars').then(res => res.json());
  
  // Temporary demo data
  const stored = localStorage.getItem('cars');
  if (stored) return JSON.parse(stored);
  return [
    { id: 1, name: 'Toyota Camry', img: '🚗' },
    { id: 2, name: 'Lada Vesta', img: '🚙' },
    { id: 3, name: 'BMW X5', img: '🚘' }
  ];
}

async function getCurrentCarFromBackend() {
  // TODO: Replace with actual API call
  // return fetch('/api/cars/current').then(res => res.json());
  
  const carId = localStorage.getItem('currentCarId');
  const cars = await fetchCarsFromBackend();
  return cars.find(c => c.id == carId) || cars[0];
}

async function setCurrentCarInBackend(carId) {
  // TODO: Replace with actual API call
  // return fetch('/api/cars/current', { method: 'POST', body: JSON.stringify({ carId }) });
  
  localStorage.setItem('currentCarId', carId);
}

async function addCarToBackend(carData) {
  // TODO: Replace with actual API call
  // return fetch('/api/cars', { method: 'POST', body: JSON.stringify(carData) });
  
  const cars = await fetchCarsFromBackend();
  const newId = cars.length > 0 ? Math.max(...cars.map(c => c.id)) + 1 : 1;
  cars.push({ id: newId, ...carData });
  localStorage.setItem('cars', JSON.stringify(cars));
}

async function removeCarFromBackend(carId) {
  // TODO: Replace with actual API call
  // return fetch(`/api/cars/${carId}`, { method: 'DELETE' });
  
  let cars = await fetchCarsFromBackend();
  cars = cars.filter(c => c.id !== carId);
  localStorage.setItem('cars', JSON.stringify(cars));
  
  // Handle current car selection
  const currentCarId = parseInt(localStorage.getItem('currentCarId'));
  if (currentCarId === carId && cars.length > 0) {
    localStorage.setItem('currentCarId', cars[0].id);
  } else if (cars.length === 0) {
    localStorage.removeItem('currentCarId');
  }
}

// --- Event Listeners (UI Logic Only) ---
window.addEventListener('hashchange', () => {
  loadPage(location.hash);
  // Hide car selection popup on navigation
  const carSelectMenu = document.getElementById('car-select-menu');
  if (carSelectMenu) {
    carSelectMenu.style.display = 'none';
  }
});
window.addEventListener('DOMContentLoaded', () => {
  loadPage(location.hash || '#my-cars');
  
  // Initialize car selection UI
  updateCarSelectionUI();
  
  // Car image dropdown
  const carImgDiv = document.getElementById('current-car-img');
  const carSelectMenu = document.getElementById('car-select-menu');
  if (carImgDiv && carSelectMenu) {
    carImgDiv.onclick = function(e) {
      e.stopPropagation();
      carSelectMenu.style.display = carSelectMenu.style.display === 'block' ? 'none' : 'block';
    };
    document.addEventListener('click', function(e) {
      if (!carSelectMenu.contains(e.target) && e.target !== carImgDiv) {
        carSelectMenu.style.display = 'none';
      }
    });
  }
});

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