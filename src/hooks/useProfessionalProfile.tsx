
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Partner {
  id: string;
  full_name: string;
  specialty: string;
  bio: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  crm_crp_register: string | null;
  specialties?: string[];
}

interface UseProfessionalProfileProps {
  partner: Partner;
  onUpdate: () => void;
}

export const useProfessionalProfile = ({ partner, onUpdate }: UseProfessionalProfileProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: partner.full_name || '',
    specialty: partner.specialty || '',
    bio: partner.bio || '',
    contact_email: partner.contact_email || '',
    contact_phone: partner.contact_phone || '',
    crm_crp_register: partner.crm_crp_register || '',
    specialties: Array.isArray(partner.specialties) ? partner.specialties.join(', ') : ''
  });
  
  const [profileData, setProfileData] = useState({
    phone: '',
    city: ''
  });
  
  const [saving, setSaving] = useState(false);

  // Carregar dados do profile do usuário
  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('phone, city')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          phone: data.phone || '',
          city: data.city || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do profile:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileDataChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const specialtiesArray = formData.specialties
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Atualizar dados do partner
      const { error: partnerError } = await supabase
        .from('partners')
        .update({
          full_name: formData.full_name,
          specialty: formData.specialty,
          bio: formData.bio || null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          crm_crp_register: formData.crm_crp_register || null,
          specialties: specialtiesArray
        })
        .eq('id', partner.id);

      if (partnerError) throw partnerError;

      // Atualizar dados do profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: profileData.phone || null,
          city: profileData.city || null
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.'
      });

      onUpdate();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    profileData,
    saving,
    handleInputChange,
    handleProfileDataChange,
    handleSave
  };
};
