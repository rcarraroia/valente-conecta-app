// Service-specific types for diagnosis system

import { 
  DiagnosisError, 
  ChatMessage, 
  DiagnosisData, 
  DiagnosisReport,
  DiagnosisChatSession,
  N8nWebhookRequest,
  N8nWebhookResponse 
} from './diagnosis';

// Base service response type
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: DiagnosisError;
  metadata?: {
    timestamp: Date;
    requestId?: string;
    duration?: number;
    // Extended metadata for batch operations
    attempts?: number;
    totalItems?: number;
    successCount?: number;
    errorCount?: number;
    errors?: DiagnosisError[];
  };
}

// Chat Service Types
export interface ChatServiceInterface {
  sendMessage(request: N8nWebhookRequest): Promise<ServiceResponse<N8nWebhookResponse>>;
  validateWebhookResponse(response: any): boolean;
  createInitialRequest(userId: string, sessionId: string): N8nWebhookRequest;
}

export interface ChatServiceOptions {
  webhookUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface ChatServiceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastRequestTime?: Date;
}

// PDF Service Types
export interface PDFServiceInterface {
  generatePDF(data: DiagnosisData, template: 'standard' | 'detailed'): Promise<ServiceResponse<Blob>>;
  validateDiagnosisData(data: DiagnosisData): boolean;
  getTemplateOptions(): PDFTemplateOption[];
}

export interface PDFTemplateOption {
  id: 'standard' | 'detailed';
  name: string;
  description: string;
  features: string[];
}

export interface PDFGenerationOptions {
  template: 'standard' | 'detailed';
  includeCharts: boolean;
  includeRecommendations: boolean;
  includePatientInfo: boolean;
  language: 'pt-BR';
  format: 'A4';
  orientation: 'portrait' | 'landscape';
}

export interface PDFServiceMetrics {
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  averageGenerationTime: number;
  totalSizeGenerated: number;
}

// Storage Service Types
export interface StorageServiceInterface {
  uploadFile(file: Blob, path: string): Promise<ServiceResponse<string>>;
  downloadFile(path: string): Promise<ServiceResponse<Blob>>;
  deleteFile(path: string): Promise<ServiceResponse<void>>;
  getSignedUrl(path: string, expiresIn?: number): Promise<ServiceResponse<string>>;
  listUserFiles(userId: string): Promise<ServiceResponse<StorageFileInfo[]>>;
}

export interface StorageFileInfo {
  name: string;
  path: string;
  size: number;
  contentType: string;
  createdAt: Date;
  updatedAt: Date;
  url?: string;
}

export interface StorageServiceOptions {
  bucketName: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
  signedUrlExpiration: number;
}

export interface StorageServiceMetrics {
  totalUploads: number;
  totalDownloads: number;
  totalDeletes: number;
  totalStorageUsed: number;
  averageUploadTime: number;
}

// Database Service Types
export interface DatabaseServiceInterface {
  // Reports
  createReport(report: Omit<DiagnosisReport, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<DiagnosisReport>>;
  getReport(id: string): Promise<ServiceResponse<DiagnosisReport>>;
  getUserReports(userId: string): Promise<ServiceResponse<DiagnosisReport[]>>;
  updateReport(id: string, updates: Partial<DiagnosisReport>): Promise<ServiceResponse<DiagnosisReport>>;
  deleteReport(id: string): Promise<ServiceResponse<void>>;

  // Chat Sessions
  createSession(session: Omit<DiagnosisChatSession, 'id' | 'started_at' | 'updated_at'>): Promise<ServiceResponse<DiagnosisChatSession>>;
  getSession(id: string): Promise<ServiceResponse<DiagnosisChatSession>>;
  updateSession(id: string, updates: Partial<DiagnosisChatSession>): Promise<ServiceResponse<DiagnosisChatSession>>;
  deleteSession(id: string): Promise<ServiceResponse<void>>;
}

export interface DatabaseQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface DatabaseServiceMetrics {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  averageQueryTime: number;
  cacheHitRate: number;
}

// Validation Service Types
export interface ValidationServiceInterface {
  validateChatMessage(message: ChatMessage): ValidationResult;
  validateDiagnosisData(data: DiagnosisData): ValidationResult;
  validateN8nRequest(request: N8nWebhookRequest): ValidationResult;
  validateN8nResponse(response: N8nWebhookResponse): ValidationResult;
  validateReport(report: DiagnosisReport): ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

// Analytics Service Types
export interface AnalyticsServiceInterface {
  trackEvent(event: AnalyticsEvent): Promise<void>;
  trackError(error: DiagnosisError, context?: any): Promise<void>;
  trackPerformance(metric: PerformanceMetric): Promise<void>;
  getMetrics(timeRange: TimeRange): Promise<ServiceResponse<AnalyticsMetrics>>;
}

export interface AnalyticsEvent {
  name: string;
  category: 'chat' | 'pdf' | 'storage' | 'user' | 'system';
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  properties?: Record<string, any>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  category: 'api' | 'render' | 'storage' | 'pdf';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface AnalyticsMetrics {
  totalEvents: number;
  totalErrors: number;
  averageResponseTime: number;
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    sessionsPerUser: number;
  };
  systemHealth: {
    errorRate: number;
    uptime: number;
    performanceScore: number;
  };
}

// Cache Service Types
export interface CacheServiceInterface {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

export interface CacheEntry<T = any> {
  value: T;
  timestamp: Date;
  ttl: number;
  accessCount: number;
  lastAccessed: Date;
}

export interface CacheServiceOptions {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  enableMetrics: boolean;
}

export interface CacheServiceMetrics {
  totalEntries: number;
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  memoryUsage: number;
}

// Service Factory Types
export interface ServiceFactory {
  createChatService(options?: Partial<ChatServiceOptions>): ChatServiceInterface;
  createPDFService(): PDFServiceInterface;
  createStorageService(options?: Partial<StorageServiceOptions>): StorageServiceInterface;
  createDatabaseService(): DatabaseServiceInterface;
  createValidationService(): ValidationServiceInterface;
  createAnalyticsService(): AnalyticsServiceInterface;
  createCacheService(options?: Partial<CacheServiceOptions>): CacheServiceInterface;
}

// Service Registry Types
export interface ServiceRegistry {
  register<T>(name: string, service: T): void;
  get<T>(name: string): T;
  has(name: string): boolean;
  unregister(name: string): void;
  clear(): void;
}

// Health Check Types
export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  responseTime?: number;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface SystemHealthStatus {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  services: HealthCheckResult[];
  timestamp: Date;
  uptime: number;
}

// Service Events
export interface ServiceEvent {
  type: 'started' | 'stopped' | 'error' | 'warning' | 'info';
  service: string;
  message: string;
  timestamp: Date;
  data?: any;
}

export interface ServiceEventListener {
  (event: ServiceEvent): void;
}

// Service Configuration
export interface ServiceConfiguration {
  chat: ChatServiceOptions;
  pdf: PDFGenerationOptions;
  storage: StorageServiceOptions;
  database: DatabaseQueryOptions;
  cache: CacheServiceOptions;
  analytics: {
    enabled: boolean;
    endpoint?: string;
    batchSize: number;
    flushInterval: number;
  };
}

// Diagnosis Report Service Types
export interface DiagnosisReportServiceInterface {
  generateAndSaveReport(
    userId: string,
    sessionId: string,
    diagnosisData: DiagnosisData,
    options?: ReportGenerationOptions
  ): Promise<ServiceResponse<ReportGenerationResult>>;
  
  getReportWithSignedUrl(
    reportId: string,
    userId: string,
    expiresIn?: number
  ): Promise<ServiceResponse<{ report: any; signedUrl: string }>>;
  
  updateReportStatus(
    reportId: string,
    userId: string,
    status: 'processing' | 'completed' | 'failed'
  ): Promise<ServiceResponse<void>>;
  
  deleteReport(
    reportId: string,
    userId: string
  ): Promise<ServiceResponse<void>>;
}

export interface ReportGenerationOptions {
  title?: string;
  includePatientInfo?: boolean;
  includeRecommendations?: boolean;
  notifyUser?: boolean;
  autoSave?: boolean;
}

export interface ReportGenerationResult {
  reportId: string;
  pdfUrl: string;
  signedUrl: string;
  metadata: {
    fileSize: number;
    generationTime: number;
    uploadTime: number;
    totalTime: number;
  };
}

// Export utility types
export type ServiceName = 'chat' | 'pdf' | 'storage' | 'database' | 'validation' | 'analytics' | 'cache' | 'report';
export type ServiceStatus = 'initializing' | 'ready' | 'error' | 'stopped';
export type ServicePriority = 'low' | 'normal' | 'high' | 'critical';