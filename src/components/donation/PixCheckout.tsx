import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, X, RefreshCw, Clock, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PixCheckoutProps {
  paymentData: {
    id: string;
    value: number;
    pixQrCode?: string;
    pixCopyPaste?: string;
    invoiceUrl?: string;
    externalReference?: string;
  };
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

export const PixCheckout: React.FC<PixCheckoutProps> = ({
  paymentData,
  onClose,
  onSuccess,
  onError
}) => {
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const { toast } = useToast();

  // Timer para mostrar tempo decorrido
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Função para copiar código PIX
  const handleCopyPixCode = async () => {
    if (!paymentData.pixCopyPaste) {
      toast({
        title: "Erro",
        description: "Código PIX não disponível",
        variant: "destructive"
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(paymentData.pixCopyPaste);
      setCopied(true);
      toast({
        title: "Código copiado!",
        description: "Cole no seu app de pagamentos para finalizar a doação",
      });

      // Reset do estado "copiado" após 3 segundos
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Tente copiar manualmente o código abaixo",
        variant: "destructive"
      });
    }
  };

  // Função para verificar status manualmente
  const handleCheckStatus = () => {
    setIsChecking(true);
    // TODO: Implementar verificação de status
    setTimeout(() => {
      setIsChecking(false);
      toast({
        title: "Verificando...",
        description: "Aguarde, estamos verificando seu pagamento",
      });
    }, 2000);
  };

  // Função para abrir no app bancário (fallback)
  const handleOpenBankApp = () => {
    if (paymentData.invoiceUrl) {
      window.open(paymentData.invoiceUrl, '_blank');
    }
  };

  // Formatar tempo decorrido
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-cv-purple-dark">
              💳 Pagamento PIX
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="secondary" className="bg-cv-green-mint text-white">
              R$ {(paymentData.value / 100).toFixed(2)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {formatTime(timeElapsed)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* QR Code Section */}
          {paymentData.pixQrCode && (
            <div className="text-center space-y-3">
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-cv-gray-light inline-block">
                <img
                  src={`data:image/png;base64,${paymentData.pixQrCode}`}
                  alt="QR Code PIX"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <p className="text-sm text-cv-gray-light">
                📱 Escaneie com seu app de pagamentos
              </p>
            </div>
          )}

          {/* Código Copia e Cola */}
          {paymentData.pixCopyPaste && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-cv-gray-dark">
                  Código PIX:
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPixCode}
                  className="text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-cv-off-white p-3 rounded-lg border">
                <code className="text-xs break-all text-cv-gray-dark">
                  {paymentData.pixCopyPaste}
                </code>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="bg-cv-yellow-soft/20 p-4 rounded-lg border border-cv-yellow-soft">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-cv-purple-dark" />
              <span className="text-sm font-medium text-cv-purple-dark">
                Aguardando pagamento...
              </span>
            </div>
            <p className="text-xs text-cv-gray-light">
              ⚡ Será confirmado automaticamente quando o pagamento for processado
            </p>
          </div>

          {/* Ações */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="flex-1"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Verificar
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleOpenBankApp}
              className="flex-1"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Abrir App
            </Button>
          </div>

          {/* Fallback para problemas */}
          <div className="text-center">
            <p className="text-xs text-cv-gray-light mb-2">
              Problemas com o QR Code?
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={handleOpenBankApp}
              className="text-cv-blue-heart text-xs"
            >
              Abrir página de pagamento tradicional
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};