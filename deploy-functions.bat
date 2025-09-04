@echo off
echo === DEPLOY DAS EDGE FUNCTIONS NO SUPABASE ===
echo.

echo 1. Fazendo deploy da funcao process-payment...
supabase functions deploy process-payment --project-ref corrklfwxfuqusfzwbls

echo.
echo 2. Fazendo deploy da funcao process-payment-v2...
supabase functions deploy process-payment-v2 --project-ref corrklfwxfuqusfzwbls

echo.
echo 3. Fazendo deploy da funcao check-asaas-config...
supabase functions deploy check-asaas-config --project-ref corrklfwxfuqusfzwbls

echo.
echo === DEPLOY CONCLUIDO ===
echo.
echo Para testar as funcoes:
echo - process-payment: https://corrklfwxfuqusfzwbls.supabase.co/functions/v1/process-payment
echo - process-payment-v2: https://corrklfwxfuqusfzwbls.supabase.co/functions/v1/process-payment-v2
echo - check-asaas-config: https://corrklfwxfuqusfzwbls.supabase.co/functions/v1/check-asaas-config

pause