// Tests for useReports hook

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useReports } from '../useReports';
import { supabase } from '@/integrations/supabase/client';
import { storageService } from '@/services/storage.service';
import { pdfService } from '@/services/pdf.service';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import type { DiagnosisData, DiagnosisReport } from '@/types/diagnosis';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('@/services/storage.service', () => ({
  storageService: {
    uploadFile: vi.fn(),
    deleteFile: vi.fn(),
    getSignedUrl: vi.fn(),
  },
}));

vi.mock('@/services/pdf.service', () => ({
  pdfService: {
    generatePDF: vi.fn(),
  },
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn(),
}));

describe('useReports', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockToast = vi.fn();

  const mockDiagnosisData: DiagnosisData = {
    symptoms: [
      { description: 'Dor de cabeça', severity: 7, duration: '2 dias' },
    ],
    analysis: 'Possível enxaqueca baseada nos sintomas relatados.',
    recommendations: ['Consultar neurologista', 'Evitar fatores desencadeantes'],
    severity_level: 3,
    generated_at: new Date().toISOString(),
    patient_info: {
      age: 30,
      gender: 'Feminino',
    },
  };

  const mockReport: DiagnosisReport = {
    id: 'report-123',
    user_id: 'user-123',
    session_id: 'session-123',
    title: 'Pré-diagnóstico - 30 anos - 01/01/2024',
    diagnosis_data: mockDiagnosisData,
    pdf_url: 'https://storage.example.com/report.pdf',
    status: 'completed',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  };

  const mockSupabaseQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
    } as any);

    vi.mocked(useToast).mockReturnValue({
      toast: mockToast,
    });

    vi.mocked(supabase.from).mockReturnValue(mockSupabaseQuery as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useReports());

      expect(result.current.state.reports).toEqual([]);
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.isCreating).toBe(false);
      expect(result.current.state.isDeleting).toBe(false);
      expect(result.current.state.error).toBeNull();
      expect(result.current.state.totalCount).toBe(0);
      expect(result.current.state.hasMore).toBe(false);
    });

    it('should provide all required actions', () => {
      const { result } = renderHook(() => useReports());

      expect(typeof result.current.actions.fetchReports).toBe('function');
      expect(typeof result.current.actions.createReport).toBe('function');
      expect(typeof result.current.actions.deleteReport).toBe('function');
      expect(typeof result.current.actions.downloadReport).toBe('function');
      expect(typeof result.current.actions.refreshReports).toBe('function');
      expect(typeof result.current.actions.loadMoreReports).toBe('function');
      expect(typeof result.current.actions.clearError).toBe('function');
    });
  });

  describe('fetchReports', () => {
    it('should fetch reports successfully', async () => {
      mockSupabaseQuery.select.mockResolvedValue({
        data: [mockReport],
        error: null,
        count: 1,
      });

      const { result } = renderHook(() => useReports());

      await act(async () => {
        await result.current.actions.fetchReports();
      });

      expect(result.current.state.reports).toHaveLength(1);
      expect(result.current.state.reports[0].id).toBe('report-123');
      expect(result.current.state.totalCount).toBe(1);
      expect(result.current.state.isLoading).toBe(false);
    });

    it('should handle unauthenticated user', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        signOut: vi.fn(),
      } as any);

      const { result } = renderHook(() => useReports());

      await act(async () => {
        await result.current.actions.fetchReports();
      });

      expect(result.current.state.error).toBe('Usuário não autenticado');
    });
  });

  describe('createReport', () => {
    it('should create report successfully', async () => {
      // Mock PDF generation
      vi.mocked(pdfService.generatePDF).mockResolvedValue({
        success: true,
        data: new Blob(['pdf content'], { type: 'application/pdf' }),
        metadata: { timestamp: new Date(), duration: 1000 },
      });

      // Mock storage upload
      vi.mocked(storageService.uploadFile).mockResolvedValue({
        success: true,
        data: 'https://storage.example.com/report.pdf',
        metadata: { timestamp: new Date(), duration: 500 },
      });

      // Mock database insert
      mockSupabaseQuery.single.mockResolvedValue({
        data: mockReport,
        error: null,
      });

      const { result } = renderHook(() => useReports());

      let createdReport: DiagnosisReport;
      await act(async () => {
        createdReport = await result.current.actions.createReport(mockDiagnosisData, 'session-123');
      });

      expect(createdReport!.id).toBe('report-123');
      expect(result.current.state.reports).toHaveLength(1);
      expect(result.current.state.totalCount).toBe(1);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Relatório Criado',
        description: 'Seu relatório de diagnóstico foi criado com sucesso.',
      });
    });

    it('should handle unauthenticated user', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        signOut: vi.fn(),
      } as any);

      const { result } = renderHook(() => useReports());

      await act(async () => {
        try {
          await result.current.actions.createReport(mockDiagnosisData);
        } catch (error: any) {
          expect(error.message).toBe('Usuário não autenticado');
        }
      });
    });
  });

  describe('utility functions', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useReports());

      act(() => {
        result.current.actions.clearError();
      });

      expect(result.current.state.error).toBeNull();
    });
  });
});