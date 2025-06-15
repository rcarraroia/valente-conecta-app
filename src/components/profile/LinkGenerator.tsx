
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LinkGeneratorProps {
  onGenerateLink: (url: string) => Promise<void>;
  loading: boolean;
}

const LinkGenerator = ({ onGenerateLink, loading }: LinkGeneratorProps) => {
  const [destinationUrl, setDestinationUrl] = useState('');
  const { toast } = useToast();

  const handleGenerateLink = async () => {
    if (!destinationUrl.trim()) {
      toast({
        title: 'URL necessária',
        description: 'Por favor, insira uma URL de destino.',
        variant: 'destructive',
      });
      return;
    }

    await onGenerateLink(destinationUrl);
    setDestinationUrl('');
  };

  return (
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
  );
};

export default LinkGenerator;
