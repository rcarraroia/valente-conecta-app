
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import LandingHero from '@/components/landing/LandingHero';
import LandingAbout from '@/components/landing/LandingAbout';
import LandingPreDiagnosis from '@/components/landing/LandingPreDiagnosis';
import LandingImpact from '@/components/landing/LandingImpact';
import LandingTestimonials from '@/components/landing/LandingTestimonials';
import LandingFooter from '@/components/landing/LandingFooter';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AmbassadorData {
  id: string;
  full_name: string;
  professional_photo_url?: string;
}

const LandingPage = () => {
  const { ref: paramRef } = useParams<{ ref: string }>();
  const [searchParams] = useSearchParams();
  const queryRef = searchParams.get('ref');
  
  // Priorizar o ref da URL ou query parameter
  const ref = paramRef || queryRef;
  
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
        console.log('Buscando embaixador com código:', ref);
        
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
          console.log('Perfil do embaixador encontrado:', profile);
          
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
        } else {
          console.log('Nenhum embaixador encontrado com o código:', ref);
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

  const pageTitle = ambassadorData 
    ? `${ambassadorData.full_name} - ONG Coração Valente`
    : 'ONG Coração Valente - Desenvolvimento Integral para Crianças';
  
  const pageDescription = ambassadorData
    ? `Conheça o trabalho da ONG Coração Valente através de ${ambassadorData.full_name}. Atendimento especializado para crianças com TEA, TDAH e Dislexia.`
    : 'Atendimento multidisciplinar especializado para crianças com TEA, TDAH, Dislexia e outras condições. Triagem comportamental gratuita com IA.';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="TEA, TDAH, Dislexia, autismo, terapia ocupacional, fonoaudiologia, neuropsicologia, psicologia infantil, desenvolvimento infantil, Ipatinga, Minas Gerais" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content="/lovable-uploads/9343bd02-f7b0-4bb6-81a4-b8e8ee1af9e9.png" />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="/lovable-uploads/9343bd02-f7b0-4bb6-81a4-b8e8ee1af9e9.png" />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="ONG Coração Valente" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      
      <div className="min-h-screen bg-cv-off-white">
        <LandingHero ambassadorData={ambassadorData} />
        <LandingAbout />
        <LandingPreDiagnosis />
        <LandingImpact />
        <LandingTestimonials />
        <LandingFooter />
      </div>
    </>
  );
};

export default LandingPage;
