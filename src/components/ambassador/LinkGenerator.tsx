
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAmbassadorLinks } from '@/hooks/useAmbassadorLinks';
import { Copy, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const LinkGenerator = () => {
  const [ambassadorLink, setAmbassadorLink] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadAmbassadorLink();
    }
  }, [user]);

  const loadAmbassadorLink = async () => {
    try {
      setLoading(true);
      
      // Buscar o perfil do embaixador para pegar o código
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('ambassador_code')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        return;
      }

      if (profile?.ambassador_code) {
        const baseUrl = 'https://coracaovalente.com.br';
        const link = `${baseUrl}/landing?ref=${profile.ambassador_code}`;
        setAmbassadorLink(link);
      }
    } catch (error) {
      console.error('Erro ao carregar link do embaixador:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copiado!',
        description: 'Link copiado para a área de transferência.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar o link.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Link Do Embaixador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Link Do Embaixador
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Seu Link de Afiliado
          </label>
          <p className="text-sm text-cv-gray-light mb-3">
            Compartilhe este link para atrair novos apoiadores para o instituto.
          </p>
        </div>

        {ambassadorLink ? (
          <div className="bg-cv-off-white p-3 rounded-lg">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-cv-gray-dark break-all flex-1">{ambassadorLink}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(ambassadorLink)}
                className="flex-shrink-0"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Link
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              Seu link de embaixador ainda não foi gerado. Entre em contato com o suporte.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LinkGenerator;
