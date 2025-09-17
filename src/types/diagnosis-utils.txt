// Utility functions and type guards for diagnosis types

import { 
  DiagnosisError, 
  DiagnosisErrorType,
  ChatMessage, 
  DiagnosisData, 
  DiagnosisReport,
  DiagnosisChatSession,
  N8nWebhookRequest,
  N8nWebhookResponse,
  MessageType,
  MessageStatus,
  DiagnosisStatus,
  ChatSessionStatus
} from './diagnosis';

import {
  ServiceResponse,
  ValidationResult,
  AnalyticsEvent,
  PerformanceMetric,
  HealthCheckResult
} from './diagnosis-services';

// Type Guards
export const isDiagnosisError = (obj: any): obj is DiagnosisError => {
  return !!(obj && 
    typeof obj === 'object' &&
    typeof obj.type === 'string' &&
    Object.values(DiagnosisErrorType).includes(obj.type) &&
    typeof obj.message === 'string' &&
    typeof obj.retryable === 'boolean' &&
    obj.timestamp instanceof Date);
};

export const isChatMessage = (obj: any): obj is ChatMessage => {
  return obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    ['user', 'ai', 'system'].includes(obj.type) &&
    typeof obj.content === 'string' &&
    obj.timestamp instanceof Date;
};

export const isDiagnosisData = (obj: any): obj is DiagnosisData => {
  return obj &&
    typeof obj === 'object' &&
    obj.patient_info &&
    Array.isArray(obj.symptoms) &&
    obj.symptoms.length > 0 &&
    typeof obj.analysis === 'string' &&
    Array.isArray(obj.recommendations) &&
    obj.recommendations.length > 0 &&
    typeof obj.severity_level === 'number' &&
    obj.severity_level >= 1 &&
    obj.severity_level <= 5;
};

export const isDiagnosisReport = (obj: any): obj is DiagnosisReport => {
  return obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.pdf_url === 'string' &&
    typeof obj.title === 'string' &&
    ['completed', 'processing', 'error'].includes(obj.status);
};

export const isN8nWebhookRequest = (obj: any): obj is N8nWebhookRequest => {
  return obj &&
    typeof obj === 'object' &&
    typeof obj.user_id === 'string' &&
    typeof obj.text === 'string' &&
    obj.text.length > 0;
};

export const isN8nWebhookResponse = (obj: any): obj is N8nWebhookResponse => {
  return obj &&
    typeof obj === 'object' &&
    typeof obj.response === 'string' &&
    typeof obj.session_id === 'string';
};

export const isServiceResponse = <T>(obj: any): obj is ServiceResponse<T> => {
  return obj &&
    typeof obj === 'object' &&
    typeof obj.success === 'boolean';
};

export const isValidationResult = (obj: any): obj is ValidationResult => {
  return obj &&
    typeof obj === 'object' &&
    typeof obj.isValid === 'boolean' &&
    Array.isArray(obj.errors) &&
    Array.isArray(obj.warnings);
};

// Type Assertion Functions
export const assertDiagnosisError = (obj: any): DiagnosisError => {
  if (!isDiagnosisError(obj)) {
    throw new Error('Object is not a valid DiagnosisError');
  }
  return obj;
};

export const assertChatMessage = (obj: any): ChatMessage => {
  if (!isChatMessage(obj)) {
    throw new Error('Object is not a valid ChatMessage');
  }
  return obj;
};

export const assertDiagnosisData = (obj: any): DiagnosisData => {
  if (!isDiagnosisData(obj)) {
    throw new Error('Object is not a valid DiagnosisData');
  }
  return obj;
};

export const assertN8nWebhookResponse = (obj: any): N8nWebhookResponse => {
  if (!isN8nWebhookResponse(obj)) {
    throw new Error('Object is not a valid N8nWebhookResponse');
  }
  return obj;
};

// Factory Functions
export const createChatMessage = (
  type: MessageType,
  content: string,
  status?: MessageStatus
): ChatMessage => {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
    type,
    content,
    timestamp: new Date(),
    status,
  };
};

export const createDiagnosisError = (
  type: DiagnosisErrorType,
  message: string,
  details?: any,
  retryable: boolean = true
): DiagnosisError => {
  return {
    type,
    message,
    details,
    retryable,
    timestamp: new Date(),
  };
};

export const createN8nWebhookRequest = (
  userId: string,
  text: string,
  sessionId?: string
): N8nWebhookRequest => {
  return {
    user_id: userId,
    text,
    session_id: sessionId,
  };
};

export const createServiceResponse = <T>(
  success: boolean,
  data?: T,
  error?: DiagnosisError,
  requestId?: string,
  duration?: number
): ServiceResponse<T> => {
  return {
    success,
    data,
    error,
    metadata: {
      timestamp: new Date(),
      requestId,
      duration,
    },
  };
};

export const createSuccessResponse = <T>(
  data: T,
  requestId?: string,
  duration?: number
): ServiceResponse<T> => {
  return createServiceResponse(true, data, undefined, requestId, duration);
};

export const createErrorResponse = <T>(
  error: DiagnosisError,
  requestId?: string,
  duration?: number
): ServiceResponse<T> => {
  return createServiceResponse(false, undefined, error, requestId, duration);
};

export const createAnalyticsEvent = (
  name: string,
  category: AnalyticsEvent['category'],
  action: string,
  options?: {
    label?: string;
    value?: number;
    userId?: string;
    sessionId?: string;
    properties?: Record<string, any>;
  }
): AnalyticsEvent => {
  return {
    name,
    category,
    action,
    label: options?.label,
    value: options?.value,
    userId: options?.userId,
    sessionId: options?.sessionId,
    timestamp: new Date(),
    properties: options?.properties,
  };
};

export const createPerformanceMetric = (
  name: string,
  value: number,
  unit: PerformanceMetric['unit'],
  category: PerformanceMetric['category'],
  metadata?: Record<string, any>
): PerformanceMetric => {
  return {
    name,
    value,
    unit,
    category,
    timestamp: new Date(),
    metadata,
  };
};

export const createHealthCheckResult = (
  service: string,
  status: HealthCheckResult['status'],
  options?: {
    message?: string;
    responseTime?: number;
    details?: Record<string, any>;
  }
): HealthCheckResult => {
  return {
    service,
    status,
    message: options?.message,
    responseTime: options?.responseTime,
    timestamp: new Date(),
    details: options?.details,
  };
};

// Utility Functions
export const getMessageTypeLabel = (type: MessageType): string => {
  const labels: Record<MessageType, string> = {
    user: 'Usuário',
    ai: 'Assistente',
    system: 'Sistema',
  };
  return labels[type];
};

export const getMessageStatusLabel = (status?: MessageStatus): string => {
  if (!status) return '';
  
  const labels: Record<MessageStatus, string> = {
    sending: 'Enviando...',
    sent: 'Enviado',
    error: 'Erro',
  };
  return labels[status];
};

export const getDiagnosisStatusLabel = (status: DiagnosisStatus): string => {
  const labels: Record<DiagnosisStatus, string> = {
    completed: 'Concluído',
    processing: 'Processando',
    error: 'Erro',
  };
  return labels[status];
};

export const getChatSessionStatusLabel = (status: ChatSessionStatus): string => {
  const labels: Record<ChatSessionStatus, string> = {
    active: 'Ativo',
    completed: 'Concluído',
    error: 'Erro',
  };
  return labels[status];
};

export const getSeverityLevelLabel = (level: number): string => {
  const labels: Record<number, string> = {
    1: 'Muito Baixo',
    2: 'Baixo',
    3: 'Moderado',
    4: 'Alto',
    5: 'Muito Alto',
  };
  return labels[level] || 'Desconhecido';
};

export const getSeverityLevelColor = (level: number): string => {
  const colors: Record<number, string> = {
    1: 'green',
    2: 'blue',
    3: 'yellow',
    4: 'orange',
    5: 'red',
  };
  return colors[level] || 'gray';
};

export const getErrorTypeLabel = (type: DiagnosisErrorType): string => {
  const labels: Record<DiagnosisErrorType, string> = {
    [DiagnosisErrorType.NETWORK_ERROR]: 'Erro de Rede',
    [DiagnosisErrorType.WEBHOOK_TIMEOUT]: 'Timeout do Webhook',
    [DiagnosisErrorType.SUPABASE_ERROR]: 'Erro do Supabase',
    [DiagnosisErrorType.PDF_GENERATION_ERROR]: 'Erro na Geração de PDF',
    [DiagnosisErrorType.STORAGE_ERROR]: 'Erro de Armazenamento',
    [DiagnosisErrorType.AUTHENTICATION_ERROR]: 'Erro de Autenticação',
  };
  return labels[type];
};

// Data Transformation Functions
export const formatDiagnosisDataForDisplay = (data: DiagnosisData) => {
  return {
    patientInfo: {
      age: data.patient_info.age ? `${data.patient_info.age} anos` : 'Não informado',
      gender: data.patient_info.gender || 'Não informado',
      medicalHistory: data.patient_info.medical_history || [],
    },
    symptoms: data.symptoms.map(symptom => ({
      description: symptom.description,
      severity: `${symptom.severity}/10`,
      severityLabel: getSeverityLevelLabel(Math.ceil(symptom.severity / 2)),
      duration: symptom.duration || 'Não informado',
    })),
    analysis: data.analysis,
    recommendations: data.recommendations,
    severityLevel: data.severity_level,
    severityLevelLabel: getSeverityLevelLabel(data.severity_level),
    severityLevelColor: getSeverityLevelColor(data.severity_level),
    nextSteps: data.next_steps || [],
    generatedAt: new Date(data.generated_at),
  };
};

export const formatChatSessionForDisplay = (session: DiagnosisChatSession) => {
  return {
    id: session.id,
    sessionId: session.session_id,
    status: session.status,
    statusLabel: getChatSessionStatusLabel(session.status),
    messageCount: session.messages.length,
    startedAt: new Date(session.started_at),
    completedAt: session.completed_at ? new Date(session.completed_at) : null,
    duration: session.completed_at 
      ? new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()
      : Date.now() - new Date(session.started_at).getTime(),
  };
};

export const formatDiagnosisReportForDisplay = (report: DiagnosisReport) => {
  return {
    id: report.id,
    title: report.title,
    status: report.status,
    statusLabel: getDiagnosisStatusLabel(report.status),
    pdfUrl: report.pdf_url,
    hasDiagnosisData: !!report.diagnosis_data,
    diagnosisData: report.diagnosis_data ? formatDiagnosisDataForDisplay(report.diagnosis_data) : null,
    createdAt: new Date(report.created_at),
    updatedAt: new Date(report.updated_at),
  };
};

// Validation Helper Functions
export const validateMessageContent = (content: string): { isValid: boolean; error?: string } => {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Mensagem não pode estar vazia' };
  }
  
  if (content.length < 1) {
    return { isValid: false, error: 'Mensagem muito curta' };
  }
  
  if (content.length > 1000) {
    return { isValid: false, error: 'Mensagem muito longa (máximo 1000 caracteres)' };
  }
  
  return { isValid: true };
};

export const validateUserId = (userId: string): { isValid: boolean; error?: string } => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!userId || userId.trim().length === 0) {
    return { isValid: false, error: 'ID do usuário é obrigatório' };
  }
  
  if (!uuidRegex.test(userId)) {
    return { isValid: false, error: 'ID do usuário deve ser um UUID válido' };
  }
  
  return { isValid: true };
};

export const validateSessionId = (sessionId: string): { isValid: boolean; error?: string } => {
  if (!sessionId || sessionId.trim().length === 0) {
    return { isValid: false, error: 'ID da sessão é obrigatório' };
  }
  
  if (sessionId.length < 3) {
    return { isValid: false, error: 'ID da sessão muito curto' };
  }
  
  return { isValid: true };
};

// Error Handling Utilities
export const isRetryableError = (error: DiagnosisError): boolean => {
  return error.retryable;
};

export const shouldRetryOperation = (error: DiagnosisError, attemptCount: number, maxAttempts: number): boolean => {
  return isRetryableError(error) && attemptCount < maxAttempts;
};

export const getRetryDelay = (attemptCount: number, baseDelay: number = 1000): number => {
  // Exponential backoff: 1s, 2s, 4s, 8s...
  return baseDelay * Math.pow(2, attemptCount);
};

// Data Filtering and Sorting
export const filterReportsByStatus = (reports: DiagnosisReport[], status: DiagnosisStatus): DiagnosisReport[] => {
  return reports.filter(report => report.status === status);
};

export const filterReportsByDateRange = (
  reports: DiagnosisReport[], 
  startDate: Date, 
  endDate: Date
): DiagnosisReport[] => {
  return reports.filter(report => {
    const createdAt = new Date(report.created_at);
    return createdAt >= startDate && createdAt <= endDate;
  });
};

export const sortReportsByDate = (reports: DiagnosisReport[], ascending: boolean = false): DiagnosisReport[] => {
  return [...reports].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const sortMessagesByTimestamp = (messages: ChatMessage[], ascending: boolean = true): ChatMessage[] => {
  return [...messages].sort((a, b) => {
    const timeA = a.timestamp.getTime();
    const timeB = b.timestamp.getTime();
    return ascending ? timeA - timeB : timeB - timeA;
  });
};

// Statistics and Analytics
export const calculateChatSessionStats = (sessions: DiagnosisChatSession[]) => {
  const total = sessions.length;
  const completed = sessions.filter(s => s.status === 'completed').length;
  const active = sessions.filter(s => s.status === 'active').length;
  const errors = sessions.filter(s => s.status === 'error').length;
  
  const totalMessages = sessions.reduce((sum, session) => sum + session.messages.length, 0);
  const averageMessagesPerSession = total > 0 ? totalMessages / total : 0;
  
  const completedSessions = sessions.filter(s => s.status === 'completed' && s.completed_at);
  const averageDuration = completedSessions.length > 0 
    ? completedSessions.reduce((sum, session) => {
        const duration = new Date(session.completed_at!).getTime() - new Date(session.started_at).getTime();
        return sum + duration;
      }, 0) / completedSessions.length
    : 0;
  
  return {
    total,
    completed,
    active,
    errors,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
    errorRate: total > 0 ? (errors / total) * 100 : 0,
    totalMessages,
    averageMessagesPerSession,
    averageDuration,
  };
};

export const calculateReportStats = (reports: DiagnosisReport[]) => {
  const total = reports.length;
  const completed = reports.filter(r => r.status === 'completed').length;
  const processing = reports.filter(r => r.status === 'processing').length;
  const errors = reports.filter(r => r.status === 'error').length;
  
  const reportsWithData = reports.filter(r => r.diagnosis_data).length;
  const severityLevels = reports
    .filter(r => r.diagnosis_data)
    .map(r => r.diagnosis_data!.severity_level);
  
  const averageSeverity = severityLevels.length > 0 
    ? severityLevels.reduce((sum, level) => sum + level, 0) / severityLevels.length
    : 0;
  
  return {
    total,
    completed,
    processing,
    errors,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
    errorRate: total > 0 ? (errors / total) * 100 : 0,
    reportsWithData,
    dataCompletionRate: total > 0 ? (reportsWithData / total) * 100 : 0,
    averageSeverity,
    severityDistribution: {
      level1: severityLevels.filter(l => l === 1).length,
      level2: severityLevels.filter(l => l === 2).length,
      level3: severityLevels.filter(l => l === 3).length,
      level4: severityLevels.filter(l => l === 4).length,
      level5: severityLevels.filter(l => l === 5).length,
    },
  };
};

// Export all utility functions
export const DiagnosisTypeUtils = {
  // Type Guards
  isDiagnosisError,
  isChatMessage,
  isDiagnosisData,
  isDiagnosisReport,
  isN8nWebhookRequest,
  isN8nWebhookResponse,
  isServiceResponse,
  isValidationResult,
  
  // Type Assertions
  assertDiagnosisError,
  assertChatMessage,
  assertDiagnosisData,
  assertN8nWebhookResponse,
  
  // Factory Functions
  createChatMessage,
  createDiagnosisError,
  createN8nWebhookRequest,
  createServiceResponse,
  createSuccessResponse,
  createErrorResponse,
  createAnalyticsEvent,
  createPerformanceMetric,
  createHealthCheckResult,
  
  // Utility Functions
  getMessageTypeLabel,
  getMessageStatusLabel,
  getDiagnosisStatusLabel,
  getChatSessionStatusLabel,
  getSeverityLevelLabel,
  getSeverityLevelColor,
  getErrorTypeLabel,
  
  // Data Transformation
  formatDiagnosisDataForDisplay,
  formatChatSessionForDisplay,
  formatDiagnosisReportForDisplay,
  
  // Validation
  validateMessageContent,
  validateUserId,
  validateSessionId,
  
  // Error Handling
  isRetryableError,
  shouldRetryOperation,
  getRetryDelay,
  
  // Data Filtering and Sorting
  filterReportsByStatus,
  filterReportsByDateRange,
  sortReportsByDate,
  sortMessagesByTimestamp,
  
  // Statistics
  calculateChatSessionStats,
  calculateReportStats,
};