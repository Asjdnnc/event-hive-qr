
// Environment configuration module

// Define environment-specific settings
export const env = {
  // Server related
  isProduction: import.meta.env.PROD || false,
  isDevelopment: import.meta.env.DEV || true,
  
  // MongoDB
  mongodbUri: (import.meta.env.VITE_MONGODB_URI as string) || 'mongodb://localhost:27017/hackzilla',
  
  // Authentication
  adminDefaultPassword: (import.meta.env.VITE_ADMIN_DEFAULT_PASSWORD as string) || 'admin',
  
  // Application
  appName: 'Hackzilla',
  version: '1.0.0',
};

// Export a function to check if we're running in a browser
export const isBrowser = () => typeof window !== 'undefined';
