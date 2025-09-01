
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Wallet, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AmbassadorWalletSetupProps {
  userId: string;
  currentWalletId?: string;
  onWalletUpdated?: (walletId: string) => void;
}

const AmbassadorWalletSetup = ({ userId, currentWalletId, onWalletUpdated }: AmbassadorWalletSetupProps) => {
  const [walletId, setWalletId] = useState(currentWalletId || '');
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setWalletId(currentWalletId || '');
  }, [currentWalletId]);

  const validateWalletId = async (id: string) => {
    if (!id) {
      setIsValid(false);
      setValidationMessage('');
      return false;
    }

    if (id.length < 10) {
      setIsValid(false);
      setValidationMessage('Wallet ID muito curto');
      return false;
    }

    setIsValidating(true);
    try {
      // Validar formato UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isValidFormat = uuidRegex.test(id);
      
      if (!isValidFormat) {
        setIsValid(false);
        setValidationMessage('Formato inválido. Use formato UUID.');
        return false;
      }

      setIsValid(true);
      setValidationMessage('Formato válido');
      return true;
    } catch (error) {
      setIsValid(false);
      setValidationMessage('Erro na validação');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleWalletIdChange = async (value: string) => {
    setWalletId(value);
    if (value) {
      await validateWalletId(value);
    } else {
      setIsValid(false);
      setValidationMessage('');
    }
  };

  const handleSave = async () => {
    if (!isValid || !walletId) {
      toast({
        title: "Wallet ID inválido",
        description: "Por favor, insira um Wallet ID válido do Asaas",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          ambassador_wallet_id: walletId,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Wallet ID salva com sucesso!",
        description: "Agora você pode receber comissões nas doações através do seu link.",
      });

      if (onWalletUpdated) {
        onWalletUpdated(walletId);
      }
    } catch (error: any) {
      console.error('Erro ao salvar wallet ID:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar sua Wallet ID. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testSplit = async () => {
    if (!walletId || !isValid) {
      toast({
        title: "Configure sua Wallet ID primeiro",
        description: "É necessário ter uma Wallet ID válida para testar o split",
        variant: "destructive"
      });
      return;
    }

    try {
      // Buscar código do embaixador
      const { data: profile } = await supabase
        .from('profiles')
        .select('ambassador_code')
        .eq('id', userId)
        .single();

      if (!profile?.ambassador_code) {
        toast({
          title: "Código de embaixador não encontrado",
          description: "Você precisa ter um código de embaixador ativo",
          variant: "destructive"
        });
        return;
      }

      // Importar e testar a função de split
      const { calculatePaymentSplitWithDB } = await import('@/utils/paymentSplit');
      const testAmount = 10000; // R$ 100,00 em centavos
      
      const splitResult = await calculatePaymentSplitWithDB(testAmount, profile.ambassador_code);
      
      console.log('Teste de split:', splitResult);
      
      toast({
        title: "Teste de split realizado!",
        description: `Para uma doação de R$ 100,00, você receberia R$ ${(splitResult.ambassadorShare / 100).toFixed(2)}`,
      });
    } catch (error: any) {
      console.error('Erro no teste de split:', error);
      toast({
        title: "Erro no teste",
        description: "Ocorreu um erro ao testar o split. Verifique os logs.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-cv-coral" />
          Configurar Wallet Asaas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="walletId">Wallet ID do Asaas</Label>
          <div className="relative">
            <Input
              id="walletId"
              type="text"
              placeholder="f9c7d1dd-9e52-4e81-8194-8b666f276405"
              value={walletId}
              onChange={(e) => handleWalletIdChange(e.target.value)}
              className={`pr-10 ${isValid && walletId ? 'border-green-500' : ''}`}
            />
            {isValidating && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cv-coral"></div>
              </div>
            )}
            {!isValidating && walletId && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isValid ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            )}
          </div>
          {validationMessage && (
            <p className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
              {validationMessage}
            </p>
          )}
          <p className="text-sm text-cv-gray-light">
            Encontre seu Wallet ID no painel do Asaas em: Minha Conta → Split de Pagamento → Carteiras
          </p>
        </div>

        <div className="bg-cv-blue-heart/10 p-4 rounded-lg">
          <div className="flex items-start gap-2 mb-2">
            <Info className="w-4 h-4 text-cv-blue-heart mt-0.5" />
            <h4 className="font-semibold text-cv-gray-dark">Como funciona o split:</h4>
          </div>
          <ul className="text-sm text-cv-gray-light space-y-1 ml-6">
            <li>• Você receberá 20% de comissão em todas as doações através do seu link</li>
            <li>• O Instituto recebe 70% do valor total</li>
            <li>• Os valores são depositados automaticamente nas respectivas contas Asaas</li>
            <li>• A comissão é calculada e distribuída no momento da doação</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={!isValid || !walletId || isSaving}
            className="flex-1 bg-cv-coral hover:bg-cv-coral/90"
          >
            {isSaving ? 'Salvando...' : 'Salvar Wallet ID'}
          </Button>
          
          {isValid && walletId && (
            <Button
              onClick={testSplit}
              variant="outline"
              className="border-cv-blue-heart text-cv-blue-heart hover:bg-cv-blue-heart hover:text-white"
            >
              Testar Split
            </Button>
          )}
        </div>

        {currentWalletId && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              ✅ Wallet ID configurada e ativa para recebimento de comissões
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AmbassadorWalletSetup;
