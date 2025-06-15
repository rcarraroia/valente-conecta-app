import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Copy, ExternalLink, TrendingUp, Link, HandHeart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAmbassadorLinks } from '@/hooks/useAmbassadorLinks';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ProfileScreen = () => {
  const { user } = useAuth();
  const { loading, generateLink, getMyLinks, getPerformance } = useAmbassadorLinks();
  const { toast } = useToast();
  const [isAmbassador, setIsAmbassador] = useState(false);
  const [myLinks, setMyLinks] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [destinationUrl, setDestinationUrl] = useState('');

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
      
      setIsAmbassador(data?.is_volunteer && data?.ambassador_code);
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

  const handleGenerateLink = async () => {
    if (!destinationUrl.trim()) {
      toast({
        title: 'URL necessária',
        description: 'Por favor, insira uma URL de destino.',
        variant: 'destructive',
      });
      return;
    }

    const newLink = await generateLink(destinationUrl);
    if (newLink) {
      setMyLinks(prev => [newLink, ...prev]);
      setDestinationUrl('');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copiado!',
        description: 'Link copiado para a área de transferência.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar o link.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-cv-off-white p-6 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-cv-purple-soft p-3 rounded-full">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-cv-gray-dark">
              Meu Perfil
            </h1>
            <p className="text-cv-gray-light">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-cv-gray-dark">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            <p className="text-sm text-cv-gray-light">
              Para alterar informações pessoais, entre em contato conosco.
            </p>
          </CardContent>
        </Card>

        {/* Ambassador Section */}
        {isAmbassador && (
          <>
            <Separator />
            
            {/* Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-cv-gray-dark flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance de Embaixador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-cv-blue-heart">
                      {performance?.total_clicks || 0}
                    </p>
                    <p className="text-sm text-cv-gray-light">Cliques</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-cv-green-mint">
                      {performance?.total_donations_count || 0}
                    </p>
                    <p className="text-sm text-cv-gray-light">Doações</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-cv-coral">
                      {performance?.points || 0}
                    </p>
                    <p className="text-sm text-cv-gray-light">Pontos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate New Link */}
            <Card>
              <CardHeader>
                <CardTitle className="text-cv-gray-dark flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  Gerar Novo Link Rastreável
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="destination">URL de Destino</Label>
                  <Input
                    id="destination"
                    type="url"
                    placeholder="https://exemplo.com"
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleGenerateLink}
                  disabled={loading}
                  className="w-full bg-cv-green-mint hover:bg-cv-green-mint/90"
                >
                  {loading ? 'Gerando...' : 'Gerar Link'}
                </Button>
              </CardContent>
            </Card>

            {/* My Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-cv-gray-dark">Meus Links</CardTitle>
              </CardHeader>
              <CardContent>
                {myLinks.length === 0 ? (
                  <p className="text-cv-gray-light text-center py-4">
                    Você ainda não possui links gerados.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {myLinks.map((link) => (
                      <div key={link.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-cv-gray-light">
                            {new Date(link.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-gray-100 p-2 rounded text-sm">
                            {link.short_url}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(link.short_url)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(link.short_url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Non-Ambassador Info */}
        {!isAmbassador && (
          <Card>
            <CardContent className="p-6 text-center">
              <HandHeart className="w-12 h-12 mx-auto mb-4 text-cv-coral" />
              <h3 className="text-lg font-semibold text-cv-gray-dark mb-2">
                Torne-se um Embaixador
              </h3>
              <p className="text-cv-gray-light mb-4">
                Ajude a divulgar nossa causa e ganhe reconhecimento pelos seus esforços.
              </p>
              <Button className="bg-cv-coral hover:bg-cv-coral/90">
                Saiba Mais
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;
