@echo off
REM ========================================
REM SETUP SUPABASE CLI - INSTITUTO CORAÇÃO VALENTE
REM ========================================

echo.
echo ========================================
echo CONFIGURACAO DO SUPABASE CLI
echo Instituto Coração Valente
echo ========================================
echo.

REM Verificar se Supabase CLI está instalado
echo [1/4] Verificando instalacao do Supabase CLI...
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Supabase CLI nao encontrado!
    echo.
    echo Para instalar:
    echo 1. Instale Scoop: irm get.scoop.sh ^| iex
    echo 2. Adicione bucket: scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
    echo 3. Instale CLI: scoop install supabase
    echo.
    pause
    exit /b 1
)

echo ✅ Supabase CLI instalado
supabase --version
echo.

REM Fazer logout (limpar sessão anterior)
echo [2/4] Limpando sessao anterior...
supabase logout >nul 2>&1
echo ✅ Sessao limpa
echo.

REM Fazer login
echo [3/4] Fazendo login no Supabase...
echo.
echo ⚠️  IMPORTANTE: Voce precisa de um Access Token!
echo.
echo Como obter:
echo 1. Acesse: https://supabase.com/dashboard/account/tokens
echo 2. Clique em "Generate new token"
echo 3. Nome: "Kiro CLI - Instituto Coração Valente"
echo 4. Copie o token (formato: sbp_xxxxx...)
echo.
echo Cole o token quando solicitado:
echo.

supabase login
if %errorlevel% neq 0 (
    echo.
    echo ❌ Falha no login!
    echo Verifique se o token esta correto.
    pause
    exit /b 1
)

echo.
echo ✅ Login realizado com sucesso!
echo.

REM Linkar ao projeto
echo [4/4] Linkando ao projeto Instituto Coração Valente...
echo.
echo Project ID: corrklfwxfuqusfzwbls
echo.

supabase link --project-ref corrklfwxfuqusfzwbls
if %errorlevel% neq 0 (
    echo.
    echo ❌ Falha ao linkar projeto!
    echo Verifique se o Project ID esta correto.
    pause
    exit /b 1
)

echo.
echo ✅ Projeto linkado com sucesso!
echo.

REM Validar configuração
echo ========================================
echo VALIDANDO CONFIGURACAO
echo ========================================
echo.

echo Listando projetos...
supabase projects list
echo.

echo Testando query no banco...
supabase db execute "SELECT 1 as test, 'Instituto Coração Valente' as projeto"
echo.

echo ========================================
echo ✅ CONFIGURACAO COMPLETA!
echo ========================================
echo.
echo Voce agora pode usar comandos como:
echo - supabase db execute "SELECT * FROM profiles LIMIT 5"
echo - supabase migration new nome_da_migration
echo - supabase db push
echo - supabase functions list
echo.
pause
