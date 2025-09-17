// PDF service tests

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PDFService } from '../pdf.service';
import { DiagnosisErrorType } from '@/types/diagnosis';
import type { DiagnosisData } from '@/types/diagnosis';

// Mock jsPDF and html2canvas
vi.mock('jspdf', () => {
  const mockPDF = {
    setProperties: vi.fn(),
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    splitTextToSize: vi.fn().mockReturnValue(['line 1', 'line 2']),
    output: vi.fn().mockReturnValue(new Blob(['mock pdf content'], { type: 'application/pdf' })),
    internal: {
      pageSize: {
        getWidth: vi.fn().mockReturnValue(210),
        getHeight: vi.fn().mockReturnValue(297),
      },
    },
  };

  return {
    default: vi.fn().mockImplementation(() => mockPDF),
  };
});

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mock'),
  }),
}));

// Mock environment variables for tests
vi.mock('@/lib/diagnosis-config', () => ({
  diagnosisConfig: {
    supabase: {
      url: 'https://test.supabase.co',
      anonKey: 'test-key',
      storageBucket: 'test-bucket'
    },
    n8n: {
      webhookUrl: 'https://test-webhook.com',
      timeout: 30000
    },
    pdf: {
      maxSize: 10485760,
      allowedFormats: ['application/pdf']
    }
  },
  isFeatureEnabled: vi.fn(() => false),
  isDevelopment: false,
  isProduction: false,
  isDebugMode: false
}));

describe('PDFService', () => {
  let pdfService: PDFService;

  const validDiagnosisData: DiagnosisData = {
    patient_info: {
      age: 30,
      gender: 'Feminino',
      medical_history: ['Hipertensão', 'Diabetes'],
    },
    symptoms: [
      {
        description: 'Dor de cabeça frequente',
        severity: 7,
        duration: '2 semanas',
      },
      {
        description: 'Fadiga',
        severity: 5,
        duration: '1 mês',
      },
    ],
    analysis: 'Baseado nos sintomas relatados, há indicações de possível enxaqueca crônica com componente de fadiga associada.',
    recommendations: [
      'Consultar neurologista',
      'Manter diário de dores de cabeça',
      'Evitar fatores desencadeantes conhecidos',
    ],
    severity_level: 3,
    next_steps: [
      'Agendar consulta médica',
      'Realizar exames complementares se necessário',
    ],
    generated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    pdfService = new PDFService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const service = new PDFService();
      expect(service).toBeInstanceOf(PDFService);
    });

    it('should initialize with custom options', () => {
      const customOptions = {
        maxSize: 5242880, // 5MB
        allowedFormats: ['application/pdf'],
        template: 'detailed' as const,
      };

      const service = new PDFService(customOptions);
      expect(service).toBeInstanceOf(PDFService);
    });
  });

  describe('generatePDF', () => {
    it('should generate PDF successfully with valid data', async () => {
      const result = await pdfService.generatePDF(validDiagnosisData);

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Blob);
      expect(result.data?.type).toBe('application/pdf');
      expect(result.metadata?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should generate PDF with custom options', async () => {
      const options = {
        template: 'detailed' as const,
        includeCharts: false,
        includeRecommendations: true,
        includePatientInfo: true,
        language: 'pt-BR' as const,
        format: 'A4' as const,
        orientation: 'landscape' as const,
      };

      const result = await pdfService.generatePDF(validDiagnosisData, options);

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Blob);
    });

    it('should handle invalid diagnosis data', async () => {
      const invalidData = {
        ...validDiagnosisData,
        symptoms: [], // Empty symptoms array
        analysis: '', // Empty analysis
      };

      const result = await pdfService.generatePDF(invalidData);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.PDF_GENERATION_ERROR);
      expect(result.error?.message).toContain('Invalid diagnosis data');
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        symptoms: validDiagnosisData.symptoms,
        // Missing analysis and other required fields
      } as DiagnosisData;

      const result = await pdfService.generatePDF(incompleteData);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.PDF_GENERATION_ERROR);
    });

    it('should handle PDF generation errors', async () => {
      // Mock jsPDF to throw an error
      const jsPDF = await import('jspdf');
      vi.mocked(jsPDF.default).mockImplementationOnce(() => {
        throw new Error('jsPDF error');
      });

      const result = await pdfService.generatePDF(validDiagnosisData);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.PDF_GENERATION_ERROR);
      expect(result.error?.message).toContain('jsPDF error');
    });

    it('should handle PDF size validation', async () => {
      // Create service with very small max size
      const smallSizeService = new PDFService({ maxSize: 10 }); // 10 bytes

      const result = await smallSizeService.generatePDF(validDiagnosisData);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.PDF_GENERATION_ERROR);
      expect(result.error?.message).toContain('exceeds maximum allowed size');
    });
  });

  describe('configuration', () => {
    it('should get current configuration', () => {
      const config = pdfService.getConfiguration();
      
      expect(config).toHaveProperty('maxSize');
      expect(config).toHaveProperty('allowedFormats');
      expect(config).toHaveProperty('template');
    });

    it('should update configuration', () => {
      const newConfig = {
        maxSize: 5242880,
        template: 'detailed' as const,
      };

      pdfService.updateConfiguration(newConfig);
      const updatedConfig = pdfService.getConfiguration();

      expect(updatedConfig.maxSize).toBe(newConfig.maxSize);
      expect(updatedConfig.template).toBe(newConfig.template);
    });
  });

  describe('PDF content validation', () => {
    it('should include patient information when enabled', async () => {
      const options = {
        includePatientInfo: true,
      };

      const result = await pdfService.generatePDF(validDiagnosisData, options);

      expect(result.success).toBe(true);
      // We can't easily test the actual PDF content, but we can verify it was generated
      expect(result.data).toBeInstanceOf(Blob);
    });

    it('should include recommendations when enabled', async () => {
      const options = {
        includeRecommendations: true,
      };

      const result = await pdfService.generatePDF(validDiagnosisData, options);

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Blob);
    });

    it('should handle data without optional fields', async () => {
      const minimalData: DiagnosisData = {
        symptoms: [
          {
            description: 'Test symptom',
            severity: 5,
          },
        ],
        analysis: 'Test analysis',
        recommendations: ['Test recommendation'],
        severity_level: 2,
        generated_at: new Date().toISOString(),
      };

      const result = await pdfService.generatePDF(minimalData);

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Blob);
    });
  });

  describe('error handling', () => {
    it('should handle memory errors', async () => {
      // Mock jsPDF to throw a memory error
      const jsPDF = await import('jspdf');
      vi.mocked(jsPDF.default).mockImplementationOnce(() => {
        throw new Error('Out of memory');
      });

      const result = await pdfService.generatePDF(validDiagnosisData);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.PDF_GENERATION_ERROR);
      expect(result.error?.message).toContain('insufficient memory');
    });

    it('should handle canvas errors', async () => {
      // Mock jsPDF to throw a canvas error
      const jsPDF = await import('jspdf');
      vi.mocked(jsPDF.default).mockImplementationOnce(() => {
        throw new Error('Canvas rendering failed');
      });

      const result = await pdfService.generatePDF(validDiagnosisData);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.PDF_GENERATION_ERROR);
      expect(result.error?.message).toContain('Canvas rendering failed');
    });

    it('should handle generic errors', async () => {
      // Mock jsPDF to throw a generic error
      const jsPDF = await import('jspdf');
      vi.mocked(jsPDF.default).mockImplementationOnce(() => {
        throw new Error('Generic error');
      });

      const result = await pdfService.generatePDF(validDiagnosisData);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.PDF_GENERATION_ERROR);
      expect(result.error?.retryable).toBe(true);
    });
  });

  describe('severity level mapping', () => {
    it('should handle all severity levels', async () => {
      for (let level = 1; level <= 5; level++) {
        const dataWithLevel = {
          ...validDiagnosisData,
          severity_level: level,
        };

        const result = await pdfService.generatePDF(dataWithLevel);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid severity levels', async () => {
      const invalidData = {
        ...validDiagnosisData,
        severity_level: 0, // Invalid level
      };

      const result = await pdfService.generatePDF(invalidData);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.PDF_GENERATION_ERROR);
    });
  });

  describe('template variations', () => {
    it('should generate standard template', async () => {
      const options = {
        template: 'standard' as const,
      };

      const result = await pdfService.generatePDF(validDiagnosisData, options);

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Blob);
    });

    it('should generate detailed template', async () => {
      const options = {
        template: 'detailed' as const,
      };

      const result = await pdfService.generatePDF(validDiagnosisData, options);

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Blob);
    });
  });
});