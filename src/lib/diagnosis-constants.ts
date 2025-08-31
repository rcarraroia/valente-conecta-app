// Constants and configuration for diagnosis system

// n8n webhook configuration
export const N8N_CONFIG = {
  WEBHOOK_URL: 'https://primary-production-b7fe.up.railway.app/webhook/multiagente-ia-diagnostico',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// PDF configuration
export const PDF_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FORMATS: ['application/pdf'],
  TEMPLATES: {
    STANDARD: 'standard',
    DETAILED: 'detailed',
  },
} as const;

// Storage configuration
export const STORAGE_CONFIG = {
  BUCKET_NAME: 'diagnosis-reports',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: ['application/pdf'],
  FILE_NAME_PREFIX: 'diagnostico',
} as const;

// Chat configuration
export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 1000,
  MAX_MESSAGES_PER_SESSION: 100,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  TYPING_INDICATOR_DELAY: 500, // 0.5 seconds
} as const;

// Error messages in Portuguese
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet e tente novamente.',
  WEBHOOK_TIMEOUT: 'O sistema demorou para responder. Tente novamente.',
  SUPABASE_ERROR: 'Erro no banco de dados. Tente novamente em alguns instantes.',
  PDF_GENERATION_ERROR: 'Erro ao gerar o relatório PDF. Tente novamente.',
  STORAGE_ERROR: 'Erro ao salvar o arquivo. Tente novamente.',
  AUTHENTICATION_ERROR: 'Erro de autenticação. Faça login novamente.',
  INVALID_SESSION: 'Sessão inválida. Inicie uma nova conversa.',
  MESSAGE_TOO_LONG: `Mensagem muito longa. Máximo ${CHAT_CONFIG.MAX_MESSAGE_LENGTH} caracteres.`,
  SESSION_EXPIRED: 'Sessão expirada. Inicie uma nova conversa.',
  GENERIC_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
} as const;

// Success messages in Portuguese
export const SUCCESS_MESSAGES = {
  SESSION_STARTED: 'Conversa iniciada com sucesso!',
  MESSAGE_SENT: 'Mensagem enviada!',
  PDF_GENERATED: 'Relatório gerado com sucesso!',
  REPORT_SAVED: 'Relatório salvo com sucesso!',
  SESSION_COMPLETED: 'Diagnóstico concluído com sucesso!',
} as const;

// Diagnosis severity levels
export const SEVERITY_LEVELS = {
  1: { label: 'Muito Baixo', color: 'green', description: 'Sintomas leves ou ausentes' },
  2: { label: 'Baixo', color: 'lime', description: 'Sintomas leves que não interferem significativamente' },
  3: { label: 'Moderado', color: 'yellow', description: 'Sintomas moderados que podem interferir no dia a dia' },
  4: { label: 'Alto', color: 'orange', description: 'Sintomas significativos que interferem nas atividades' },
  5: { label: 'Muito Alto', color: 'red', description: 'Sintomas graves que requerem atenção imediata' },
} as const;

// Chat message types
export const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai',
  SYSTEM: 'system',
} as const;

// Chat message status
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  ERROR: 'error',
} as const;

// Session status
export const SESSION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

// Report status
export const REPORT_STATUS = {
  COMPLETED: 'completed',
  PROCESSING: 'processing',
  ERROR: 'error',
} as const;

// Default values
export const DEFAULTS = {
  CHAT_PLACEHOLDER: 'Digite sua mensagem...',
  INITIAL_MESSAGE: 'iniciar',
  SESSION_TITLE: 'Pré-Diagnóstico',
  REPORT_TITLE_PREFIX: 'Relatório de Pré-Diagnóstico',
  PDF_FILENAME_FORMAT: 'diagnostico-{userId}-{timestamp}.pdf',
} as const;

// Validation rules
export const VALIDATION_RULES = {
  MIN_MESSAGE_LENGTH: 1,
  MAX_MESSAGE_LENGTH: CHAT_CONFIG.MAX_MESSAGE_LENGTH,
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 255,
  UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const;

// Environment variables keys
export const ENV_KEYS = {
  SUPABASE_URL: 'VITE_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'VITE_SUPABASE_ANON_KEY',
  N8N_WEBHOOK_URL: 'VITE_N8N_WEBHOOK_URL',
  STORAGE_BUCKET: 'VITE_SUPABASE_STORAGE_BUCKET',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  DIAGNOSIS_REPORTS: '/rest/v1/relatorios_diagnostico',
  CHAT_SESSIONS: '/rest/v1/diagnosis_chat_sessions',
  STORAGE: '/storage/v1/object',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  CURRENT_SESSION: 'diagnosis_current_session',
  CHAT_HISTORY: 'diagnosis_chat_history',
  USER_PREFERENCES: 'diagnosis_user_preferences',
} as const;

// Animation durations (in milliseconds)
export const ANIMATIONS = {
  FADE_IN: 200,
  SLIDE_UP: 300,
  TYPING_INDICATOR: 1000,
  MESSAGE_APPEAR: 150,
} as const;

// Responsive breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;