// Supabase storage service for diagnosis reports

import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { 
  StorageServiceInterface, 
  StorageServiceOptions, 
  ServiceResponse 
} from '@/types/diagnosis-services';
import { 
  DiagnosisError,
  DiagnosisErrorType 
} from '@/types/diagnosis';
import { 
  createDiagnosisError, 
  extractErrorMessage,
  retryWithBackoff 
} from '@/utils/diagnosis-utils';
import { diagnosisConfig, isFeatureEnabled } from '@/lib/diagnosis-config';

export interface StorageUploadOptions {
  fileName?: string;
  contentType?: string;
  cacheControl?: string;
  upsert?: boolean;
}

export interface StorageDownloadOptions {
  transform?: {
    width?: number;
    height?: number;
    resize?: 'cover' | 'contain' | 'fill';
    format?: 'origin' | 'webp';
    quality?: number;
  };
}

export interface StorageFileInfo {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
}

export class StorageService implements StorageServiceInterface {
  private supabase: SupabaseClient;
  private options: StorageServiceOptions;
  private requestId = 0;

  constructor(options?: Partial<StorageServiceOptions>) {
    this.options = {
      bucketName: options?.bucketName || diagnosisConfig.supabase.storageBucket,
      maxFileSize: options?.maxFileSize || 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: options?.allowedMimeTypes || ['application/pdf'],
      retryAttempts: options?.retryAttempts || 3,
      retryDelay: options?.retryDelay || 1000,
    };

    this.supabase = supabase;

    this.validateConfiguration();
  }

  /**
   * Uploads a file to Supabase storage
   */
  async uploadFile(
    file: Blob | File,
    path: string,
    options?: StorageUploadOptions
  ): Promise<ServiceResponse<{ path: string; fullPath: string }>> {
    const startTime = Date.now();
    const currentRequestId = ++this.requestId;

    try {
      this.logRequest('uploadFile', { path, size: file.size }, currentRequestId);

      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        const error = createDiagnosisError(
          DiagnosisErrorType.SUPABASE_ERROR,
          `File validation failed: ${validation.errors.join(', ')}`,
          validation.errors,
          false
        );
        return this.createErrorResponse(error, startTime, currentRequestId);
      }

      // Generate filename if not provided
      const fileName = options?.fileName || this.generateFileName(path);
      const fullPath = `${path}/${fileName}`;

      // Upload with retry logic
      const uploadResult = await retryWithBackoff(
        () => this.performUpload(file, fullPath, options),
        this.options.retryAttempts,
        this.options.retryDelay
      );

      if (uploadResult.error) {
        const error = createDiagnosisError(
          DiagnosisErrorType.SUPABASE_ERROR,
          `Upload failed: ${uploadResult.error.message}`,
          uploadResult.error,
          true
        );
        return this.createErrorResponse(error, startTime, currentRequestId);
      }

      const duration = Date.now() - startTime;
      this.logSuccess('uploadFile', { path: fullPath, size: file.size }, currentRequestId, duration);

      return {
        success: true,
        data: {
          path: uploadResult.data?.path || fullPath,
          fullPath: uploadResult.data?.fullPath || fullPath,
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
   * Downloads a file from Supabase storage
   */
  async downloadFile(
    path: string,
    options?: StorageDownloadOptions
  ): Promise<ServiceResponse<Blob>> {
    const startTime = Date.now();
    const currentRequestId = ++this.requestId;

    try {
      this.logRequest('downloadFile', { path }, currentRequestId);

      // Download with retry logic
      const downloadResult = await retryWithBackoff(
        () => this.performDownload(path, options),
        this.options.retryAttempts,
        this.options.retryDelay
      );

      if (downloadResult.error) {
        const error = createDiagnosisError(
          DiagnosisErrorType.SUPABASE_ERROR,
          `Download failed: ${downloadResult.error.message}`,
          downloadResult.error,
          true
        );
        return this.createErrorResponse(error, startTime, currentRequestId);
      }

      const duration = Date.now() - startTime;
      this.logSuccess('downloadFile', { path, size: downloadResult.data?.size }, currentRequestId, duration);

      return {
        success: true,
        data: downloadResult.data!,
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
   * Generates a signed URL for secure file access
   */
  async getSignedUrl(
    path: string,
    expiresIn: number = 3600
  ): Promise<ServiceResponse<string>> {
    const startTime = Date.now();
    const currentRequestId = ++this.requestId;

    try {
      this.logRequest('getSignedUrl', { path, expiresIn }, currentRequestId);

      const { data, error } = await this.supabase.storage
        .from(this.options.bucketName)
        .createSignedUrl(path, expiresIn);

      if (error) {
        const diagnosisError = createDiagnosisError(
          DiagnosisErrorType.SUPABASE_ERROR,
          `Failed to generate signed URL: ${error.message}`,
          error,
          true
        );
        return this.createErrorResponse(diagnosisError, startTime, currentRequestId);
      }

      const duration = Date.now() - startTime;
      this.logSuccess('getSignedUrl', { path, url: data.signedUrl }, currentRequestId, duration);

      return {
        success: true,
        data: data.signedUrl,
        metadata: {
          timestamp: new Date(),
          duration,
          requestId: currentRequestId.toString(),
          expiresAt: new Date(Date.now() + expiresIn * 1000),
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
   * Deletes a file from Supabase storage
   */
  async deleteFile(path: string): Promise<ServiceResponse<void>> {
    const startTime = Date.now();
    const currentRequestId = ++this.requestId;

    try {
      this.logRequest('deleteFile', { path }, currentRequestId);

      const { error } = await this.supabase.storage
        .from(this.options.bucketName)
        .remove([path]);

      if (error) {
        const diagnosisError = createDiagnosisError(
          DiagnosisErrorType.SUPABASE_ERROR,
          `Failed to delete file: ${error.message}`,
          error,
          true
        );
        return this.createErrorResponse(diagnosisError, startTime, currentRequestId);
      }

      const duration = Date.now() - startTime;
      this.logSuccess('deleteFile', { path }, currentRequestId, duration);

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
   * Lists files in a directory
   */
  async listFiles(
    path: string = '',
    limit: number = 100,
    offset: number = 0
  ): Promise<ServiceResponse<StorageFileInfo[]>> {
    const startTime = Date.now();
    const currentRequestId = ++this.requestId;

    try {
      this.logRequest('listFiles', { path, limit, offset }, currentRequestId);

      const { data, error } = await this.supabase.storage
        .from(this.options.bucketName)
        .list(path, {
          limit,
          offset,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        const diagnosisError = createDiagnosisError(
          DiagnosisErrorType.SUPABASE_ERROR,
          `Failed to list files: ${error.message}`,
          error,
          true
        );
        return this.createErrorResponse(diagnosisError, startTime, currentRequestId);
      }

      const duration = Date.now() - startTime;
      this.logSuccess('listFiles', { path, count: data?.length }, currentRequestId, duration);

      return {
        success: true,
        data: data as StorageFileInfo[],
        metadata: {
          timestamp: new Date(),
          duration,
          requestId: currentRequestId.toString(),
          totalCount: data?.length || 0,
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
   * Generates a unique filename with user_id and timestamp
   */
  generateFileName(userId: string, prefix: string = 'diagnosis-report'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${userId}-${timestamp}-${randomSuffix}.pdf`;
  }

  /**
   * Gets file information
   */
  async getFileInfo(path: string): Promise<ServiceResponse<StorageFileInfo>> {
    const startTime = Date.now();
    const currentRequestId = ++this.requestId;

    try {
      this.logRequest('getFileInfo', { path }, currentRequestId);

      // Extract directory and filename from path
      const pathParts = path.split('/');
      const fileName = pathParts.pop();
      const directory = pathParts.join('/');

      const { data, error } = await this.supabase.storage
        .from(this.options.bucketName)
        .list(directory, {
          search: fileName,
        });

      if (error) {
        const diagnosisError = createDiagnosisError(
          DiagnosisErrorType.SUPABASE_ERROR,
          `Failed to get file info: ${error.message}`,
          error,
          true
        );
        return this.createErrorResponse(diagnosisError, startTime, currentRequestId);
      }

      const fileInfo = data?.find(file => file.name === fileName);
      if (!fileInfo) {
        const diagnosisError = createDiagnosisError(
          DiagnosisErrorType.SUPABASE_ERROR,
          `File not found: ${path}`,
          { path },
          false
        );
        return this.createErrorResponse(diagnosisError, startTime, currentRequestId);
      }

      const duration = Date.now() - startTime;
      this.logSuccess('getFileInfo', { path, size: fileInfo.metadata?.size }, currentRequestId, duration);

      return {
        success: true,
        data: fileInfo as StorageFileInfo,
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
   * Performs the actual file upload
   */
  private async performUpload(
    file: Blob | File,
    path: string,
    options?: StorageUploadOptions
  ) {
    return await this.supabase.storage
      .from(this.options.bucketName)
      .upload(path, file, {
        contentType: options?.contentType || 'application/pdf',
        cacheControl: options?.cacheControl || '3600',
        upsert: options?.upsert || false,
      });
  }

  /**
   * Performs the actual file download
   */
  private async performDownload(
    path: string,
    options?: StorageDownloadOptions
  ) {
    return await this.supabase.storage
      .from(this.options.bucketName)
      .download(path, options?.transform);
  }

  /**
   * Validates file before upload
   */
  private validateFile(file: Blob | File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file size
    if (file.size > this.options.maxFileSize) {
      errors.push(`File size (${file.size} bytes) exceeds maximum allowed size (${this.options.maxFileSize} bytes)`);
    }

    // Check file type
    if (file.type && !this.options.allowedMimeTypes.includes(file.type)) {
      errors.push(`File type (${file.type}) is not allowed. Allowed types: ${this.options.allowedMimeTypes.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates service configuration
   */
  private validateConfiguration(): void {
    if (!this.options.bucketName) {
      console.warn('StorageService: Storage bucket name not configured - service will be limited');
    }

    if (!this.supabase) {
      console.warn('StorageService: Supabase client not available - service will be disabled');
      return;
    }
  }

  /**
   * Handles and categorizes errors
   */
  private handleError(error: any): DiagnosisError {
    if (error && typeof error === 'object' && error.type && Object.values(DiagnosisErrorType).includes(error.type)) {
      return error;
    }

    const message = extractErrorMessage(error);

    // Authentication errors (check first)
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
        `Network error during storage operation: ${message}`,
        error,
        true
      );
    }

    // Supabase specific errors
    if (message.includes('storage') || message.includes('bucket')) {
      return createDiagnosisError(
        DiagnosisErrorType.SUPABASE_ERROR,
        `Storage operation failed: ${message}`,
        error,
        true
      );
    }

    // Generic error
    return createDiagnosisError(
      DiagnosisErrorType.SUPABASE_ERROR,
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
   * Logs request (if debugging is enabled)
   */
  private logRequest(operation: string, data: any, requestId: number): void {
    if (isFeatureEnabled('ENABLE_DETAILED_LOGGING')) {
      console.log(`[StorageService] ${operation} ${requestId}:`, data);
    }
  }

  /**
   * Logs success (if debugging is enabled)
   */
  private logSuccess(operation: string, data: any, requestId: number, duration: number): void {
    if (isFeatureEnabled('ENABLE_DETAILED_LOGGING')) {
      console.log(`[StorageService] ${operation} ${requestId} completed:`, {
        ...data,
        duration: `${duration}ms`,
      });
    }
  }

  /**
   * Logs error (if debugging is enabled)
   */
  private logError(error: DiagnosisError, requestId: number, duration: number): void {
    if (isFeatureEnabled('ENABLE_DETAILED_LOGGING')) {
      console.error(`[StorageService] Error ${requestId}:`, {
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
  getConfiguration(): StorageServiceOptions {
    return { ...this.options };
  }

  /**
   * Updates service configuration
   */
  updateConfiguration(options: Partial<StorageServiceOptions>): void {
    this.options = { ...this.options, ...options };
    this.validateConfiguration();
  }
}

// Factory function for creating StorageService instances
export const createStorageService = (options?: Partial<StorageServiceOptions>): StorageService => {
  return new StorageService(options);
};

// Default StorageService instance - only create if configuration is valid
export const storageService = (() => {
  try {
    return createStorageService();
  } catch (error) {
    console.warn('StorageService initialization failed:', error);
    return null;
  }
})();