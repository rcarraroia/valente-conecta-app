// Hook for managing diagnosis reports

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { storageService } from '@/services/storage.service';
import { pdfService } from '@/services/pdf.service';
import type { Database } from '@/integrations/supabase/types';
import type { DiagnosisData, DiagnosisReport } from '@/types/diagnosis';

// Type aliases for better readability
type ReportRow = Database['public']['Tables']['relatorios_diagnostico']['Row'];
type ReportInsert = Database['public']['Tables']['relatorios_diagnostico']['Insert'];
type ReportUpdate = Database['public']['Tables']['relatorios_diagnostico']['Update'];

export interface ReportFilters {
  status?: 'pending' | 'completed' | 'error';
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

export interface ReportSortOptions {
  field: 'created_at' | 'title' | 'status';
  direction: 'asc' | 'desc';
}

export interface ReportsState {
  reports: DiagnosisReport[];
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
}

export interface ReportsActions {
  fetchReports: (filters?: ReportFilters, sort?: ReportSortOptions) => Promise<void>;
  createReport: (diagnosisData: DiagnosisData, sessionId?: string) => Promise<DiagnosisReport>;
  deleteReport: (reportId: string) => Promise<void>;
  downloadReport: (reportId: string) => Promise<void>;
  refreshReports: () => Promise<void>;
  loadMoreReports: () => Promise<void>;
  clearError: () => void;
}

export interface UseReportsReturn {
  state: ReportsState;
  actions: ReportsActions;
}

/**
 * Hook for managing diagnosis reports
 */
export const useReports = (): UseReportsReturn => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [reports, setReports] = useState<DiagnosisReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Current filters and pagination
  const [currentFilters, setCurrentFilters] = useState<ReportFilters>({});
  const [currentSort, setCurrentSort] = useState<ReportSortOptions>({
    field: 'created_at',
    direction: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  /**
   * Converts Supabase row to DiagnosisReport
   */
  const convertRowToReport = useCallback((row: ReportRow): DiagnosisReport => {
    return {
      id: row.id,
      user_id: row.user_id,
      session_id: row.session_id || undefined,
      title: row.title,
      diagnosis_data: row.diagnosis_data as DiagnosisData | null,
      pdf_url: row.pdf_url,
      status: row.status as 'pending' | 'completed' | 'error',
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }, []);

  /**
   * Fetches reports from Supabase with filters and sorting
   */
  const fetchReports = useCallback(async (
    filters?: ReportFilters,
    sort?: ReportSortOptions,
    reset = true
  ) => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update current filters and sort
      if (filters !== undefined) setCurrentFilters(filters);
      if (sort !== undefined) setCurrentSort(sort);
      if (reset) setCurrentPage(0);

      const activeFilters = filters || currentFilters;
      const activeSort = sort || currentSort;
      const page = reset ? 0 : currentPage;

      // Build query
      let query = supabase
        .from('relatorios_diagnostico')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order(activeSort.field, { ascending: activeSort.direction === 'asc' });

      // Apply filters
      if (activeFilters.status) {
        query = query.eq('status', activeFilters.status);
      }

      if (activeFilters.dateFrom) {
        query = query.gte('created_at', activeFilters.dateFrom.toISOString());
      }

      if (activeFilters.dateTo) {
        query = query.lte('created_at', activeFilters.dateTo.toISOString());
      }

      if (activeFilters.searchTerm) {
        query = query.ilike('title', `%${activeFilters.searchTerm}%`);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const newReports = (data || []).map(convertRowToReport);

      if (reset) {
        setReports(newReports);
      } else {
        setReports(prev => [...prev, ...newReports]);
      }

      setTotalCount(count || 0);
      setHasMore(newReports.length === pageSize);

      if (!reset) {
        setCurrentPage(page + 1);
      }

    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao carregar relatórios';
      setError(errorMsg);
      
      toast({
        title: 'Erro ao Carregar Relatórios',
        description: errorMsg,
        variant: 'destructive',
      });

      console.error('Erro ao buscar relatórios:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentFilters, currentSort, currentPage, convertRowToReport, toast]);

  /**
   * Creates a new diagnosis report
   */
  const createReport = useCallback(async (
    diagnosisData: DiagnosisData,
    sessionId?: string
  ): Promise<DiagnosisReport> => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    setIsCreating(true);
    setError(null);

    try {
      // Generate PDF
      const pdfResult = await pdfService.generatePDF(diagnosisData);
      
      if (!pdfResult.success || !pdfResult.data) {
        throw new Error(pdfResult.error?.message || 'Erro ao gerar PDF');
      }

      // Upload PDF to storage
      const fileName = `relatorio_${user.id}_${Date.now()}.pdf`;
      const uploadResult = await storageService.uploadFile(pdfResult.data, fileName);

      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.error?.message || 'Erro ao fazer upload do PDF');
      }

      // Generate title based on diagnosis data
      const title = generateReportTitle(diagnosisData);

      // Create report record in database
      const reportData: ReportInsert = {
        user_id: user.id,
        session_id: sessionId,
        title,
        diagnosis_data: diagnosisData as any,
        pdf_url: uploadResult.data,
        status: 'completed',
      };

      const { data, error: insertError } = await supabase
        .from('relatorios_diagnostico')
        .insert(reportData)
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      const newReport = convertRowToReport(data);

      // Add to local state
      setReports(prev => [newReport, ...prev]);
      setTotalCount(prev => prev + 1);

      toast({
        title: 'Relatório Criado',
        description: 'Seu relatório de diagnóstico foi criado com sucesso.',
      });

      return newReport;

    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao criar relatório';
      setError(errorMsg);

      toast({
        title: 'Erro ao Criar Relatório',
        description: errorMsg,
        variant: 'destructive',
      });

      console.error('Erro ao criar relatório:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [user?.id, convertRowToReport, toast]);

  /**
   * Deletes a report
   */
  const deleteReport = useCallback(async (reportId: string) => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      // Find the report to get PDF URL
      const report = reports.find(r => r.id === reportId);
      
      if (!report) {
        throw new Error('Relatório não encontrado');
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('relatorios_diagnostico')
        .delete()
        .eq('id', reportId)
        .eq('user_id', user.id); // Security check

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      // Try to delete PDF from storage (non-blocking)
      try {
        const fileName = report.pdf_url.split('/').pop();
        if (fileName) {
          await storageService.deleteFile(fileName);
        }
      } catch (storageError) {
        console.warn('Erro ao deletar PDF do storage:', storageError);
        // Don't throw - report was deleted from database successfully
      }

      // Remove from local state
      setReports(prev => prev.filter(r => r.id !== reportId));
      setTotalCount(prev => prev - 1);

      toast({
        title: 'Relatório Excluído',
        description: 'O relatório foi excluído com sucesso.',
      });

    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao excluir relatório';
      setError(errorMsg);

      toast({
        title: 'Erro ao Excluir Relatório',
        description: errorMsg,
        variant: 'destructive',
      });

      console.error('Erro ao deletar relatório:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [user?.id, reports, toast]);

  /**
   * Downloads a report PDF
   */
  const downloadReport = useCallback(async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    
    if (!report) {
      toast({
        title: 'Relatório Não Encontrado',
        description: 'O relatório solicitado não foi encontrado.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Get signed URL for download
      const fileName = report.pdf_url.split('/').pop();
      if (!fileName) {
        throw new Error('Nome do arquivo não encontrado');
      }

      const urlResult = await storageService.getSignedUrl(fileName);
      
      if (!urlResult.success || !urlResult.data) {
        throw new Error(urlResult.error?.message || 'Erro ao gerar URL de download');
      }

      // Open download in new tab
      window.open(urlResult.data, '_blank');

      toast({
        title: 'Download Iniciado',
        description: 'O download do relatório foi iniciado.',
      });

    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao fazer download do relatório';
      
      toast({
        title: 'Erro no Download',
        description: errorMsg,
        variant: 'destructive',
      });

      console.error('Erro ao fazer download:', error);
    }
  }, [reports, toast]);

  /**
   * Refreshes the reports list
   */
  const refreshReports = useCallback(async () => {
    await fetchReports(currentFilters, currentSort, true);
  }, [fetchReports, currentFilters, currentSort]);

  /**
   * Loads more reports (pagination)
   */
  const loadMoreReports = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchReports(currentFilters, currentSort, false);
  }, [fetchReports, currentFilters, currentSort, hasMore, isLoading]);

  /**
   * Clears error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch reports when user changes
  useEffect(() => {
    if (user?.id) {
      fetchReports();
    } else {
      setReports([]);
      setTotalCount(0);
      setHasMore(false);
    }
  }, [user?.id, fetchReports]);

  const state: ReportsState = {
    reports,
    isLoading,
    isCreating,
    isDeleting,
    error,
    totalCount,
    hasMore,
  };

  const actions: ReportsActions = {
    fetchReports: (filters, sort) => fetchReports(filters, sort, true),
    createReport,
    deleteReport,
    downloadReport,
    refreshReports,
    loadMoreReports,
    clearError,
  };

  return {
    state,
    actions,
  };
};

/**
 * Generates a report title based on diagnosis data
 */
function generateReportTitle(diagnosisData: DiagnosisData): string {
  const date = new Date().toLocaleDateString('pt-BR');
  
  if (diagnosisData.patient_info?.age) {
    return `Pré-diagnóstico - ${diagnosisData.patient_info.age} anos - ${date}`;
  }
  
  const mainSymptom = diagnosisData.symptoms?.[0]?.description;
  if (mainSymptom) {
    const shortSymptom = mainSymptom.length > 30 
      ? mainSymptom.substring(0, 30) + '...' 
      : mainSymptom;
    return `Pré-diagnóstico - ${shortSymptom} - ${date}`;
  }
  
  return `Pré-diagnóstico - ${date}`;
}

// Export types for external use
export type { ReportFilters, ReportSortOptions };