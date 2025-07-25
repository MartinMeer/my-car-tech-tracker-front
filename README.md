# My Car Tech Tracker - Astro Frontend

Ваш персональный помощник по обслуживанию и ремонту автомобиля, построенный на Astro.

## 🚀 Особенности

- **Современный стек**: Astro + Vanilla JavaScript + Tailwind CSS
- **Быстрая загрузка**: Оптимизированная производительность благодаря Astro
- **Адаптивный дизайн**: Работает на всех устройствах
- **Модульная архитектура**: Четкое разделение компонентов и логики
- **SEO оптимизация**: Встроенная поддержка мета-тегов и структурированных данных

## 📁 Структура проекта

```
src/
├── layouts/
│   └── Layout.astro          # Основной макет
├── pages/
│   ├── index.astro           # Главная страница
│   ├── cover.astro           # Обложка
│   ├── service-card.astro    # Запись об обслуживании
│   ├── alert-list.astro      # Список проблем
│   ├── service-history.astro # История обслуживания
│   ├── user-alert.astro      # Сообщить о проблеме
│   ├── auth/
│   │   ├── login.astro       # Вход
│   │   └── register.astro    # Регистрация
│   ├── cars/
│   │   ├── my-cars.astro     # Мои автомобили
│   │   └── add-car.astro     # Добавить автомобиль
│   └── info/
│       ├── contacts.astro    # Контакты
│       ├── privacy.astro     # Безопасность
│       ├── oils.astro        # Масла и жидкости
│       ├── spares.astro      # Запчасти
│       └── shops.astro       # Мастера
├── authService.js            # Сервис аутентификации
├── authUI.js                 # UI для аутентификации
├── carsUI.js                 # UI для автомобилей
├── dataService.js            # Сервис данных
├── maintenanceUI.js          # UI для обслуживания
├── repairUI.js               # UI для ремонта
├── serviceRecordManager.js   # Менеджер записей обслуживания
├── userAlertUI.js            # UI для проблем
└── styles/                   # CSS стили
    ├── base.css
    ├── layout.css
    ├── navigation.css
    └── components/
        ├── buttons.css
        ├── cards.css
        ├── forms.css
        └── popups.css
```

## 🛠️ Установка и запуск

### Предварительные требования

- Node.js 18+ 
- npm или yarn

### Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd my-car-tech-tracker-front
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите сервер разработки:
```bash
npm run dev
```

4. Откройте браузер и перейдите по адресу `http://localhost:4321`

### Другие команды

```bash
# Сборка для продакшена
npm run build

# Предварительный просмотр сборки
npm run preview

# Запуск в режиме разработки
npm start
```

## 🔧 Конфигурация

### Astro конфигурация

Основные настройки находятся в `astro.config.mjs`:

- **site**: URL сайта для генерации абсолютных ссылок
- **base**: Базовый путь для развертывания
- **trailingSlash**: Настройка завершающих слешей
- **build.assets**: Папка для статических ресурсов
- **vite.build.rollupOptions**: Оптимизация сборки

### Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# API конфигурация
PUBLIC_API_URL=http://localhost:8080/api
PUBLIC_DEMO_MODE=true

# Аналитика (опционально)
PUBLIC_GA_ID=your-google-analytics-id
```

## 📱 Страницы и маршруты

### Основные страницы

- `/` - Главная страница приложения
- `/cover` - Обложка (лендинг)
- `/service-card` - Запись об обслуживании
- `/alert-list` - Список проблем
- `/service-history` - История обслуживания
- `/user-alert` - Сообщить о проблеме

### Аутентификация

- `/auth/login` - Вход в систему
- `/auth/register` - Регистрация

### Автомобили

- `/cars/my-cars` - Список автомобилей
- `/cars/add-car` - Добавить автомобиль
- `/cars/my-car-overview` - Обзор автомобиля

### Информация

- `/info/contacts` - Контакты
- `/info/privacy` - Безопасность данных
- `/info/oils` - Масла и жидкости
- `/info/spares` - Запчасти
- `/info/shops` - Мастера и сервисы

## 🎨 Стили и компоненты

### CSS архитектура

Проект использует модульную CSS архитектуру:

- **base.css** - Базовые стили и сброс
- **layout.css** - Макеты и сетки
- **navigation.css** - Навигация
- **components/** - Переиспользуемые компоненты

### Tailwind CSS

Для быстрой разработки используется Tailwind CSS:

```html
<div class="bg-blue-500 text-white p-4 rounded-lg shadow-md">
  <h2 class="text-xl font-bold mb-2">Заголовок</h2>
  <p class="text-sm">Описание</p>
</div>
```

## 🔌 JavaScript модули

### Основные сервисы

- **authService.js** - Аутентификация и авторизация
- **dataService.js** - Работа с данными и API
- **cookieHandler.js** - Управление cookies

### UI модули

- **authUI.js** - Интерфейс аутентификации
- **carsUI.js** - Интерфейс управления автомобилями
- **maintenanceUI.js** - Интерфейс обслуживания
- **userAlertUI.js** - Интерфейс проблем

## 🚀 Развертывание

### Netlify

1. Подключите репозиторий к Netlify
2. Настройте команды сборки:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Vercel

1. Подключите репозиторий к Vercel
2. Настройки будут определены автоматически

### Статический хостинг

1. Выполните сборку: `npm run build`
2. Загрузите содержимое папки `dist` на ваш хостинг

## 🧪 Тестирование

### Запуск тестов

```bash
# Запуск всех тестов
npm test

# Запуск тестов в режиме наблюдения
npm run test:watch

# Покрытие кода
npm run test:coverage
```

### Тестовые данные

Для демонстрации используются тестовые данные:

- **Демо пользователь**: demo@example.com / demo123
- **Тестовые автомобили**: Toyota Camry 2020
- **Примеры записей**: Техническое обслуживание

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE) для подробностей.

## 👥 Авторы

- **com.martinmeer** - Основной разработчик

## 📞 Поддержка

По всем вопросам обращайтесь:
- Email: your@email.com
- GitHub Issues: [Создать issue](https://github.com/your-repo/issues)

---

**My Car Tech Tracker** - Ваш надежный помощник в уходе за автомобилем! 🚗✨
