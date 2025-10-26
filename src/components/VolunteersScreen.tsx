
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Heart, Building2, UserCheck, DollarSign, Users, Phone } from 'lucide-react';

interface VolunteersScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

const VolunteersScreen = ({ onBack, onNavigate }: VolunteersScreenProps) => {
  return (
    <div className="min-h-screen bg-cv-off-white p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-cv-gray-light hover:text-cv-gray-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-heading font-bold text-cv-gray-dark">
            Seja um Voluntário
          </h1>
        </div>

        {/* Instituto Info */}
        <Card className="bg-white border-cv-off-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cv-gray-dark">
              <Heart className="w-5 h-5 text-cv-coral" />
              Sobre a ONG Coração Valente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-cv-gray-light leading-relaxed">
              A ONG Coração Valente é uma organização sem fins lucrativos dedicada a promover o bem-estar 
              e a saúde mental da população. Oferecemos suporte psicológico gratuito, recursos educacionais 
              e uma rede de apoio para pessoas que enfrentam desafios emocionais e psicológicos.
            </p>
            <p className="text-cv-gray-light leading-relaxed">
              Nossos serviços incluem: atendimento psicológico online, biblioteca de recursos de saúde mental, 
              diagnósticos pré-clínicos com IA, e uma rede de profissionais qualificados comprometidos em 
              fazer a diferença na vida das pessoas.
            </p>
          </CardContent>
        </Card>

        {/* Empresas Parceiras */}
        <Card className="bg-white border-cv-off-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cv-gray-dark">
              <Building2 className="w-5 h-5 text-cv-coral" />
              Para Empresas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-cv-gray-light leading-relaxed">
              Sua empresa pode fazer parte desta causa transformadora! Seja uma empresa parceira e ajude-nos 
              a expandir nosso impacto social, oferecendo suporte vital para quem mais precisa.
            </p>
            <Button 
              onClick={() => {
                localStorage.setItem('redirect_to', 'donation');
                localStorage.setItem('donation_type', 'supporter');
                onNavigate('donation');
              }}
              className="bg-cv-coral hover:bg-cv-coral/90 text-white"
            >
              Apoie Nossa Causa
            </Button>
          </CardContent>
        </Card>

        {/* Profissionais */}
        <Card className="bg-white border-cv-off-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cv-gray-dark">
              <UserCheck className="w-5 h-5 text-cv-coral" />
              Para Profissionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-cv-gray-light leading-relaxed">
              Psicólogos, terapeutas e profissionais da saúde mental: venham fazer parte da nossa rede! 
              Oferecemos a oportunidade de prestar serviços voluntários ou com valores sociais, 
              contribuindo para o bem-estar da comunidade.
            </p>
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="bg-cv-coral hover:bg-cv-coral/90 text-white"
            >
              Cadastre-se como Profissional
            </Button>
          </CardContent>
        </Card>

        {/* Doações */}
        <Card className="bg-white border-cv-off-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cv-gray-dark">
              <DollarSign className="w-5 h-5 text-cv-coral" />
              Doações Financeiras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-cv-gray-light leading-relaxed">
              Sua contribuição financeira nos permite manter e expandir nossos serviços gratuitos. 
              Seja através de doações pontuais ou como mantenedor mensal, cada real faz a diferença 
              na vida de quem precisa de apoio psicológico.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => {
                  localStorage.setItem('redirect_to', 'donation');
                  localStorage.setItem('donation_type', 'donation');
                  onNavigate('donation');
                }}
                className="bg-cv-coral hover:bg-cv-coral/90 text-white flex-1"
              >
                Faça Uma Doação
              </Button>
              <Button 
                onClick={() => {
                  localStorage.setItem('redirect_to', 'donation');
                  localStorage.setItem('donation_type', 'supporter');
                  onNavigate('donation');
                }}
                variant="outline"
                className="border-cv-coral text-cv-coral hover:bg-cv-coral hover:text-white flex-1"
              >
                Seja Um Mantenedor
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Embaixadores */}
        <Card className="bg-white border-cv-off-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cv-gray-dark">
              <Users className="w-5 h-5 text-cv-coral" />
              Seja um Embaixador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-cv-gray-light leading-relaxed">
              Como embaixador da ONG Coração Valente, você será fundamental para divulgar nossa causa 
              e alcançar mais pessoas que precisam de nosso apoio. É uma forma simples e poderosa de fazer a diferença!
            </p>
            <div className="bg-cv-off-white p-4 rounded-lg">
              <h4 className="font-medium text-cv-gray-dark mb-2">Benefícios de ser um Embaixador:</h4>
              <ul className="space-y-1 text-cv-gray-light text-sm">
                <li>• Comissão sobre doações geradas pelos seus links</li>
                <li>• Certificado de reconhecimento social</li>
                <li>• Participação em eventos exclusivos</li>
                <li>• Acesso prioritário a novos recursos</li>
                <li>• Contribuição direta para uma causa nobre</li>
              </ul>
            </div>
            <p className="text-cv-gray-light text-sm">
              Sua ajuda é essencial para o desenvolvimento do projeto. Quanto mais pessoas souberem 
              sobre nossos serviços, mais vidas podemos transformar juntos.
            </p>
            <Button 
              onClick={() => onNavigate('ambassador')}
              className="bg-cv-coral hover:bg-cv-coral/90 text-white"
            >
              Tornar-se Embaixador
            </Button>
          </CardContent>
        </Card>

        {/* Autorização WhatsApp */}
        <Card className="bg-white border-cv-off-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cv-gray-dark">
              <Phone className="w-5 h-5 text-cv-coral" />
              Divulgação via WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-cv-gray-light leading-relaxed">
              Para maximizar nosso alcance, gostaríamos de sua autorização para divulgar o Instituto 
              Coração Valente através da sua lista de contatos do WhatsApp. Isso nos ajudará a 
              alcançar mais pessoas que podem se beneficiar dos nossos serviços.
            </p>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="whatsapp-consent" className="rounded border-cv-coral" />
              <label htmlFor="whatsapp-consent" className="text-cv-gray-light text-sm">
                Autorizo a divulgação do Instituto através dos meus contatos do WhatsApp
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Agradecimento */}
        <Card className="bg-gradient-to-r from-cv-coral/5 to-cv-coral/10 border-cv-coral/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-cv-gray-dark leading-relaxed">
                Agradecemos imensamente seu interesse em ser parte da nossa missão. 
                Juntos, podemos transformar vidas e construir uma sociedade mais acolhedora 
                e saudável emocionalmente.
              </p>
              <div className="text-cv-gray-light">
                <p className="font-medium">Com gratidão,</p>
                <p className="text-cv-coral font-medium">Adriane Carraro</p>
                <p className="text-sm">Presidente da ONG Coração Valente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VolunteersScreen;
