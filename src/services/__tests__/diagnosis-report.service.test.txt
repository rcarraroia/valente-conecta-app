// Tests for DiagnosisReportService

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DiagnosisReportService } from '../diagnosis-report.service';
import { pdfService } from '../pdf.service';
import { storageService } from '../storage.service';
import { DiagnosisData, DiagnosisErrorType } from '@/types/diagnosis';
import { createDiagnosisError } from '@/utils/diagnosis-utils';

// Mock dependencies
vi.mock('../pdf.service');
vi.mock('../storage.service');
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(),
        })),
      })),
    })),
  })),
}));

// Mock window.dispatchEvent
const mockDispatchEvent = vi.fn();
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
  writable: true,
});

describe('DiagnosisReportService', () => {
  let service: DiagnosisReportService;
  let mockPdfService: any;
  let mockStorageService: any;
  let mockSupabase: any;

  const mockDiagnosisData: DiagnosisData = {
    symptoms: [
      { description: 'Dor de cabeça', severity: 7, duration: '2 dias' },
      { description: 'Febre', severity: 8, duration: '1 dia' },
    ],
    analysis: 'Análise detalhada dos sintomas apresentados pelo paciente.',
    recommendations: [
      'Procurar atendimento médico',
      'Manter repouso',
      'Hidratação adequada',
    ],
    severity_level: 4,
    generated_at: '2025-01-01T10:00:00Z',
    patient_info: {
      age: 30,
      gender: 'Feminino',
      medical_history: ['Hipertensão'],
    },
    next_steps: [
      'Agendar consulta médica',
      'Realizar exames complementares',
    ],
  };

  const mockUserId = 'user-123';
  const mockSessionId = 'session-456';

  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatchEvent.mockClear();

    service = new DiagnosisReportService();
    
    mockPdfService = vi.mocked(pdfService);
    mockStorageService = vi.mocked(storageService);

    // Setup default successful mocks
    mockPdfService.generatePDF.mockResolvedValue({
      success: true,
      data: new Blob(['mock pdf content'], { type: 'application/pdf' }),
      metadata: { timestamp: new Date(), duration: 1000 },
    });

    mockStorageService.generateFileName.mockReturnValue('diagnosis-report-user-123-2025-01-01.pdf');
    mockStorageService.uploadFile.mockResolvedValue({
      success: true,
      data: { path: 'diagnosis-reports/user-123/diagnosis-report-user-123-2025-01-01.pdf', fullPath: 'diagnosis-reports/user-123/diagnosis-report-user-123-2025-01-01.pdf' },
      metadata: { timestamp: new Date(), duration: 500 },
    });

    mockStorageService.getSignedUrl.mockResolvedValue({
      success: true,
      data: 'https://signed-url.com/report.pdf',
      metadata: { timestamp: new Date(), duration: 100 },
    });

    // Mock Supabase client
    const mockSupabaseClient = {
      from: vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'report-789',
                user_id: mockUserId,
                session_id: mockSessionId,
                title: 'Pré-Diagnóstico - Alto - 01/01/2025',
                pdf_url: 'diagnosis-reports/user-123/diagnosis-report-user-123-2025-01-01.pdf',
                status: 'completed',
                created_at: '2025-01-01T10:00:00Z',
                updated_at: '2025-01-01T10:00:00Z',
              },
              error: null,
            }),
          })),
        })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'report-789',
                  pdf_url: 'diagnosis-reports/user-123/diagnosis-report-user-123-2025-01-01.pdf',
                },
                error: null,
              }),
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
        })),
      })),
    };

    // Replace the supabase client in the service
    (service as any).supabase = mockSupabaseClient;
    mockSupabase = mockSupabaseClient;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateAndSaveReport', () => {
    it('should generate and save report successfully', async () => {
      const result = await service.generateAndSaveReport(
        mockUserId,
        mockSessionId,
        mockDiagnosisData
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        reportId: 'report-789',
        pdfUrl: 'diagnosis-reports/user-123/diagnosis-report-user-123-2025-01-01.pdf',
        signedUrl: 'https://signed-url.com/report.pdf',
        metadata: {
          fileSize: expect.any(Number),
          generationTime: expect.any(Number),
          uploadTime: expect.any(Number),
          totalTime: expect.any(Number),
        },
      });

      // Verify PDF generation was called
      expect(mockPdfService.generatePDF).toHaveBeenCalledWith(
        mockDiagnosisData,
        {
          includePatientInfo: true,
          includeRecommendations: true,
        }
      );

      // Verify storage upload was called
      expect(mockStorageService.uploadFile).toHaveBeenCalled();

      // Verify signed URL generation was called
      expect(mockStorageService.getSignedUrl).toHaveBeenCalled();

      // Verify database insert was called
      expect(mockSupabase.from).toHaveBeenCalledWith('relatorios_diagnostico');

      // Verify notification event was dispatched
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'diagnosis-report-ready',
          detail: expect.objectContaining({
            title: 'Relatório Pronto',
            reportTitle: expect.stringContaining('Pré-Diagnóstico'),
          }),
        })
      );
    });

    it('should handle PDF generation failure', async () => {
      mockPdfService.generatePDF.mockResolvedValue({
        success: false,
        error: createDiagnosisError(
          DiagnosisErrorType.PDF_GENERATION_ERROR,
          'PDF generation failed',
          null,
          true
        ),
      });

      const result = await service.generateAndSaveReport(
        mockUserId,
        mockSessionId,
        mockDiagnosisData
      );

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.PDF_GENERATION_ERROR);
      expect(result.error?.message).toContain('PDF generation failed');
    });

    it('should handle storage upload failure', async () => {
      mockStorageService.uploadFile.mockResolvedValue({
        success: false,
        error: createDiagnosisError(
          DiagnosisErrorType.SUPABASE_ERROR,
          'Upload failed',
          null,
          true
        ),
      });

      const result = await service.generateAndSaveReport(
        mockUserId,
        mockSessionId,
        mockDiagnosisData
      );

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.SUPABASE_ERROR);
      expect(result.error?.message).toContain('PDF upload failed');
    });

    it('should handle database save failure', async () => {
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await service.generateAndSaveReport(
        mockUserId,
        mockSessionId,
        mockDiagnosisData
      );

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.SUPABASE_ERROR);
      expect(result.error?.message).toContain('Failed to save report metadata');
    });

    it('should use custom options when provided', async () => {
      const customOptions = {
        title: 'Custom Report Title',
        includePatientInfo: false,
        includeRecommendations: false,
        notifyUser: false,
      };

      await service.generateAndSaveReport(
        mockUserId,
        mockSessionId,
        mockDiagnosisData,
        customOptions
      );

      expect(mockPdfService.generatePDF).toHaveBeenCalledWith(
        mockDiagnosisData,
        {
          includePatientInfo: false,
          includeRecommendations: false,
        }
      );

      // Should not dispatch notification event when notifyUser is false
      expect(mockDispatchEvent).not.toHaveBeenCalled();
    });
  });

  describe('getReportWithSignedUrl', () => {
    it('should get report with signed URL successfully', async () => {
      const result = await service.getReportWithSignedUrl('report-789', mockUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        report: {
          id: 'report-789',
          pdf_url: 'diagnosis-reports/user-123/diagnosis-report-user-123-2025-01-01.pdf',
        },
        signedUrl: 'https://signed-url.com/report.pdf',
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('relatorios_diagnostico');
      expect(mockStorageService.getSignedUrl).toHaveBeenCalled();
    });

    it('should handle report not found', async () => {
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Report not found' },
      });

      const result = await service.getReportWithSignedUrl('nonexistent', mockUserId);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.SUPABASE_ERROR);
      expect(result.error?.message).toContain('Report not found');
    });
  });

  describe('updateReportStatus', () => {
    it('should update report status successfully', async () => {
      const result = await service.updateReportStatus('report-789', mockUserId, 'completed');

      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('relatorios_diagnostico');
    });

    it('should handle update failure', async () => {
      mockSupabase.from().update().eq().eq.mockResolvedValue({
        error: { message: 'Update failed' },
      });

      const result = await service.updateReportStatus('report-789', mockUserId, 'failed');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.SUPABASE_ERROR);
    });
  });

  describe('deleteReport', () => {
    it('should delete report and PDF file successfully', async () => {
      mockStorageService.deleteFile.mockResolvedValue({
        success: true,
        data: undefined,
      });

      const result = await service.deleteReport('report-789', mockUserId);

      expect(result.success).toBe(true);
      expect(mockStorageService.deleteFile).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('relatorios_diagnostico');
    });

    it('should continue with database deletion even if file deletion fails', async () => {
      mockStorageService.deleteFile.mockResolvedValue({
        success: false,
        error: createDiagnosisError(
          DiagnosisErrorType.SUPABASE_ERROR,
          'File not found',
          null,
          false
        ),
      });

      const result = await service.deleteReport('report-789', mockUserId);

      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('relatorios_diagnostico');
    });

    it('should handle report not found for deletion', async () => {
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Report not found' },
      });

      const result = await service.deleteReport('nonexistent', mockUserId);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.SUPABASE_ERROR);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockPdfService.generatePDF.mockRejectedValue(networkError);

      const result = await service.generateAndSaveReport(
        mockUserId,
        mockSessionId,
        mockDiagnosisData
      );

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Network error');
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('unauthorized');
      mockStorageService.uploadFile.mockRejectedValue(authError);

      const result = await service.generateAndSaveReport(
        mockUserId,
        mockSessionId,
        mockDiagnosisData
      );

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.AUTHENTICATION_ERROR);
    });

    it('should handle unknown errors', async () => {
      const unknownError = new Error('Something went wrong');
      mockPdfService.generatePDF.mockRejectedValue(unknownError);

      const result = await service.generateAndSaveReport(
        mockUserId,
        mockSessionId,
        mockDiagnosisData
      );

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.UNKNOWN_ERROR);
    });
  });

  describe('title generation', () => {
    it('should generate appropriate titles for different severity levels', async () => {
      const testCases = [
        { severity: 1, expected: 'Muito Baixo' },
        { severity: 2, expected: 'Baixo' },
        { severity: 3, expected: 'Moderado' },
        { severity: 4, expected: 'Alto' },
        { severity: 5, expected: 'Muito Alto' },
      ];

      for (const testCase of testCases) {
        const diagnosisData = { ...mockDiagnosisData, severity_level: testCase.severity };
        
        await service.generateAndSaveReport(mockUserId, mockSessionId, diagnosisData);

        const insertCall = mockSupabase.from().insert.mock.calls[mockSupabase.from().insert.mock.calls.length - 1];
        const reportData = insertCall[0];
        
        expect(reportData.title).toContain(testCase.expected);
      }
    });
  });

  describe('metadata tracking', () => {
    it('should track generation times and file sizes', async () => {
      const result = await service.generateAndSaveReport(
        mockUserId,
        mockSessionId,
        mockDiagnosisData
      );

      expect(result.data?.metadata).toEqual({
        fileSize: expect.any(Number),
        generationTime: expect.any(Number),
        uploadTime: expect.any(Number),
        totalTime: expect.any(Number),
      });

      expect(result.data?.metadata.totalTime).toBeGreaterThan(0);
      expect(result.data?.metadata.generationTime).toBeGreaterThan(0);
      expect(result.data?.metadata.uploadTime).toBeGreaterThan(0);
    });
  });
});