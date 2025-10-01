import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentStatusData {
  id: string;
  status: 'pending' | 'received' | 'confirmed' | 'failed';
  amount?: number;
  paidAt?: string;
  method?: string;
}

interface UsePaymentStatusOptions {
  paymentId: string;
  enabled?: boolean;
  interval?: number; // em segundos
  maxDuration?: number; // em segundos
  onStatusChange?: (status: PaymentStatusData) => void;
  onSuccess?: (payment: PaymentStatusData) => void;
  onTimeout?: () => void;
}

export const usePaymentStatus = ({
  paymentId,
  enabled = true,
  interval = 30, // 30 segundos
  maxDuration = 600, // 10 minutos
  onStatusChange,
  onSuccess,
  onTimeout
}: UsePaymentStatusOptions) => {
  const [status, setStatus] = useState<PaymentStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isActive, setIsActive] = useState(enabled);

  // Função para verificar status do pagamento
  const checkPaymentStatus = useCallback(async () => {
    if (!paymentId || !isActive) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Verificando status do pagamento:', paymentId);

      // Primeiro, tentar buscar na tabela donations
      const { data: donation, error: donationError } = await supabase
        .from('donations')
        .select('*')
        .eq('transaction_id', paymentId)
        .maybeSingle();

      if (donationError) {
        console.warn('Erro ao buscar doação:', donationError);
      }

      if (donation) {
        const statusData: PaymentStatusData = {
          id: donation.transaction_id,
          status: donation.status as PaymentStatusData['status'],
          amount: donation.amount * 100, // converter para centavos
          paidAt: donation.updated_at,
          method: donation.payment_method
        };

        setStatus(statusData);
        onStatusChange?.(statusData);

        // Se pagamento foi confirmado, chamar callback de sucesso
        if (donation.status === 'received' || donation.status === 'confirmed') {
          console.log('✅ Pagamento confirmado!', statusData);
          onSuccess?.(statusData);
          setIsActive(false); // Parar polling
          return statusData;
        }
      }

      // Se não encontrou na tabela ou ainda está pendente, 
      // tentar verificar via Edge Function (opcional)
      try {
        const { data: edgeResponse, error: edgeError } = await supabase.functions.invoke('check-payment-status', {
          body: { paymentId }
        });

        if (!edgeError && edgeResponse?.status) {
          const statusData: PaymentStatusData = {
            id: paymentId,
            status: edgeResponse.status,
            amount: edgeResponse.amount,
            paidAt: edgeResponse.paidAt,
            method: edgeResponse.method
          };

          setStatus(statusData);
          onStatusChange?.(statusData);

          if (edgeResponse.status === 'received' || edgeResponse.status === 'confirmed') {
            console.log('✅ Pagamento confirmado via Edge Function!', statusData);
            onSuccess?.(statusData);
            setIsActive(false);
            return statusData;
          }
        }
      } catch (edgeError) {
        console.warn('Edge Function check-payment-status não disponível:', edgeError);
      }

      // Se chegou até aqui, pagamento ainda está pendente
      const pendingStatus: PaymentStatusData = {
        id: paymentId,
        status: 'pending'
      };
      
      setStatus(pendingStatus);
      onStatusChange?.(pendingStatus);
      
      return pendingStatus;

    } catch (err: any) {
      console.error('Erro ao verificar status do pagamento:', err);
      setError(err.message || 'Erro ao verificar pagamento');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [paymentId, isActive, onStatusChange, onSuccess]);

  // Verificação manual
  const checkNow = useCallback(() => {
    return checkPaymentStatus();
  }, [checkPaymentStatus]);

  // Parar polling
  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  // Reiniciar polling
  const restart = useCallback(() => {
    setTimeElapsed(0);
    setIsActive(true);
    setError(null);
  }, []);

  // Effect para polling automático
  useEffect(() => {
    if (!isActive || !paymentId) return;

    // Verificação inicial
    checkPaymentStatus();

    // Configurar polling
    const pollInterval = setInterval(() => {
      checkPaymentStatus();
    }, interval * 1000);

    // Timer para contar tempo decorrido
    const timeInterval = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        
        // Verificar timeout
        if (newTime >= maxDuration) {
          console.log('⏰ Timeout do polling de pagamento');
          setIsActive(false);
          onTimeout?.();
        }
        
        return newTime;
      });
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timeInterval);
    };
  }, [isActive, paymentId, interval, maxDuration, checkPaymentStatus, onTimeout]);

  return {
    status,
    isLoading,
    error,
    timeElapsed,
    isActive,
    checkNow,
    stop,
    restart
  };
};