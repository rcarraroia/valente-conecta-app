export interface InstitutoUserData {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  origem_cadastro: 'visao_itinerante';
  consentimento_data_sharing: boolean;
  created_at: string;
}

export interface InstitutoApiConfig {
  id?: string;
  endpoint: string;
  method: 'POST' | 'PUT';
  auth_type: 'api_key' | 'bearer' | 'basic';
  api_key?: string;
  bearer_token?: string;
  basic_username?: string;
  basic_password?: string;
  sandbox_endpoint?: string;
  is_sandbox: boolean;
  retry_attempts: number;
  retry_delay: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IntegrationLog {
  id: string;
  user_id: string;
  status: 'success' | 'failed' | 'pending' | 'retry';
  payload: InstitutoUserData;
  response?: any;
  error_message?: string;
  attempt_count: number;
  next_retry_at?: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationStats {
  total_attempts: number;
  successful_sends: number;
  failed_sends: number;
  pending_retries: number;
  success_rate: number;
  last_24h_attempts: number;
  last_24h_success_rate: number;
}

export interface IntegrationResult {
  success: boolean;
  data?: any;
  error?: string;
  log_id?: string;
}

export interface IntegrationJob {
  id: string;
  log_id: string;
  user_data: InstitutoUserData;
  scheduled_for: string;
  attempts: number;
  max_attempts: number;
}

export enum IntegrationErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
  CONSENT_ERROR = 'CONSENT_ERROR'
}

export class IntegrationError extends Error {
  constructor(
    public type: IntegrationErrorType,
    message: string,
    public retryable: boolean = true,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'IntegrationError';
  }
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface RetryConfig {
  maxAttempts: number;
  delays: number[];
  backoffMultiplier: number;
}