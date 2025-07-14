
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Partner {
  id: string;
  full_name: string;
  specialty: string;
  specialties: string[];
  professional_photo_url: string | null;
  bio: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  crm_crp_register: string | null;
}

export const useProfessionalData = (partnerId?: string) => {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (partnerId) {
      loadPartner();
    }
  }, [partnerId]);

  const loadPartner = async () => {
    try {
      setError(null);
      console.log('Loading partner with ID:', partnerId);
      
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('id', partnerId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error loading partner:', error);
        throw error;
      }
      
      if (!data) {
        console.log('No partner found with ID:', partnerId);
        setPartner(null);
        return;
      }

      console.log('Partner data loaded:', data);
      
      // Transform the data to ensure specialties is always an array of strings
      const transformedData: Partner = {
        ...data,
        specialties: Array.isArray(data.specialties) 
          ? data.specialties.filter((spec): spec is string => typeof spec === 'string')
          : [],
        specialty: data.specialty || 'Não informado'
      };
      
      console.log('Transformed partner data:', transformedData);
      setPartner(transformedData);
    } catch (error: any) {
      console.error('Erro ao carregar profissional:', error);
      setError(error.message || 'Erro ao carregar dados do profissional');
    } finally {
      setLoading(false);
    }
  };

  return { partner, loading, error };
};
