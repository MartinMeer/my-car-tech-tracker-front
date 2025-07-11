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
          imgHtml = `<img src="${car.img}" alt="car image" style="width:256px;height:256px;object-fit:cover;border-radius:50%;box-shadow:0 2px 8px #e0e0e0;">`;
        } else {
          imgHtml = `<div style="width:256px;height:256px;display:flex;align-items:center;justify-content:center;background:#f4f7fb;border-radius:50%;font-size:5rem;color:#bbb;box-shadow:0 2px 8px #e0e0e0;">🚗</div>`;
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
      () => {}
    );
  };
}

export function updateCarSelectionUI() {
  renderCurrentCar();
  renderCarsMenu();
}

function renderCurrentCar() {
  const carNameDiv = document.getElementById('current-car-name');
  const carImgDiv = document.getElementById('current-car-img');
  if (!carNameDiv || !carImgDiv) return;
  carNameDiv.textContent = 'Загрузка...';
  carImgDiv.textContent = '⏳';
  getCurrentCarFromBackend()
    .then(car => {
      if (car) {
        carNameDiv.textContent = car.name;
        carImgDiv.textContent = car.img && car.img.startsWith('data:image/')
          ? `<img src="${car.img}" alt="car image" style="width:2.5rem;height:2.5rem;object-fit:cover;border-radius:0.3rem;">`
          : `<span style="font-size:1.5rem;">${car.img || '🚗'}</span>`;
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
  menu.innerHTML = '<div class="loading">Загрузка...</div>';
  DataService.getCars()
    .then(cars => {
      menu.innerHTML = cars.map(car =>
        `<div class="car-menu-item" data-car-id="${car.id}">${car.img && car.img.startsWith('data:image/')
          ? `<img src="${car.img}" alt="car image" style="width:2.5rem;height:2.5rem;object-fit:cover;border-radius:0.3rem;">`
          : `<span style="font-size:1.5rem;">${car.img || '🚗'}</span>`} ${car.name}</div>`
      ).join('');
      Array.from(menu.querySelectorAll('.car-menu-item')).forEach(item => {
        item.onclick = function() {
          const carId = this.getAttribute('data-car-id');
          setCurrentCarId(carId).then(() => {
            window.location.hash = '#my-car-overview';
            menu.style.display = 'none';
          });
        };
      });
    });
}

export function initializeAddCarUI() {
  setupAddCarForm();
  setupImagePreview();
  setupCancelButton();
}

function setupImagePreview() {
  const imageInput = document.getElementById('car-img-input');
  const imagePreview = document.getElementById('car-img-preview');
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
  const cancelBtn = document.getElementById('cancel-add-car');
  if (!cancelBtn) return;
  cancelBtn.onclick = () => {
    window.location.hash = '#my-cars';
  };
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
  const newCar = { ...carData, id: Date.now() };
  cars.push(newCar);
  if (DataService.saveCars) {
    await DataService.saveCars(cars);
  }
}

async function removeCarFromBackend(carId) {
  let cars = await DataService.getCars();
  cars = cars.filter(car => car.id != carId);
  if (DataService.saveCars) {
    await DataService.saveCars(cars);
  }
} 