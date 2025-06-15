
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import LandingHero from '@/components/landing/LandingHero';
import LandingAbout from '@/components/landing/LandingAbout';
import LandingImpact from '@/components/landing/LandingImpact';
import LandingTestimonials from '@/components/landing/LandingTestimonials';
import LandingDonation from '@/components/landing/LandingDonation';
import LandingFooter from '@/components/landing/LandingFooter';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AmbassadorData {
  id: string;
  full_name: string;
  professional_photo_url?: string;
}

const LandingPage = () => {
  const { ref } = useParams<{ ref: string }>();
  const [ambassadorData, setAmbassadorData] = useState<AmbassadorData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadAmbassadorData = async () => {
      if (!ref) {
        setLoading(false);
        return;
      }

      try {
        // Buscar dados do embaixador pelo código de referência
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('ambassador_code', ref)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Erro ao buscar perfil:', profileError);
          return;
        }

        if (profile) {
          // Verificar se é um profissional (parceiro)
          const { data: partner, error: partnerError } = await supabase
            .from('partners')
            .select('professional_photo_url')
            .eq('user_id', profile.id)
            .maybeSingle();

          if (partnerError) {
            console.warn('Erro ao buscar dados do parceiro:', partnerError);
          }

          setAmbassadorData({
            id: profile.id,
            full_name: profile.full_name,
            professional_photo_url: partner?.professional_photo_url
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do embaixador:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as informações do embaixador.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadAmbassadorData();
  }, [ref, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cv-off-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cv-off-white">
      <LandingHero ambassadorData={ambassadorData} />
      <LandingAbout />
      <LandingImpact />
      <LandingTestimonials />
      <LandingDonation ambassadorCode={ref} />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
