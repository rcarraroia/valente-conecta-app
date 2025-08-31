// Storage service tests

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StorageService } from '../storage.service';
import { DiagnosisErrorType } from '@/types/diagnosis';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => {
  const mockSupabaseClient = {
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn(),
      download: vi.fn(),
      createSignedUrl: vi.fn(),
      remove: vi.fn(),
      list: vi.fn(),
    },
  };

  return {
    createClient: vi.fn(() => mockSupabaseClient),
  };
});

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

describe('StorageService', () => {
  let storageService: StorageService;
  let mockFile: File;
  let mockSupabaseClient: any;

  beforeEach(async () => {
    // Get the mocked Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    mockSupabaseClient = (createClient as any)();
    
    storageService = new StorageService();
    
    // Create a mock PDF file
    mockFile = new File(['mock pdf content'], 'test.pdf', {
      type: 'application/pdf',
    });

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const service = new StorageService();
      expect(service).toBeInstanceOf(StorageService);
    });

    it('should initialize with custom options', () => {
      const customOptions = {
        bucketName: 'custom-bucket',
        maxFileSize: 5242880, // 5MB
        allowedMimeTypes: ['application/pdf', 'image/png'],
        retryAttempts: 5,
        retryDelay: 2000,
      };

      const service = new StorageService(customOptions);
      expect(service).toBeInstanceOf(StorageService);
    });

    it('should validate bucket name configuration', () => {
      const service = new StorageService({ bucketName: 'valid-bucket' });
      const config = service.getConfiguration();
      expect(config.bucketName).toBe('valid-bucket');
    });
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const mockUploadResponse = {
        data: { path: 'test-path/test.pdf', fullPath: 'test-path/test.pdf' },
        error: null,
      };

      mockSupabaseClient.storage.upload.mockResolvedValueOnce(mockUploadResponse);

      const result = await storageService.uploadFile(mockFile, 'test-path');

      expect(result.success).toBe(true);
      expect(result.data?.path).toBe('test-path/test.pdf');
      expect(result.metadata?.duration).toBeGreaterThanOrEqual(0);
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('test-bucket');
    });

    it('should handle file validation errors', async () => {
      // Create a file that's too large
      const largeFile = new File(['x'.repeat(20 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf',
      });

      const result = await storageService.uploadFile(largeFile, 'test-path');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.SUPABASE_ERROR);
      expect(result.error?.message).toContain('File size');
    });

    it('should handle invalid file types', async () => {
      const invalidFile = new File(['content'], 'test.txt', {
        type: 'text/plain',
      });

      const result = await storageService.uploadFile(invalidFile, 'test-path');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.SUPABASE_ERROR);
      expect(result.error?.message).toContain('File type');
    });

    it('should handle upload errors', async () => {
      const mockUploadResponse = {
        data: null,
        error: { message: 'Upload failed' },
      };

      mockSupabaseClient.storage.upload.mockResolvedValueOnce(mockUploadResponse);

      const result = await storageService.uploadFile(mockFile, 'test-path');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.SUPABASE_ERROR);
      expect(result.error?.message).toContain('Upload failed');
    });

    it('should use custom filename when provided', async () => {
      const mockUploadResponse = {
        data: { path: 'test-path/custom.pdf', fullPath: 'test-path/custom.pdf' },
        error: null,
      };

      mockSupabaseClient.storage.upload.mockResolvedValueOnce(mockUploadResponse);

      const result = await storageService.uploadFile(mockFile, 'test-path', {
        fileName: 'custom.pdf',
      });

      expect(result.success).toBe(true);
      expect(mockSupabaseClient.storage.upload).toHaveBeenCalledWith(
        'test-path/custom.pdf',
        mockFile,
        expect.objectContaining({
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: false,
        })
      );
    });
  });

  describe('downloadFile', () => {
    it('should download file successfully', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      const mockDownloadResponse = {
        data: mockBlob,
        error: null,
      };

      mockSupabaseClient.storage.download.mockResolvedValueOnce(mockDownloadResponse);

      const result = await storageService.downloadFile('test-path/test.pdf');

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Blob);
      expect(result.metadata?.duration).toBeGreaterThanOrEqual(0);
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('test-bucket');
      expect(mockSupabaseClient.storage.download).toHaveBeenCalledWith('test-path/test.pdf', undefined);
    });

    it('should handle download errors', async () => {
      const mockDownloadResponse = {
        data: null,
        error: { message: 'File not found' },
      };

      mockSupabaseClient.storage.download.mockResolvedValueOnce(mockDownloadResponse);

      const result = await storageService.downloadFile('test-path/nonexistent.pdf');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.SUPABASE_ERROR);
      expect(result.error?.message).toContain('File not found');
    });

    it('should pass transform options', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      const mockDownloadResponse = {
        data: mockBlob,
        error: null,
      };

      mockSupabaseClient.storage.download.mockResolvedValueOnce(mockDownloadResponse);

      const transformOptions = {
        width: 800,
        height: 600,
        resize: 'cover' as const,
      };

      const result = await storageService.downloadFile('test-path/test.pdf', {
        transform: transformOptions,
      });

      expect(result.success).toBe(true);
      expect(mockSupabaseClient.storage.download).toHaveBeenCalledWith(
        'test-path/test.pdf',
        transformOptions
      );
    });
  });

  describe('getSignedUrl', () => {
    it('should generate signed URL successfully', async () => {
      const mockSignedUrlResponse = {
        data: { signedUrl: 'https://signed-url.com/test.pdf' },
        error: null,
      };

      mockSupabaseClient.storage.createSignedUrl.mockResolvedValueOnce(mockSignedUrlResponse);

      const result = await storageService.getSignedUrl('test-path/test.pdf', 7200);

      expect(result.success).toBe(true);
      expect(result.data).toBe('https://signed-url.com/test.pdf');
      expect(result.metadata?.expiresAt).toBeInstanceOf(Date);
      expect(mockSupabaseClient.storage.createSignedUrl).toHaveBeenCalledWith('test-path/test.pdf', 7200);
    });

    it('should use default expiration time', async () => {
      const mockSignedUrlResponse = {
        data: { signedUrl: 'https://signed-url.com/test.pdf' },
        error: null,
      };

      mockSupabaseClient.storage.createSignedUrl.mockResolvedValueOnce(mockSignedUrlResponse);

      const result = await storageService.getSignedUrl('test-path/test.pdf');

      expect(result.success).toBe(true);
      expect(mockSupabaseClient.storage.createSignedUrl).toHaveBeenCalledWith('test-path/test.pdf', 3600);
    });

    it('should handle signed URL generation errors', async () => {
      const mockSignedUrlResponse = {
        data: null,
        error: { message: 'Access denied' },
      };

      mockSupabaseClient.storage.createSignedUrl.mockResolvedValueOnce(mockSignedUrlResponse);

      const result = await storageService.getSignedUrl('test-path/test.pdf');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.SUPABASE_ERROR);
      expect(result.error?.message).toContain('Access denied');
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const mockDeleteResponse = {
        data: null,
        error: null,
      };

      mockSupabaseClient.storage.remove.mockResolvedValueOnce(mockDeleteResponse);

      const result = await storageService.deleteFile('test-path/test.pdf');

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
      expect(mockSupabaseClient.storage.remove).toHaveBeenCalledWith(['test-path/test.pdf']);
    });

    it('should handle delete errors', async () => {
      const mockDeleteResponse = {
        data: null,
        error: { message: 'Delete failed' },
      };

      mockSupabaseClient.storage.remove.mockResolvedValueOnce(mockDeleteResponse);

      const result = await storageService.deleteFile('test-path/test.pdf');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.SUPABASE_ERROR);
      expect(result.error?.message).toContain('Delete failed');
    });
  });

  describe('listFiles', () => {
    it('should list files successfully', async () => {
      const mockFiles = [
        {
          name: 'file1.pdf',
          id: '1',
          updated_at: '2023-01-01T00:00:00Z',
          created_at: '2023-01-01T00:00:00Z',
          last_accessed_at: '2023-01-01T00:00:00Z',
          metadata: {
            eTag: 'etag1',
            size: 1024,
            mimetype: 'application/pdf',
            cacheControl: '3600',
            lastModified: '2023-01-01T00:00:00Z',
            contentLength: 1024,
            httpStatusCode: 200,
          },
        },
      ];

      const mockListResponse = {
        data: mockFiles,
        error: null,
      };

      mockSupabaseClient.storage.list.mockResolvedValueOnce(mockListResponse);

      const result = await storageService.listFiles('test-path', 50, 0);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFiles);
      expect(result.metadata?.totalCount).toBe(1);
      expect(mockSupabaseClient.storage.list).toHaveBeenCalledWith('test-path', {
        limit: 50,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });
    });

    it('should handle list errors', async () => {
      const mockListResponse = {
        data: null,
        error: { message: 'List failed' },
      };

      mockSupabaseClient.storage.list.mockResolvedValueOnce(mockListResponse);

      const result = await storageService.listFiles('test-path');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.SUPABASE_ERROR);
      expect(result.error?.message).toContain('List failed');
    });
  });

  describe('generateFileName', () => {
    it('should generate unique filename with user ID', () => {
      const userId = 'user123';
      const fileName = storageService.generateFileName(userId);

      expect(fileName).toMatch(/^diagnosis-report-user123-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-[a-z0-9]{6}\.pdf$/);
    });

    it('should generate filename with custom prefix', () => {
      const userId = 'user123';
      const fileName = storageService.generateFileName(userId, 'custom-report');

      expect(fileName).toMatch(/^custom-report-user123-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-[a-z0-9]{6}\.pdf$/);
    });
  });

  describe('getFileInfo', () => {
    it('should get file info successfully', async () => {
      const mockFileInfo = {
        name: 'test.pdf',
        id: '1',
        updated_at: '2023-01-01T00:00:00Z',
        created_at: '2023-01-01T00:00:00Z',
        last_accessed_at: '2023-01-01T00:00:00Z',
        metadata: {
          eTag: 'etag1',
          size: 1024,
          mimetype: 'application/pdf',
          cacheControl: '3600',
          lastModified: '2023-01-01T00:00:00Z',
          contentLength: 1024,
          httpStatusCode: 200,
        },
      };

      const mockListResponse = {
        data: [mockFileInfo],
        error: null,
      };

      mockSupabaseClient.storage.list.mockResolvedValueOnce(mockListResponse);

      const result = await storageService.getFileInfo('test-path/test.pdf');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFileInfo);
      expect(mockSupabaseClient.storage.list).toHaveBeenCalledWith('test-path', {
        search: 'test.pdf',
      });
    });

    it('should handle file not found', async () => {
      const mockListResponse = {
        data: [],
        error: null,
      };

      mockSupabaseClient.storage.list.mockResolvedValueOnce(mockListResponse);

      const result = await storageService.getFileInfo('test-path/nonexistent.pdf');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.SUPABASE_ERROR);
      expect(result.error?.message).toContain('File not found');
    });
  });

  describe('configuration', () => {
    it('should get current configuration', () => {
      const config = storageService.getConfiguration();
      
      expect(config).toHaveProperty('bucketName');
      expect(config).toHaveProperty('maxFileSize');
      expect(config).toHaveProperty('allowedMimeTypes');
      expect(config).toHaveProperty('retryAttempts');
      expect(config).toHaveProperty('retryDelay');
    });

    it('should update configuration', () => {
      const newConfig = {
        maxFileSize: 5242880,
        retryAttempts: 5,
      };

      storageService.updateConfiguration(newConfig);
      const updatedConfig = storageService.getConfiguration();

      expect(updatedConfig.maxFileSize).toBe(newConfig.maxFileSize);
      expect(updatedConfig.retryAttempts).toBe(newConfig.retryAttempts);
    });

    it('should validate configuration on update', () => {
      expect(() => {
        storageService.updateConfiguration({ bucketName: '' });
      }).toThrow('Storage bucket name is required');
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockSupabaseClient.storage.upload.mockRejectedValueOnce(new Error('network failed'));

      const result = await storageService.uploadFile(mockFile, 'test-path');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.SUPABASE_ERROR);
      expect(result.error?.retryable).toBe(true);
    });

    it('should handle authentication errors', async () => {
      // Mock the entire storage chain properly
      const mockStorageChain = {
        upload: vi.fn().mockRejectedValueOnce(new Error('forbidden access'))
      };
      mockSupabaseClient.storage.from.mockReturnValueOnce(mockStorageChain);

      const result = await storageService.uploadFile(mockFile, 'test-path');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.AUTHENTICATION_ERROR);
      expect(result.error?.retryable).toBe(false);
    });

    it('should handle storage-specific errors', async () => {
      mockSupabaseClient.storage.upload.mockRejectedValueOnce(new Error('bucket not found'));

      const result = await storageService.uploadFile(mockFile, 'test-path');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.SUPABASE_ERROR);
      expect(result.error?.retryable).toBe(true);
    });

    it('should handle generic errors', async () => {
      mockSupabaseClient.storage.upload.mockRejectedValueOnce(new Error('Generic error'));

      const result = await storageService.uploadFile(mockFile, 'test-path');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.SUPABASE_ERROR);
      expect(result.error?.retryable).toBe(true);
    });
  });
});