
## Dev/Prod Mode Switching

To switch between development (demo/localStorage) and production (backend API) modes, edit the file:

```
src/config.js
```

Set the following values:

- **Development (demo mode, no backend):**
  ```js
  export const CONFIG = {
    useBackend: false,
    apiUrl: 'http://localhost:8080/api',
    demoMode: true
  };
  ```
- **Production (backend API):**
  ```js
  export const CONFIG = {
    useBackend: true,
    apiUrl: 'https://your-production-api-url',
    demoMode: false
  };
  ```

**Remember to update this file before deploying!**
