import 'dotenv/config';

export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  API_PREFIX: string;
  
  CORS_ORIGIN: string;
  CORS_CREDENTIALS: boolean;
  
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  
  DB_PATH: string;
  
  SOCKET_CORS_ORIGIN: string;
  
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

function getEnvVarNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
}

function getEnvVarBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  return value ? value === 'true' : defaultValue;
}

export const env: Environment = {
  NODE_ENV: (getEnvVar('NODE_ENV', 'development') as Environment['NODE_ENV']),
  PORT: getEnvVarNumber('PORT', 3001),
  API_PREFIX: getEnvVar('API_PREFIX', '/api/v1'),
  
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', 'http://localhost:5173'),
  CORS_CREDENTIALS: getEnvVarBoolean('CORS_CREDENTIALS', true),
  
  JWT_SECRET: getEnvVar('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production'),
  JWT_ACCESS_EXPIRES_IN: getEnvVar('JWT_ACCESS_EXPIRES_IN', '15m'),
  JWT_REFRESH_EXPIRES_IN: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),
  
  DB_PATH: getEnvVar('DB_PATH', './chat.db'),
  
  SOCKET_CORS_ORIGIN: getEnvVar('SOCKET_CORS_ORIGIN', 'http://localhost:5173'),
  
  RATE_LIMIT_WINDOW_MS: getEnvVarNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  RATE_LIMIT_MAX: getEnvVarNumber('RATE_LIMIT_MAX', 100),
};

export function validateEnvironment(): void {
  const requiredVars = ['JWT_SECRET'];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Required environment variable ${varName} is not set`);
    }
  }
  
  if (env.JWT_SECRET.length < 32 && env.NODE_ENV === 'production') {
    console.warn('⚠️ JWT_SECRET should be at least 32 characters long in production');
  }
}
