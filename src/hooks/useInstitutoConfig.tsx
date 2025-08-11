import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { institutoIntegrationService } from '@/services/instituto-integration.service';
import { CredentialEncryption } from '@/utils/encryption';
import { toast } from 'sonner';
import { 
  InstitutoApiConfig,
  IntegrationResult 
} from '@/types/instituto-integration';
import { institutoApiConfigSchema } from '@/schemas/instituto-integration.schema';

export const useInstitutoConfig = () => {
  const queryClient = useQueryClient();

  // Query to fetch current configuration
  const config = useQuery({
    queryKey: ['instituto-integration-config'],
    queryFn: async (): Promise<InstitutoApiConfig | null> => {
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

      // Decrypt credentials for display (but don't expose sensitive data)
      const decryptedCredentials = CredentialEncryption.decrypt(data.encrypted_credentials);
      
      return {
        ...data,
        // Only include credential indicators, not actual values
        api_key: decryptedCredentials.api_key ? '***' : undefined,
        bearer_token: decryptedCredentials.bearer_token ? '***' : undefined,
        basic_username: decryptedCredentials.basic_username || undefined,
        basic_password: decryptedCredentials.basic_password ? '***' : undefined
      };
    },
    staleTime: 60000, // Consider stale after 1 minute
    gcTime: 300000, // Keep in cache for 5 minutes
    retry: 2
  });

  // Mutation to save configuration
  const saveConfig = useMutation({
    mutationFn: async (configData: Omit<InstitutoApiConfig, 'id' | 'created_at' | 'updated_at'>): Promise<InstitutoApiConfig> => {
      // Validate configuration
      const validatedConfig = institutoApiConfigSchema.parse(configData);
      
      // Encrypt credentials
      const encryptedCredentials = CredentialEncryption.encryptCredentials(validatedConfig);
      
      // Prepare data for database (remove credential fields)
      const { api_key, bearer_token, basic_username, basic_password, ...dbConfig } = validatedConfig;
      
      const configToSave = {
        ...dbConfig,
        encrypted_credentials: encryptedCredentials,
        updated_at: new Date().toISOString()
      };

      // Check if config exists
      const { data: existingConfig } = await supabase
        .from('instituto_integration_config')
        .select('id')
        .eq('is_active', true)
        .single();

      let result;
      
      if (existingConfig) {
        // Update existing config
        const { data, error } = await supabase
          .from('instituto_integration_config')
          .update(configToSave)
          .eq('id', existingConfig.id)
          .select()
          .single();

        if (error) {
          throw new Error(`Erro ao atualizar configuração: ${error.message}`);
        }
        result = data;
      } else {
        // Create new config
        const { data, error } = await supabase
          .from('instituto_integration_config')
          .insert([configToSave])
          .select()
          .single();

        if (error) {
          throw new Error(`Erro ao criar configuração: ${error.message}`);
        }
        result = data;
      }

      return result;
    },
    onSuccess: () => {
      toast.success('Configuração salva com sucesso');
      queryClient.invalidateQueries({ queryKey: ['instituto-integration-config'] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao salvar configuração: ${error.message}`);
      console.error('Config save error:', error);
    }
  });

  // Mutation to test configuration
  const testConfig = useMutation({
    mutationFn: async (configData: Omit<InstitutoApiConfig, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
      const validatedConfig = institutoApiConfigSchema.parse(configData);
      return institutoIntegrationService.validateConfig(validatedConfig);
    },
    onSuccess: (isValid) => {
      if (isValid) {
        toast.success('Configuração testada com sucesso - API acessível');
      } else {
        toast.error('Teste falhou - Verifique as configurações');
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro ao testar configuração: ${error.message}`);
    }
  });

  // Mutation to delete configuration
  const deleteConfig = useMutation({
    mutationFn: async (): Promise<void> => {
      const { error } = await supabase
        .from('instituto_integration_config')
        .update({ is_active: false })
        .eq('is_active', true);

      if (error) {
        throw new Error(`Erro ao desativar configuração: ${error.message}`);
      }
    },
    onSuccess: () => {
      toast.success('Configuração desativada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['instituto-integration-config'] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao desativar configuração: ${error.message}`);
    }
  });

  // Function to generate default configuration
  const getDefaultConfig = (): Partial<InstitutoApiConfig> => ({
    method: 'POST',
    auth_type: 'api_key',
    is_sandbox: true,
    retry_attempts: 3,
    retry_delay: 5000,
    is_active: true
  });

  // Function to validate encryption key
  const validateEncryption = () => {
    const isValid = CredentialEncryption.validateEncryptionKey();
    if (!isValid) {
      toast.warning('Chave de criptografia fraca detectada. Configure VITE_ENCRYPTION_KEY em produção.');
    }
    return isValid;
  };

  return {
    // Data
    config: config.data,
    isLoading: config.isLoading,
    error: config.error,
    
    // Actions
    saveConfig,
    testConfig,
    deleteConfig,
    
    // Status
    isSaving: saveConfig.isPending,
    isTesting: testConfig.isPending,
    isDeleting: deleteConfig.isPending,
    
    // Test results
    testResult: testConfig.data,
    testError: testConfig.error,
    
    // Utilities
    getDefaultConfig,
    validateEncryption,
    
    // Refresh
    refetch: config.refetch,
    
    // Reset states
    resetSaveState: saveConfig.reset,
    resetTestState: testConfig.reset
  };
};