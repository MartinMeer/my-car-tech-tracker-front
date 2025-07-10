# Dev/Prod Switching Approaches

## 1. Manual Switch in config.js (Simple, Current)
Edit `src/config.js` before running or deploying:
```js
// Development (demo mode)
export const CONFIG = {
  useBackend: false,
  apiUrl: 'http://localhost:8080/api',
  demoMode: true
};

// Production (backend API)
export const CONFIG = {
  useBackend: true,
  apiUrl: 'https://your-production-api-url',
  demoMode: false
};
```

---

## 2. HTML Environment Variable (No Build Tool Needed)
Set a variable in your HTML before loading JS:
```html
<script>
  window.APP_ENV = 'production'; // or 'development'
</script>
<script type="module" src="../src/main.js"></script>
```
Then in `config.js`:
```js
const env = window.APP_ENV || 'development';
export const CONFIG = env === 'production'
  ? { useBackend: true, apiUrl: 'https://your-production-api-url', demoMode: false }
  : { useBackend: false, apiUrl: 'http://localhost:8080/api', demoMode: true };
```

---

## 3. Build Tool with Separate Config Files
Create `config.dev.js` and `config.prod.js`:
```js
// config.dev.js
export const CONFIG = {
  useBackend: false,
  apiUrl: 'http://localhost:8080/api',
  demoMode: true
};
// config.prod.js
export const CONFIG = {
  useBackend: true,
  apiUrl: 'https://your-production-api-url',
  demoMode: false
};
```
Configure your build tool (Webpack, Vite, etc.) to copy the right file to `config.js` during build:
- For example, in Webpack: use `resolve.alias` or `DefinePlugin`.
- In Vite: use `define` or `env` variables.

**This approach is best for larger projects or teams.** 