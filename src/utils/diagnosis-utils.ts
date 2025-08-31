// Utility functions for diagnosis system

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  DiagnosisError, 
  DiagnosisErrorType, 
  ChatMessage, 
  DiagnosisData,
  DiagnosisReport 
} from '@/types/diagnosis';
import { 
  ERROR_MESSAGES, 
  SEVERITY_LEVELS, 
  DEFAULTS,
  VALIDATION_RULES 
} from '@/lib/diagnosis-constants';

/**
 * Creates a standardized diagnosis error
 */
export const createDiagnosisError = (
  type: DiagnosisErrorType,
  message?: string,
  details?: any,
  retryable: boolean = true
): DiagnosisError => {
  return {
    type,
    message: message || ERROR_MESSAGES[type] || ERROR_MESSAGES.GENERIC_ERROR,
    details,
    retryable,
    timestamp: new Date(),
  };
};

/**
 * Generates a unique session ID
 */
export const generateSessionId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `session_${timestamp}_${randomStr}`;
};

/**
 * Generates a unique message ID
 */
export const generateMessageId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `msg_${timestamp}_${randomStr}`;
};

/**
 * Creates a chat message object
 */
export const createChatMessage = (
  content: string,
  type: 'user' | 'ai' | 'system' = 'user',
  status?: 'sending' | 'sent' | 'error'
): ChatMessage => {
  return {
    id: generateMessageId(),
    type,
    content,
    timestamp: new Date(),
    status,
  };
};

/**
 * Validates a message content
 */
export const validateMessage = (message: string): { isValid: boolean; error?: string } => {
  if (!message || message.trim().length === 0) {
    return { isValid: false, error: 'Mensagem não pode estar vazia' };
  }

  if (message.length < VALIDATION_RULES.MIN_MESSAGE_LENGTH) {
    return { isValid: false, error: 'Mensagem muito curta' };
  }

  if (message.length > VALIDATION_RULES.MAX_MESSAGE_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.MESSAGE_TOO_LONG };
  }

  return { isValid: true };
};

/**
 * Validates a UUID
 */
export const isValidUUID = (uuid: string): boolean => {
  return VALIDATION_RULES.UUID_REGEX.test(uuid);
};

/**
 * Formats a date for display in Portuguese
 */
export const formatDate = (date: string | Date, formatStr: string = 'dd/MM/yyyy HH:mm'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: ptBR });
};

/**
 * Formats a relative date (e.g., "há 2 horas")
 */
export const formatRelativeDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'agora mesmo';
  if (diffInMinutes < 60) return `há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
  
  return formatDate(dateObj, 'dd/MM/yyyy');
};

/**
 * Gets severity level information
 */
export const getSeverityInfo = (level: number) => {
  return SEVERITY_LEVELS[level as keyof typeof SEVERITY_LEVELS] || SEVERITY_LEVELS[1];
};

/**
 * Generates a PDF filename
 */
export const generatePDFFilename = (userId: string, timestamp?: Date): string => {
  const date = timestamp || new Date();
  const timestampStr = date.getTime().toString();
  return DEFAULTS.PDF_FILENAME_FORMAT
    .replace('{userId}', userId)
    .replace('{timestamp}', timestampStr);
};

/**
 * Generates a report title
 */
export const generateReportTitle = (timestamp?: Date): string => {
  const date = timestamp || new Date();
  const dateStr = formatDate(date, 'dd/MM/yyyy HH:mm');
  return `${DEFAULTS.REPORT_TITLE_PREFIX} - ${dateStr}`;
};

/**
 * Sanitizes text content for display
 */
export const sanitizeText = (text: string): string => {
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive line breaks
    .trim();
};

/**
 * Truncates text to a maximum length
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Checks if a session is expired
 */
export const isSessionExpired = (startedAt: string | Date, timeoutMs: number = 30 * 60 * 1000): boolean => {
  const startDate = typeof startedAt === 'string' ? new Date(startedAt) : startedAt;
  const now = new Date();
  return (now.getTime() - startDate.getTime()) > timeoutMs;
};

/**
 * Extracts error message from various error types
 */
export const extractErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  if (error?.details?.message) return error.details.message;
  return ERROR_MESSAGES.GENERIC_ERROR;
};

/**
 * Determines if an error is retryable
 */
export const isRetryableError = (error: any): boolean => {
  if (error?.retryable !== undefined) return error.retryable;
  
  // Check error message for authentication issues (before type is set)
  const message = extractErrorMessage(error);
  if (message.includes('unauthorized') || message.includes('forbidden')) {
    return false;
  }
  
  // Network errors are usually retryable
  if (error?.type === DiagnosisErrorType.NETWORK_ERROR) return true;
  if (error?.type === DiagnosisErrorType.WEBHOOK_TIMEOUT) return true;
  if (error?.type === DiagnosisErrorType.SUPABASE_ERROR) return true;
  
  // Authentication errors are not retryable
  if (error?.type === DiagnosisErrorType.AUTHENTICATION_ERROR) return false;
  
  // Default to retryable for unknown errors
  return true;
};

/**
 * Formats file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validates diagnosis data structure
 */
export const validateDiagnosisData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data) {
    errors.push('Dados de diagnóstico não fornecidos');
    return { isValid: false, errors };
  }

  if (!data.analysis || typeof data.analysis !== 'string') {
    errors.push('Análise é obrigatória');
  }

  if (!data.recommendations || !Array.isArray(data.recommendations) || data.recommendations.length === 0) {
    errors.push('Recomendações são obrigatórias');
  }

  if (!data.severity_level || typeof data.severity_level !== 'number' || data.severity_level < 1 || data.severity_level > 5) {
    errors.push('Nível de severidade deve ser entre 1 e 5');
  }

  if (!data.symptoms || !Array.isArray(data.symptoms) || data.symptoms.length === 0) {
    errors.push('Sintomas são obrigatórios');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Creates a storage path for user files
 */
export const createUserStoragePath = (userId: string, filename: string): string => {
  return `${userId}/${filename}`;
};

/**
 * Debounce function for limiting API calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }

      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};