
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Shield, 
  Clock, 
  Users, 
  ArrowRight, 
  CheckCircle,
  AlertTriangle,
  Heart
} from 'lucide-react';

interface AIIntroScreenProps {
  onStart: () => void;
  onCancel: () => void;
}

const AIIntroScreen = ({ onStart, onCancel }: AIIntroScreenProps) => {
  const features = [
    {
      icon: Brain,
      title: "Inteligência Artificial Especializada",
      description: "Nossa IA foi treinada com dados científicos sobre neurodesenvolvimento"
    },
    {
      icon: Shield,
      title: "Totalmente Confidencial",
      description: "Suas informações são protegidas e não são compartilhadas com terceiros"
    },
    {
      icon: Clock,
      title: "Disponível 24/7",
      description: "Acesse orientações a qualquer momento, quando precisar"
    },
    {
      icon: Users,
      title: "Apoio Especializado",
      description: "Desenvolvido em parceria com profissionais da área"
    }
  ];

  return (
    <div className="min-h-screen bg-cv-off-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onCancel} className="text-cv-purple-dark">
          ← Voltar
        </Button>
        <Badge variant="secondary" className="bg-cv-yellow-soft text-cv-purple-dark">
          Pré-Diagnóstico IA
        </Badge>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Main intro card */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-cv-purple-soft to-cv-blue-heart text-white">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-h2 font-heading">
              Orientação Inteligente com IA
            </CardTitle>
            <CardDescription className="text-white/90 text-body">
              Nossa ferramenta de pré-diagnóstico oferece orientações personalizadas baseadas 
              em evidências científicas para apoiar sua jornada.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-md">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-cv-green-mint/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-cv-green-mint" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-cv-purple-dark">{feature.title}</h3>
                    <p className="text-caption text-cv-gray-light">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Important notice */}
        <Card className="border-cv-coral/20 bg-cv-coral/5">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-cv-coral flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-cv-purple-dark">Importante</h3>
                <p className="text-caption text-cv-gray-light">
                  Esta ferramenta oferece orientações iniciais e não substitui a avaliação de um profissional 
                  qualificado. Para um diagnóstico oficial, sempre consulte especialistas em neurodesenvolvimento.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consent section */}
        <Card className="border-cv-green-mint/20 bg-cv-green-mint/5">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-cv-green-mint flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-cv-purple-dark">Seu Consentimento</h3>
                <p className="text-caption text-cv-gray-light">
                  Ao prosseguir, você autoriza o uso das informações fornecidas para gerar orientações 
                  personalizadas. Seus dados são tratados com total confidencialidade.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-col space-y-3 pt-4">
          <Button 
            onClick={onStart}
            className="bg-cv-green-mint hover:bg-cv-green-mint/90 text-white font-semibold py-4"
            size="lg"
          >
            <Heart className="w-5 h-5 mr-2" />
            Iniciar Pré-Diagnóstico
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="border-cv-purple-dark text-cv-purple-dark hover:bg-cv-purple-dark hover:text-white"
          >
            Talvez mais tarde
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIIntroScreen;
