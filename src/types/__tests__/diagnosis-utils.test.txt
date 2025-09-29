// Tests for diagnosis type utilities

import { describe, it, expect } from 'vitest';
import {
  isDiagnosisError,
  isChatMessage,
  isDiagnosisData,
  isDiagnosisReport,
  isN8nWebhookRequest,
  isN8nWebhookResponse,
  createChatMessage,
  createDiagnosisError,
  createN8nWebhookRequest,
  createSuccessResponse,
  createErrorResponse,
  getMessageTypeLabel,
  getSeverityLevelLabel,
  getSeverityLevelColor,
  getErrorTypeLabel,
  formatDiagnosisDataForDisplay,
  validateMessageContent,
  validateUserId,
  validateSessionId,
  isRetryableError,
  shouldRetryOperation,
  getRetryDelay,
  filterReportsByStatus,
  sortReportsByDate,
  calculateChatSessionStats,
  calculateReportStats,
  DiagnosisTypeUtils,
} from '../diagnosis-utils';

import { 
  DiagnosisErrorType,
  DiagnosisData,
  DiagnosisReport,
  DiagnosisChatSession,
  ChatMessage,
  N8nWebhookRequest,
  N8nWebhookResponse
} from '../diagnosis';

describe('Diagnosis Type Utils', () => {
  describe('Type Guards', () => {
    describe('isDiagnosisError', () => {
      it('should return true for valid DiagnosisError', () => {
        const error = {
          type: DiagnosisErrorType.NETWORK_ERROR,
          message: 'Network failed',
          retryable: true,
          timestamp: new Date(),
        };

        expect(isDiagnosisError(error)).toBe(true);
      });

      it('should return false for invalid DiagnosisError', () => {
        const invalidError = {
          type: 'INVALID_TYPE',
          message: 'Error',
          retryable: true,
          timestamp: new Date(),
        };

        expect(isDiagnosisError(invalidError)).toBe(false);
      });

      it('should return false for null or undefined', () => {
        expect(isDiagnosisError(null)).toBe(false);
        expect(isDiagnosisError(undefined)).toBe(false);
      });
    });

    describe('isChatMessage', () => {
      it('should return true for valid ChatMessage', () => {
        const message = {
          id: 'msg_123',
          type: 'user' as const,
          content: 'Hello',
          timestamp: new Date(),
        };

        expect(isChatMessage(message)).toBe(true);
      });

      it('should return false for invalid ChatMessage', () => {
        const invalidMessage = {
          id: 'msg_123',
          type: 'invalid' as any,
          content: 'Hello',
          timestamp: new Date(),
        };

        expect(isChatMessage(invalidMessage)).toBe(false);
      });
    });

    describe('isDiagnosisData', () => {
      it('should return true for valid DiagnosisData', () => {
        const data: DiagnosisData = {
          patient_info: { age: 30 },
          symptoms: [{ description: 'Headache', severity: 7 }],
          analysis: 'Possible migraine',
          recommendations: ['Rest'],
          severity_level: 3,
          generated_at: new Date().toISOString(),
        };

        expect(isDiagnosisData(data)).toBe(true);
      });

      it('should return false for data with empty symptoms', () => {
        const invalidData = {
          patient_info: { age: 30 },
          symptoms: [],
          analysis: 'Analysis',
          recommendations: ['Rest'],
          severity_level: 3,
          generated_at: new Date().toISOString(),
        };

        expect(isDiagnosisData(invalidData)).toBe(false);
      });

      it('should return false for data with invalid severity level', () => {
        const invalidData = {
          patient_info: { age: 30 },
          symptoms: [{ description: 'Headache', severity: 7 }],
          analysis: 'Analysis',
          recommendations: ['Rest'],
          severity_level: 6, // Invalid: should be 1-5
          generated_at: new Date().toISOString(),
        };

        expect(isDiagnosisData(invalidData)).toBe(false);
      });
    });

    describe('isN8nWebhookRequest', () => {
      it('should return true for valid webhook request', () => {
        const request: N8nWebhookRequest = {
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          text: 'Hello',
        };

        expect(isN8nWebhookRequest(request)).toBe(true);
      });

      it('should return false for request with empty text', () => {
        const invalidRequest = {
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          text: '',
        };

        expect(isN8nWebhookRequest(invalidRequest)).toBe(false);
      });
    });
  });

  describe('Factory Functions', () => {
    describe('createChatMessage', () => {
      it('should create a valid chat message', () => {
        const message = createChatMessage('user', 'Hello world');

        expect(message.type).toBe('user');
        expect(message.content).toBe('Hello world');
        expect(message.id).toMatch(/^msg_/);
        expect(message.timestamp).toBeInstanceOf(Date);
      });

      it('should create message with status', () => {
        const message = createChatMessage('ai', 'Response', 'sent');

        expect(message.status).toBe('sent');
      });
    });

    describe('createDiagnosisError', () => {
      it('should create a valid diagnosis error', () => {
        const error = createDiagnosisError(
          DiagnosisErrorType.NETWORK_ERROR,
          'Connection failed',
          { code: 500 },
          true
        );

        expect(error.type).toBe(DiagnosisErrorType.NETWORK_ERROR);
        expect(error.message).toBe('Connection failed');
        expect(error.details).toEqual({ code: 500 });
        expect(error.retryable).toBe(true);
        expect(error.timestamp).toBeInstanceOf(Date);
      });

      it('should default retryable to true', () => {
        const error = createDiagnosisError(
          DiagnosisErrorType.NETWORK_ERROR,
          'Connection failed'
        );

        expect(error.retryable).toBe(true);
      });
    });

    describe('createN8nWebhookRequest', () => {
      it('should create a valid webhook request', () => {
        const request = createN8nWebhookRequest(
          '123e4567-e89b-12d3-a456-426614174000',
          'Hello',
          'session_123'
        );

        expect(request.user_id).toBe('123e4567-e89b-12d3-a456-426614174000');
        expect(request.text).toBe('Hello');
        expect(request.session_id).toBe('session_123');
      });

      it('should create request without session_id', () => {
        const request = createN8nWebhookRequest(
          '123e4567-e89b-12d3-a456-426614174000',
          'Hello'
        );

        expect(request.session_id).toBeUndefined();
      });
    });

    describe('createSuccessResponse', () => {
      it('should create a successful service response', () => {
        const data = { message: 'Success' };
        const response = createSuccessResponse(data, 'req_123', 150);

        expect(response.success).toBe(true);
        expect(response.data).toEqual(data);
        expect(response.error).toBeUndefined();
        expect(response.metadata?.requestId).toBe('req_123');
        expect(response.metadata?.duration).toBe(150);
        expect(response.metadata?.timestamp).toBeInstanceOf(Date);
      });
    });

    describe('createErrorResponse', () => {
      it('should create an error service response', () => {
        const error = createDiagnosisError(DiagnosisErrorType.NETWORK_ERROR, 'Failed');
        const response = createErrorResponse(error, 'req_123', 5000);

        expect(response.success).toBe(false);
        expect(response.data).toBeUndefined();
        expect(response.error).toEqual(error);
        expect(response.metadata?.requestId).toBe('req_123');
        expect(response.metadata?.duration).toBe(5000);
      });
    });
  });

  describe('Label Functions', () => {
    describe('getMessageTypeLabel', () => {
      it('should return correct labels for message types', () => {
        expect(getMessageTypeLabel('user')).toBe('Usuário');
        expect(getMessageTypeLabel('ai')).toBe('Assistente');
        expect(getMessageTypeLabel('system')).toBe('Sistema');
      });
    });

    describe('getSeverityLevelLabel', () => {
      it('should return correct labels for severity levels', () => {
        expect(getSeverityLevelLabel(1)).toBe('Muito Baixo');
        expect(getSeverityLevelLabel(2)).toBe('Baixo');
        expect(getSeverityLevelLabel(3)).toBe('Moderado');
        expect(getSeverityLevelLabel(4)).toBe('Alto');
        expect(getSeverityLevelLabel(5)).toBe('Muito Alto');
        expect(getSeverityLevelLabel(6)).toBe('Desconhecido');
      });
    });

    describe('getSeverityLevelColor', () => {
      it('should return correct colors for severity levels', () => {
        expect(getSeverityLevelColor(1)).toBe('green');
        expect(getSeverityLevelColor(2)).toBe('blue');
        expect(getSeverityLevelColor(3)).toBe('yellow');
        expect(getSeverityLevelColor(4)).toBe('orange');
        expect(getSeverityLevelColor(5)).toBe('red');
        expect(getSeverityLevelColor(6)).toBe('gray');
      });
    });

    describe('getErrorTypeLabel', () => {
      it('should return correct labels for error types', () => {
        expect(getErrorTypeLabel(DiagnosisErrorType.NETWORK_ERROR)).toBe('Erro de Rede');
        expect(getErrorTypeLabel(DiagnosisErrorType.AUTHENTICATION_ERROR)).toBe('Erro de Autenticação');
        expect(getErrorTypeLabel(DiagnosisErrorType.PDF_GENERATION_ERROR)).toBe('Erro na Geração de PDF');
      });
    });
  });

  describe('Data Transformation', () => {
    describe('formatDiagnosisDataForDisplay', () => {
      it('should format diagnosis data for display', () => {
        const data: DiagnosisData = {
          patient_info: {
            age: 30,
            gender: 'female',
            medical_history: ['diabetes'],
          },
          symptoms: [
            {
              description: 'Headache',
              severity: 8,
              duration: '2 days',
            },
          ],
          analysis: 'Possible migraine',
          recommendations: ['Rest', 'Hydrate'],
          severity_level: 4,
          next_steps: ['Monitor symptoms'],
          generated_at: new Date().toISOString(),
        };

        const formatted = formatDiagnosisDataForDisplay(data);

        expect(formatted.patientInfo.age).toBe('30 anos');
        expect(formatted.patientInfo.gender).toBe('female');
        expect(formatted.symptoms[0].severity).toBe('8/10');
        expect(formatted.symptoms[0].severityLabel).toBe('Alto');
        expect(formatted.severityLevel).toBe(4);
        expect(formatted.severityLevelLabel).toBe('Alto');
        expect(formatted.severityLevelColor).toBe('orange');
      });

      it('should handle missing optional fields', () => {
        const data: DiagnosisData = {
          patient_info: {},
          symptoms: [
            {
              description: 'Pain',
              severity: 5,
            },
          ],
          analysis: 'Analysis',
          recommendations: ['Rest'],
          severity_level: 2,
          generated_at: new Date().toISOString(),
        };

        const formatted = formatDiagnosisDataForDisplay(data);

        expect(formatted.patientInfo.age).toBe('Não informado');
        expect(formatted.patientInfo.gender).toBe('Não informado');
        expect(formatted.symptoms[0].duration).toBe('Não informado');
        expect(formatted.nextSteps).toEqual([]);
      });
    });
  });

  describe('Validation Functions', () => {
    describe('validateMessageContent', () => {
      it('should validate correct message content', () => {
        const result = validateMessageContent('Hello, I need help');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should reject empty message', () => {
        const result = validateMessageContent('');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Mensagem não pode estar vazia');
      });

      it('should reject message that is too long', () => {
        const longMessage = 'a'.repeat(1001);
        const result = validateMessageContent(longMessage);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Mensagem muito longa (máximo 1000 caracteres)');
      });
    });

    describe('validateUserId', () => {
      it('should validate correct UUID', () => {
        const result = validateUserId('123e4567-e89b-12d3-a456-426614174000');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should reject invalid UUID', () => {
        const result = validateUserId('invalid-uuid');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('ID do usuário deve ser um UUID válido');
      });

      it('should reject empty user ID', () => {
        const result = validateUserId('');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('ID do usuário é obrigatório');
      });
    });

    describe('validateSessionId', () => {
      it('should validate correct session ID', () => {
        const result = validateSessionId('session_123');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should reject empty session ID', () => {
        const result = validateSessionId('');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('ID da sessão é obrigatório');
      });

      it('should reject too short session ID', () => {
        const result = validateSessionId('ab');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('ID da sessão muito curto');
      });
    });
  });

  describe('Error Handling Utilities', () => {
    describe('isRetryableError', () => {
      it('should return true for retryable error', () => {
        const error = createDiagnosisError(DiagnosisErrorType.NETWORK_ERROR, 'Failed', null, true);
        expect(isRetryableError(error)).toBe(true);
      });

      it('should return false for non-retryable error', () => {
        const error = createDiagnosisError(DiagnosisErrorType.AUTHENTICATION_ERROR, 'Auth failed', null, false);
        expect(isRetryableError(error)).toBe(false);
      });
    });

    describe('shouldRetryOperation', () => {
      it('should return true when error is retryable and attempts remain', () => {
        const error = createDiagnosisError(DiagnosisErrorType.NETWORK_ERROR, 'Failed', null, true);
        expect(shouldRetryOperation(error, 1, 3)).toBe(true);
      });

      it('should return false when max attempts reached', () => {
        const error = createDiagnosisError(DiagnosisErrorType.NETWORK_ERROR, 'Failed', null, true);
        expect(shouldRetryOperation(error, 3, 3)).toBe(false);
      });

      it('should return false when error is not retryable', () => {
        const error = createDiagnosisError(DiagnosisErrorType.AUTHENTICATION_ERROR, 'Auth failed', null, false);
        expect(shouldRetryOperation(error, 1, 3)).toBe(false);
      });
    });

    describe('getRetryDelay', () => {
      it('should calculate exponential backoff delay', () => {
        expect(getRetryDelay(0, 1000)).toBe(1000); // 1s
        expect(getRetryDelay(1, 1000)).toBe(2000); // 2s
        expect(getRetryDelay(2, 1000)).toBe(4000); // 4s
        expect(getRetryDelay(3, 1000)).toBe(8000); // 8s
      });
    });
  });

  describe('Data Filtering and Sorting', () => {
    const mockReports: DiagnosisReport[] = [
      {
        id: '1',
        user_id: 'user1',
        session_id: 'session1',
        pdf_url: 'url1',
        title: 'Report 1',
        diagnosis_data: null,
        status: 'completed',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
      {
        id: '2',
        user_id: 'user1',
        session_id: 'session2',
        pdf_url: 'url2',
        title: 'Report 2',
        diagnosis_data: null,
        status: 'processing',
        created_at: '2023-01-02T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
      },
      {
        id: '3',
        user_id: 'user1',
        session_id: 'session3',
        pdf_url: 'url3',
        title: 'Report 3',
        diagnosis_data: null,
        status: 'completed',
        created_at: '2023-01-03T00:00:00Z',
        updated_at: '2023-01-03T00:00:00Z',
      },
    ];

    describe('filterReportsByStatus', () => {
      it('should filter reports by status', () => {
        const completedReports = filterReportsByStatus(mockReports, 'completed');
        expect(completedReports).toHaveLength(2);
        expect(completedReports.every(r => r.status === 'completed')).toBe(true);

        const processingReports = filterReportsByStatus(mockReports, 'processing');
        expect(processingReports).toHaveLength(1);
        expect(processingReports[0].status).toBe('processing');
      });
    });

    describe('sortReportsByDate', () => {
      it('should sort reports by date descending by default', () => {
        const sorted = sortReportsByDate(mockReports);
        expect(sorted[0].id).toBe('3'); // Most recent
        expect(sorted[1].id).toBe('2');
        expect(sorted[2].id).toBe('1'); // Oldest
      });

      it('should sort reports by date ascending when specified', () => {
        const sorted = sortReportsByDate(mockReports, true);
        expect(sorted[0].id).toBe('1'); // Oldest
        expect(sorted[1].id).toBe('2');
        expect(sorted[2].id).toBe('3'); // Most recent
      });
    });
  });

  describe('Statistics and Analytics', () => {
    describe('calculateChatSessionStats', () => {
      const mockSessions: DiagnosisChatSession[] = [
        {
          id: '1',
          user_id: 'user1',
          session_id: 'session1',
          messages: [
            createChatMessage('user', 'Hello'),
            createChatMessage('ai', 'Hi there'),
          ],
          status: 'completed',
          started_at: '2023-01-01T00:00:00Z',
          completed_at: '2023-01-01T00:05:00Z',
        },
        {
          id: '2',
          user_id: 'user1',
          session_id: 'session2',
          messages: [
            createChatMessage('user', 'Help me'),
          ],
          status: 'active',
          started_at: '2023-01-01T01:00:00Z',
          completed_at: null,
        },
        {
          id: '3',
          user_id: 'user1',
          session_id: 'session3',
          messages: [],
          status: 'error',
          started_at: '2023-01-01T02:00:00Z',
          completed_at: null,
        },
      ];

      it('should calculate session statistics correctly', () => {
        const stats = calculateChatSessionStats(mockSessions);

        expect(stats.total).toBe(3);
        expect(stats.completed).toBe(1);
        expect(stats.active).toBe(1);
        expect(stats.errors).toBe(1);
        expect(stats.completionRate).toBeCloseTo(33.33, 2);
        expect(stats.errorRate).toBeCloseTo(33.33, 2);
        expect(stats.totalMessages).toBe(3);
        expect(stats.averageMessagesPerSession).toBe(1);
        expect(stats.averageDuration).toBe(5 * 60 * 1000); // 5 minutes in ms
      });
    });

    describe('calculateReportStats', () => {
      const mockReportsWithData: DiagnosisReport[] = [
        {
          id: '1',
          user_id: 'user1',
          session_id: 'session1',
          pdf_url: 'url1',
          title: 'Report 1',
          diagnosis_data: {
            patient_info: {},
            symptoms: [{ description: 'Pain', severity: 5 }],
            analysis: 'Analysis',
            recommendations: ['Rest'],
            severity_level: 3,
            generated_at: new Date().toISOString(),
          },
          status: 'completed',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
        {
          id: '2',
          user_id: 'user1',
          session_id: 'session2',
          pdf_url: 'url2',
          title: 'Report 2',
          diagnosis_data: {
            patient_info: {},
            symptoms: [{ description: 'Headache', severity: 8 }],
            analysis: 'Analysis',
            recommendations: ['Rest'],
            severity_level: 5,
            generated_at: new Date().toISOString(),
          },
          status: 'completed',
          created_at: '2023-01-02T00:00:00Z',
          updated_at: '2023-01-02T00:00:00Z',
        },
        {
          id: '3',
          user_id: 'user1',
          session_id: 'session3',
          pdf_url: 'url3',
          title: 'Report 3',
          diagnosis_data: null,
          status: 'processing',
          created_at: '2023-01-03T00:00:00Z',
          updated_at: '2023-01-03T00:00:00Z',
        },
      ];

      it('should calculate report statistics correctly', () => {
        const stats = calculateReportStats(mockReportsWithData);

        expect(stats.total).toBe(3);
        expect(stats.completed).toBe(2);
        expect(stats.processing).toBe(1);
        expect(stats.errors).toBe(0);
        expect(stats.completionRate).toBeCloseTo(66.67, 2);
        expect(stats.errorRate).toBe(0);
        expect(stats.reportsWithData).toBe(2);
        expect(stats.dataCompletionRate).toBeCloseTo(66.67, 2);
        expect(stats.averageSeverity).toBe(4); // (3 + 5) / 2
        expect(stats.severityDistribution.level3).toBe(1);
        expect(stats.severityDistribution.level5).toBe(1);
      });
    });
  });

  describe('DiagnosisTypeUtils Export', () => {
    it('should export all utility functions', () => {
      expect(DiagnosisTypeUtils.isDiagnosisError).toBe(isDiagnosisError);
      expect(DiagnosisTypeUtils.createChatMessage).toBe(createChatMessage);
      expect(DiagnosisTypeUtils.getMessageTypeLabel).toBe(getMessageTypeLabel);
      expect(DiagnosisTypeUtils.validateMessageContent).toBe(validateMessageContent);
      expect(DiagnosisTypeUtils.calculateChatSessionStats).toBe(calculateChatSessionStats);
    });
  });
});