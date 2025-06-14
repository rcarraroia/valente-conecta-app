
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Heart, 
  Users, 
  Share2, 
  Gift, 
  Trophy,
  Star,
  Target,
  ArrowRight,
  HandHeart,
  UserPlus
} from 'lucide-react';

interface HelpScreenProps {
  onBack: () => void;
}

const HelpScreen = ({ onBack }: HelpScreenProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const helpOptions = [
    {
      id: 'donate',
      title: 'Faça uma Doação',
      description: 'Contribua financeiramente para nossos projetos',
      icon: Gift,
      color: 'bg-cv-coral',
      textColor: 'text-white'
    },
    {
      id: 'volunteer',
      title: 'Seja Voluntário',
      description: 'Dedique seu tempo e conhecimento',
      icon: Heart,
      color: 'bg-cv-green-mint',
      textColor: 'text-white'
    },
    {
      id: 'ambassador',
      title: 'Torne-se um Embaixador',
      description: 'Compartilhe nossa causa em suas redes',
      icon: Share2,
      color: 'bg-cv-blue-heart',
      textColor: 'text-white'
    }
  ];

  const ambassadorLevels = [
    { name: 'Iniciante', points: '0-100', icon: UserPlus, color: 'bg-cv-yellow-soft' },
    { name: 'Colaborador', points: '101-500', icon: Users, color: 'bg-cv-green-mint' },
    { name: 'Defensor', points: '501-1000', icon: Heart, color: 'bg-cv-blue-heart' },
    { name: 'Campeão', points: '1001+', icon: Trophy, color: 'bg-cv-coral' }
  ];

  if (selectedOption === 'ambassador') {
    return (
      <div className="min-h-screen bg-cv-off-white">
        {/* Header */}
        <header className="bg-cv-blue-heart text-white p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSelectedOption(null)} 
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-h2 font-heading font-bold">Programa Embaixador</h1>
              <p className="text-sm opacity-90">Compartilhe nossa causa</p>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Welcome section */}
          <Card className="bg-gradient-to-r from-cv-blue-heart to-cv-purple-soft text-white border-none shadow-lg">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-h3 font-heading font-bold">Seja um Embaixador Digital</h2>
              <p className="text-body opacity-95">
                Ajude-nos a alcançar mais famílias compartilhando nossa missão em suas redes sociais 
                e receba reconhecimento por cada pessoa que você ajudar a conhecer nosso trabalho.
              </p>
            </CardContent>
          </Card>

          {/* How it works */}
          <Card>
            <CardHeader>
              <CardTitle className="text-cv-purple-dark">Como Funciona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-cv-green-mint/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-cv-green-mint font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-cv-purple-dark">Cadastre-se como Embaixador</h4>
                  <p className="text-caption text-cv-gray-light">Autorize o uso de suas redes sociais para nossa causa</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-cv-blue-heart/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-cv-blue-heart font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-cv-purple-dark">Receba seu Link Personalizado</h4>
                  <p className="text-caption text-cv-gray-light">Compartilhe conteúdos e convites com seu código único</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-cv-coral/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-cv-coral font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-cv-purple-dark">Ganhe Pontos e Reconhecimento</h4>
                  <p className="text-caption text-cv-gray-light">Cada clique e doação através do seu link gera pontos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Levels */}
          <Card>
            <CardHeader>
              <CardTitle className="text-cv-purple-dark flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-cv-coral" />
                Níveis de Embaixador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {ambassadorLevels.map((level) => (
                  <div key={level.name} className="text-center space-y-2">
                    <div className={`w-12 h-12 ${level.color} rounded-xl flex items-center justify-center mx-auto`}>
                      <level.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-cv-purple-dark text-sm">{level.name}</h4>
                      <p className="text-xs text-cv-gray-light">{level.points} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="bg-cv-yellow-soft border-none">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-cv-purple-dark flex items-center">
                <Star className="w-4 h-4 mr-2 text-cv-coral" />
                Benefícios Exclusivos
              </h3>
              <ul className="space-y-2 text-sm text-cv-gray-dark">
                <li>• Certificado digital de reconhecimento</li>
                <li>• Acesso antecipado a novos conteúdos</li>
                <li>• Participação em eventos exclusivos</li>
                <li>• Ranking mensal de embaixadores</li>
              </ul>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="space-y-3">
            <Button 
              className="w-full bg-cv-blue-heart hover:bg-cv-blue-heart/90 text-white font-semibold py-4"
              size="lg"
            >
              <HandHeart className="w-5 h-5 mr-2" />
              Tornar-se Embaixador
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-cv-purple-dark text-cv-purple-dark hover:bg-cv-purple-dark hover:text-white"
              onClick={() => setSelectedOption(null)}
            >
              Voltar às Opções
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cv-off-white">
      {/* Header */}
      <header className="bg-cv-coral text-white p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/20">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-h2 font-heading font-bold">Como Ajudar</h1>
            <p className="text-sm opacity-90">Faça parte da nossa missão</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Mission */}
        <Card className="bg-gradient-to-r from-cv-purple-soft to-cv-blue-heart text-white border-none shadow-lg">
          <CardContent className="p-6 text-center space-y-3">
            <Heart className="w-12 h-12 mx-auto text-white" />
            <h2 className="text-h3 font-heading font-bold">Juntos Somos Mais Fortes</h2>
            <p className="text-body opacity-95">
              Sua contribuição, seja ela qual for, nos ajuda a alcançar e apoiar mais famílias 
              em sua jornada de descoberta e crescimento.
            </p>
          </CardContent>
        </Card>

        {/* Help options */}
        <div className="space-y-4">
          {helpOptions.map((option) => (
            <Card 
              key={option.id} 
              className="border-none shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => option.id === 'ambassador' ? setSelectedOption(option.id) : undefined}
            >
              <CardContent className="p-0">
                <div className={`${option.color} p-4 rounded-t-lg`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <option.icon className={`w-6 h-6 ${option.textColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${option.textColor}`}>{option.title}</h3>
                      <p className={`text-sm ${option.textColor} opacity-90`}>{option.description}</p>
                    </div>
                    <ArrowRight className={`w-5 h-5 ${option.textColor}`} />
                  </div>
                </div>
                
                <div className="p-4 bg-white">
                  {option.id === 'donate' && (
                    <div className="space-y-3">
                      <p className="text-caption text-cv-gray-dark">
                        Suas doações nos permitem oferecer serviços gratuitos e expandir nosso alcance.
                      </p>
                      <Button className="w-full bg-cv-coral hover:bg-cv-coral/90 text-white">
                        <Gift className="w-4 h-4 mr-2" />
                        Fazer Doação
                      </Button>
                    </div>
                  )}
                  
                  {option.id === 'volunteer' && (
                    <div className="space-y-3">
                      <p className="text-caption text-cv-gray-dark">
                        Compartilhe seus conhecimentos e experiências para ajudar outras famílias.
                      </p>
                      <Button className="w-full bg-cv-green-mint hover:bg-cv-green-mint/90 text-white">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Inscrever-se como Voluntário
                      </Button>
                    </div>
                  )}
                  
                  {option.id === 'ambassador' && (
                    <div className="space-y-3">
                      <p className="text-caption text-cv-gray-dark">
                        Use suas redes sociais para amplificar nossa missão e ganhe reconhecimento.
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-cv-yellow-soft text-cv-purple-dark">
                          Programa Gamificado
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-cv-blue-heart">
                          Saiba mais →
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Impact section */}
        <Card className="bg-cv-yellow-soft border-none">
          <CardContent className="p-6 text-center space-y-4">
            <Target className="w-10 h-10 mx-auto text-cv-purple-dark" />
            <h3 className="text-h3 font-heading font-bold text-cv-purple-dark">
              Nosso Impacto em 2024
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-h2 font-bold text-cv-green-mint">2.5K+</div>
                <p className="text-caption text-cv-purple-dark">Famílias Atendidas</p>
              </div>
              <div>
                <div className="text-h2 font-bold text-cv-coral">150+</div>
                <p className="text-caption text-cv-purple-dark">Voluntários Ativos</p>
              </div>
              <div>
                <div className="text-h2 font-bold text-cv-blue-heart">98%</div>
                <p className="text-caption text-cv-purple-dark">Satisfação</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom spacing */}
      <div className="h-20"></div>
    </div>
  );
};

export default HelpScreen;
