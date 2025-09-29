// Tests for diagnosis validation schemas

import { describe, it, expect } from 'vitest';
import {
  chatMessageSchema,
  diagnosisDataSchema,
  n8nWebhookRequestSchema,
  n8nWebhookResponseSchema,
  diagnosisReportSchema,
  diagnosisChatSessionSchema,
  validateChatMessage,
  validateDiagnosisData,
  validateN8nWebhookRequest,
  validateN8nWebhookResponse,
  safeParseChatMessage,
  safeParseDiagnosisData,
  serviceResponseSchema,
  pdfGenerationOptionsSchema,
  analyticsEventSchema,
  performanceMetricSchema,
  healthCheckResultSchema,
} from '../diagnosis.schema';

describe('Diagnosis Schema Validation', () => {
  describe('chatMessageSchema', () => {
    it('should validate a valid chat message', () => {
      const validMessage = {
        id: 'msg_123',
        type: 'user' as const,
        content: 'Hello, I need help with my symptoms',
        timestamp: new Date(),
        status: 'sent' as const,
      };

      const result = chatMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    it('should reject message with empty content', () => {
      const invalidMessage = {
        id: 'msg_123',
        type: 'user' as const,
        content: '',
        timestamp: new Date(),
      };

      const result = chatMessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
    });

    it('should reject message with invalid type', () => {
      const invalidMessage = {
        id: 'msg_123',
        type: 'invalid' as any,
        content: 'Hello',
        timestamp: new Date(),
      };

      const result = chatMessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
    });

    it('should work with validation helper function', () => {
      const validMessage = {
        id: 'msg_123',
        type: 'ai' as const,
        content: 'How can I help you today?',
        timestamp: new Date(),
      };

      expect(() => validateChatMessage(validMessage)).not.toThrow();
    });

    it('should work with safe parse helper', () => {
      const validMessage = {
        id: 'msg_123',
        type: 'system' as const,
        content: 'Session started',
        timestamp: new Date(),
      };

      const result = safeParseChatMessage(validMessage);
      expect(result.success).toBe(true);
    });
  });

  describe('diagnosisDataSchema', () => {
    it('should validate complete diagnosis data', () => {
      const validData = {
        patient_info: {
          age: 30,
          gender: 'female',
          medical_history: ['diabetes', 'hypertension'],
        },
        symptoms: [
          {
            description: 'Headache',
            severity: 7,
            duration: '2 days',
          },
          {
            description: 'Nausea',
            severity: 5,
          },
        ],
        analysis: 'Based on the symptoms, this could be a migraine episode.',
        recommendations: [
          'Rest in a dark room',
          'Stay hydrated',
          'Consider over-the-counter pain relief',
        ],
        severity_level: 3,
        next_steps: ['Monitor symptoms', 'Consult doctor if persists'],
        generated_at: new Date().toISOString(),
      };

      const result = diagnosisDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate minimal diagnosis data', () => {
      const minimalData = {
        patient_info: {},
        symptoms: [
          {
            description: 'Fever',
            severity: 6,
          },
        ],
        analysis: 'Possible viral infection',
        recommendations: ['Rest', 'Fluids'],
        severity_level: 2,
        generated_at: new Date().toISOString(),
      };

      const result = diagnosisDataSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should reject data with invalid severity level', () => {
      const invalidData = {
        patient_info: {},
        symptoms: [{ description: 'Pain', severity: 5 }],
        analysis: 'Test analysis',
        recommendations: ['Test recommendation'],
        severity_level: 6, // Invalid: should be 1-5
        generated_at: new Date().toISOString(),
      };

      const result = diagnosisDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject data with empty symptoms array', () => {
      const invalidData = {
        patient_info: {},
        symptoms: [], // Invalid: should have at least one symptom
        analysis: 'Test analysis',
        recommendations: ['Test recommendation'],
        severity_level: 3,
        generated_at: new Date().toISOString(),
      };

      const result = diagnosisDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should work with validation helper function', () => {
      const validData = {
        patient_info: { age: 25 },
        symptoms: [{ description: 'Cough', severity: 4 }],
        analysis: 'Possible cold',
        recommendations: ['Rest'],
        severity_level: 1,
        generated_at: new Date().toISOString(),
      };

      expect(() => validateDiagnosisData(validData)).not.toThrow();
    });
  });

  describe('n8nWebhookRequestSchema', () => {
    it('should validate valid webhook request', () => {
      const validRequest = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        text: 'I have been experiencing headaches',
        session_id: 'session_123',
      };

      const result = n8nWebhookRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should validate request without session_id', () => {
      const validRequest = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        text: 'I have been experiencing headaches',
      };

      const result = n8nWebhookRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject request with invalid UUID', () => {
      const invalidRequest = {
        user_id: 'invalid-uuid',
        text: 'I have been experiencing headaches',
      };

      const result = n8nWebhookRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject request with empty text', () => {
      const invalidRequest = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        text: '',
      };

      const result = n8nWebhookRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should work with validation helper function', () => {
      const validRequest = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        text: 'Test message',
      };

      expect(() => validateN8nWebhookRequest(validRequest)).not.toThrow();
    });
  });

  describe('n8nWebhookResponseSchema', () => {
    it('should validate complete webhook response', () => {
      const validResponse = {
        response: 'Thank you for sharing your symptoms. Can you tell me more about the headaches?',
        is_final: false,
        session_id: 'session_123',
      };

      const result = n8nWebhookResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate final response with diagnosis data', () => {
      const validResponse = {
        response: 'Based on your symptoms, here is my analysis...',
        is_final: true,
        diagnosis_data: {
          patient_info: { age: 30 },
          symptoms: [{ description: 'Headache', severity: 7 }],
          analysis: 'Possible migraine',
          recommendations: ['Rest'],
          severity_level: 3,
          generated_at: new Date().toISOString(),
        },
        session_id: 'session_123',
      };

      const result = n8nWebhookResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate error response', () => {
      const errorResponse = {
        response: 'I apologize, but I encountered an error processing your request.',
        error: 'Internal processing error',
        session_id: 'session_123',
      };

      const result = n8nWebhookResponseSchema.safeParse(errorResponse);
      expect(result.success).toBe(true);
    });

    it('should reject response without session_id', () => {
      const invalidResponse = {
        response: 'Test response',
      };

      const result = n8nWebhookResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should work with validation helper function', () => {
      const validResponse = {
        response: 'Test response',
        session_id: 'session_123',
      };

      expect(() => validateN8nWebhookResponse(validResponse)).not.toThrow();
    });
  });

  describe('diagnosisReportSchema', () => {
    it('should validate complete diagnosis report', () => {
      const validReport = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        session_id: 'session_123',
        pdf_url: 'https://storage.example.com/reports/report.pdf',
        title: 'Diagnosis Report - Headache Analysis',
        diagnosis_data: {
          patient_info: { age: 30 },
          symptoms: [{ description: 'Headache', severity: 7 }],
          analysis: 'Possible migraine',
          recommendations: ['Rest'],
          severity_level: 3,
          generated_at: new Date().toISOString(),
        },
        status: 'completed' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = diagnosisReportSchema.safeParse(validReport);
      expect(result.success).toBe(true);
    });

    it('should validate report with null diagnosis_data', () => {
      const validReport = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        session_id: null,
        pdf_url: 'https://storage.example.com/reports/report.pdf',
        title: 'Processing Report',
        diagnosis_data: null,
        status: 'processing' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = diagnosisReportSchema.safeParse(validReport);
      expect(result.success).toBe(true);
    });

    it('should reject report with invalid status', () => {
      const invalidReport = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        session_id: null,
        pdf_url: 'https://storage.example.com/reports/report.pdf',
        title: 'Test Report',
        diagnosis_data: null,
        status: 'invalid_status' as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = diagnosisReportSchema.safeParse(invalidReport);
      expect(result.success).toBe(false);
    });
  });

  describe('serviceResponseSchema', () => {
    it('should validate successful service response', () => {
      const successResponse = {
        success: true,
        data: { message: 'Operation completed successfully' },
        metadata: {
          timestamp: new Date(),
          requestId: 'req_123',
          duration: 150,
        },
      };

      const result = serviceResponseSchema.safeParse(successResponse);
      expect(result.success).toBe(true);
    });

    it('should validate error service response', () => {
      const errorResponse = {
        success: false,
        error: {
          type: 'NETWORK_ERROR',
          message: 'Connection failed',
          retryable: true,
          timestamp: new Date(),
        },
        metadata: {
          timestamp: new Date(),
          duration: 5000,
        },
      };

      const result = serviceResponseSchema.safeParse(errorResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('pdfGenerationOptionsSchema', () => {
    it('should validate with default values', () => {
      const options = {
        template: 'standard' as const,
      };

      const result = pdfGenerationOptionsSchema.safeParse(options);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.includeCharts).toBe(true);
        expect(result.data.language).toBe('pt-BR');
        expect(result.data.format).toBe('A4');
        expect(result.data.orientation).toBe('portrait');
      }
    });

    it('should validate with custom values', () => {
      const options = {
        template: 'detailed' as const,
        includeCharts: false,
        includeRecommendations: true,
        includePatientInfo: false,
        orientation: 'landscape' as const,
      };

      const result = pdfGenerationOptionsSchema.safeParse(options);
      expect(result.success).toBe(true);
    });
  });

  describe('analyticsEventSchema', () => {
    it('should validate complete analytics event', () => {
      const event = {
        name: 'chat_message_sent',
        category: 'chat' as const,
        action: 'send_message',
        label: 'user_message',
        value: 1,
        userId: '123e4567-e89b-12d3-a456-426614174000',
        sessionId: 'session_123',
        timestamp: new Date(),
        properties: {
          messageLength: 50,
          messageType: 'text',
        },
      };

      const result = analyticsEventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('should validate minimal analytics event', () => {
      const event = {
        name: 'pdf_generated',
        category: 'pdf' as const,
        action: 'generate',
        timestamp: new Date(),
      };

      const result = analyticsEventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });
  });

  describe('performanceMetricSchema', () => {
    it('should validate performance metric', () => {
      const metric = {
        name: 'api_response_time',
        value: 250,
        unit: 'ms' as const,
        category: 'api' as const,
        timestamp: new Date(),
        metadata: {
          endpoint: '/api/chat/send',
          method: 'POST',
        },
      };

      const result = performanceMetricSchema.safeParse(metric);
      expect(result.success).toBe(true);
    });

    it('should reject metric with negative value', () => {
      const metric = {
        name: 'invalid_metric',
        value: -100,
        unit: 'ms' as const,
        category: 'api' as const,
        timestamp: new Date(),
      };

      const result = performanceMetricSchema.safeParse(metric);
      expect(result.success).toBe(false);
    });
  });

  describe('healthCheckResultSchema', () => {
    it('should validate healthy service result', () => {
      const result = {
        service: 'chat_service',
        status: 'healthy' as const,
        message: 'Service is operating normally',
        responseTime: 50,
        timestamp: new Date(),
        details: {
          version: '1.0.0',
          uptime: 3600,
        },
      };

      const validation = healthCheckResultSchema.safeParse(result);
      expect(validation.success).toBe(true);
    });

    it('should validate unhealthy service result', () => {
      const result = {
        service: 'database_service',
        status: 'unhealthy' as const,
        message: 'Connection timeout',
        timestamp: new Date(),
      };

      const validation = healthCheckResultSchema.safeParse(result);
      expect(validation.success).toBe(true);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null values appropriately', () => {
      const result = chatMessageSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should handle undefined values appropriately', () => {
      const result = diagnosisDataSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it('should handle empty objects', () => {
      const result = n8nWebhookRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should handle arrays instead of objects', () => {
      const result = diagnosisReportSchema.safeParse([]);
      expect(result.success).toBe(false);
    });

    it('should handle strings instead of objects', () => {
      const result = serviceResponseSchema.safeParse('invalid');
      expect(result.success).toBe(false);
    });
  });

  describe('Complex nested validation', () => {
    it('should validate deeply nested diagnosis data', () => {
      const complexData = {
        patient_info: {
          age: 45,
          gender: 'male',
          medical_history: [
            'Type 2 Diabetes',
            'Hypertension',
            'Previous heart surgery',
          ],
        },
        symptoms: [
          {
            description: 'Chest pain radiating to left arm',
            severity: 9,
            duration: '30 minutes',
          },
          {
            description: 'Shortness of breath',
            severity: 8,
            duration: '20 minutes',
          },
          {
            description: 'Nausea and sweating',
            severity: 6,
            duration: '15 minutes',
          },
        ],
        analysis: 'Based on the constellation of symptoms including severe chest pain radiating to the left arm, shortness of breath, and associated nausea and sweating, combined with the patient\'s history of diabetes and hypertension, this presentation is highly suggestive of an acute myocardial infarction (heart attack).',
        recommendations: [
          'IMMEDIATE EMERGENCY MEDICAL ATTENTION REQUIRED',
          'Call 911 or go to the nearest emergency room immediately',
          'Do not drive yourself - have someone else drive or call an ambulance',
          'If available, chew one aspirin (unless allergic)',
          'Remain calm and rest while waiting for medical help',
        ],
        severity_level: 5,
        next_steps: [
          'Emergency room evaluation with ECG and cardiac enzymes',
          'Immediate cardiology consultation',
          'Possible cardiac catheterization',
          'Continuous cardiac monitoring',
        ],
        generated_at: new Date().toISOString(),
      };

      const result = diagnosisDataSchema.safeParse(complexData);
      expect(result.success).toBe(true);
    });

    it('should validate complex service response with nested data', () => {
      const complexResponse = {
        success: true,
        data: {
          report: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            user_id: '123e4567-e89b-12d3-a456-426614174001',
            session_id: 'session_123',
            pdf_url: 'https://storage.example.com/reports/report.pdf',
            title: 'Emergency Diagnosis Report',
            diagnosis_data: {
              patient_info: { age: 45, gender: 'male' },
              symptoms: [{ description: 'Chest pain', severity: 9 }],
              analysis: 'Possible heart attack',
              recommendations: ['Emergency care'],
              severity_level: 5,
              generated_at: new Date().toISOString(),
            },
            status: 'completed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          analytics: {
            processingTime: 1500,
            confidence: 0.95,
            riskLevel: 'high',
          },
        },
        metadata: {
          timestamp: new Date(),
          requestId: 'req_emergency_123',
          duration: 2000,
        },
      };

      const result = serviceResponseSchema.safeParse(complexResponse);
      expect(result.success).toBe(true);
    });
  });
});