
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, User, Eye, Share2, BookOpen } from 'lucide-react';

interface ArticleDetailScreenProps {
  onBack: () => void;
  articleId?: string;
}

const ArticleDetailScreen = ({ onBack, articleId }: ArticleDetailScreenProps) => {
  // Artigo fictício para demonstração
  const article = {
    id: '1',
    title: 'Sinais Precoces de Cardiopatias Congênitas em Crianças',
    content: `
      As cardiopatias congênitas são malformações do coração presentes desde o nascimento e representam uma das principais causas de morbimortalidade infantil. O diagnóstico precoce é fundamental para garantir o melhor prognóstico possível.

      ## Principais Sinais de Alerta

      ### Em Recém-nascidos (0-3 meses):
      - Cianose (coloração azulada) nos lábios, língua ou unhas
      - Dificuldade para mamar ou cansaço excessivo durante a amamentação
      - Respiração acelerada ou com esforço
      - Ganho de peso insuficiente
      - Sonolência excessiva

      ### Em Lactentes (3-12 meses):
      - Respiração rápida e superficial
      - Sudorese excessiva, especialmente durante a alimentação
      - Irritabilidade constante
      - Infecções respiratórias frequentes
      - Crescimento inadequado

      ### Em Crianças Maiores (1-6 anos):
      - Fadiga fácil durante brincadeiras
      - Falta de ar ao subir escadas
      - Dor no peito
      - Desmaios ou tonturas
      - Posição de cócoras para descansar

      ## Quando Procurar Ajuda

      É importante consultar um cardiologista pediátrico sempre que observar qualquer um desses sinais. O diagnóstico precoce permite:

      - Tratamento adequado no momento ideal
      - Prevenção de complicações
      - Melhor qualidade de vida
      - Maior expectativa de vida

      ## Exames Diagnósticos

      Os principais exames utilizados incluem:
      - Ecocardiograma
      - Eletrocardiograma
      - Radiografia de tórax
      - Cateterismo cardíaco (quando necessário)

      ## Tratamento

      O tratamento varia conforme o tipo e gravidade da cardiopatia:
      - Medicamentos
      - Procedimentos minimamente invasivos
      - Cirurgia cardíaca
      - Acompanhamento multidisciplinar

      Lembre-se: o amor e cuidado da família são fundamentais no processo de tratamento e recuperação.
    `,
    summary: 'Guia completo sobre identificação precoce de cardiopatias congênitas em crianças',
    author: 'Dr. Maria Silva',
    category: 'Cardiologia',
    published_at: '2024-06-10',
    view_count: 1247,
    image_url: null,
    is_featured: true
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === '') return null;
      
      if (paragraph.startsWith('## ')) {
        return (
          <h2 key={index} className="text-xl font-bold text-cv-gray-dark mt-6 mb-3">
            {paragraph.replace('## ', '')}
          </h2>
        );
      }
      
      if (paragraph.startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-cv-gray-dark mt-4 mb-2">
            {paragraph.replace('### ', '')}
          </h3>
        );
      }
      
      if (paragraph.startsWith('- ')) {
        return (
          <li key={index} className="text-cv-gray-dark mb-1 ml-4">
            {paragraph.replace('- ', '')}
          </li>
        );
      }
      
      return (
        <p key={index} className="text-cv-gray-dark mb-4 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

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
        </div>

        {/* Article Content */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-4">
            <div className="space-y-4">
              {article.is_featured && (
                <span className="inline-block px-3 py-1 bg-cv-coral text-white rounded-full text-sm font-medium">
                  DESTAQUE
                </span>
              )}
              
              <CardTitle className="text-2xl font-bold text-cv-gray-dark leading-tight">
                {article.title}
              </CardTitle>
              
              {article.summary && (
                <p className="text-lg text-cv-gray-light leading-relaxed">
                  {article.summary}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-cv-gray-light/20">
                <div className="flex items-center gap-4 text-sm text-cv-gray-light">
                  {article.author && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{article.author}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{article.view_count} visualizações</span>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="prose prose-cv max-w-none">
            <div className="space-y-4">
              {formatContent(article.content)}
            </div>
          </CardContent>
        </Card>

        {/* Related Articles */}
        <Card className="border-cv-blue-soft bg-cv-blue-soft/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-cv-blue-heart mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-cv-gray-dark mb-2">
                  Artigos Relacionados
                </h4>
                <p className="text-sm text-cv-gray-dark">
                  Explore mais conteúdos sobre cardiologia pediátrica e desenvolvimento infantil 
                  em nossa biblioteca.
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-cv-blue-heart hover:text-cv-blue-heart/80 mt-2"
                  onClick={onBack}
                >
                  Ver todos os artigos →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ArticleDetailScreen;
