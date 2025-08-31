import { z } from 'zod';
import { VALIDATION_RULES } from '@/lib/diagnosis-constants';

// Chat message validation schema
export const chatMessageSchema = z.object({
  id: z.string().min(1, 'Message ID is required'),
  type: z.enum(['user', 'ai', 'system']),
  content: z.string()
    .min(VALIDATION_RULES.MIN_MESSAGE_LENGTH, 'Message content cannot be empty')
    .max(VALIDATION_RULES.MAX_MESSAGE_LENGTH, 'Message is too long'),
  timestamp: z.date(),
  status: z.enum(['sending', 'sent', 'error']).optional(),
});

// Diagnosis data validation schema
export const diagnosisDataSchema = z.object({
  patient_info: z.object({
    age: z.number().min(0).max(150).optional(),
    gender: z.string().optional(),
    medical_history: z.array(z.string()).optional(),
  }),
  symptoms: z.array(z.object({
    description: z.string().min(1, 'Symptom description is required'),
    severity: z.number().min(1).max(10),
    duration: z.string().optional(),
  })).min(1, 'At least one symptom is required'),
  analysis: z.string().min(1, 'Analysis is required'),
  recommendations: z.array(z.string().min(1)).min(1, 'At least one recommendation is required'),
  severity_level: z.number().min(1).max(5),
  next_steps: z.array(z.string()).optional(),
  generated_at: z.string().datetime(),
});

// n8n webhook request validation schema
export const n8nWebhookRequestSchema = z.object({
  user_id: z.string().regex(VALIDATION_RULES.UUID_REGEX, 'Invalid user ID format'),
  text: z.string()
    .min(VALIDATION_RULES.MIN_MESSAGE_LENGTH, 'Message text cannot be empty')
    .max(VALIDATION_RULES.MAX_MESSAGE_LENGTH, 'Message text is too long'),
  session_id: z.string().optional(),
});

// n8n webhook response validation schema
export const n8nWebhookResponseSchema = z.object({
  response: z.string().min(1, 'Response cannot be empty'),
  is_final: z.boolean().optional(),
  diagnosis_data: diagnosisDataSchema.optional(),
  session_id: z.string().min(1, 'Session ID is required'),
  error: z.string().optional(),
});

// Diagnosis report validation schema
export const diagnosisReportSchema = z.object({
  id: z.string().regex(VALIDATION_RULES.UUID_REGEX, 'Invalid report ID format'),
  user_id: z.string().regex(VALIDATION_RULES.UUID_REGEX, 'Invalid user ID format'),
  session_id: z.string().nullable(),
  pdf_url: z.string().url('Invalid PDF URL'),
  title: z.string()
    .min(VALIDATION_RULES.MIN_TITLE_LENGTH, 'Title is required')
    .max(VALIDATION_RULES.MAX_TITLE_LENGTH, 'Title is too long'),
  diagnosis_data: diagnosisDataSchema.nullable(),
  status: z.enum(['completed', 'processing', 'error']),
  created_at: z.string(),
  updated_at: z.string(),
});

// Diagnosis chat session validation schema
export const diagnosisChatSessionSchema = z.object({
  id: z.string().regex(VALIDATION_RULES.UUID_REGEX, 'Invalid session ID format'),
  user_id: z.string().regex(VALIDATION_RULES.UUID_REGEX, 'Invalid user ID format'),
  session_id: z.string().min(1, 'Session ID is required'),
  messages: z.array(chatMessageSchema),
  status: z.enum(['active', 'completed', 'error']),
  started_at: z.string(),
  completed_at: z.string().nullable(),
});

// Environment configuration validation schema
export const diagnosisEnvironmentConfigSchema = z.object({
  supabase: z.object({
    url: z.string().url('Invalid Supabase URL'),
    anonKey: z.string().min(1, 'Supabase anon key is required'),
    storageBucket: z.string().min(1, 'Storage bucket name is required'),
  }),
  n8n: z.object({
    webhookUrl: z.string().url('Invalid n8n webhook URL'),
    timeout: z.number().min(1000).max(60000), // 1 second to 1 minute
  }),
  pdf: z.object({
    maxSize: z.number().min(1024), // Minimum 1KB
    allowedFormats: z.array(z.string()),
  }),
});

// Service configuration schemas
export const chatServiceConfigSchema = z.object({
  webhookUrl: z.string().url('Invalid webhook URL'),
  timeout: z.number().min(1000).max(60000),
  retryAttempts: z.number().min(0).max(5),
});

export const pdfServiceConfigSchema = z.object({
  maxSize: z.number().min(1024),
  allowedFormats: z.array(z.string()),
  template: z.enum(['standard', 'detailed']),
});

export const storageServiceConfigSchema = z.object({
  bucketName: z.string().min(1, 'Bucket name is required'),
  maxFileSize: z.number().min(1024),
  allowedMimeTypes: z.array(z.string()),
});

// Input validation schemas for forms
export const startChatSchema = z.object({
  initialMessage: z.string().min(1, 'Initial message is required').max(1000, 'Message too long'),
});

export const sendMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
  sessionId: z.string().min(1, 'Session ID is required'),
});

export const createReportSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  diagnosisData: diagnosisDataSchema,
  sessionId: z.string().min(1, 'Session ID is required'),
});

// Error validation schema
export const diagnosisErrorSchema = z.object({
  type: z.enum([
    'NETWORK_ERROR',
    'WEBHOOK_TIMEOUT',
    'SUPABASE_ERROR',
    'PDF_GENERATION_ERROR',
    'STORAGE_ERROR',
    'AUTHENTICATION_ERROR'
  ]),
  message: z.string().min(1, 'Error message is required'),
  details: z.any().optional(),
  retryable: z.boolean(),
  timestamp: z.date(),
});

// Export type inference helpers
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type DiagnosisData = z.infer<typeof diagnosisDataSchema>;
export type N8nWebhookRequest = z.infer<typeof n8nWebhookRequestSchema>;
export type N8nWebhookResponse = z.infer<typeof n8nWebhookResponseSchema>;
export type DiagnosisReport = z.infer<typeof diagnosisReportSchema>;
export type DiagnosisChatSession = z.infer<typeof diagnosisChatSessionSchema>;
export type DiagnosisEnvironmentConfig = z.infer<typeof diagnosisEnvironmentConfigSchema>;
export type ChatServiceConfig = z.infer<typeof chatServiceConfigSchema>;
export type PDFServiceConfig = z.infer<typeof pdfServiceConfigSchema>;
export type StorageServiceConfig = z.infer<typeof storageServiceConfigSchema>;
export type DiagnosisError = z.infer<typeof diagnosisErrorSchema>;

// Validation helper functions
export const validateChatMessage = (data: unknown): ChatMessage => {
  return chatMessageSchema.parse(data);
};

export const validateDiagnosisData = (data: unknown): DiagnosisData => {
  return diagnosisDataSchema.parse(data);
};

export const validateN8nWebhookRequest = (data: unknown): N8nWebhookRequest => {
  return n8nWebhookRequestSchema.parse(data);
};

export const validateN8nWebhookResponse = (data: unknown): N8nWebhookResponse => {
  return n8nWebhookResponseSchema.parse(data);
};

export const validateDiagnosisReport = (data: unknown): DiagnosisReport => {
  return diagnosisReportSchema.parse(data);
};

export const validateDiagnosisChatSession = (data: unknown): DiagnosisChatSession => {
  return diagnosisChatSessionSchema.parse(data);
};

// Safe validation functions that return results instead of throwing
export const safeParseChatMessage = (data: unknown) => {
  return chatMessageSchema.safeParse(data);
};

export const safeParseDiagnosisData = (data: unknown) => {
  return diagnosisDataSchema.safeParse(data);
};

export const safeParseN8nWebhookRequest = (data: unknown) => {
  return n8nWebhookRequestSchema.safeParse(data);
};

export const safeParseN8nWebhookResponse = (data: unknown) => {
  return n8nWebhookResponseSchema.safeParse(data);
};

export const safeParseDiagnosisReport = (data: unknown) => {
  return diagnosisReportSchema.safeParse(data);
};

export const safeParseDiagnosisChatSession = (data: unknown) => {
  return diagnosisChatSessionSchema.safeParse(data);
};

// Service response validation schema
export const serviceResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: diagnosisErrorSchema.optional(),
  metadata: z.object({
    timestamp: z.date(),
    requestId: z.string().optional(),
    duration: z.number().optional(),
  }).optional(),
});

// Storage file info validation schema
export const storageFileInfoSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  path: z.string().min(1, 'File path is required'),
  size: z.number().min(0, 'File size must be non-negative'),
  contentType: z.string().min(1, 'Content type is required'),
  createdAt: z.date(),
  updatedAt: z.date(),
  url: z.string().url().optional(),
});

// PDF generation options validation schema
export const pdfGenerationOptionsSchema = z.object({
  template: z.enum(['standard', 'detailed']),
  includeCharts: z.boolean().default(true),
  includeRecommendations: z.boolean().default(true),
  includePatientInfo: z.boolean().default(true),
  language: z.literal('pt-BR').default('pt-BR'),
  format: z.literal('A4').default('A4'),
  orientation: z.enum(['portrait', 'landscape']).default('portrait'),
});

// Analytics event validation schema
export const analyticsEventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  category: z.enum(['chat', 'pdf', 'storage', 'user', 'system']),
  action: z.string().min(1, 'Event action is required'),
  label: z.string().optional(),
  value: z.number().optional(),
  userId: z.string().regex(VALIDATION_RULES.UUID_REGEX).optional(),
  sessionId: z.string().optional(),
  timestamp: z.date(),
  properties: z.record(z.any()).optional(),
});

// Performance metric validation schema
export const performanceMetricSchema = z.object({
  name: z.string().min(1, 'Metric name is required'),
  value: z.number().min(0, 'Metric value must be non-negative'),
  unit: z.enum(['ms', 'bytes', 'count']),
  category: z.enum(['api', 'render', 'storage', 'pdf']),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional(),
});

// Health check result validation schema
export const healthCheckResultSchema = z.object({
  service: z.string().min(1, 'Service name is required'),
  status: z.enum(['healthy', 'unhealthy', 'degraded']),
  message: z.string().optional(),
  responseTime: z.number().min(0).optional(),
  timestamp: z.date(),
  details: z.record(z.any()).optional(),
});

// System health status validation schema
export const systemHealthStatusSchema = z.object({
  overall: z.enum(['healthy', 'unhealthy', 'degraded']),
  services: z.array(healthCheckResultSchema),
  timestamp: z.date(),
  uptime: z.number().min(0),
});

// Database query options validation schema
export const databaseQueryOptionsSchema = z.object({
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
  orderBy: z.string().optional(),
  orderDirection: z.enum(['asc', 'desc']).optional(),
  filters: z.record(z.any()).optional(),
});

// Cache entry validation schema
export const cacheEntrySchema = z.object({
  value: z.any(),
  timestamp: z.date(),
  ttl: z.number().min(0),
  accessCount: z.number().min(0),
  lastAccessed: z.date(),
});

// Service configuration validation schema
export const serviceConfigurationSchema = z.object({
  chat: z.object({
    webhookUrl: z.string().url('Invalid webhook URL'),
    timeout: z.number().min(1000).max(60000),
    retryAttempts: z.number().min(0).max(5),
    retryDelay: z.number().min(100).max(10000),
  }),
  pdf: pdfGenerationOptionsSchema,
  storage: z.object({
    bucketName: z.string().min(1, 'Bucket name is required'),
    maxFileSize: z.number().min(1024),
    allowedMimeTypes: z.array(z.string()),
    signedUrlExpiration: z.number().min(60).max(86400), // 1 minute to 24 hours
  }),
  database: databaseQueryOptionsSchema,
  cache: z.object({
    maxSize: z.number().min(1),
    defaultTTL: z.number().min(1000),
    cleanupInterval: z.number().min(1000),
    enableMetrics: z.boolean(),
  }),
  analytics: z.object({
    enabled: z.boolean(),
    endpoint: z.string().url().optional(),
    batchSize: z.number().min(1).max(1000),
    flushInterval: z.number().min(1000),
  }),
});

// Export additional type inference helpers
export type ServiceResponse = z.infer<typeof serviceResponseSchema>;
export type StorageFileInfo = z.infer<typeof storageFileInfoSchema>;
export type PDFGenerationOptions = z.infer<typeof pdfGenerationOptionsSchema>;
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;
export type PerformanceMetric = z.infer<typeof performanceMetricSchema>;
export type HealthCheckResult = z.infer<typeof healthCheckResultSchema>;
export type SystemHealthStatus = z.infer<typeof systemHealthStatusSchema>;
export type DatabaseQueryOptions = z.infer<typeof databaseQueryOptionsSchema>;
export type CacheEntry = z.infer<typeof cacheEntrySchema>;
export type ServiceConfiguration = z.infer<typeof serviceConfigurationSchema>;

// Additional validation helper functions
export const validateServiceResponse = (data: unknown) => {
  return serviceResponseSchema.safeParse(data);
};

export const validateStorageFileInfo = (data: unknown) => {
  return storageFileInfoSchema.safeParse(data);
};

export const validatePDFGenerationOptions = (data: unknown) => {
  return pdfGenerationOptionsSchema.safeParse(data);
};

export const validateAnalyticsEvent = (data: unknown) => {
  return analyticsEventSchema.safeParse(data);
};

export const validatePerformanceMetric = (data: unknown) => {
  return performanceMetricSchema.safeParse(data);
};

export const validateHealthCheckResult = (data: unknown) => {
  return healthCheckResultSchema.safeParse(data);
};

export const validateSystemHealthStatus = (data: unknown) => {
  return systemHealthStatusSchema.safeParse(data);
};

export const validateDatabaseQueryOptions = (data: unknown) => {
  return databaseQueryOptionsSchema.safeParse(data);
};

export const validateServiceConfiguration = (data: unknown) => {
  return serviceConfigurationSchema.safeParse(data);
};