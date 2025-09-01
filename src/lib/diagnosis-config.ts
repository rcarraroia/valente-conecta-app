// Diagnosis system configuration

export interface DiagnosisConfig {
  // Feature flags
  features: {
    chatEnabled: boolean;
    pdfGenerationEnabled: boolean;
    analyticsEnabled: boolean;
    monitoringEnabled: boolean;
    offlineModeEnabled: boolean;
  };
  
  // API configuration
  api: {
    n8nWebhookUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  
  // PDF configuration
  pdf: {
    maxFileSize: number; // in bytes
    compressionQuality: number;
    includeMetadata: boolean;
  };
  
  // Chat configuration
  chat: {
    maxMessageLength: number;
    sessionTimeout: number; // in minutes
    maxMessagesPerSession: number;
  };
  
  // Storage configuration
  storage: {
    bucketName: string;
    maxUploadSize: number;
    allowedFileTypes: string[];
  };
  
  // Analytics configuration
  analytics: {
    batchSize: number;
    flushInterval: number; // in milliseconds
    retentionDays: number;
  };
}

// Default configuration
export const diagnosisConfig: DiagnosisConfig = {
  features: {
    chatEnabled: true,
    pdfGenerationEnabled: true,
    analyticsEnabled: process.env.NODE_ENV === 'production',
    monitoringEnabled: process.env.NODE_ENV === 'production',
    offlineModeEnabled: true,
  },
  
  api: {
    n8nWebhookUrl: process.env.VITE_N8N_WEBHOOK_URL || '',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 2000, // 2 seconds
  },
  
  pdf: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    compressionQuality: 0.8,
    includeMetadata: true,
  },
  
  chat: {
    maxMessageLength: 2000,
    sessionTimeout: 24 * 60, // 24 hours
    maxMessagesPerSession: 100,
  },
  
  storage: {
    bucketName: 'diagnosis-reports',
    maxUploadSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['application/pdf'],
  },
  
  analytics: {
    batchSize: 20,
    flushInterval: 30000, // 30 seconds
    retentionDays: 90,
  },
};

// Feature flag helper
export const isFeatureEnabled = (feature: keyof DiagnosisConfig['features']): boolean => {
  return diagnosisConfig.features[feature];
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'development') {
  diagnosisConfig.features.analyticsEnabled = process.env.VITE_ENABLE_ANALYTICS === 'true';
  diagnosisConfig.features.monitoringEnabled = process.env.VITE_ENABLE_MONITORING === 'true';
  diagnosisConfig.api.timeout = 10000; // Shorter timeout in development
}

if (process.env.NODE_ENV === 'test') {
  diagnosisConfig.features.analyticsEnabled = false;
  diagnosisConfig.features.monitoringEnabled = false;
  diagnosisConfig.api.timeout = 5000;
  diagnosisConfig.analytics.flushInterval = 1000; // Faster flush in tests
}

// Configuration validation
export const validateConfig = (): boolean => {
  const errors: string[] = [];
  
  if (!diagnosisConfig.api.n8nWebhookUrl && diagnosisConfig.features.chatEnabled) {
    errors.push('N8n webhook URL is required when chat is enabled');
  }
  
  if (diagnosisConfig.pdf.maxFileSize <= 0) {
    errors.push('PDF max file size must be greater than 0');
  }
  
  if (diagnosisConfig.chat.sessionTimeout <= 0) {
    errors.push('Chat session timeout must be greater than 0');
  }
  
  if (errors.length > 0) {
    console.error('Diagnosis configuration errors:', errors);
    return false;
  }
  
  return true;
};

// Initialize configuration validation
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}