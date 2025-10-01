import { useState, useCallback, useEffect } from 'react';
import { usePaymentStatus } from './usePaymentStatus';
import { notifyPaymentReceived, initializeNotifications } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

interface PixCheckoutData {
  id: string;
  value: number;
  pixQrCode?: string;
  pixCopyPaste?: string;
  invoiceUrl?: string;
  externalReference?: string;
}

interface UsePixCheckoutOptions {
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

export const usePixCheckout = (options: UsePixCheckoutOptions = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<PixCheckoutData | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();

  // Inicializar notificações quando o hook for criado
  useEffect(() => {
    initializeNotifications().then(enabled => {
      setNotificationsEnabled(enabled);
      if (enabled) {
        console.log('✅ Notificações habilitadas para checkout PIX');
      } else {
        console.log('⚠️ Notificações não disponíveis');
      }
    });
  }, []);

  // Hook de monitoramento de status (só ativo quando checkout estiver aberto)
  const {
    status,
    isLoading,
    error,
    timeElapsed,
    isActive,
    checkNow,
    stop,
    restart
  } = usePaymentStatus({
    paymentId: paymentData?.id || '',
    enabled: isOpen && !!paymentData?.id,
    interval: 30, // Verificar a cada 30 segundos
    maxDuration: 600, // Timeout de 10 minutos
    onStatusChange: (status) => {
      console.log('📊 Status do pagamento atualizado:', status);
    },
    onSuccess: (payment) => {
      console.log('🎉 Pagamento confirmado!', payment);
      handlePaymentSuccess(payment.id, payment.amount || 0);
    },
    onTimeout: () => {
      console.log('⏰ Timeout do checkout PIX');
      toast({
        title: "Tempo esgotado",
        description: "Verificação automática encerrada. Você pode verificar manualmente.",
        variant: "destructive"
      });
    }
  });

  // Função para abrir checkout PIX
  const openPixCheckout = useCallback((data: PixCheckoutData) => {
    console.log('🔓 Abrindo checkout PIX:', data);
    setPaymentData(data);
    setIsOpen(true);
  }, []);

  // Função para fechar checkout
  const closePixCheckout = useCallback(() => {
    console.log('🔒 Fechando checkout PIX');
    setIsOpen(false);
    setPaymentData(null);
    stop(); // Parar monitoramento
    options.onClose?.();
  }, [stop, options]);

  // Função chamada quando pagamento é confirmado
  const handlePaymentSuccess = useCallback(async (paymentId: string, amount: number) => {
    console.log('✅ Processando sucesso do pagamento:', { paymentId, amount });

    // Enviar notificação se habilitada
    if (notificationsEnabled) {
      try {
        await notifyPaymentReceived(amount, 'PIX');
        console.log('📱 Notificação de pagamento enviada');
      } catch (error) {
        console.warn('Erro ao enviar notificação:', error);
      }
    }

    // Toast de sucesso
    toast({
      title: "🎉 Pagamento confirmado!",
      description: `Sua doação de R$ ${(amount / 100).toFixed(2)} foi recebida com sucesso!`,
    });

    // Fechar checkout
    setIsOpen(false);
    setPaymentData(null);

    // Callback de sucesso
    options.onSuccess?.(paymentId);
  }, [notificationsEnabled, toast, options]);

  // Função para lidar com erros
  const handlePaymentError = useCallback((error: string) => {
    console.error('❌ Erro no checkout PIX:', error);
    
    toast({
      title: "Erro no pagamento",
      description: error,
      variant: "destructive"
    });

    options.onError?.(error);
  }, [toast, options]);

  // Função para verificação manual
  const checkPaymentNow = useCallback(async () => {
    if (!paymentData?.id) return;
    
    try {
      const result = await checkNow();
      if (result?.status === 'pending') {
        toast({
          title: "Ainda processando",
          description: "Seu pagamento ainda está sendo processado. Aguarde...",
        });
      }
    } catch (error) {
      console.error('Erro na verificação manual:', error);
    }
  }, [paymentData?.id, checkNow, toast]);

  return {
    // Estado
    isOpen,
    paymentData,
    status,
    isLoading,
    error,
    timeElapsed,
    isActive,
    notificationsEnabled,

    // Ações
    openPixCheckout,
    closePixCheckout,
    checkPaymentNow,
    handlePaymentError,

    // Dados para o componente
    checkoutProps: paymentData ? {
      paymentData,
      onClose: closePixCheckout,
      onSuccess: handlePaymentSuccess,
      onError: handlePaymentError
    } : null
  };
};