import { supabase } from '@/integrations/supabase/client';
import { 
  InstitutoUserData, 
  InstitutoApiConfig, 
  IntegrationResult, 
  IntegrationError, 
  IntegrationErrorType,
  ApiResponse 
} from '@/types/instituto-integration';
import { institutoUserDataSchema, institutoApiConfigSchema } from '@/schemas/instituto-integration.schema';
import { CredentialEncryption } from '@/utils/encryption';
import { InstitutoRateLimiter } from '@/utils/rate-limiter';
import { InputSanitizer } from '@/utils/input-sanitizer';
import { TestEnvironment } from '@/utils/test-environment';

export class InstitutoIntegrationService {
  private static instance: InstitutoIntegrationService;
  private config: InstitutoApiConfig | null = null;
  private configLastFetch: number = 0;
  private readonly CONFIG_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): InstitutoIntegrationService {
    if (!InstitutoIntegrationService.instance) {
      InstitutoIntegrationService.instance = new InstitutoIntegrationService();
    }
    return InstitutoIntegrationService.instance;
  }

  /**
   * Sends user data to Instituto Coração Valente API
   */
  async sendUserData(userData: InstitutoUserData, userId: string): Promise<IntegrationResult> {
    try {
      // Check rate limiting for user
      const rateLimitCheck = InstitutoRateLimiter.canSendUserData(userId);
      if (!rateLimitCheck.allowed) {
        const resetTime = new Date(rateLimitCheck.resetTime || Date.now() + 300000);
        throw new IntegrationError(
          IntegrationErrorType.RATE_LIMIT,
          `Limite de tentativas excedido. Tente novamente em ${resetTime.toLocaleTimeString()}`,
          false
        );
      }

      // Check global API rate limiting
      const apiRateCheck = InstitutoRateLimiter.canMakeApiCall();
      if (!apiRateCheck.allowed) {
        throw new IntegrationError(
          IntegrationErrorType.RATE_LIMIT,
          'Limite global de API excedido. Tente novamente mais tarde',
          true
        );
      }

      // Sanitize and validate input data
      const sanitizedData = this.sanitizeUserData(userData);
      const validatedData = this.validateUserData(sanitizedData);
      
      // Get current configuration
      const config = await this.getConfig();
      if (!config) {
        throw new IntegrationError(
          IntegrationErrorType.CONFIG_ERROR,
          'Configuração da integração não encontrada',
          false
        );
      }

      if (!config.is_active) {
        throw new IntegrationError(
          IntegrationErrorType.CONFIG_ERROR,
          'Integração está desativada',
          false
        );
      }

      // Log attempt as pending
      const logId = await this.logAttempt({
        user_id: userId,
        status: 'pending',
        payload: validatedData,
        attempt_count: 1
      });

      try {
        // Check if we should use test environment
        let response;
        if (TestEnvironment.isMockEnabled()) {
          const mockResult = await TestEnvironment.simulateApiResponse(validatedData);
          if (!mockResult.success) {
            throw new IntegrationError(
              IntegrationErrorType.SERVER_ERROR,
              mockResult.error || 'Mock API error',
              true
            );
          }
          response = mockResult.data;
        } else {
          // Make real API request
          response = await this.makeApiRequest(validatedData, config);
        }
        
        // Record successful rate limit usage
        InstitutoRateLimiter.recordUserDataSend(userId, true);
        InstitutoRateLimiter.recordApiCall(true);

        // Log success
        await this.updateLog(logId, {
          status: 'success',
          response: response,
          updated_at: new Date().toISOString()
        });

        console.log(InputSanitizer.createSafeLogMessage(
          'Instituto integration successful',
          { userId, logId, email: validatedData.email }
        ));

        return {
          success: true,
          data: response,
          log_id: logId
        };

      } catch (error) {
        const integrationError = error as IntegrationError;
        
        // Record failed rate limit usage
        InstitutoRateLimiter.recordUserDataSend(userId, false);
        InstitutoRateLimiter.recordApiCall(false);

        // Log failure
        await this.updateLog(logId, {
          status: 'failed',
          error_message: integrationError.message,
          updated_at: new Date().toISOString()
        });

        console.error(InputSanitizer.createSafeLogMessage(
          'Instituto integration failed',
          { userId, logId, error: integrationError.message, type: integrationError.type }
        ));

        // Schedule retry if error is retryable
        if (integrationError.retryable) {
          await this.scheduleRetry(logId, config.retry_delay);
        }

        return {
          success: false,
          error: integrationError.message,
          log_id: logId
        };
      }

    } catch (error) {
      const integrationError = error instanceof IntegrationError 
        ? error 
        : new IntegrationError(
            IntegrationErrorType.SERVER_ERROR,
            `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            false
          );

      return {
        success: false,
        error: integrationError.message
      };
    }
  }

  /**
   * Validates API configuration
   */
  async validateConfig(config: InstitutoApiConfig): Promise<boolean> {
    try {
      // Validate schema
      institutoApiConfigSchema.parse(config);
      
      // Test connectivity
      const testEndpoint = config.is_sandbox && config.sandbox_endpoint 
        ? config.sandbox_endpoint 
        : config.endpoint;

      const testResponse = await fetch(`${testEndpoint}/health`, {
        method: 'GET',
        headers: this.buildHeaders(config),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      return testResponse.ok;
    } catch (error) {
      console.error('Config validation failed:', error);
      return false;
    }
  }

  /**
   * Processes retry queue
   */
  async processRetryQueue(): Promise<void> {
    try {
      const { data: queueItems, error } = await supabase
        .from('instituto_integration_queue')
        .select(`
          id,
          log_id,
          attempts,
          max_attempts,
          instituto_integration_logs (
            user_id,
            payload,
            attempt_count
          )
        `)
        .lte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(10);

      if (error) {
        throw new Error(`Erro ao buscar fila de retry: ${error.message}`);
      }

      if (!queueItems || queueItems.length === 0) {
        return;
      }

      for (const item of queueItems) {
        try {
          await this.processRetryItem(item);
        } catch (error) {
          console.error(`Erro ao processar item da fila ${item.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Erro ao processar fila de retry:', error);
    }
  }

  /**
   * Gets integration statistics
   */
  async getStats(): Promise<any> {
    try {
      const { data, error } = await supabase
        .rpc('get_instituto_integration_stats');

      if (error) {
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        total_attempts: 0,
        successful_sends: 0,
        failed_sends: 0,
        pending_retries: 0,
        success_rate: 0,
        last_24h_attempts: 0,
        last_24h_success_rate: 0
      };
    }
  }

  // Private methods

  private sanitizeUserData(userData: InstitutoUserData): InstitutoUserData {
    const { sanitized, errors } = InputSanitizer.sanitizeObject(userData, {
      nome: { type: 'name', maxLength: 100, required: true },
      email: { type: 'email', maxLength: 255, required: true },
      telefone: { type: 'phone', maxLength: 20, required: true },
      cpf: { type: 'cpf', maxLength: 14, required: true },
      origem_cadastro: { type: 'text', maxLength: 50, required: true },
      created_at: { type: 'text', maxLength: 30, required: true }
    });

    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors).join(', ');
      throw new IntegrationError(
        IntegrationErrorType.VALIDATION_ERROR,
        `Dados inválidos após sanitização: ${errorMessages}`,
        false
      );
    }

    return {
      ...userData,
      ...sanitized,
      consentimento_data_sharing: Boolean(userData.consentimento_data_sharing)
    };
  }

  private validateUserData(userData: InstitutoUserData): InstitutoUserData {
    try {
      return institutoUserDataSchema.parse(userData);
    } catch (error) {
      throw new IntegrationError(
        IntegrationErrorType.VALIDATION_ERROR,
        `Dados inválidos: ${error instanceof Error ? error.message : 'Erro de validação'}`,
        false
      );
    }
  }

  private async getConfig(): Promise<InstitutoApiConfig | null> {
    const now = Date.now();
    
    // Return cached config if still valid
    if (this.config && (now - this.configLastFetch) < this.CONFIG_CACHE_TTL) {
      return this.config;
    }

    try {
      const { data, error } = await supabase
        .from('instituto_integration_config')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw new Error(`Erro ao buscar configuração: ${error.message}`);
      }

      // Decrypt credentials
      const decryptedCredentials = CredentialEncryption.decrypt(data.encrypted_credentials);
      
      this.config = {
        ...data,
        ...decryptedCredentials
      };
      this.configLastFetch = now;

      return this.config;
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      return null;
    }
  }

  private async makeApiRequest(userData: InstitutoUserData, config: InstitutoApiConfig): Promise<any> {
    const endpoint = config.is_sandbox && config.sandbox_endpoint 
      ? config.sandbox_endpoint 
      : config.endpoint;

    const headers = this.buildHeaders(config);
    
    try {
      const response = await fetch(endpoint, {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(userData),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorType = this.getErrorTypeFromStatus(response.status);
        const errorMessage = responseData.message || responseData.error || `HTTP ${response.status}`;
        
        throw new IntegrationError(
          errorType,
          errorMessage,
          response.status >= 500 || response.status === 429 // Retry on server errors and rate limits
        );
      }

      return responseData;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new IntegrationError(
          IntegrationErrorType.NETWORK_ERROR,
          'Erro de conexão com a API do Instituto',
          true
        );
      }

      // Handle timeout
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new IntegrationError(
          IntegrationErrorType.NETWORK_ERROR,
          'Timeout na conexão com a API do Instituto',
          true
        );
      }

      throw new IntegrationError(
        IntegrationErrorType.SERVER_ERROR,
        `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        true
      );
    }
  }

  private buildHeaders(config: InstitutoApiConfig): Record<string, string> {
    const headers: Record<string, string> = {};

    switch (config.auth_type) {
      case 'api_key':
        if (config.api_key) {
          headers['X-API-Key'] = config.api_key;
        }
        break;
      case 'bearer':
        if (config.bearer_token) {
          headers['Authorization'] = `Bearer ${config.bearer_token}`;
        }
        break;
      case 'basic':
        if (config.basic_username && config.basic_password) {
          const credentials = btoa(`${config.basic_username}:${config.basic_password}`);
          headers['Authorization'] = `Basic ${credentials}`;
        }
        break;
    }

    return headers;
  }

  private getErrorTypeFromStatus(status: number): IntegrationErrorType {
    if (status === 401 || status === 403) {
      return IntegrationErrorType.AUTH_ERROR;
    }
    if (status === 400 || status === 422) {
      return IntegrationErrorType.VALIDATION_ERROR;
    }
    if (status === 429) {
      return IntegrationErrorType.RATE_LIMIT;
    }
    if (status >= 500) {
      return IntegrationErrorType.SERVER_ERROR;
    }
    return IntegrationErrorType.NETWORK_ERROR;
  }

  private async logAttempt(logData: {
    user_id: string;
    status: string;
    payload: InstitutoUserData;
    response?: any;
    error_message?: string;
    attempt_count: number;
  }): Promise<string> {
    const { data, error } = await supabase
      .from('instituto_integration_logs')
      .insert([logData])
      .select('id')
      .single();

    if (error) {
      throw new Error(`Erro ao criar log: ${error.message}`);
    }

    return data.id;
  }

  private async updateLog(logId: string, updates: any): Promise<void> {
    const { error } = await supabase
      .from('instituto_integration_logs')
      .update(updates)
      .eq('id', logId);

    if (error) {
      console.error(`Erro ao atualizar log ${logId}:`, error);
    }
  }

  private async scheduleRetry(logId: string, delayMs: number): Promise<void> {
    const { error } = await supabase
      .rpc('schedule_integration_retry', {
        p_log_id: logId,
        p_delay_seconds: Math.floor(delayMs / 1000)
      });

    if (error) {
      console.error(`Erro ao agendar retry para log ${logId}:`, error);
    }
  }

  private async processRetryItem(item: any): Promise<void> {
    const logData = item.instituto_integration_logs;
    if (!logData) {
      return;
    }

    try {
      // Increment attempt count
      const newAttemptCount = logData.attempt_count + 1;
      
      // Update log to retry status
      await this.updateLog(item.log_id, {
        status: 'retry',
        attempt_count: newAttemptCount,
        updated_at: new Date().toISOString()
      });

      // Check if we should use test environment
      let result;
      if (TestEnvironment.isMockEnabled()) {
        result = await TestEnvironment.simulateApiResponse(logData.payload);
      } else {
        result = await this.sendUserData(logData.payload, logData.user_id);
      }
      
      // Remove from queue if successful or max attempts reached
      if (result.success || newAttemptCount >= item.max_attempts) {
        await supabase
          .from('instituto_integration_queue')
          .delete()
          .eq('id', item.id);
      }

    } catch (error) {
      console.error(`Erro ao processar retry do item ${item.id}:`, error);
    }
  }
}

// Export singleton instance
export const institutoIntegrationService = InstitutoIntegrationService.getInstance();