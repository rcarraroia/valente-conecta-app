// Diagnosis system constants

// PDF Configuration
export const PDF_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  COMPRESSION_QUALITY: 0.8,
  PAGE_MARGINS: {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
  },
  FONT_SIZES: {
    title: 18,
    subtitle: 14,
    body: 12,
    caption: 10,
  },
  COLORS: {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
    text: '#1f2937',
    muted: '#6b7280',
  },
} as const;

// N8n Webhook Configuration
export const N8N_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000, // 2 seconds
  MAX_MESSAGE_LENGTH: 2000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

// Default Values
export const DEFAULTS = {
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  MAX_MESSAGES_PER_SESSION: 100,
  BATCH_SIZE: 20,
  FLUSH_INTERVAL: 30000, // 30 seconds
  RETRY_DELAY: 2000, // 2 seconds
  MAX_RETRIES: 3,
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  MIN_MESSAGE_LENGTH: 1,
  MAX_MESSAGE_LENGTH: 2000,
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 255,
  UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  MESSAGE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 2000,
  },
  SESSION_ID: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 100,
    PATTERN: /^session_[a-zA-Z0-9_-]+$/,
  },
  USER_ID: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PDF: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['application/pdf'],
  },
} as const;

// Severity Levels
export const SEVERITY_LEVELS = {
  1: { label: 'Muito Baixo', color: 'green' },
  2: { label: 'Baixo', color: 'lime' },
  3: { label: 'Moderado', color: 'yellow' },
  4: { label: 'Alto', color: 'orange' },
  5: { label: 'Muito Alto', color: 'red' },
} as const;

// Error Types
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  WEBHOOK_TIMEOUT: 'WEBHOOK_TIMEOUT',
  SUPABASE_ERROR: 'SUPABASE_ERROR',
  PDF_GENERATION_ERROR: 'PDF_GENERATION_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 408,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// Analytics Events
export const ANALYTICS_EVENTS = {
  // User Journey
  DIAGNOSIS_STARTED: 'diagnosis_started',
  DIAGNOSIS_COMPLETED: 'diagnosis_completed',
  DIAGNOSIS_ABANDONED: 'diagnosis_abandoned',
  
  // Chat Events
  CHAT_SESSION_STARTED: 'chat_session_started',
  CHAT_MESSAGE_SENT: 'chat_message_sent',
  CHAT_MESSAGE_RECEIVED: 'chat_message_received',
  CHAT_SESSION_ENDED: 'chat_session_ended',
  
  // PDF Events
  PDF_GENERATION_STARTED: 'pdf_generation_started',
  PDF_GENERATION_COMPLETED: 'pdf_generation_completed',
  PDF_GENERATION_FAILED: 'pdf_generation_failed',
  PDF_DOWNLOADED: 'pdf_downloaded',
  PDF_VIEWED: 'pdf_viewed',
  
  // System Events
  ERROR_OCCURRED: 'error_occurred',
  ERROR_RECOVERED: 'error_recovered',
  FEATURE_USED: 'feature_used',
} as const;

// Log Levels
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
} as const;

// Log Categories
export const LOG_CATEGORIES = {
  SYSTEM: 'system',
  AUTH: 'auth',
  CHAT: 'chat',
  PDF: 'pdf',
  STORAGE: 'storage',
  DATABASE: 'database',
  WEBHOOK: 'webhook',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  USER_ACTION: 'user_action',
} as const;

// Health Check Status
export const HEALTH_STATUS = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy',
  UNKNOWN: 'unknown',
} as const;

// Alert Severities
export const ALERT_SEVERITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Responsive Breakpoints
export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Storage Buckets
export const STORAGE_BUCKETS = {
  DIAGNOSIS_REPORTS: 'diagnosis-reports',
  USER_UPLOADS: 'user-uploads',
  SYSTEM_BACKUPS: 'system-backups',
} as const;

// Database Tables
export const DB_TABLES = {
  DIAGNOSIS_REPORTS: 'relatorios_diagnostico',
  DIAGNOSIS_SESSIONS: 'diagnosis_sessions',
  ANALYTICS_EVENTS: 'analytics_events',
  ANALYTICS_PERFORMANCE: 'analytics_performance',
  SYSTEM_LOGS: 'system_logs',
  MONITORING_HEALTH_CHECKS: 'monitoring_health_checks',
  MONITORING_ALERTS: 'monitoring_alerts',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  CHAT_ENABLED: 'chatEnabled',
  PDF_GENERATION_ENABLED: 'pdfGenerationEnabled',
  ANALYTICS_ENABLED: 'analyticsEnabled',
  MONITORING_ENABLED: 'monitoringEnabled',
  OFFLINE_MODE_ENABLED: 'offlineModeEnabled',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  CHAT_WEBHOOK: '/webhook/diagnosis-chat',
  HEALTH_CHECK: '/health',
  ANALYTICS: '/api/analytics',
  MONITORING: '/api/monitoring',
} as const;

// Time Constants
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
} as const;

// File Size Constants
export const FILE_SIZE = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
} as const;