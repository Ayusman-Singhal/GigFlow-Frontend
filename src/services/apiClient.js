import axios from 'axios';
import { env } from '../config/env';

export const createApiClient = (getToken) => {
  const baseURL = env.apiBaseUrl?.replace(/\/$/, '') || '';

  const instance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(async (config) => {
    // Avoid double /api/api if baseURL already includes /api
    if (baseURL.endsWith('/api') && typeof config.url === 'string' && config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api\//, '/');
    }

    if (typeof getToken === 'function') {
      const token = await getToken().catch(() => null);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  return instance;
};
