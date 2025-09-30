// Diagnosis report service - integrates PDF generation with chat completion

import { supabase } from '@/integrations/supabase/client';
import { pdfService } from './pdf.service';
import { storageService } from './storage.service';
import { useToast } from '@/components/ui/use-toast';
import { analyticsService } from './analytics.service';
import { loggingService, LogCategory } from './logging.service';
import { 
  DiagnosisData, 
  DiagnosisError,
  DiagnosisErrorType 
} from '@/types/diagnosis';
import { 
  ServiceResponse,
  DiagnosisReportServiceInterface 
} from '@/types/diagnosis-services';
import { Database } from '@/integrations/supabase/types';
import { 
  createDiagnosisError, 
  extractErrorMessage,
  formatDate 
} from '@/utils/diagnosis-utils';
import { diagnosisConfig, isFeatureEnabled } from '@/lib/diagnosis-config';

type ReportRow = Database['public']['Tables']['relatorios_diagnostico']['Row'];
type ReportInsert = Database['public']['Tables']['relatorios_diagnostico']['Insert'];

export interface ReportGenerationOptions {
  title?: string;
  includePatientInfo?: boolean;
  includeRecommendations?: boolean;
  notifyUser?: boolean;
  autoSave?: boolean;
}

export interface ReportGenerationResult {
  reportId: string;
  pdfUrl: string;
  signedUrl: string;
  metadata: {
    fileSize: number;
    generationTime: number;
    uploadTime: number;
    totalTime: number;
  };
}

export class DiagnosisReportService implements DiagnosisReportServiceInterface {
  private supabase;
  private requestId = 0;

  constructor() {
    this.supabase = supabase;
  }

  /**
   * Generates PDF report and saves to database when diagnosis is completed
   */
  async generateAndSaveReport(
    userId: string,
    sessionId: string,
    diagnosisData: DiagnosisData,
    options?: ReportGenerationOptions
  ): Promise<ServiceResponse<ReportGenerationResult>> {
    const startTime = Date.now();
    const currentRequestId = ++this.requestId;

    try {
      this.logRequest('generateAndSaveReport', { userId, sessionId }, currentRequestId);

      // Step 1: Generate PDF
      const pdfStartTime = Date.now();
      const pdfResult = await pdfService.generatePDF(diagnosisData, {
        includePatientInfo: options?.includePatientInfo ?? true,
        includeRecommendations: options?.includeRecommendations ?? true,
      });

      if (!pdfResult.success || !pdfResult.data) {
        const error = createDiagnosisError(
          DiagnosisErrorType.PDF_GENERATION_ERROR,
          `PDF generation failed: ${pdfResult.error?.message || 'Unknown error'}`,
          pdfResult.error,
          true
        );
        return this.createErrorResponse(error, startTime, currentRequestId);
      }

      const pdfGenerationTime = Date.now() - pdfStartTime;
      const pdfBlob = pdfResult.data;

      // Step 2: Upload PDF to storage
      const uploadStartTime = Date.now();
      const fileName = storageService.generateFileName(userId, 'diagnosis-report');
      const storagePath = `diagnosis-reports/${userId}`;

      const uploadResult = await storageService.uploadFile(
        pdfBlob,
        storagePath,
        {
          fileName,
          contentType: 'application/pdf',
          cacheControl: '3600',
        }
      );

      if (!uploadResult.success || !uploadResult.data) {
        const error = createDiagnosisError(
          DiagnosisErrorType.SUPABASE_ERROR,
          `PDF upload failed: ${uploadResult.error?.message || 'Unknown error'}`,
          uploadResult.error,
          true
        );
        return this.createErrorResponse(error, startTime, currentRequestId);
      }

      const uploadTime = Date.now() - uploadStartTime;
      const pdfUrl = uploadResult.data.fullPath;

      // Step 3: Generate signed URL for immediate access
      const signedUrlResult = await storageService.getSignedUrl(pdfUrl, 86400); // 24 hours

      if (!signedUrlResult.success || !signedUrlResult.data) {
        const error = createDiagnosisError(
          DiagnosisErrorType.SUPABASE_ERROR,
          `Failed to generate signed URL: ${signedUrlResult.error?.message || 'Unknown error'}`,
          signedUrlResult.error,
          true
        );
        return this.createErrorResponse(error, startTime, currentRequestId);
      }

      const signedUrl = signedUrlResult.data;

      // Step 4: Save report metadata to database
      const reportTitle = options?.title || this.generateReportTitle(diagnosisData);
      
      const reportData: ReportInsert = {
        user_id: userId,
        session_id: sessionId,
        title: reportTitle,
        pdf_url: pdfUrl,
        status: 'completed',
        diagnosis_data: diagnosisData as any,
      };

      const { data: savedReport, error: saveError } = await this.supabase
        .from('relatorios_diagnostico')
        .insert(reportData)
        .select()
        .single();

      if (saveError || !savedReport) {
        const error = createDiagnosisError(
          DiagnosisErrorType.SUPABASE_ERROR,
          `Failed to save report metadata: ${saveError?.message || 'Unknown error'}`,
          saveError,
          true
        );
        return this.createErrorResponse(error, startTime, currentRequestId);
      }

      const totalTime = Date.now() - startTime;

      const result: ReportGenerationResult = {
        reportId: savedReport.id,
        pdfUrl,
        signedUrl,
        metadata: {
          fileSize: pdfBlob.size,
          generationTime: pdfGenerationTime,
          uploadTime,
          totalTime,
        },
      };

      this.logSuccess('generateAndSaveReport', result, currentRequestId, totalTime);

      // Step 5: Notify user if requested
      if (options?.notifyUser !== false) {
        this.notifyUserReportReady(reportTitle);
      }

      return {
        success: true,
        data: result,
        metadata: {
          timestamp: new Date(),
          duration: totalTime,
          requestId: currentRequestId.toString(),
        },
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      const diagnosisError = this.handleError(error);
      this.logError(diagnosisError, currentRequestId, duration);

      return this.createErrorResponse(diagnosisError, startTime, currentRequestId);
    }
  }

  /**
   * Gets report by ID with signed URL
   */
  async getReportWithSignedUrl(
    reportId: string,
    userId: string,
    expiresIn: number = 3600
  ): Promise<ServiceResponse<{ report: ReportRow; signedUrl: string }>> {
    const startTime = Date.now();
    const currentRequestId = ++this.requestId;

    try {
      this.logRequest('getReportWithSignedUrl', { reportId, userId }, currentRequestId);

      // Get report from database
      const { data: report, error: fetchError } = await this.supabase
        .from('relatorios_diagnostico')
        .select('*')
        .eq('id', reportId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !report) {
        const error = createDiagnosisError(
          DiagnosisErrorType.SUPABASE_ERROR,
          `Report not found: ${fetchError?.message || 'Report does not exist'}`,
          fetchError,
          false
        );
        return this.createErrorResponse(error, startTime, currentRequestId);
      }

      // Generate signed URL
      const signedUrlResult = await storageService.getSignedUrl(report.pdf_url, expiresIn);

      if (!signedUrlResult.success || !signedUrlResult.data) {
        const error = createDiagnosisError(
          DiagnosisErrorType.SUPABASE_ERROR,
          `Failed to generate signed URL: ${signedUrlResult.error?.message || 'Unknown error'}`,
          signedUrlResult.error,
          true
        );
        return this.createErrorResponse(error, startTime, currentRequestId);
      }

      const duration = Date.now() - startTime;
      this.logSuccess('getReportWithSignedUrl', { reportId }, currentRequestId, duration);

      return {
        success: true,
        data: {
          report,
          signedUrl: signedUrlResult.data,
        },
        metadata: {
          timestamp: new Date(),
          duration,
          requestId: currentRequestId.toString(),
        },
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      const diagnosisError = this.handleError(error);
      this.logError(diagnosisError, currentRequestId, duration);

      return this.createErrorResponse(diagnosisError, startTime, currentRequestId);
    }
  }

  /**
   * Updates report status
   */
  async updateReportStatus(
    reportId: string,
    userId: string,
    status: 'processing' | 'completed' | 'failed'
  ): Promise<ServiceResponse<void>> {
    const startTime = Date.now();
    const currentRequestId = ++this.requestId;

    try {
      this.logRequest('updateReportStatus', { reportId, status }, currentRequestId);

      const { error: updateError } = await this.supabase
        .from('relatorios_diagnostico')
        .update({ status })
        .eq('id', reportId)
        .eq('user_id', userId);

      if (updateError) {
        const error = createDiagnosisError(
          DiagnosisErrorType.SUPABASE_ERROR,
          `Failed to update report status: ${updateError.message}`,
          updateError,
          true
        );
        return this.createErrorResponse(error, startTime, currentRequestId);
      }

      const duration = Date.now() - startTime;
      this.logSuccess('updateReportStatus', { reportId, status }, currentRequestId, duration);

      return {
        success: true,
        data: undefined,
        metadata: {
          timestamp: new Date(),
          duration,
          requestId: currentRequestId.toString(),
        },
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      const diagnosisError = this.handleError(error);
      this.logError(diagnosisError, currentRequestId, duration);

      return this.createErrorResponse(diagnosisError, startTime, currentRequestId);
    }
  }

  /**
   * Deletes report and associated PDF file
   */
  async deleteReport(
    reportId: string,
    userId: string
  ): Promise<ServiceResponse<void>> {
    const startTime = Date.now();
    const currentRequestId = ++this.requestId;

    try {
      this.logRequest('deleteReport', { reportId, userId }, currentRequestId);

      // First get the report to get PDF URL
      const { data: report, error: fetchError } = await this.supabase
        .from('relatorios_diagnostico')
        .select('pdf_url')
        .eq('id', reportId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !report) {
        const error = createDiagnosisError(
          DiagnosisErrorType.SUPABASE_ERROR,
          `Report not found: ${fetchError?.message || 'Report does not exist'}`,
          fetchError,
          false
        );
        return this.createErrorResponse(error, startTime, currentRequestId);
      }

      // Delete PDF file from storage
      const deleteFileResult = await storageService.deleteFile(report.pdf_url);
      
      if (!deleteFileResult.success) {
        // Log warning but continue with database deletion
        console.warn(`Failed to delete PDF file: ${deleteFileResult.error?.message}`);
      }

      // Delete report from database
      const { error: deleteError } = await this.supabase
        .from('relatorios_diagnostico')
        .delete()
        .eq('id', reportId)
        .eq('user_id', userId);

      if (deleteError) {
        const error = createDiagnosisError(
          DiagnosisErrorType.SUPABASE_ERROR,
          `Failed to delete report: ${deleteError.message}`,
          deleteError,
          true
        );
        return this.createErrorResponse(error, startTime, currentRequestId);
      }

      const duration = Date.now() - startTime;
      this.logSuccess('deleteReport', { reportId }, currentRequestId, duration);

      return {
        success: true,
        data: undefined,
        metadata: {
          timestamp: new Date(),
          duration,
          requestId: currentRequestId.toString(),
        },
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      const diagnosisError = this.handleError(error);
      this.logError(diagnosisError, currentRequestId, duration);

      return this.createErrorResponse(diagnosisError, startTime, currentRequestId);
    }
  }

  /**
   * Generates a descriptive title for the report
   */
  private generateReportTitle(diagnosisData: DiagnosisData): string {
    const date = formatDate(new Date(), 'dd/MM/yyyy');
    const severityText = this.getSeverityText(diagnosisData.severity_level);
    
    return `Triagem Comportamental - ${severityText} - ${date}`;
  }

  /**
   * Gets severity level description
   */
  private getSeverityText(level: number): string {
    switch (level) {
      case 1: return 'Muito Baixo';
      case 2: return 'Baixo';
      case 3: return 'Moderado';
      case 4: return 'Alto';
      case 5: return 'Muito Alto';
      default: return 'Não Definido';
    }
  }

  /**
   * Notifies user that report is ready
   */
  private notifyUserReportReady(reportTitle: string): void {
    // Emit custom event that components can listen to
    const event = new CustomEvent('diagnosis-report-ready', {
      detail: {
        title: 'Relatório Pronto',
        description: `Seu relatório "${reportTitle}" foi gerado com sucesso e está disponível para visualização.`,
        reportTitle,
        timestamp: new Date().toISOString(),
      },
    });
    
    window.dispatchEvent(event);

    // Also emit a more specific event for PDF generation completion
    const pdfEvent = new CustomEvent('diagnosis-pdf-ready', {
      detail: {
        reportTitle,
        timestamp: new Date().toISOString(),
      },
    });
    
    window.dispatchEvent(pdfEvent);
  }

  /**
   * Handles and categorizes errors
   */
  private handleError(error: any): DiagnosisError {
    if (error && typeof error === 'object' && error.type && Object.values(DiagnosisErrorType).includes(error.type)) {
      return error;
    }

    const message = extractErrorMessage(error);

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('forbidden')) {
      return createDiagnosisError(
        DiagnosisErrorType.AUTHENTICATION_ERROR,
        `Authentication failed: ${message}`,
        error,
        false
      );
    }

    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return createDiagnosisError(
        DiagnosisErrorType.NETWORK_ERROR,
        `Network error during report generation: ${message}`,
        error,
        true
      );
    }

    // PDF generation errors
    if (message.includes('pdf') || message.includes('jsPDF')) {
      return createDiagnosisError(
        DiagnosisErrorType.PDF_GENERATION_ERROR,
        `PDF generation failed: ${message}`,
        error,
        true
      );
    }

    // Storage errors
    if (message.includes('storage') || message.includes('upload')) {
      return createDiagnosisError(
        DiagnosisErrorType.SUPABASE_ERROR,
        `Storage operation failed: ${message}`,
        error,
        true
      );
    }

    // Generic error
    return createDiagnosisError(
      DiagnosisErrorType.UNKNOWN_ERROR,
      message,
      error,
      true
    );
  }

  /**
   * Creates error response
   */
  private createErrorResponse(
    error: DiagnosisError, 
    startTime: number,
    requestId: number
  ): ServiceResponse<any> {
    return {
      success: false,
      error,
      metadata: {
        timestamp: new Date(),
        duration: Date.now() - startTime,
        requestId: requestId.toString(),
      },
    };
  }

  /**
   * Logging methods
   */
  private logRequest(operation: string, data: any, requestId: number): void {
    if (isFeatureEnabled('ENABLE_DETAILED_LOGGING')) {
      console.log(`[DiagnosisReportService] ${operation} ${requestId}:`, data);
    }
  }

  private logSuccess(operation: string, data: any, requestId: number, duration: number): void {
    if (isFeatureEnabled('ENABLE_DETAILED_LOGGING')) {
      console.log(`[DiagnosisReportService] ${operation} ${requestId} completed:`, {
        ...data,
        duration: `${duration}ms`,
      });
    }
  }

  private logError(error: DiagnosisError, requestId: number, duration: number): void {
    if (isFeatureEnabled('ENABLE_DETAILED_LOGGING')) {
      console.error(`[DiagnosisReportService] Error ${requestId}:`, {
        error: {
          type: error.type,
          message: error.message,
          retryable: error.retryable,
        },
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Factory function for creating DiagnosisReportService instances
export const createDiagnosisReportService = (): DiagnosisReportService => {
  return new DiagnosisReportService();
};

// Default DiagnosisReportService instance with error handling
export const diagnosisReportService = (() => {
  try {
    return createDiagnosisReportService();
  } catch (error) {
    console.warn('DiagnosisReportService initialization failed:', error);
    return null;
  }
})();