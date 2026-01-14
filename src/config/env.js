const readEnv = (key, { optional = false, fallback } = {}) => {
  const value = import.meta.env[key];
  if (value === undefined || value === null || value === '') {
    if (optional) return fallback;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  apiBaseUrl: readEnv('VITE_API_BASE_URL'),
  clerkPublishableKey: readEnv('VITE_CLERK_PUBLISHABLE_KEY'),
};
