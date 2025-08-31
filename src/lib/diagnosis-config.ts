// Environment configuration for diagnosis system

import { DiagnosisEnvironmentConfig } from '@/types/diagnosis';
import { N8N_CONFIG, PDF_CONFIG, ENV_KEYS } from './diagnosis-constants';

/**
 * Gets environment variable with fallback
 */
const getEnvVar = (key: string, fallback?: string): string => {
  const value = import.meta.env[key];
  if (!value && !fallback) {
    console.warn(`Environment variable ${key} is not set`);
  }
  return value || fallback || '';
};

/**
 * Validates required environment variables
 */
const validateEnvironment = (): void => {
  // Skip validation in test environment
  if (import.meta.env?.MODE === 'test' || process.env.NODE_ENV === 'test') {
    return;
  }

  const requiredVars = [
    ENV_KEYS.SUPABASE_URL,
    ENV_KEYS.SUPABASE_ANON_KEY,
  ];

  const missing = requiredVars.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

/**
 * Creates diagnosis environment configuration
 */
export const createDiagnosisConfig = (): DiagnosisEnvironmentConfig => {
  // Validate environment in development (but not in tests)
  if (import.meta.env.DEV && import.meta.env?.MODE !== 'test') {
    validateEnvironment();
  }

  return {
    supabase: {
      url: getEnvVar(ENV_KEYS.SUPABASE_URL),
      anonKey: getEnvVar(ENV_KEYS.SUPABASE_ANON_KEY),
      storageBucket: getEnvVar(ENV_KEYS.STORAGE_BUCKET, 'diagnosis-reports'),
    },
    n8n: {
      webhookUrl: getEnvVar(ENV_KEYS.N8N_WEBHOOK_URL, N8N_CONFIG.WEBHOOK_URL),
      timeout: N8N_CONFIG.TIMEOUT,
    },
    pdf: {
      maxSize: PDF_CONFIG.MAX_SIZE,
      allowedFormats: PDF_CONFIG.ALLOWED_FORMATS,
    },
  };
};

/**
 * Global diagnosis configuration instance
 */
export const diagnosisConfig = createDiagnosisConfig();

/**
 * Development mode flag
 */
export const isDevelopment = import.meta.env.DEV;

/**
 * Production mode flag
 */
export const isProduction = import.meta.env.PROD;

/**
 * Debug mode flag (can be controlled via environment)
 */
export const isDebugMode = import.meta.env.VITE_DEBUG === 'true' || isDevelopment;

/**
 * Feature flags for diagnosis system
 */
export const FEATURE_FLAGS = {
  // Enable detailed logging
  ENABLE_DETAILED_LOGGING: isDebugMode,
  
  // Enable retry mechanisms
  ENABLE_RETRY_LOGIC: true,
  
  // Enable offline support (future feature)
  ENABLE_OFFLINE_SUPPORT: false,
  
  // Enable analytics tracking
  ENABLE_ANALYTICS: isProduction,
  
  // Enable error reporting
  ENABLE_ERROR_REPORTING: isProduction,
  
  // Enable performance monitoring
  ENABLE_PERFORMANCE_MONITORING: isProduction,
} as const;

/**
 * Logging configuration
 */
export const LOGGING_CONFIG = {
  LEVEL: isDebugMode ? 'debug' : 'info',
  ENABLE_CONSOLE: isDevelopment,
  ENABLE_REMOTE: isProduction,
} as const;

/**
 * Performance monitoring configuration
 */
export const PERFORMANCE_CONFIG = {
  // Track API response times
  TRACK_API_CALLS: FEATURE_FLAGS.ENABLE_PERFORMANCE_MONITORING,
  
  // Track component render times
  TRACK_COMPONENT_RENDERS: FEATURE_FLAGS.ENABLE_PERFORMANCE_MONITORING,
  
  // Track user interactions
  TRACK_USER_INTERACTIONS: FEATURE_FLAGS.ENABLE_ANALYTICS,
} as const;

/**
 * Security configuration
 */
export const SECURITY_CONFIG = {
  // Enable CSRF protection
  ENABLE_CSRF_PROTECTION: true,
  
  // Enable input sanitization
  ENABLE_INPUT_SANITIZATION: true,
  
  // Enable rate limiting
  ENABLE_RATE_LIMITING: true,
  
  // Maximum requests per minute per user
  MAX_REQUESTS_PER_MINUTE: 60,
} as const;

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  // Cache diagnosis reports
  CACHE_REPORTS: true,
  
  // Cache chat sessions
  CACHE_SESSIONS: true,
  
  // Cache duration in milliseconds
  DEFAULT_CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // Maximum cache size (number of items)
  MAX_CACHE_SIZE: 100,
} as const;

/**
 * Gets configuration value with type safety
 */
export const getConfig = <T extends keyof DiagnosisEnvironmentConfig>(
  key: T
): DiagnosisEnvironmentConfig[T] => {
  return diagnosisConfig[key];
};

/**
 * Checks if a feature flag is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature];
};

/**
 * Gets the current environment name
 */
export const getEnvironment = (): 'development' | 'production' | 'test' => {
  if (import.meta.env.MODE === 'test') return 'test';
  if (import.meta.env.PROD) return 'production';
  return 'development';
};

/**
 * Configuration validation for runtime checks
 */
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check Supabase configuration
  if (!diagnosisConfig.supabase.url) {
    errors.push('Supabase URL is not configured');
  }

  if (!diagnosisConfig.supabase.anonKey) {
    errors.push('Supabase anonymous key is not configured');
  }

  // Check n8n configuration
  if (!diagnosisConfig.n8n.webhookUrl) {
    errors.push('n8n webhook URL is not configured');
  }

  // Validate URLs
  try {
    new URL(diagnosisConfig.supabase.url);
  } catch {
    errors.push('Invalid Supabase URL format');
  }

  try {
    new URL(diagnosisConfig.n8n.webhookUrl);
  } catch {
    errors.push('Invalid n8n webhook URL format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate configuration on module load in development
if (isDevelopment) {
  const validation = validateConfig();
  if (!validation.isValid) {
    console.warn('Configuration validation failed:', validation.errors);
  }
}