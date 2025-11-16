// Environment configuration for database
export const isDevelopment = process.env.NODE_ENV !== 'production';

export const getDatabaseUrl = () => {
  if (isDevelopment) {
    return process.env.DATABASE_URL;
  }
  return process.env.DATABASE_URL_PROD || process.env.DATABASE_URL;
};
