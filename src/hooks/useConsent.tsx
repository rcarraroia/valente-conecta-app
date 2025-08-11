import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ConsentRecord {
  id: string;
  user_id: string;
  consent_data_sharing: boolean;
  consent_date: string;
  revoked_date?: string;
  created_at: string;
  updated_at: string;
}

export const useConsent = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to fetch current consent status
  const consentQuery = useQuery({
    queryKey: ['user-consent', user?.id],
    queryFn: async (): Promise<ConsentRecord | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_consent')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw new Error(`Erro ao buscar consentimento: ${error.message}`);
      }

      return data;
    },
    enabled: !!user,
    staleTime: 60000 // Consider stale after 1 minute
  });

  // Mutation to grant consent
  const grantConsent = useMutation({
    mutationFn: async (): Promise<ConsentRecord> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('user_consent')
        .insert([{
          user_id: user.id,
          consent_data_sharing: true,
          consent_date: now
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao conceder consentimento: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Consentimento concedido com sucesso');
      queryClient.invalidateQueries({ queryKey: ['user-consent', user?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao conceder consentimento: ${error.message}`);
    }
  });

  // Mutation to revoke consent
  const revokeConsent = useMutation({
    mutationFn: async (): Promise<ConsentRecord> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      if (!consentQuery.data) {
        throw new Error('Nenhum consentimento encontrado para revogar');
      }

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('user_consent')
        .update({
          consent_data_sharing: false,
          revoked_date: now,
          updated_at: now
        })
        .eq('id', consentQuery.data.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao revogar consentimento: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Consentimento revogado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['user-consent', user?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao revogar consentimento: ${error.message}`);
    }
  });

  // Mutation to update consent (grant or revoke based on current state)
  const updateConsent = useMutation({
    mutationFn: async (shouldConsent: boolean): Promise<ConsentRecord> => {
      if (shouldConsent) {
        return grantConsent.mutateAsync();
      } else {
        return revokeConsent.mutateAsync();
      }
    }
  });

  // Computed values
  const hasActiveConsent = consentQuery.data 
    ? consentQuery.data.consent_data_sharing && !consentQuery.data.revoked_date
    : false;

  const hasEverConsented = !!consentQuery.data;

  const consentStatus = (() => {
    if (!consentQuery.data) return 'never_given';
    if (consentQuery.data.consent_data_sharing && !consentQuery.data.revoked_date) return 'active';
    if (consentQuery.data.revoked_date) return 'revoked';
    return 'inactive';
  })();

  // Function to check if user can proceed with data sharing
  const canShareData = () => {
    return hasActiveConsent;
  };

  // Function to validate consent for form submission
  const validateConsent = (consentValue: boolean) => {
    if (!consentValue) {
      return 'Consentimento é obrigatório para prosseguir';
    }
    return null;
  };

  // Function to get consent display info
  const getConsentDisplayInfo = () => {
    switch (consentStatus) {
      case 'active':
        return {
          label: 'Consentimento Ativo',
          description: 'Seus dados podem ser compartilhados com o Instituto',
          color: 'green',
          canShare: true
        };
      case 'revoked':
        return {
          label: 'Consentimento Revogado',
          description: 'Você revogou o consentimento para compartilhamento',
          color: 'red',
          canShare: false
        };
      case 'never_given':
        return {
          label: 'Consentimento Não Concedido',
          description: 'Você ainda não concedeu consentimento para compartilhamento',
          color: 'gray',
          canShare: false
        };
      default:
        return {
          label: 'Status Desconhecido',
          description: 'Status do consentimento não pode ser determinado',
          color: 'gray',
          canShare: false
        };
    }
  };

  return {
    // Data
    consentRecord: consentQuery.data,
    hasActiveConsent,
    hasEverConsented,
    consentStatus,
    
    // Loading states
    isLoading: consentQuery.isLoading,
    isGranting: grantConsent.isPending,
    isRevoking: revokeConsent.isPending,
    isUpdating: updateConsent.isPending,
    
    // Error states
    error: consentQuery.error,
    grantError: grantConsent.error,
    revokeError: revokeConsent.error,
    updateError: updateConsent.error,
    
    // Actions
    grantConsent: grantConsent.mutate,
    revokeConsent: revokeConsent.mutate,
    updateConsent: updateConsent.mutate,
    
    // Utilities
    canShareData,
    validateConsent,
    getConsentDisplayInfo,
    
    // Refresh
    refetch: consentQuery.refetch
  };
};