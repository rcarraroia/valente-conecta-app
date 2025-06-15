
import React, { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useAmbassadorLinks } from '@/hooks/useAmbassadorLinks';
import { supabase } from '@/integrations/supabase/client';
import ProfileHeader from './profile/ProfileHeader';
import ProfileInfo from './profile/ProfileInfo';
import AmbassadorPerformance from './profile/AmbassadorPerformance';
import LinkGenerator from './profile/LinkGenerator';
import LinksList from './profile/LinksList';
import BecomeAmbassador from './profile/BecomeAmbassador';

const ProfileScreen = () => {
  const { user } = useAuth();
  const { loading, generateLink, getMyLinks, getPerformance } = useAmbassadorLinks();
  const [isAmbassador, setIsAmbassador] = useState(false);
  const [myLinks, setMyLinks] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);

  useEffect(() => {
    checkAmbassadorStatus();
    loadAmbassadorData();
  }, [user]);

  const checkAmbassadorStatus = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('is_volunteer, ambassador_code')
        .eq('id', user.id)
        .single();
      
      setIsAmbassador(Boolean(data?.is_volunteer && data?.ambassador_code));
    } catch (error) {
      console.error('Erro ao verificar status de embaixador:', error);
    }
  };

  const loadAmbassadorData = async () => {
    if (!isAmbassador) return;
    
    const [links, perf] = await Promise.all([
      getMyLinks(),
      getPerformance()
    ]);
    
    setMyLinks(links || []);
    setPerformance(perf);
  };

  const handleGenerateLink = async (destinationUrl: string) => {
    const newLink = await generateLink(destinationUrl);
    if (newLink) {
      setMyLinks(prev => [newLink, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-cv-off-white p-6 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        <ProfileHeader userEmail={user?.email} />
        
        <ProfileInfo userEmail={user?.email} />

        {isAmbassador && (
          <>
            <Separator />
            
            <AmbassadorPerformance performance={performance} />

            <LinkGenerator 
              onGenerateLink={handleGenerateLink}
              loading={loading}
            />

            <LinksList links={myLinks} />
          </>
        )}

        {!isAmbassador && <BecomeAmbassador />}
      </div>
    </div>
  );
};

export default ProfileScreen;
