#!/usr/bin/env python3
"""
Análise completa do sistema de biblioteca - Instituto Coração Valente
Verifica estado atual das tabelas, dados e estrutura
"""

from supabase import create_client, Client
import json

# Configurações do Instituto Coração Valente
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw"

def analyze_library_system():
    """Análise completa do sistema de biblioteca"""
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    print("=" * 80)
    print("ANÁLISE COMPLETA DO SISTEMA DE BIBLIOTECA - INSTITUTO CORAÇÃO VALENTE")
    print("=" * 80)
    
    # Tabelas relacionadas à biblioteca
    library_tables = {
        'library_categories': 'Categorias da Biblioteca',
        'library_resources': 'Recursos da Biblioteca', 
        'news_articles': 'Artigos/Notícias (usado atualmente)'
    }
    
    results = {}
    
    for table, description in library_tables.items():
        print(f"\n📊 ANALISANDO: {description} ({table})")
        print("-" * 60)
        
        try:
            # Contar registros
            count_response = supabase.table(table).select('*', count='exact').execute()
            count = count_response.count
            
            # Pegar amostra de dados
            sample_response = supabase.table(table).select('*').limit(5).execute()
            sample = sample_response.data
            
            results[table] = {
                'exists': True,
                'count': count,
                'sample': sample,
                'description': description
            }
            
            print(f"✅ Tabela existe: {count} registros")
            
            if count > 0:
                print(f"📋 Estrutura dos dados (primeiros {min(count, 5)} registros):")
                for i, record in enumerate(sample, 1):
                    print(f"\n   Registro {i}:")
                    for key, value in record.items():
                        if isinstance(value, str) and len(value) > 100:
                            value = value[:100] + "..."
                        print(f"     {key}: {value}")
            else:
                print("⚠️  Tabela vazia - sem dados")
                
        except Exception as e:
            results[table] = {
                'exists': False,
                'error': str(e),
                'description': description
            }
            print(f"❌ Erro ao acessar tabela: {str(e)}")
    
    # Análise específica das categorias
    print(f"\n🏷️  ANÁLISE DAS CATEGORIAS")
    print("-" * 60)
    
    if results.get('library_categories', {}).get('exists'):
        try:
            categories = supabase.table('library_categories').select('*').order('order_position').execute()
            print(f"📂 Categorias disponíveis ({len(categories.data)}):")
            for cat in categories.data:
                status = "🟢 Ativa" if cat.get('is_active') else "🔴 Inativa"
                print(f"   {cat.get('order_position', '?')}. {cat.get('name')} - {status}")
                print(f"      Descrição: {cat.get('description', 'N/A')}")
                print(f"      Ícone: {cat.get('icon_name', 'N/A')}")
        except Exception as e:
            print(f"❌ Erro ao analisar categorias: {e}")
    
    # Análise dos recursos por categoria
    print(f"\n📚 ANÁLISE DOS RECURSOS POR CATEGORIA")
    print("-" * 60)
    
    if results.get('library_resources', {}).get('exists'):
        try:
            resources = supabase.table('library_resources').select('*').execute()
            
            # Agrupar por categoria
            by_category = {}
            for resource in resources.data:
                cat_id = resource.get('category_id', 'sem_categoria')
                if cat_id not in by_category:
                    by_category[cat_id] = []
                by_category[cat_id].append(resource)
            
            print(f"📊 Recursos por categoria:")
            for cat_id, resources_list in by_category.items():
                if cat_id == 'sem_categoria':
                    print(f"   📂 Sem categoria: {len(resources_list)} recursos")
                else:
                    # Buscar nome da categoria
                    try:
                        cat_info = supabase.table('library_categories').select('name').eq('id', cat_id).single().execute()
                        cat_name = cat_info.data.get('name', 'Categoria desconhecida')
                    except:
                        cat_name = f"ID: {cat_id}"
                    print(f"   📂 {cat_name}: {len(resources_list)} recursos")
                    
                    # Mostrar tipos de recursos
                    types = {}
                    for res in resources_list:
                        res_type = res.get('resource_type', 'indefinido')
                        types[res_type] = types.get(res_type, 0) + 1
                    
                    for res_type, count in types.items():
                        print(f"      - {res_type}: {count}")
                        
        except Exception as e:
            print(f"❌ Erro ao analisar recursos: {e}")
    
    # Análise dos artigos/notícias (sistema atual)
    print(f"\n📰 ANÁLISE DO SISTEMA ATUAL (news_articles)")
    print("-" * 60)
    
    if results.get('news_articles', {}).get('exists'):
        try:
            articles = supabase.table('news_articles').select('*').execute()
            
            print(f"📊 Estatísticas dos artigos:")
            print(f"   Total: {len(articles.data)}")
            
            # Análise por categoria
            categories = {}
            featured_count = 0
            total_views = 0
            
            for article in articles.data:
                cat = article.get('category', 'sem_categoria')
                categories[cat] = categories.get(cat, 0) + 1
                
                if article.get('is_featured'):
                    featured_count += 1
                    
                total_views += article.get('view_count', 0)
            
            print(f"   Em destaque: {featured_count}")
            print(f"   Total de visualizações: {total_views}")
            print(f"   Média de visualizações: {total_views / len(articles.data) if articles.data else 0:.1f}")
            
            print(f"\n📂 Artigos por categoria:")
            for cat, count in categories.items():
                print(f"   - {cat}: {count} artigos")
                
        except Exception as e:
            print(f"❌ Erro ao analisar artigos: {e}")
    
    # Resumo final
    print(f"\n📋 RESUMO DA ANÁLISE")
    print("=" * 60)
    
    for table, data in results.items():
        if data.get('exists'):
            count = data.get('count', 0)
            status = "🟢 Funcional" if count > 0 else "🟡 Vazia"
            print(f"{status} {data['description']}: {count} registros")
        else:
            print(f"🔴 Erro - {data['description']}: {data.get('error', 'Não acessível')}")
    
    return results

if __name__ == "__main__":
    try:
        results = analyze_library_system()
        print(f"\n✅ Análise concluída com sucesso!")
    except Exception as e:
        print(f"\n❌ Erro na análise: {e}")