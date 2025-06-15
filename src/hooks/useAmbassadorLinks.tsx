
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useAmbassadorLinks = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getMyLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('ambassador_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
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
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar performance:', error);
      return null;
    }
  };

  // Função para gerar códigos para usuários existentes (apenas para admin)
  const generateExistingAmbassadorLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-existing-ambassador-links');
      
      if (error) {
        throw error;
      }

      toast({
        title: 'Códigos gerados!',
        description: `${data.successful} códigos de embaixador foram gerados com sucesso.`,
      });

      return data;
    } catch (error: any) {
      console.error('Erro ao gerar códigos:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível gerar os códigos.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getMyLinks,
    getPerformance,
    generateExistingAmbassadorLinks
  };
};
