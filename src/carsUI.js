import { DataService } from './dataService.js';
import { showConfirmationDialog } from './dialogs.js';

export function initializeMyCarsUI() {
  renderCarsList();
  setupAddCarForm();
}

function renderCarsList() {
  const listDiv = document.getElementById('cars-list');
  if (!listDiv) return;
  listDiv.innerHTML = '<div class="loading">Загрузка списка автомобилей...</div>';
  DataService.getCars()
    .then(cars => {
      if (cars.length === 0) {
        listDiv.innerHTML = '<p>Нет добавленных автомобилей.</p>';
        return;
      }
      listDiv.innerHTML = cars.map(car => {
        // Compose name and nickname
        const displayName = car.name || `${car.brand || ''} ${car.model || ''}`.trim();
        const nickname = car.nickname ? ` "${car.nickname}"` : '';
        // Image logic
        let imgHtml = '';
        if (car.img && car.img.startsWith('data:image/')) {
          imgHtml = `<img class="car-list-img" src="${car.img}" alt="car image" style="width:256px;height:256px;object-fit:cover;border-radius:50%;box-shadow:0 2px 8px #e0e0e0;cursor:pointer;">`;
        } else {
          imgHtml = `<div class="car-list-img" style="width:256px;height:256px;display:flex;align-items:center;justify-content:center;background:#f4f7fb;border-radius:50%;font-size:5rem;color:#bbb;box-shadow:0 2px 8px #e0e0e0;cursor:pointer;">🚗</div>`;
        }
        return `
          <div class="car-list-item" data-car-id="${car.id}" style="display:flex;flex-direction:column;align-items:center;gap:1rem;margin-bottom:2.5rem;cursor:pointer;max-width:256px;">
            ${imgHtml}
            <h2 class="car-list-name" style="font-size:1.25rem;font-weight:600;text-align:center;margin:0 0 0.5rem 0;cursor:pointer;">
              <span>${displayName}${nickname}</span>
            </h2>
          </div>
        `;
      }).join('');
      // Add event listeners for car name click
      Array.from(listDiv.querySelectorAll('.car-list-item .car-list-name')).forEach(nameEl => {
        nameEl.onclick = function(e) {
          e.stopPropagation();
          const carItem = this.closest('.car-list-item');
          const carId = carItem.getAttribute('data-car-id');
          setCurrentCarId(carId).then(() => {
            window.location.hash = '#my-car-overview';
          });
        };
      });
      // Add event listeners for car image/icon click
      Array.from(listDiv.querySelectorAll('.car-list-item .car-list-img')).forEach(imgEl => {
        imgEl.onclick = function(e) {
          e.stopPropagation();
          const carItem = this.closest('.car-list-item');
          const carId = carItem.getAttribute('data-car-id');
          setCurrentCarId(carId).then(() => {
            window.location.hash = '#my-car-overview';
          });
        };
      });
    })
    .catch(error => {
      listDiv.innerHTML = `<div class="error" aria-live="assertive">Ошибка загрузки: ${error.message}</div>`;
    });
}

function setupAddCarForm() {
  const form = document.getElementById('add-car-form');
  if (!form) return;
  form.onsubmit = async function(e) {
    e.preventDefault();
    const brand = form['brand'].value.trim();
    const model = form['model'].value.trim();
    const year = form['year'].value.trim();
    const vin = form['vin'].value.trim();
    const mileage = form['mileage'].value.trim();
    const price = form['price'].value.trim();
    const nickname = form['nickname'].value.trim();
    const name = [brand, model, nickname].filter(Boolean).join(' ');
    let img = '🚗';
    let imageBase64 = '';
    const imageInput = form['image'];
    if (imageInput && imageInput.files && imageInput.files[0]) {
      const file = imageInput.files[0];
      if (file.type.startsWith('image/')) {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        img = imageBase64; // Use base64 as img for now
      }
    }
    if (!brand || !model || !year || !vin || !mileage) return;
    const editId = form.getAttribute('data-edit-id');
    if (editId) {
      // Edit mode: check if required fields changed
      const cars = await DataService.getCars();
      const car = cars.find(c => c.id == editId);
      let changed = false;
      if (car) {
        changed = car.brand !== brand || car.model !== model || car.year != year || car.vin !== vin || car.mileage != mileage;
      }
      const doSave = async () => {
        // Update car object
        if (car) {
          car.brand = brand;
          car.model = model;
          car.year = year;
          car.vin = vin;
          car.mileage = mileage;
          car.price = price;
          car.nickname = nickname;
          if (imageBase64) car.img = imageBase64;
          await DataService.saveCars(cars);
        }
        window.location.hash = '#my-car-overview';
      };
      if (changed && window.showConfirmationDialog) {
        window.showConfirmationDialog('Сохранить изменения?', doSave, () => {});
      } else {
        await doSave();
      }
      return;
    }
    // Add mode
    showConfirmationDialog(
      `Вы уверены, что хотите добавить автомобиль "${name}"?`,
      () => {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Добавление...';
        submitBtn.disabled = true;
        addCarToBackend({
          name,
          brand,
          model,
          year,
          vin,
          mileage,
          price,
          nickname,
          img,
          imageBase64
        })
          .then(() => {
            form.reset();
            if (typeof renderCarsList === 'function') renderCarsList();
            if (typeof updateCarSelectionUI === 'function') updateCarSelectionUI();
          })
          .catch(error => {
            alert('Ошибка добавления: ' + error.message);
          })
          .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
          });
      },
      () => {}
    );
  };
}

export function updateCarSelectionUI() {
  renderCurrentCar();
  renderCarsMenu();
}

function renderCurrentCar() {
  const carNameDiv = document.getElementById('my-cars-name');
  const carImgEl = document.getElementById('my-cars-img');
  if (!carNameDiv || !carImgEl) return;
  
  // Check if we're on a page that doesn't require a specific car
  const currentPage = window.location.hash.replace('#', '');
  const pagesWithoutCarRequirement = ['alert-list', 'my-cars', 'add-car'];
  
  if (pagesWithoutCarRequirement.includes(currentPage)) {
    // For these pages, don't show car selection UI
    carNameDiv.textContent = '';
    carImgEl.style.display = 'none';
    return;
  }
  
  carNameDiv.textContent = 'Загрузка...';
  carImgEl.style.display = 'block';
  carImgEl.src = '';
  carImgEl.alt = 'car image';
  getCurrentCarFromBackend()
    .then(car => {
      if (car) {
        carNameDiv.textContent = car.name;
        if (car.img && car.img.startsWith('data:image/')) {
          carImgEl.src = car.img;
          carImgEl.alt = car.name || 'car image';
        } else if (car.img && car.img.length === 1) { // emoji fallback
          // Create a data URL for emoji fallback
          carImgEl.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='170' height='170'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='100'>${encodeURIComponent(car.img)}</text></svg>`;
          carImgEl.alt = car.name || 'car image';
        } else {
          // Default car emoji
          carImgEl.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='170' height='170'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='100'>🚗</text></svg>`;
          carImgEl.alt = 'car image';
        }
      } else {
        carNameDiv.textContent = 'Автомобиль не выбран';
        carImgEl.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='170' height='170'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='100'>🚗</text></svg>`;
        carImgEl.alt = 'car image';
      }
    })
    .catch(error => {
      carNameDiv.textContent = 'Ошибка загрузки';
      carImgEl.src = '';
      carImgEl.alt = 'Ошибка';
    });
}

function renderCarsMenu() {
  const menu = document.getElementById('car-select-menu');
  if (!menu) return;
  menu.innerHTML = '<div class="loading">Загрузка...</div>';
  DataService.getCars()
    .then(cars => {
      // Add 'Мои автомобили' entry at the top
      let html = `<div class="car-menu-item" data-action="my-cars" style="font-weight:bold;">Мои автомобили</div>`;
      html += cars.map(car =>
        `<div class="car-menu-item" data-car-id="${car.id}">${car.img && car.img.startsWith('data:image/')
          ? `<img src="${car.img}" alt="car image" style="width:2.5rem;height:2.5rem;object-fit:cover;border-radius:0.3rem;">`
          : `<span style="font-size:1.5rem;">${car.img || '🚗'}</span>`} ${car.name}</div>`
      ).join('');
      menu.innerHTML = html;
      // Add event listeners
      Array.from(menu.querySelectorAll('.car-menu-item')).forEach(item => {
        item.onclick = function() {
          const carId = this.getAttribute('data-car-id');
          const action = this.getAttribute('data-action');
          if (action === 'my-cars') {
            window.location.hash = '#my-cars';
            menu.style.display = 'none';
            return;
          }
          if (carId) {
            setCurrentCarId(carId).then(() => {
              window.location.hash = '#my-car-overview';
              menu.style.display = 'none';
            });
          }
        };
      });
    });
}

function setupYearDropdown() {
  const yearSelect = document.getElementById('car-year');
  if (!yearSelect) return;
  
  // Clear existing options
  yearSelect.innerHTML = '';
  
  // Set the size attribute to limit visible options to 6
  yearSelect.setAttribute('size', '6');
  
  // Get current year
  const currentYear = new Date().getFullYear();
  
  // Generate options from 1900 to current year, in descending order
  for (let year = currentYear; year >= 1900; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    
    // Set current year as selected by default
    if (year === currentYear) {
      option.selected = true;
    }
    
    yearSelect.appendChild(option);
  }
}

export function initializeAddCarUI() {
  setupAddCarForm();
  setupImagePreview();
  setupCancelButton();
  setupYearDropdown();
  // --- Edit mode support ---
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const editId = params.get('edit');
  const header = document.querySelector('.add-car-form h1, h1');
  if (editId) {
    if (header) header.textContent = 'Изменить информацию о машине';
    DataService.getCars().then(cars => {
      const car = cars.find(c => c.id == editId);
      if (!car) return;
      const form = document.getElementById('add-car-form');
      if (!form) return;
      form.setAttribute('data-edit-id', car.id);
      form.querySelector('button[type="submit"]').textContent = 'Сохранить изменения';
      form['brand'].value = car.brand || '';
      form['model'].value = car.model || '';
      form['year'].value = car.year || '';
      form['vin'].value = car.vin || '';
      form['mileage'].value = car.mileage || '';
      form['price'].value = car.price || '';
      form['nickname'].value = car.nickname || '';
      // Show image preview if present
      const imagePreview = document.getElementById('image-preview');
      if (car.img && imagePreview) {
        if (car.img.startsWith('data:image/')) {
          imagePreview.innerHTML = `<img src="${car.img}" alt="Preview">`;
        } else if (car.img.length === 1) {
          imagePreview.innerHTML = `<span style="font-size:3rem;">${car.img}</span>`;
        } else {
          imagePreview.innerHTML = '';
        }
      }
      setupRequiredFieldConfirmations(form, car);
    });
  } else {
    if (header) header.textContent = 'Добавить новый автомобиль';
    const form = document.getElementById('add-car-form');
    if (form) setupRequiredFieldConfirmations(form, null);
  }
}

function setupRequiredFieldConfirmations(form, original) {
  // List of required field names
  const requiredFields = ['brand', 'model', 'year', 'vin', 'mileage'];
  if (!original) return; // Only attach listeners in edit mode
  requiredFields.forEach(fieldName => {
    const input = form[fieldName];
    if (!input) return;
    let prevValue = input.value;
    input.addEventListener('focus', () => {
      prevValue = input.value;
    });
    input.addEventListener('change', e => {
      let changed = input.value !== (original[fieldName] || '');
      if (changed && window.showConfirmationDialog) {
        window.showConfirmationDialog(
          'Вы уверены, что хотите изменить это поле?',
          () => {},
          () => { input.value = prevValue; }
        );
      }
    });
  });
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
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      imageInput.value = '';
      imagePreview.innerHTML = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      imageInput.value = '';
      imagePreview.innerHTML = '';
      return;
    }
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
  cancelBtn.onclick = () => {
    const form = document.getElementById('add-car-form');
    if (!form) {
      window.location.hash = '#my-cars';
      return;
    }
    // Gather original data if in edit mode
    const editId = form.getAttribute('data-edit-id');
    let original = null;
    if (editId) {
      // Find the original car data
      DataService.getCars().then(cars => {
        original = cars.find(c => c.id == editId);
        checkUnsavedAndMaybeClose(form, original);
      });
    } else {
      checkUnsavedAndMaybeClose(form, null);
    }
  };
}

function checkUnsavedAndMaybeClose(form, original) {
  // Compare form values to original (if edit mode), or check if any field is filled (if add mode)
  const brand = form['brand'].value.trim();
  const model = form['model'].value.trim();
  const year = form['year'].value.trim();
  const vin = form['vin'].value.trim();
  const mileage = form['mileage'].value.trim();
  const price = form['price'].value.trim();
  const nickname = form['nickname'].value.trim();
  const imageInput = form['image'];
  let changed = false;
  if (original) {
    changed =
      brand !== (original.brand || '') ||
      model !== (original.model || '') ||
      year !== String(original.year || '') ||
      vin !== (original.vin || '') ||
      mileage !== String(original.mileage || '') ||
      price !== String(original.price || '') ||
      nickname !== (original.nickname || '') ||
      (imageInput && imageInput.value); // if a new image is selected
  } else {
    changed = [brand, model, year, vin, mileage, price, nickname].some(v => v) || (imageInput && imageInput.value);
  }
  if (changed && window.showConfirmationDialog) {
    window.showConfirmationDialog(
      'Закрыть без сохранения изменений?',
      () => { window.location.hash = '#my-cars'; },
      () => {}
    );
  } else {
    window.location.hash = '#my-cars';
  }
}

// Replace direct localStorage access with DataService for currentCarId
async function getCurrentCarId() {
  if (DataService.getCurrentCarId) {
    return await DataService.getCurrentCarId();
  }
  // fallback for now
  return null;
}

async function setCurrentCarId(carId) {
  if (DataService.setCurrentCarId) {
    await DataService.setCurrentCarId(carId);
  }
}

// Placeholder for backend car operations
async function getCurrentCarFromBackend() {
  // Use DataService for currentCarId
  const carId = await getCurrentCarId();
  const cars = await DataService.getCars();
  return cars.find(car => car.id == carId);
}

async function setCurrentCarInBackend(carId) {
  await setCurrentCarId(carId);
}

async function addCarToBackend(carData) {
  let cars = await DataService.getCars();
  // Ensure unique ID
  let newId = Date.now();
  while (cars.some(c => c.id == newId)) newId++;
  const newCar = { ...carData, id: newId };
  cars.push(newCar);
  if (DataService.saveCars) {
    await DataService.saveCars(cars);
  }
  // Set as current car
  if (DataService.setCurrentCarId) {
    await DataService.setCurrentCarId(newId);
  } else {
    localStorage.setItem('currentCarId', newId);
  }
  // Reload car list and update UI
  if (typeof renderCarsList === 'function') renderCarsList();
  if (typeof updateCarSelectionUI === 'function') updateCarSelectionUI();
  
  // Redirect to car overview page after saving new car
  window.location.hash = '#my-car-overview';
}

async function removeCarFromBackend(carId) {
  let cars = await DataService.getCars();
  cars = cars.filter(car => car.id != carId);
  if (DataService.saveCars) {
    await DataService.saveCars(cars);
  }
}

export { removeCarFromBackend }; 