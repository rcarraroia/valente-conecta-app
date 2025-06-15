
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, User, Mail, Phone, FileText, Briefcase } from 'lucide-react';

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

interface ProfessionalProfileProps {
  partner: Partner;
  onUpdate: () => void;
}

const ProfessionalProfile = ({ partner, onUpdate }: ProfessionalProfileProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: partner.full_name || '',
    specialty: partner.specialty || '',
    bio: partner.bio || '',
    contact_email: partner.contact_email || '',
    contact_phone: partner.contact_phone || '',
    crm_crp_register: partner.crm_crp_register || '',
    specialties: Array.isArray(partner.specialties) ? partner.specialties.join(', ') : ''
  });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const specialtiesArray = formData.specialties
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const { error } = await supabase
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

      if (error) throw error;

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Editar Perfil Profissional
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="pl-10"
                placeholder="Seu nome completo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidade Principal</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => handleInputChange('specialty', e.target.value)}
                className="pl-10"
                placeholder="Ex: Cardiologista, Psicólogo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Email de Contato Profissional</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                className="pl-10"
                placeholder="contato@profissional.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Telefone de Contato Profissional</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                className="pl-10"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="crm_crp_register">CRM/CRP</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
              <Input
                id="crm_crp_register"
                value={formData.crm_crp_register}
                onChange={(e) => handleInputChange('crm_crp_register', e.target.value)}
                className="pl-10"
                placeholder="Ex: CRM-SP 123456"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="specialties">Outras Especialidades</Label>
            <Input
              id="specialties"
              value={formData.specialties}
              onChange={(e) => handleInputChange('specialties', e.target.value)}
              placeholder="Separe por vírgulas: Ex: Hipertensão, Diabetes"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Apresentação Profissional</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Conte um pouco sobre sua experiência e abordagem..."
            rows={4}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-cv-coral hover:bg-cv-coral/90"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfessionalProfile;
