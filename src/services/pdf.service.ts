// PDF generation service for diagnosis reports

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  PDFServiceInterface, 
  PDFServiceOptions, 
  ServiceResponse 
} from '@/types/diagnosis-services';
import { 
  DiagnosisData, 
  DiagnosisError,
  DiagnosisErrorType 
} from '@/types/diagnosis';
import { 
  createDiagnosisError, 
  extractErrorMessage,
  formatDate,
  formatCurrency 
} from '@/utils/diagnosis-utils';
import { PDF_CONFIG } from '@/lib/diagnosis-constants';
import { isFeatureEnabled } from '@/lib/diagnosis-config';

export interface PDFGenerationOptions {
  template: 'standard' | 'detailed';
  includeCharts: boolean;
  includeRecommendations: boolean;
  includePatientInfo: boolean;
  language: 'pt-BR';
  format: 'A4';
  orientation: 'portrait' | 'landscape';
}

export class PDFService implements PDFServiceInterface {
  private options: PDFServiceOptions;

  constructor(options?: Partial<PDFServiceOptions>) {
    this.options = {
      maxSize: options?.maxSize || PDF_CONFIG.MAX_SIZE,
      allowedFormats: options?.allowedFormats || PDF_CONFIG.ALLOWED_FORMATS,
      template: options?.template || 'standard',
    };
  }

  /**
   * Generates PDF from diagnosis data
   */
  async generatePDF(
    diagnosisData: DiagnosisData,
    options?: Partial<PDFGenerationOptions>
  ): Promise<ServiceResponse<Blob>> {
    const startTime = Date.now();

    try {
      this.logPDFGeneration('Starting PDF generation', diagnosisData);

      // Validate diagnosis data
      if (!this.validateDiagnosisData(diagnosisData)) {
        const error = createDiagnosisError(
          DiagnosisErrorType.PDF_GENERATION_ERROR,
          'Invalid diagnosis data provided for PDF generation',
          diagnosisData,
          false
        );
        return this.createErrorResponse(error, startTime);
      }

      const pdfOptions: PDFGenerationOptions = {
        template: 'standard',
        includeCharts: true,
        includeRecommendations: true,
        includePatientInfo: true,
        language: 'pt-BR',
        format: 'A4',
        orientation: 'portrait',
        ...options,
      };

      // Generate PDF based on template
      const pdfBlob = await this.createPDFFromData(diagnosisData, pdfOptions);

      // Validate PDF size
      if (pdfBlob.size > this.options.maxSize) {
        const error = createDiagnosisError(
          DiagnosisErrorType.PDF_GENERATION_ERROR,
          `Generated PDF size (${pdfBlob.size} bytes) exceeds maximum allowed size (${this.options.maxSize} bytes)`,
          { size: pdfBlob.size, maxSize: this.options.maxSize },
          false
        );
        return this.createErrorResponse(error, startTime);
      }

      const duration = Date.now() - startTime;
      this.logPDFGeneration('PDF generation completed', { size: pdfBlob.size, duration });

      return {
        success: true,
        data: pdfBlob,
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      const diagnosisError = this.handleError(error);
      this.logError(diagnosisError, duration);

      return this.createErrorResponse(diagnosisError, startTime);
    }
  }

  /**
   * Creates PDF from diagnosis data using jsPDF
   */
  private async createPDFFromData(
    diagnosisData: DiagnosisData,
    options: PDFGenerationOptions
  ): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.format.toLowerCase() as any,
    });

    // Set document properties
    pdf.setProperties({
      title: 'Relatório de Triagem Comportamental - ONG Coração Valente',
      subject: 'Triagem Comportamental',
      author: 'ONG Coração Valente',
      creator: 'Valente Conecta App',
      producer: 'jsPDF',
    });

    // Add content based on template
    if (options.template === 'standard') {
      await this.addStandardTemplate(pdf, diagnosisData, options);
    } else {
      await this.addDetailedTemplate(pdf, diagnosisData, options);
    }

    // Convert to blob
    const pdfBlob = pdf.output('blob');
    return pdfBlob;
  }

  /**
   * Adds standard template content to PDF
   */
  private async addStandardTemplate(
    pdf: jsPDF,
    diagnosisData: DiagnosisData,
    options: PDFGenerationOptions
  ): Promise<void> {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ONG Coração Valente', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    pdf.setFontSize(16);
    pdf.text('Relatório de Triagem Comportamental', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Gerado em: ${formatDate(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 20;

    // Patient Information (if included)
    if (options.includePatientInfo && diagnosisData.patient_info) {
      yPosition = await this.addPatientInfo(pdf, diagnosisData.patient_info, yPosition);
    }

    // Symptoms
    yPosition = await this.addSymptoms(pdf, diagnosisData.symptoms, yPosition);

    // Analysis
    yPosition = await this.addAnalysis(pdf, diagnosisData.analysis, yPosition);

    // Recommendations (if included)
    if (options.includeRecommendations && diagnosisData.recommendations) {
      yPosition = await this.addRecommendations(pdf, diagnosisData.recommendations, yPosition);
    }

    // Severity Level
    yPosition = await this.addSeverityLevel(pdf, diagnosisData.severity_level, yPosition);

    // Next Steps
    if (diagnosisData.next_steps && diagnosisData.next_steps.length > 0) {
      yPosition = await this.addNextSteps(pdf, diagnosisData.next_steps, yPosition);
    }

    // Footer
    this.addFooter(pdf, pageHeight);
  }

  /**
   * Adds detailed template content to PDF
   */
  private async addDetailedTemplate(
    pdf: jsPDF,
    diagnosisData: DiagnosisData,
    options: PDFGenerationOptions
  ): Promise<void> {
    // For now, use the same as standard template
    // In the future, this could include more detailed sections, charts, etc.
    await this.addStandardTemplate(pdf, diagnosisData, options);
  }

  /**
   * Adds patient information section to PDF
   */
  private async addPatientInfo(
    pdf: jsPDF,
    patientInfo: DiagnosisData['patient_info'],
    yPosition: number
  ): Promise<number> {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Informações do Paciente', 20, yPosition);
    
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    if (patientInfo.age) {
      pdf.text(`Idade: ${patientInfo.age} anos`, 20, yPosition);
      yPosition += 6;
    }

    if (patientInfo.gender) {
      pdf.text(`Gênero: ${patientInfo.gender}`, 20, yPosition);
      yPosition += 6;
    }

    if (patientInfo.medical_history && patientInfo.medical_history.length > 0) {
      pdf.text('Histórico Médico:', 20, yPosition);
      yPosition += 6;
      
      patientInfo.medical_history.forEach((item) => {
        pdf.text(`• ${item}`, 25, yPosition);
        yPosition += 6;
      });
    }

    return yPosition + 10;
  }

  /**
   * Adds symptoms section to PDF
   */
  private async addSymptoms(
    pdf: jsPDF,
    symptoms: DiagnosisData['symptoms'],
    yPosition: number
  ): Promise<number> {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Sintomas Relatados', 20, yPosition);
    
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    symptoms.forEach((symptom, index) => {
      pdf.text(`${index + 1}. ${symptom.description}`, 20, yPosition);
      yPosition += 6;
      
      pdf.text(`   Intensidade: ${symptom.severity}/10`, 25, yPosition);
      yPosition += 6;
      
      if (symptom.duration) {
        pdf.text(`   Duração: ${symptom.duration}`, 25, yPosition);
        yPosition += 6;
      }
      
      yPosition += 3;
    });

    return yPosition + 5;
  }

  /**
   * Adds analysis section to PDF
   */
  private async addAnalysis(
    pdf: jsPDF,
    analysis: string,
    yPosition: number
  ): Promise<number> {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Análise', 20, yPosition);
    
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    // Split analysis into lines to fit page width
    const lines = pdf.splitTextToSize(analysis, 170);
    lines.forEach((line: string) => {
      pdf.text(line, 20, yPosition);
      yPosition += 6;
    });

    return yPosition + 10;
  }

  /**
   * Adds recommendations section to PDF
   */
  private async addRecommendations(
    pdf: jsPDF,
    recommendations: string[],
    yPosition: number
  ): Promise<number> {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recomendações', 20, yPosition);
    
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    recommendations.forEach((recommendation, index) => {
      const lines = pdf.splitTextToSize(`${index + 1}. ${recommendation}`, 170);
      lines.forEach((line: string) => {
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 3;
    });

    return yPosition + 5;
  }

  /**
   * Adds severity level section to PDF
   */
  private async addSeverityLevel(
    pdf: jsPDF,
    severityLevel: number,
    yPosition: number
  ): Promise<number> {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Nível de Gravidade', 20, yPosition);
    
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const severityText = this.getSeverityText(severityLevel);
    pdf.text(`Nível: ${severityLevel}/5 - ${severityText}`, 20, yPosition);

    return yPosition + 15;
  }

  /**
   * Adds next steps section to PDF
   */
  private async addNextSteps(
    pdf: jsPDF,
    nextSteps: string[],
    yPosition: number
  ): Promise<number> {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Próximos Passos', 20, yPosition);
    
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    nextSteps.forEach((step, index) => {
      const lines = pdf.splitTextToSize(`${index + 1}. ${step}`, 170);
      lines.forEach((line: string) => {
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 3;
    });

    return yPosition + 5;
  }

  /**
   * Adds footer to PDF
   */
  private addFooter(pdf: jsPDF, pageHeight: number): void {
    const footerY = pageHeight - 20;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Este relatório é apenas uma triagem comportamental e não substitui consulta médica profissional.', 
      pdf.internal.pageSize.getWidth() / 2, footerY, { align: 'center' });
    
    pdf.text('ONG Coração Valente - Valente Conecta App', 
      pdf.internal.pageSize.getWidth() / 2, footerY + 5, { align: 'center' });
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
   * Validates diagnosis data for PDF generation
   */
  private validateDiagnosisData(data: DiagnosisData): boolean {
    if (!data) return false;
    if (!data.symptoms || data.symptoms.length === 0) return false;
    if (!data.analysis || data.analysis.trim().length === 0) return false;
    if (!data.severity_level || data.severity_level < 1 || data.severity_level > 5) return false;
    
    return true;
  }

  /**
   * Handles and categorizes errors
   */
  private handleError(error: any): DiagnosisError {
    if (error && typeof error === 'object' && error.type && Object.values(DiagnosisErrorType).includes(error.type)) {
      return error;
    }

    const message = extractErrorMessage(error);

    // PDF generation specific errors
    if (message.includes('jsPDF') || message.includes('canvas')) {
      return createDiagnosisError(
        DiagnosisErrorType.PDF_GENERATION_ERROR,
        `PDF generation failed: ${message}`,
        error,
        true
      );
    }

    // Memory errors
    if (message.includes('memory') || message.includes('heap')) {
      return createDiagnosisError(
        DiagnosisErrorType.PDF_GENERATION_ERROR,
        'PDF generation failed due to insufficient memory',
        error,
        true
      );
    }

    // Generic error
    return createDiagnosisError(
      DiagnosisErrorType.PDF_GENERATION_ERROR,
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
    startTime: number
  ): ServiceResponse<Blob> {
    return {
      success: false,
      error,
      metadata: {
        timestamp: new Date(),
        duration: Date.now() - startTime,
      },
    };
  }

  /**
   * Logs PDF generation (if debugging is enabled)
   */
  private logPDFGeneration(message: string, data?: any): void {
    if (isFeatureEnabled('ENABLE_DETAILED_LOGGING')) {
      console.log(`[PDFService] ${message}:`, data);
    }
  }

  /**
   * Logs error (if debugging is enabled)
   */
  private logError(error: DiagnosisError, duration: number): void {
    if (isFeatureEnabled('ENABLE_DETAILED_LOGGING')) {
      console.error(`[PDFService] Error:`, {
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

  /**
   * Gets service configuration
   */
  getConfiguration(): PDFServiceOptions {
    return { ...this.options };
  }

  /**
   * Updates service configuration
   */
  updateConfiguration(options: Partial<PDFServiceOptions>): void {
    this.options = { ...this.options, ...options };
  }
}

// Factory function for creating PDFService instances
export const createPDFService = (options?: Partial<PDFServiceOptions>): PDFService => {
  return new PDFService(options);
};

// Default PDFService instance
export const pdfService = createPDFService();