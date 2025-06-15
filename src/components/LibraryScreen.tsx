import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Book, Search, Calendar, User, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import OptimizedImage from './OptimizedImage';

interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  image_url?: string;
  author?: string;
  category: string;
  published_at: string;
  is_featured: boolean;
  view_count: number;
}

const LibraryScreen = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const { toast } = useToast();

  const categories = [
    { value: 'todos', label: 'Todos os Artigos' },
    { value: 'geral', label: 'Geral' },
    { value: 'cardiologia', label: 'Cardiologia' },
    { value: 'prevencao', label: 'Prevenção' },
    { value: 'tratamento', label: 'Tratamento' },
    { value: 'pesquisa', label: 'Pesquisa' },
  ];

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error loading articles:', error);
        setError('Não foi possível carregar os artigos. Verifique sua conexão e tente novamente.');
        toast({
          title: 'Erro ao carregar artigos',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setArticles(data || []);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
      setError('Erro inesperado ao carregar artigos.');
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async (articleId: string) => {
    try {
      const article = articles.find(a => a.id === articleId);
      if (!article) return;

      await supabase
        .from('news_articles')
        .update({ view_count: article.view_count + 1 })
        .eq('id', articleId);

      // Update local state
      setArticles(prev => 
        prev.map(a => 
          a.id === articleId 
            ? { ...a, view_count: a.view_count + 1 }
            : a
        )
      );
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticles = filteredArticles.filter(article => article.is_featured);
  const regularArticles = filteredArticles.filter(article => !article.is_featured);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cv-off-white flex items-center justify-center p-6 pb-20">
        <LoadingSpinner size="lg" message="Carregando biblioteca..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cv-off-white p-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <ErrorMessage
            title="Erro ao carregar biblioteca"
            message={error}
            onRetry={loadArticles}
            className="mt-8"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cv-off-white p-6 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center space-y-4" role="banner">
          <div className="w-16 h-16 bg-cv-blue-soft rounded-full flex items-center justify-center mx-auto">
            <Book className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-h1 font-heading font-bold text-cv-gray-dark">Biblioteca</h1>
            <p className="text-body text-cv-gray-light">
              Artigos e materiais sobre saúde cardiovascular
            </p>
          </div>
        </header>

        {/* Filtros */}
        <section aria-labelledby="filters-title">
          <h2 id="filters-title" className="sr-only">Filtros de busca</h2>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" aria-hidden="true" />
              <Input
                placeholder="Pesquisar artigos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Campo de busca para pesquisar artigos"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Categorias de artigos">
              {categories.map(category => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors touch-target ${
                    selectedCategory === category.value
                      ? 'bg-cv-coral text-white'
                      : 'bg-white text-cv-gray-dark hover:bg-cv-off-white'
                  }`}
                  role="tab"
                  aria-selected={selectedCategory === category.value}
                  aria-label={`Filtrar por categoria: ${category.label}`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Artigos em Destaque */}
        {featuredArticles.length > 0 && (
          <section aria-labelledby="featured-title">
            <h2 id="featured-title" className="text-h3 font-heading font-bold text-cv-gray-dark mb-4">
              Em Destaque
            </h2>
            <div className="grid gap-4">
              {featuredArticles.map(article => (
                <Card 
                  key={article.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  role="article"
                  tabIndex={0}
                  aria-labelledby={`featured-article-${article.id}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      incrementViewCount(article.id);
                    }
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 text-sm text-cv-gray-light">
                          <span className="px-2 py-1 bg-cv-coral text-white rounded-full text-xs font-medium">
                            DESTAQUE
                          </span>
                          <span className="capitalize">{article.category}</span>
                        </div>
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                        {article.summary && (
                          <CardDescription>{article.summary}</CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-cv-gray-light">
                      <div className="flex items-center gap-4">
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
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{article.view_count}</span>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-cv-off-white rounded-lg">
                      <p className="text-sm text-cv-gray-dark line-clamp-3">
                        {article.content.substring(0, 200)}...
                      </p>
                      <button
                        onClick={() => incrementViewCount(article.id)}
                        className="mt-2 text-cv-coral hover:text-cv-coral/80 text-sm font-medium"
                      >
                        Ler mais →
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Todos os Artigos */}
        {regularArticles.length > 0 && (
          <section aria-labelledby="all-articles-title">
            <h2 id="all-articles-title" className="text-h3 font-heading font-bold text-cv-gray-dark mb-4">
              {featuredArticles.length > 0 ? 'Mais Artigos' : 'Artigos'}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {regularArticles.map(article => (
                <Card 
                  key={article.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  role="article"
                  tabIndex={0}
                  aria-labelledby={`article-${article.id}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      incrementViewCount(article.id);
                    }
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-cv-gray-light">
                        <span className="capitalize">{article.category}</span>
                      </div>
                      <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
                      {article.summary && (
                        <CardDescription className="line-clamp-2">{article.summary}</CardDescription>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-cv-gray-dark line-clamp-2">
                        {article.content.substring(0, 120)}...
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-cv-gray-light">
                        <div className="flex items-center gap-3">
                          {article.author && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{article.author}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(article.published_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{article.view_count}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => incrementViewCount(article.id)}
                        className="text-cv-coral hover:text-cv-coral/80 text-sm font-medium"
                      >
                        Ler artigo →
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {filteredArticles.length === 0 && (
          <div className="text-center py-12" role="status" aria-live="polite">
            <Book className="w-16 h-16 text-cv-gray-light mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-cv-gray-dark mb-2">
              Nenhum artigo encontrado
            </h3>
            <p className="text-cv-gray-light">
              Tente ajustar seus filtros de pesquisa
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryScreen;
