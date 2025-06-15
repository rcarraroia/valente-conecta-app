
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

  useEffect(() => {
    if (partnerId) {
      loadPartner();
    }
  }, [partnerId]);

  const loadPartner = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('id', partnerId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      
      // Transform the data to ensure specialties is always an array of strings
      const transformedData: Partner = {
        ...data,
        specialties: Array.isArray(data.specialties) 
          ? data.specialties.filter((spec): spec is string => typeof spec === 'string')
          : []
      };
      
      setPartner(transformedData);
    } catch (error) {
      console.error('Erro ao carregar profissional:', error);
    } finally {
      setLoading(false);
    }
  };

  return { partner, loading };
};
