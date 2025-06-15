
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAmbassadorLinks } from '@/hooks/useAmbassadorLinks';
import { Copy, Link, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const LinkGenerator = () => {
  const [destinationUrl, setDestinationUrl] = useState('');
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const { generateLink, loading } = useAmbassadorLinks();
  const { toast } = useToast();

  const handleGenerateLink = async () => {
    try {
      const result = await generateLink(destinationUrl);
      if (result) {
        setGeneratedLink(result.short_url);
        setDestinationUrl('');
      }
    } catch (error) {
      console.error('Erro ao gerar link:', error);
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="w-5 h-5" />
          Gerar Link Rastreável
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="destination" className="block text-sm font-medium mb-2">
            URL de Destino (opcional)
          </label>
          <Input
            id="destination"
            type="url"
            placeholder="https://exemplo.com (deixe vazio para página de doação)"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleGenerateLink}
          disabled={loading}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          {loading ? 'Gerando...' : 'Gerar Link'}
        </Button>

        {generatedLink && (
          <div className="bg-cv-off-white p-3 rounded-lg">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-cv-gray-dark break-all">{generatedLink}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generatedLink)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LinkGenerator;
