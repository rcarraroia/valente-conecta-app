
# Instituto Coração Valente - Documentação Técnica

## Visão Geral do Sistema

O Instituto Coração Valente é uma aplicação web completa desenvolvida para conectar pacientes cardíacos com profissionais de saúde, oferecendo ferramentas de pré-diagnóstico com IA, sistema de agendamento médico, plataforma de doações e programa de embaixadores.

## Índice da Documentação

- [Arquitetura do Sistema](./architecture.md)
- [Estrutura do Banco de Dados](./database.md)
- [Regras de Negócio](./business-rules.md)
- [Políticas de Segurança](./security.md)
- [APIs e Edge Functions](./api-documentation.md)
- [Guia de Desenvolvimento](./development-guide.md)
- [Recomendações e Melhorias](./recommendations.md)

## Stack Tecnológica

### Frontend
- **React 18.3.1** - Biblioteca principal para UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router DOM 6.26.2** - Roteamento SPA
- **Tailwind CSS** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis (shadcn/ui)
- **TanStack Query 5.56.2** - Gerenciamento de estado servidor
- **React Hook Form 7.53.0** - Formulários performáticos
- **Zod 3.23.8** - Validação de esquemas
- **Lucide React** - Ícones SVG

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados relacional
- **Supabase Auth** - Sistema de autenticação
- **Edge Functions (Deno)** - Serverless functions
- **Row Level Security (RLS)** - Controle de acesso granular

### Integrações
- **Asaas** - Gateway de pagamento
- **OpenAI/Gemini** - IA para pré-diagnóstico
- **Resend** - Envio de emails (configurável)

## Arquitetura Geral

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React SPA     │◄──►│  Supabase API    │◄──►│   PostgreSQL    │
│                 │    │                  │    │                 │
│ • Components    │    │ • Auth           │    │ • 17+ tabelas   │
│ • Custom Hooks  │    │ • Real-time      │    │ • RLS policies  │
│ • State Mgmt    │    │ • Storage        │    │ • Functions     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │              ┌────────▼────────┐
         │              │  Edge Functions │
         └──────────────►│                 │
                        │ • 9 functions   │
                        │ • Deno runtime  │
                        │ • API calls     │
                        └─────────────────┘
```

## Principais Funcionalidades

### 🏥 Sistema Médico
- **Pré-diagnóstico com IA**: Questionário adaptativo com análise inteligente
- **Agendamento**: Sistema completo de marcação de consultas
- **Dashboard Profissional**: Área dedicada para profissionais de saúde
- **Perfis de Usuário**: Comum e Profissional com permissões específicas

### 💰 Sistema Financeiro
- **Doações**: Integração com Asaas para pagamentos
- **Split de Pagamento**: Distribuição automática entre instituto, admin e embaixadores
- **Programa de Embaixadores**: Sistema de afiliação com tracking de performance

### 📚 Conteúdo e Biblioteca
- **Biblioteca Médica**: Recursos categorizados por especialidade
- **Notícias**: Sistema de artigos com categorização
- **Serviços**: Catálogo de serviços oferecidos

## Status do Projeto

✅ **Produção Ready** - Sistema maduro e funcional
⚠️ **Requer Melhorias** - Algumas otimizações recomendadas
🔧 **Em Desenvolvimento** - Funcionalidades sendo aprimoradas

## Contato Técnico

Para questões técnicas sobre esta documentação, consulte os arquivos específicos ou revise o código-fonte no repositório.

---
*Documentação gerada automaticamente - Última atualização: $(date)*
