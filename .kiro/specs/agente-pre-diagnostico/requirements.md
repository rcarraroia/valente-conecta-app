# Requirements Document

## Introduction

Esta especificação define os requisitos para integrar o agente de pré-diagnóstico baseado em n8n no aplicativo Valente-Conecta. O sistema permitirá que usuários autenticados interajam com um agente de IA através de uma interface de chat conversacional, recebam diagnósticos personalizados e visualizem relatórios finais em formato PDF através de um painel dedicado.

A integração utilizará a infraestrutura existente do Supabase para autenticação e armazenamento, e se comunicará com o workflow n8n através de webhooks para processar as interações do usuário e gerar os relatórios de diagnóstico.

## Requirements

### Requirement 1

**User Story:** Como um usuário do aplicativo Valente-Conecta, eu quero fazer login de forma segura para acessar o sistema de pré-diagnóstico, para que minhas informações e relatórios sejam protegidos e personalizados.

#### Acceptance Criteria

1. WHEN o usuário acessa a tela de login THEN o sistema SHALL exibir campos para email e senha
2. WHEN o usuário insere credenciais válidas THEN o sistema SHALL autenticar via Supabase SDK e redirecionar para o painel
3. WHEN o usuário insere credenciais inválidas THEN o sistema SHALL exibir mensagem de erro apropriada
4. WHEN o usuário não possui conta THEN o sistema SHALL fornecer opção de cadastro
5. WHEN o usuário se cadastra com dados válidos THEN o sistema SHALL criar conta no Supabase e fazer login automático

### Requirement 2

**User Story:** Como um usuário autenticado, eu quero acessar um painel personalizado onde posso iniciar diagnósticos e visualizar meus relatórios anteriores, para que tenha controle total sobre meu histórico médico.

#### Acceptance Criteria

1. WHEN o usuário faz login com sucesso THEN o sistema SHALL exibir o painel do usuário
2. WHEN o usuário acessa o painel THEN o sistema SHALL exibir botão "Iniciar Pré-Diagnóstico"
3. WHEN o usuário acessa o painel THEN o sistema SHALL listar todos os relatórios anteriores do usuário
4. WHEN não há relatórios anteriores THEN o sistema SHALL exibir mensagem informativa
5. WHEN o usuário não está autenticado THEN o sistema SHALL redirecionar para tela de login

### Requirement 3

**User Story:** Como um usuário, eu quero interagir com o agente de pré-diagnóstico através de uma interface de chat intuitiva, para que possa fornecer informações sobre meus sintomas de forma natural e conversacional.

#### Acceptance Criteria

1. WHEN o usuário clica em "Iniciar Pré-Diagnóstico" THEN o sistema SHALL abrir interface de chat
2. WHEN a interface de chat é aberta THEN o sistema SHALL enviar requisição POST inicial para webhook n8n com user_id e texto "iniciar"
3. WHEN o usuário digita mensagem no chat THEN o sistema SHALL exibir a mensagem na área de conversa
4. WHEN o usuário envia mensagem THEN o sistema SHALL enviar requisição POST para webhook n8n com user_id e texto da mensagem
5. WHEN o sistema recebe resposta da IA THEN o sistema SHALL exibir resposta na área de conversa
6. WHEN ocorre erro na comunicação THEN o sistema SHALL exibir mensagem de erro e permitir nova tentativa
7. WHEN o chat está ativo THEN o sistema SHALL manter histórico da conversa na sessão

### Requirement 4

**User Story:** Como um usuário, eu quero que o sistema gere automaticamente um relatório PDF com meu diagnóstico quando a consulta for finalizada, para que eu tenha um documento formal e permanente dos resultados.

#### Acceptance Criteria

1. WHEN o workflow n8n retorna JSON final de diagnóstico THEN o sistema SHALL detectar que é resposta final
2. WHEN JSON final é recebido THEN o sistema SHALL converter JSON em formato PDF legível
3. WHEN PDF é gerado THEN o sistema SHALL criar nome único no formato "diagnostico-[user_id]-[timestamp].pdf"
4. WHEN PDF é criado THEN o sistema SHALL fazer upload para Supabase Storage no bucket específico
5. WHEN upload é bem-sucedido THEN o sistema SHALL salvar URL do PDF na tabela "relatorios_diagnostico" com user_id e data
6. WHEN processo é concluído THEN o sistema SHALL notificar usuário que relatório está disponível
7. WHEN ocorre erro na geração THEN o sistema SHALL exibir mensagem de erro e manter dados da conversa

### Requirement 5

**User Story:** Como um usuário, eu quero visualizar e acessar todos os meus relatórios de pré-diagnóstico anteriores através do painel, para que possa acompanhar meu histórico médico ao longo do tempo.

#### Acceptance Criteria

1. WHEN o usuário acessa o painel THEN o sistema SHALL consultar tabela "relatorios_diagnostico" filtrando por user_id
2. WHEN existem relatórios THEN o sistema SHALL exibir lista com data de criação e opção de visualizar
3. WHEN o usuário clica em "Visualizar Relatório" THEN o sistema SHALL abrir PDF diretamente da URL do Supabase Storage
4. WHEN PDF não pode ser carregado THEN o sistema SHALL exibir mensagem de erro
5. WHEN a lista é atualizada THEN o sistema SHALL ordenar relatórios por data mais recente primeiro
6. WHEN usuário não tem relatórios THEN o sistema SHALL exibir mensagem "Nenhum relatório encontrado"

### Requirement 6

**User Story:** Como um desenvolvedor, eu quero que o sistema tenha tratamento robusto de erros e logging adequado, para que possamos monitorar e resolver problemas rapidamente.

#### Acceptance Criteria

1. WHEN ocorre erro de rede THEN o sistema SHALL exibir mensagem específica e permitir retry
2. WHEN webhook n8n não responde THEN o sistema SHALL implementar timeout e fallback
3. WHEN Supabase não está disponível THEN o sistema SHALL exibir mensagem de manutenção
4. WHEN upload de PDF falha THEN o sistema SHALL manter dados localmente e permitir nova tentativa
5. WHEN erro crítico ocorre THEN o sistema SHALL registrar log detalhado para debugging
6. WHEN usuário perde conexão durante chat THEN o sistema SHALL salvar estado e permitir recuperação

### Requirement 7

**User Story:** Como um usuário, eu quero que a interface seja responsiva e funcione bem em dispositivos móveis, para que possa usar o sistema em qualquer lugar.

#### Acceptance Criteria

1. WHEN usuário acessa em dispositivo móvel THEN interface SHALL se adaptar ao tamanho da tela
2. WHEN usuário digita no chat em mobile THEN teclado SHALL aparecer sem quebrar layout
3. WHEN usuário visualiza PDF em mobile THEN documento SHALL ser legível e navegável
4. WHEN usuário navega entre telas THEN transições SHALL ser suaves e intuitivas
5. WHEN usuário usa em tablet THEN layout SHALL aproveitar espaço disponível adequadamente