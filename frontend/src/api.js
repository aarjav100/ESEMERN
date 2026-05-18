import axios from 'axios';

let baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Robust safety check: Automatically append '/api' if missing from the configured environment URL
const cleanedURL = baseURL.replace(/\/+$/, '');
if (!cleanedURL.endsWith('/api')) {
  baseURL = `${cleanedURL}/api`;
} else {
  baseURL = cleanedURL;
}

const api = axios.create({
  baseURL,
});

export default api;
