
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Phone, MapPin, Calendar, Heart, Shield, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Profile {
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  city?: string;
  state?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string;
  medications?: string;
}

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({});

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        toast({
          title: 'Erro ao carregar perfil',
          description: error.message,
          variant: 'destructive',
        });
      } else if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        toast({
          title: 'Erro ao salvar perfil',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Perfil atualizado!',
          description: 'Suas informações foram salvas com sucesso.',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      window.location.href = '/auth';
    }
  };

  const updateField = (field: keyof Profile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cv-off-white flex items-center justify-center p-6 pb-20">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cv-coral border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cv-gray-light">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cv-off-white p-6 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-cv-blue-heart rounded-full flex items-center justify-center mx-auto">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-h1 font-heading font-bold text-cv-gray-dark">Meu Perfil</h1>
            <p className="text-body text-cv-gray-light">{user?.email}</p>
          </div>
        </div>

        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Mantenha seus dados atualizados para um melhor atendimento
            </CardDescription>
          </CardHeader>
          <form onSubmit={updateProfile}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name || ''}
                    onChange={(e) => updateField('full_name', e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
                    <Input
                      id="phone"
                      className="pl-10"
                      value={profile.phone || ''}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Data de Nascimento</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
                    <Input
                      id="date_of_birth"
                      type="date"
                      className="pl-10"
                      value={profile.date_of_birth || ''}
                      onChange={(e) => updateField('date_of_birth', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gênero</Label>
                  <select
                    id="gender"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={profile.gender || ''}
                    onChange={(e) => updateField('gender', e.target.value)}
                  >
                    <option value="">Selecione</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                    <option value="prefiro_nao_dizer">Prefiro não dizer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
                    <Input
                      id="city"
                      className="pl-10"
                      value={profile.city || ''}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="Sua cidade"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={profile.state || ''}
                    onChange={(e) => updateField('state', e.target.value)}
                    placeholder="Seu estado"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold text-cv-gray-dark mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Contato de Emergência
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name">Nome do Contato</Label>
                    <Input
                      id="emergency_contact_name"
                      value={profile.emergency_contact_name || ''}
                      onChange={(e) => updateField('emergency_contact_name', e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_phone">Telefone do Contato</Label>
                    <Input
                      id="emergency_contact_phone"
                      value={profile.emergency_contact_phone || ''}
                      onChange={(e) => updateField('emergency_contact_phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold text-cv-gray-dark mb-4 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Informações Médicas
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medical_conditions">Condições Médicas</Label>
                    <textarea
                      id="medical_conditions"
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={profile.medical_conditions || ''}
                      onChange={(e) => updateField('medical_conditions', e.target.value)}
                      placeholder="Descreva suas condições médicas (opcional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medications">Medicamentos</Label>
                    <textarea
                      id="medications"
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={profile.medications || ''}
                      onChange={(e) => updateField('medications', e.target.value)}
                      placeholder="Liste seus medicamentos atuais (opcional)"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-cv-green-mint hover:bg-cv-green-mint/90"
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar Perfil'}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProfileScreen;
