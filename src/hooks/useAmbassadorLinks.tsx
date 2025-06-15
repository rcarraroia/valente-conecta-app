
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AmbassadorLink {
  link_id: string;
  generated_url: string;
  short_url: string;
  destination_url: string;
  created_at: string;
}

export const useAmbassadorLinks = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateLink = async (destinationUrl: string, campaignId?: string): Promise<AmbassadorLink | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('links-generate', {
        body: {
          destination_url: destinationUrl,
          campaign_id: campaignId
        }
      });
      
      if (error) {
        throw error;
      }

      toast({
        title: 'Link gerado!',
        description: 'Seu link rastreável foi criado com sucesso.',
      });

      return data;
    } catch (error) {
      console.error('Erro ao gerar link:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o link. Tente novamente.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getMyLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('ambassador_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar links:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seus links.',
        variant: 'destructive',
      });
      return [];
    }
  };

  const getPerformance = async () => {
    try {
      const { data, error } = await supabase
        .from('ambassador_performance')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar performance:', error);
      return null;
    }
  };

  return {
    loading,
    generateLink,
    getMyLinks,
    getPerformance
  };
};
