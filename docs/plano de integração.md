Ótimo, o plano está completo. Fico feliz que a integração com o Supabase simplificou a abordagem.

Solicitação Técnica para Kiro: Integração do Agente de Pré-Diagnóstico
Objetivo: Integrar o fluxo do agente de pré-diagnóstico (n8n) no aplicativo Valente-Conecta, implementando uma interface de chat conversacional e um novo painel de usuário para visualizar os relatórios finais em formato PDF.

Infraestrutura Existente:

n8n: Workflow do agente de pré-diagnóstico na URL do webhook: https://primary-production-b7fe.up.railway.app/webhook/multiagente-ia-diagnostico.

Supabase: Utilizado para autenticação e banco de dados.

GitHub: Repositório do aplicativo rcarraroia/valente-conecta-app.

Tarefas Detalhadas
1. Configuração e Autenticação do Usuário
Autenticação: Utilize o SDK do Supabase para implementar e gerenciar o fluxo de login e cadastro de usuários.

Painel do Usuário: Desenvolva uma nova tela ou seção no aplicativo que funcione como um painel. Esta tela deve ser acessível apenas após o login e será o ponto de entrada para a entrevista e o repositório dos relatórios.

2. Interface de Chat e Lógica de Comunicação
Interface: Crie uma interface de chat conversacional. Ela deve incluir:

Uma área de exibição para as mensagens (do usuário e da IA).

Um campo de entrada de texto e um botão de envio.

Fluxo de Comunicação:

Ao clicar no botão "Iniciar Pré-Diagnóstico", o aplicativo deve enviar uma requisição POST para o webhook do n8n (https://primary-production-b7fe.up.railway.app/webhook/multiagente-ia-diagnostico).

O corpo da requisição deve ser um JSON contendo o user_id do Supabase e o texto inicial para o agente. Exemplo: {"user_id": "seuidunicoaqui", "text": "iniciar"}.

A cada nova mensagem do usuário no chat, o aplicativo deve enviar uma nova requisição POST com a mensagem e o user_id.

Implemente a lógica para tratar a resposta da IA.

3. Geração e Armazenamento do PDF
Geração: Quando o fluxo do n8n retornar o JSON final, o aplicativo não deve exibir o texto no chat. Em vez disso, deve usar uma biblioteca, como react-native-html-to-pdf, para converter o JSON em um arquivo PDF. O PDF deve ser formatado de forma clara e legível.

Armazenamento: Utilize o Supabase Storage para armazenar o arquivo PDF gerado. Configure um bucket específico para os relatórios. O nome do arquivo deve ser único e descritivo, como diagnostico-[user_id]-[timestamp].pdf.

Registro no Banco de Dados: Após o upload bem-sucedido para o Supabase Storage, salve a URL do PDF na tabela relatorios_diagnostico do Supabase, junto com o user_id e a data de criação.

4. Visualização no Painel do Usuário
Listagem: O painel do usuário deve listar todos os relatórios de pré-diagnóstico que estão associados ao user_id do usuário logado.

Acesso ao Relatório: Para cada relatório listado, implemente um botão ou link que, ao ser clicado, abra o PDF diretamente da URL fornecida pelo Supabase Storage.

Diagrama de Fluxo de Processo
Snippet de código

graph TD
    A[Usuário no App Clica em 'Login'] --> B{Supabase Authentication};
    B --> C[Usuário Acessa 'Painel do Usuário'];
    C --> D[Usuário Clica em 'Iniciar Pré-Diagnóstico'];
    D --> E{App Envia POST para Webhook n8n<br/>com ID do Usuário};
    E --> F[Workflow n8n: Retorna JSON Final];
    F --> G{App Recebe JSON Final da IA};
    G --> H[App Gera PDF a partir do JSON];
    H --> I{App Envia PDF para Supabase Storage};
    I --> J{Supabase Storage Retorna URL do PDF};
    J --> K[App Salva URL e ID do Usuário em Tabela do Supabase];
    K --> L[Painel do Usuário Consulta Supabase DB e Exibe Link];
    L --> M[Usuário Clica e Visualiza o Relatório PDF];
