
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateWalletId, logWalletValidation, getWalletErrorMessage } from '@/utils/walletValidation';
import { Wallet, AlertCircle, CheckCircle } from 'lucide-react';

interface AmbassadorWalletFormProps {
  currentWalletId?: string;
  onWalletUpdated: (walletId: string) => void;
}

const AmbassadorWalletForm = ({ currentWalletId, onWalletUpdated }: AmbassadorWalletFormProps) => {
  const [walletId, setWalletId] = useState(currentWalletId || '');
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const { toast } = useToast();

  const validateWallet = async (id: string) => {
    if (!id || id.length < 10) {
      setIsValid(false);
      return false;
    }

    setIsValidating(true);
    try {
      // Obter usuário atual
      const { data: currentUser } = await supabase.auth.getUser();
      const userId = currentUser.user?.id;

      const result = await validateWalletId(id, userId);
      
      setIsValid(result.isValid);
      
      if (!result.isValid) {
        toast({
          title: result.errorType === 'format' ? "Formato inválido" : 
                 result.errorType === 'system' ? "Wallet reservada" :
                 result.errorType === 'duplicate' ? "Wallet em uso" : "Erro de validação",
          description: getWalletErrorMessage(result),
          variant: "destructive"
        });
      }
      
      // Log para auditoria
      logWalletValidation(id, result, userId);
      
      return result.isValid;
    } catch (error) {
      console.error('Erro na validação de wallet:', error);
      setIsValid(false);
      toast({
        title: "Erro de validação",
        description: "Ocorreu um erro ao validar a Wallet ID",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleWalletIdChange = async (value: string) => {
    setWalletId(value);
    if (value) {
      await validateWallet(value);
    } else {
      setIsValid(false);
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Atualizar o perfil com a wallet ID
      const { error } = await supabase
        .from('profiles')
        .update({ 
          ambassador_wallet_id: walletId,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Wallet ID salva com sucesso!",
        description: "Agora você pode receber comissões nas doações através do seu link.",
      });

      onWalletUpdated(walletId);
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
          <div className="text-sm text-cv-gray-light space-y-2">
            <p>
              Você precisa de uma conta no Asaas para receber suas comissões:{' '}
              <a 
                href="https://www.asaas.com/r/51a27e42-08b8-495b-acfd-5f1369c2e104" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cv-blue-heart hover:text-cv-blue-heart/80 underline font-medium"
              >
                CLIQUE AQUI
              </a>
            </p>
            <p>
              Depois de abrir sua conta no Asaas você precisa configurar sua Wallet ID, para encontrá-la{' '}
              <a 
                href="https://www.asaas.com/customerConfigIntegrations/index" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cv-blue-heart hover:text-cv-blue-heart/80 underline font-medium"
              >
                CLIQUE AQUI
              </a>
            </p>
          </div>
        </div>

        <div className="bg-cv-blue-heart/10 p-4 rounded-lg">
          <h4 className="font-semibold text-cv-gray-dark mb-2">Como funciona:</h4>
          <ul className="text-sm text-cv-gray-light space-y-1">
            <li>• Você receberá 20% de comissão em todas as doações através do seu link</li>
            <li>• Os valores são depositados diretamente na sua conta Asaas</li>
            <li>• A comissão é calculada automaticamente no momento da doação</li>
          </ul>
        </div>

        <Button
          onClick={handleSave}
          disabled={!isValid || !walletId || isSaving}
          className="w-full bg-cv-coral hover:bg-cv-coral/90"
        >
          {isSaving ? 'Salvando...' : 'Salvar Wallet ID'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AmbassadorWalletForm;
