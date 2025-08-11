import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConsentRecord {
  id: string;
  user_id: string;
  consent_data_sharing: boolean;
  consent_date: string;
  revoked_date?: string;
  created_at: string;
  updated_at: string;
}

export const ConsentManager: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentConsent, setCurrentConsent] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Query to fetch current consent status
  const { data: consentRecord, isLoading, error } = useQuery({
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

  // Update local state when consent record changes
  useEffect(() => {
    if (consentRecord) {
      const isActive = consentRecord.consent_data_sharing && !consentRecord.revoked_date;
      setCurrentConsent(isActive);
      setHasChanges(false);
    }
  }, [consentRecord]);

  // Mutation to update consent
  const updateConsent = useMutation({
    mutationFn: async (newConsent: boolean): Promise<ConsentRecord> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const now = new Date().toISOString();
      
      if (newConsent) {
        // Granting consent - create new record
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
          throw new Error(`Erro ao salvar consentimento: ${error.message}`);
        }

        return data;
      } else {
        // Revoking consent - update existing record
        if (!consentRecord) {
          throw new Error('Nenhum consentimento encontrado para revogar');
        }

        const { data, error } = await supabase
          .from('user_consent')
          .update({
            consent_data_sharing: false,
            revoked_date: now,
            updated_at: now
          })
          .eq('id', consentRecord.id)
          .select()
          .single();

        if (error) {
          throw new Error(`Erro ao revogar consentimento: ${error.message}`);
        }

        return data;
      }
    },
    onSuccess: (data) => {
      toast.success(
        data.consent_data_sharing 
          ? 'Consentimento concedido com sucesso'
          : 'Consentimento revogado com sucesso'
      );
      queryClient.invalidateQueries({ queryKey: ['user-consent', user?.id] });
      setHasChanges(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar consentimento: ${error.message}`);
      // Reset to previous state
      if (consentRecord) {
        const isActive = consentRecord.consent_data_sharing && !consentRecord.revoked_date;
        setCurrentConsent(isActive);
      }
      setHasChanges(false);
    }
  });

  const handleConsentChange = (newConsent: boolean) => {
    setCurrentConsent(newConsent);
    const originalConsent = consentRecord 
      ? consentRecord.consent_data_sharing && !consentRecord.revoked_date
      : false;
    setHasChanges(newConsent !== originalConsent);
  };

  const handleSave = () => {
    updateConsent.mutate(currentConsent);
  };

  const getConsentStatus = () => {
    if (!consentRecord) {
      return {
        status: 'never_given',
        label: 'Nunca Concedido',
        icon: <XCircle className="h-4 w-4 text-gray-500" />,
        color: 'text-gray-500'
      };
    }

    if (consentRecord.consent_data_sharing && !consentRecord.revoked_date) {
      return {
        status: 'active',
        label: 'Ativo',
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        color: 'text-green-500'
      };
    }

    if (consentRecord.revoked_date) {
      return {
        status: 'revoked',
        label: 'Revogado',
        icon: <XCircle className="h-4 w-4 text-red-500" />,
        color: 'text-red-500'
      };
    }

    return {
      status: 'inactive',
      label: 'Inativo',
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      color: 'text-yellow-500'
    };
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  if (!user) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Você precisa estar logado para gerenciar suas preferências de consentimento.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar informações de consentimento: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  const status = getConsentStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Consentimento para Compartilhamento de Dados
        </CardTitle>
        <CardDescription>
          Gerencie suas preferências de compartilhamento de dados com o Instituto Coração Valente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
          <div className="flex items-center gap-3">
            {status.icon}
            <div>
              <p className="font-medium">Status Atual</p>
              <p className={`text-sm ${status.color}`}>{status.label}</p>
            </div>
          </div>
          <Badge variant={status.status === 'active' ? 'default' : 'secondary'}>
            {status.label}
          </Badge>
        </div>

        {/* Consent Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="consent-toggle" className="text-base font-medium">
                Autorizar compartilhamento de dados
              </Label>
              <p className="text-sm text-gray-600">
                Permite que seus dados sejam enviados para o Instituto Coração Valente
              </p>
            </div>
            <Switch
              id="consent-toggle"
              checked={currentConsent}
              onCheckedChange={handleConsentChange}
              disabled={isLoading || updateConsent.isPending}
            />
          </div>

          {hasChanges && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Você tem alterações não salvas. Clique em "Salvar Alterações" para aplicar.
              </AlertDescription>
            </Alert>
          )}

          {hasChanges && (
            <Button 
              onClick={handleSave} 
              disabled={updateConsent.isPending}
              className="w-full"
            >
              {updateConsent.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          )}
        </div>

        {/* Consent History */}
        {consentRecord && (
          <div className="space-y-3">
            <h4 className="font-medium">Histórico de Consentimento</h4>
            <div className="bg-gray-50 p-4 rounded-md space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Consentimento concedido em:</span>
                <span>{formatDate(consentRecord.consent_date)}</span>
              </div>
              {consentRecord.revoked_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Consentimento revogado em:</span>
                  <span>{formatDate(consentRecord.revoked_date)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Última atualização:</span>
                <span>{formatDate(consentRecord.updated_at)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 p-4 rounded-md">
          <h4 className="font-medium text-blue-900 mb-2">Sobre o Compartilhamento</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Seus dados são enviados de forma segura e criptografada</li>
            <li>• Você pode revogar o consentimento a qualquer momento</li>
            <li>• O Instituto utilizará os dados apenas para fins de captação de recursos</li>
            <li>• Seus dados não serão compartilhados com terceiros</li>
          </ul>
        </div>

        {/* Warning for revoked consent */}
        {status.status === 'revoked' && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Seu consentimento foi revogado. Seus dados não serão mais compartilhados 
              com o Instituto Coração Valente até que você conceda novamente o consentimento.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};