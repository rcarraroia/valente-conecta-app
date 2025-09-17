// PDF service integration with monitoring and advanced features

import { PDFService, PDFGenerationOptions } from './pdf.service';
import { PDFGenerationProgress, validateDiagnosisForPDF, estimatePDFGenerationTime } from './pdf.config';
import { DiagnosisData, DiagnosisError } from '@/types/diagnosis';
import { ServiceResponse } from '@/types/diagnosis-services';
import { isFeatureEnabled } from '@/lib/diagnosis-config';

/**
 * Enhanced PDF service with monitoring and progress tracking
 */
export class EnhancedPDFService extends PDFService {
  private progressTracker = new PDFGenerationProgress();
  private metrics = {
    totalGenerations: 0,
    successfulGenerations: 0,
    failedGenerations: 0,
    averageGenerationTime: 0,
    totalSizeGenerated: 0,
  };

  /**
   * Generates PDF with progress tracking and enhanced validation
   */
  async generatePDFWithProgress(
    diagnosisData: DiagnosisData,
    options?: Partial<PDFGenerationOptions>,
    onProgress?: (progress: number, step: string) => void
  ): Promise<ServiceResponse<Blob>> {
    const startTime = Date.now();
    this.progressTracker.reset();

    if (onProgress) {
      this.progressTracker.onProgress(onProgress);
    }

    try {
      this.metrics.totalGenerations++;
      
      // Step 1: Validate data
      this.progressTracker.nextStep();
      const validation = validateDiagnosisForPDF(diagnosisData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Step 2: Configure document
      this.progressTracker.nextStep();
      await this.delay(100); // Simulate processing time

      // Step 3: Add header
      this.progressTracker.nextStep();
      await this.delay(100);

      // Step 4: Process patient info
      this.progressTracker.nextStep();
      await this.delay(150);

      // Step 5: Add symptoms
      this.progressTracker.nextStep();
      await this.delay(200);

      // Step 6: Process analysis
      this.progressTracker.nextStep();
      await this.delay(300);

      // Step 7: Add recommendations
      this.progressTracker.nextStep();
      await this.delay(150);

      // Step 8: Finalize document
      this.progressTracker.nextStep();
      
      // Generate the actual PDF
      const result = await super.generatePDF(diagnosisData, options);

      if (result.success && result.data) {
        this.metrics.successfulGenerations++;
        this.metrics.totalSizeGenerated += result.data.size;
        
        const duration = Date.now() - startTime;
        this.updateAverageGenerationTime(duration);
        
        this.logSuccess(result.data.size, duration);
      } else {
        this.metrics.failedGenerations++;
        this.logFailure(result.error);
      }

      return result;

    } catch (error: any) {
      this.metrics.failedGenerations++;
      const duration = Date.now() - startTime;
      this.logError(error, duration);
      
      return {
        success: false,
        error: error,
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    }
  }

  /**
   * Generates PDF with automatic retry on failure
   */
  async generatePDFWithRetry(
    diagnosisData: DiagnosisData,
    options?: Partial<PDFGenerationOptions>,
    maxRetries: number = 3
  ): Promise<ServiceResponse<Blob>> {
    let lastError: DiagnosisError | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.generatePDFWithProgress(diagnosisData, options);
        
        if (result.success) {
          if (attempt > 1) {
            this.logRetrySuccess(attempt);
          }
          return result;
        }

        lastError = result.error;
        
        if (!result.error?.retryable) {
          break; // Don't retry non-retryable errors
        }

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          this.logRetryAttempt(attempt, delay);
          await this.delay(delay);
        }

      } catch (error: any) {
        lastError = error;
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          this.logRetryAttempt(attempt, delay);
          await this.delay(delay);
        }
      }
    }

    this.logRetryFailure(maxRetries);
    
    return {
      success: false,
      error: lastError,
      metadata: {
        timestamp: new Date(),
        attempts: maxRetries,
      },
    };
  }

  /**
   * Batch PDF generation for multiple diagnosis data
   */
  async generateMultiplePDFs(
    diagnosisDataList: DiagnosisData[],
    options?: Partial<PDFGenerationOptions>,
    onProgress?: (completed: number, total: number, currentItem: string) => void
  ): Promise<ServiceResponse<Blob[]>> {
    const results: Blob[] = [];
    const errors: DiagnosisError[] = [];
    const startTime = Date.now();

    for (let i = 0; i < diagnosisDataList.length; i++) {
      const diagnosisData = diagnosisDataList[i];
      
      if (onProgress) {
        onProgress(i, diagnosisDataList.length, `Gerando relatório ${i + 1}`);
      }

      try {
        const result = await this.generatePDFWithRetry(diagnosisData, options);
        
        if (result.success && result.data) {
          results.push(result.data);
        } else if (result.error) {
          errors.push(result.error);
        }

      } catch (error: any) {
        errors.push(error);
      }
    }

    if (onProgress) {
      onProgress(diagnosisDataList.length, diagnosisDataList.length, 'Concluído');
    }

    const duration = Date.now() - startTime;

    if (results.length === 0) {
      return {
        success: false,
        error: errors[0] || new Error('Failed to generate any PDFs'),
        metadata: {
          timestamp: new Date(),
          duration,
          totalItems: diagnosisDataList.length,
          successCount: 0,
          errorCount: errors.length,
        },
      };
    }

    return {
      success: true,
      data: results,
      metadata: {
        timestamp: new Date(),
        duration,
        totalItems: diagnosisDataList.length,
        successCount: results.length,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    };
  }

  /**
   * Gets PDF generation metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalGenerations > 0 
        ? (this.metrics.successfulGenerations / this.metrics.totalGenerations) * 100 
        : 0,
      averageSizeGenerated: this.metrics.successfulGenerations > 0
        ? this.metrics.totalSizeGenerated / this.metrics.successfulGenerations
        : 0,
    };
  }

  /**
   * Resets metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalGenerations: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      averageGenerationTime: 0,
      totalSizeGenerated: 0,
    };
  }

  /**
   * Estimates generation time for given data
   */
  estimateGenerationTime(diagnosisData: DiagnosisData): number {
    return estimatePDFGenerationTime(diagnosisData);
  }

  /**
   * Health check for PDF generation capability
   */
  async healthCheck(): Promise<{ healthy: boolean; responseTime?: number; error?: string }> {
    const startTime = Date.now();

    try {
      // Create minimal test data
      const testData: DiagnosisData = {
        symptoms: [{ description: 'Test symptom', severity: 5 }],
        analysis: 'Test analysis for health check',
        recommendations: ['Test recommendation'],
        severity_level: 3,
        generated_at: new Date().toISOString(),
      };

      const result = await super.generatePDF(testData);
      const responseTime = Date.now() - startTime;

      return {
        healthy: result.success,
        responseTime,
        error: result.success ? undefined : result.error?.message,
      };

    } catch (error: any) {
      return {
        healthy: false,
        responseTime: Date.now() - startTime,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Updates average generation time
   */
  private updateAverageGenerationTime(duration: number): void {
    const totalTime = this.metrics.averageGenerationTime * (this.metrics.successfulGenerations - 1) + duration;
    this.metrics.averageGenerationTime = totalTime / this.metrics.successfulGenerations;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Logging methods
   */
  private logSuccess(size: number, duration: number): void {
    if (isFeatureEnabled('ENABLE_DETAILED_LOGGING')) {
      console.log(`[EnhancedPDFService] PDF generated successfully:`, {
        size: `${size} bytes`,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private logFailure(error?: DiagnosisError): void {
    if (isFeatureEnabled('ENABLE_DETAILED_LOGGING')) {
      console.error(`[EnhancedPDFService] PDF generation failed:`, {
        error: error?.message,
        type: error?.type,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private logError(error: any, duration: number): void {
    if (isFeatureEnabled('ENABLE_DETAILED_LOGGING')) {
      console.error(`[EnhancedPDFService] Error:`, {
        error: error.message,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private logRetryAttempt(attempt: number, delay: number): void {
    if (isFeatureEnabled('ENABLE_DETAILED_LOGGING')) {
      console.warn(`[EnhancedPDFService] Retry attempt ${attempt}, waiting ${delay}ms`);
    }
  }

  private logRetrySuccess(attempts: number): void {
    if (isFeatureEnabled('ENABLE_DETAILED_LOGGING')) {
      console.log(`[EnhancedPDFService] PDF generation succeeded after ${attempts} attempts`);
    }
  }

  private logRetryFailure(maxRetries: number): void {
    if (isFeatureEnabled('ENABLE_DETAILED_LOGGING')) {
      console.error(`[EnhancedPDFService] PDF generation failed after ${maxRetries} attempts`);
    }
  }
}

// Factory function for creating EnhancedPDFService instances
export const createEnhancedPDFService = (options?: any): EnhancedPDFService => {
  return new EnhancedPDFService(options);
};

// Default enhanced PDF service instance
export const enhancedPDFService = createEnhancedPDFService();