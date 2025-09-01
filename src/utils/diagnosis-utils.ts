// Utility functions for diagnosis system

import type { 
  ChatMessage, 
  DiagnosisChatSession,
  DiagnosisData 
} from '@/types/diagnosis';

/**
 * Creates a new chat message with proper validation
 */
export const createChatMessage = (data: Partial<ChatMessage> & { 
  id: string; 
  session_id: string; 
  sender: 'user' | 'ai' | 'system'; 
  content: string; 
  timestamp: string; 
}): ChatMessage => {
  return {
    id: data.id,
    session_id: data.session_id,
    sender: data.sender,
    content: data.content,
    timestamp: data.timestamp,
    status: data.status || 'sent',
    metadata: data.metadata,
    type: data.sender, // Map sender to type for compatibility
  };
};

/**
 * Creates a new diagnosis chat session
 */
export const createDiagnosisChatSession = (data: Partial<DiagnosisChatSession> & {
  id: string;
  user_id: string;
  status: 'active' | 'completed' | 'abandoned';
  started_at: string;
}): DiagnosisChatSession => {
  return {
    id: data.id,
    user_id: data.user_id,
    status: data.status,
    started_at: data.started_at,
    completed_at: data.completed_at,
    last_activity: data.last_activity || data.started_at,
    message_count: data.message_count || 0,
    metadata: data.metadata,
  };
};

/**
 * Validates if a chat message is properly formatted
 */
export const isValidChatMessage = (message: any): message is ChatMessage => {
  return (
    message &&
    typeof message.id === 'string' &&
    typeof message.session_id === 'string' &&
    typeof message.content === 'string' &&
    typeof message.timestamp === 'string' &&
    ['user', 'ai', 'system'].includes(message.sender) &&
    ['user', 'ai', 'system'].includes(message.type)
  );
};

/**
 * Validates if a diagnosis session is properly formatted
 */
export const isValidDiagnosisSession = (session: any): session is DiagnosisChatSession => {
  return (
    session &&
    typeof session.id === 'string' &&
    typeof session.user_id === 'string' &&
    typeof session.started_at === 'string' &&
    ['active', 'completed', 'abandoned'].includes(session.status)
  );
};

/**
 * Formats a timestamp for display
 */
export const formatTimestamp = (timestamp: string): string => {
  try {
    return new Date(timestamp).toLocaleString('pt-BR');
  } catch {
    return 'Data inválida';
  }
};

/**
 * Generates a unique session ID
 */
export const generateSessionId = (userId: string): string => {
  return `session_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generates a unique message ID
 */
export const generateMessageId = (sessionId: string, sender: string): string => {
  return `msg_${sessionId}_${sender}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Extracts severity level from diagnosis data
 */
export const extractSeverityLevel = (diagnosisData: DiagnosisData): number => {
  return diagnosisData.severity_level || 1;
};

/**
 * Formats diagnosis summary for display
 */
export const formatDiagnosisSummary = (diagnosisData: DiagnosisData): string => {
  const symptoms = diagnosisData.symptoms?.join(', ') || 'Não informado';
  const analysis = diagnosisData.analysis || 'Análise não disponível';
  
  return `Sintomas: ${symptoms}\nAnálise: ${analysis}`;
};

/**
 * Validates diagnosis data completeness
 */
export const isCompleteDiagnosisData = (data: any): data is DiagnosisData => {
  return (
    data &&
    Array.isArray(data.symptoms) &&
    data.symptoms.length > 0 &&
    typeof data.analysis === 'string' &&
    data.analysis.length > 0 &&
    Array.isArray(data.recommendations) &&
    data.recommendations.length > 0
  );
};

/**
 * Sanitizes user input for chat messages
 */
export const sanitizeMessageContent = (content: string): string => {
  return content
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .substring(0, 2000); // Limit message length
};

/**
 * Checks if a session is expired (24 hours)
 */
export const isSessionExpired = (session: DiagnosisChatSession): boolean => {
  const lastActivity = new Date(session.last_activity || session.started_at);
  const now = new Date();
  const hoursDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
  
  return hoursDiff > 24;
};

/**
 * Gets session duration in minutes
 */
export const getSessionDuration = (session: DiagnosisChatSession): number => {
  const start = new Date(session.started_at);
  const end = session.completed_at ? new Date(session.completed_at) : new Date();
  
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
};

/**
 * Formats session duration for display
 */
export const formatSessionDuration = (session: DiagnosisChatSession): string => {
  const minutes = getSessionDuration(session);
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Creates a diagnosis error with proper typing
 */
export const createDiagnosisError = (type: string, message: string, details?: any): any => {
  return {
    type,
    message,
    details,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Extracts error message from various error types
 */
export const extractErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error?.message) return error.error.message;
  return 'Erro desconhecido';
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
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Formats date for display
 */
export const formatDate = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR');
  } catch {
    return 'Data inválida';
  }
};

/**
 * Formats currency for display
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generates a random ID
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Debounce function
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
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};