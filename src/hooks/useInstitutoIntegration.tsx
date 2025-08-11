import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { institutoIntegrationService } from '@/services/instituto-integration.service';
import { integrationQueueService } from '@/services/integration-queue.service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  InstitutoUserData, 
  IntegrationResult, 
  IntegrationStats 
} from '@/types/instituto-integration';
import { userRegistrationDataSchema } from '@/schemas/instituto-integration.schema';

export interface UseInstitutoIntegrationOptions {
  enableStats?: boolean;
  enableQueueStats?: boolean;
  autoRefreshInterval?: number;
}

export const useInstitutoIntegration = (options: UseInstitutoIntegrationOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const {
    enableStats = true,
    enableQueueStats = false,
    autoRefreshInterval = 30000 // 30 seconds
  } = options;

  // Mutation for sending user data
  const sendUserData = useMutation({
    mutationFn: async (userData: InstitutoUserData): Promise<IntegrationResult> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      return institutoIntegrationService.sendUserData(userData, user.id);
    },
    onSuccess: (result, userData) => {
      if (result.success) {
        toast.success('Dados enviados com sucesso para o Instituto Coração Valente');
        
        // Invalidate stats to refresh them
        queryClient.invalidateQueries({ queryKey: ['instituto-integration-stats'] });
        queryClient.invalidateQueries({ queryKey: ['instituto-integration-queue-stats'] });
        
        // Log success for analytics
        console.log('Instituto integration success:', {
          userId: user?.id,
          logId: result.log_id,
          userEmail: userData.email
        });
      } else {
        toast.error(`Erro ao enviar dados: ${result.error}`);
        
        // Log error for analytics
        console.error('Instituto integration failed:', {
          userId: user?.id,
          error: result.error,
          logId: result.log_id
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro interno: ${error.message}`);
      console.error('Instituto integration mutation error:', error);
    }
  });

  // Query for integration statistics
  const stats = useQuery({
    queryKey: ['instituto-integration-stats'],
    queryFn: () => institutoIntegrationService.getStats(),
    enabled: enableStats,
    refetchInterval: autoRefreshInterval,
    staleTime: 30000, // Consider data stale after 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Query for queue statistics (admin only)
  const queueStats = useQuery({
    queryKey: ['instituto-integration-queue-stats'],
    queryFn: () => integrationQueueService.getQueueStats(),
    enabled: enableQueueStats,
    refetchInterval: autoRefreshInterval,
    staleTime: 30000,
    gcTime: 300000,
    retry: 2
  });

  // Helper function to send user registration data
  const sendRegistrationData = useMutation({
    mutationFn: async (registrationData: {
      name: string;
      email: string;
      phone: string;
      cpf: string;
      consent_data_sharing?: boolean;
    }): Promise<IntegrationResult> => {
      // Validate input data
      const validatedInput = userRegistrationDataSchema.parse(registrationData);
      
      // Check consent
      if (!validatedInput.consent_data_sharing) {
        throw new Error('Consentimento para compartilhamento de dados é obrigatório');
      }

      // Transform to Instituto format
      const institutoData: InstitutoUserData = {
        nome: validatedInput.name,
        email: validatedInput.email,
        telefone: validatedInput.phone.replace(/\D/g, ''), // Remove non-digits
        cpf: validatedInput.cpf.replace(/\D/g, ''), // Remove non-digits
        origem_cadastro: 'visao_itinerante',
        consentimento_data_sharing: true,
        created_at: new Date().toISOString()
      };

      return sendUserData.mutateAsync(institutoData);
    },
    onSuccess: (result, registrationData) => {
      console.log('Registration data sent to Instituto:', {
        email: registrationData.email,
        success: result.success
      });
    }
  });

  // Function to refresh stats manually
  const refreshStats = () => {
    if (enableStats) {
      queryClient.invalidateQueries({ queryKey: ['instituto-integration-stats'] });
    }
    if (enableQueueStats) {
      queryClient.invalidateQueries({ queryKey: ['instituto-integration-queue-stats'] });
    }
  };

  // Function to force queue processing
  const processQueueNow = useMutation({
    mutationFn: async () => {
      await integrationQueueService.processQueue();
    },
    onSuccess: () => {
      toast.success('Processamento da fila iniciado');
      refreshStats();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao processar fila: ${error.message}`);
    }
  });

  return {
    // Main functions
    sendUserData,
    sendRegistrationData,
    
    // Statistics
    stats: stats.data,
    isLoadingStats: stats.isLoading,
    statsError: stats.error,
    
    // Queue statistics (admin)
    queueStats: queueStats.data,
    isLoadingQueueStats: queueStats.isLoading,
    queueStatsError: queueStats.error,
    
    // Utility functions
    refreshStats,
    processQueueNow,
    
    // Status flags
    isSending: sendUserData.isPending || sendRegistrationData.isPending,
    isProcessingQueue: processQueueNow.isPending,
    
    // Error states
    sendError: sendUserData.error || sendRegistrationData.error,
    
    // Success states
    lastSendResult: sendUserData.data,
    
    // Reset functions
    resetSendState: () => {
      sendUserData.reset();
      sendRegistrationData.reset();
    }
  };
};

// Hook specifically for admin dashboard
export const useInstitutoIntegrationAdmin = () => {
  return useInstitutoIntegration({
    enableStats: true,
    enableQueueStats: true,
    autoRefreshInterval: 15000 // More frequent updates for admin
  });
};

// Hook for user registration forms
export const useInstitutoIntegrationRegistration = () => {
  const integration = useInstitutoIntegration({
    enableStats: false,
    enableQueueStats: false
  });

  return {
    sendRegistrationData: integration.sendRegistrationData,
    isSending: integration.isSending,
    sendError: integration.sendError,
    lastSendResult: integration.lastSendResult,
    resetSendState: integration.resetSendState
  };
};