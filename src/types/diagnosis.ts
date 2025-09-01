// TypeScript interfaces for diagnosis chat integration

import { User } from '@supabase/supabase-js';

// Base interfaces
export interface DiagnosisUser extends User {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    avatar_url?: string;
  };
}

// Chat message interface
export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

// Diagnosis data structure from n8n
export interface DiagnosisData {
  patient_info: {
    age?: number;
    gender?: string;
    medical_history?: string[];
  };
  symptoms: Array<{
    description: string;
    severity: number;
    duration?: string;
  }>;
  analysis: string;
  recommendations: string[];
  severity_level: number;
  next_steps?: string[];
  generated_at: string;
}

// Database table interfaces
export interface DiagnosisReport {
  id: string;
  user_id: string;
  session_id: string | null;
  pdf_url: string;
  title: string;
  diagnosis_data: DiagnosisData | null;
  status: 'completed' | 'processing' | 'error';
  created_at: string;
  updated_at: string;
}

export interface DiagnosisChatSession {
  id: string;
  user_id: string;
  session_id: string;
  messages: ChatMessage[];
  status: 'active' | 'completed' | 'error';
  started_at: string;
  completed_at: string | null;
}

// n8n webhook communication interfaces
export interface N8nWebhookRequest {
  user_id: string;
  message: string;
  session_id: string;
  timestamp: string;
  message_history?: Array<{
    sender: 'user' | 'ai';
    content: string;
    timestamp: string;
  }>;
}

export interface N8nWebhookResponse {
  message: string;
  diagnosis_complete: boolean;
  diagnosis_data?: DiagnosisData;
  session_id: string;
  next_questions?: string[];
  error?: string;
  metadata?: {
    confidence_level?: number;
    processing_time?: number;
    tokens_used?: number;
  };
}

// Error handling types
export enum DiagnosisErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  WEBHOOK_TIMEOUT = 'WEBHOOK_TIMEOUT',
  SUPABASE_ERROR = 'SUPABASE_ERROR',
  PDF_GENERATION_ERROR = 'PDF_GENERATION_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface DiagnosisError {
  type: DiagnosisErrorType;
  message: string;
  details?: any;
  retryable: boolean;
  timestamp: Date;
  context?: string;
  userId?: string | null;
  errorId?: string;
}

// Component prop interfaces
export interface DiagnosisDashboardProps {
  user: DiagnosisUser;
  reports: DiagnosisReport[];
  onStartDiagnosis: () => void;
  onViewReport: (reportId: string) => void;
}

export interface DiagnosisChatProps {
  sessionId?: string;
  onSessionComplete: (finalData: DiagnosisData) => void;
  onError: (error: DiagnosisError) => void;
}

export interface PDFGeneratorProps {
  data: DiagnosisData;
  template: 'standard' | 'detailed';
  onGenerated: (pdfBlob: Blob) => void;
  onError: (error: DiagnosisError) => void;
}

export interface ReportsListProps {
  userId: string;
  onViewReport: (report: DiagnosisReport) => void;
  onDownloadReport: (report: DiagnosisReport) => void;
}

// Service interfaces
export interface ChatServiceConfig {
  webhookUrl: string;
  timeout: number;
  retryAttempts: number;
}

export interface PDFServiceConfig {
  maxSize: number;
  allowedFormats: string[];
  template: 'standard' | 'detailed';
}

export interface StorageServiceConfig {
  bucketName: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
}

// Hook return types
export interface UseDiagnosisChatReturn {
  session: DiagnosisChatSession | null;
  messages: ChatMessage[];
  loading: boolean;
  error: DiagnosisError | null;
  startSession: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  resetSession: () => void;
}

export interface UseReportsReturn {
  reports: DiagnosisReport[];
  loading: boolean;
  error: DiagnosisError | null;
  fetchReports: () => Promise<void>;
  refreshReports: () => Promise<void>;
  deleteReport: (reportId: string) => Promise<void>;
}

// Validation schemas (for use with Zod)
export interface DiagnosisValidationSchemas {
  chatMessage: any; // Will be defined with Zod
  diagnosisData: any; // Will be defined with Zod
  webhookRequest: any; // Will be defined with Zod
  webhookResponse: any; // Will be defined with Zod
}

// Environment configuration
export interface DiagnosisEnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
    storageBucket: string;
  };
  n8n: {
    webhookUrl: string;
    timeout: number;
  };
  pdf: {
    maxSize: number;
    allowedFormats: string[];
  };
}

// Utility types
export type DiagnosisStatus = 'completed' | 'processing' | 'error';
export type ChatSessionStatus = 'active' | 'completed' | 'error';
export type MessageType = 'user' | 'ai' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'error';
export type PDFTemplate = 'standard' | 'detailed';