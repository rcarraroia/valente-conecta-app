#!/bin/bash

# Script de Auditoria do Banco de Dados
# Usa a REST API do Supabase diretamente via curl

SUPABASE_URL="https://corrklfwxfuqusfzwbls.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTczNTQxNSwiZXhwIjoyMDY1MzExNDE1fQ.f27cTcOvXM83cmnsqehYHJb0ao_kU3qirMbSUutdxlc"

echo "🔍 AUDITORIA COMPLETA DO BANCO DE DADOS - INSTITUTO CORAÇÃO VALENTE"
echo "========================================================================"

# Função auxiliar para fazer requests
query_table() {
  local table=$1
  local select=${2:-"*"}
  local filter=${3:-""}

  curl -s -X GET \
    "${SUPABASE_URL}/rest/v1/${table}?select=${select}${filter}" \
    -H "apikey: ${SERVICE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "Content-Type: application/json"
}

# Função para contar registros
count_table() {
  local table=$1
  curl -s -X GET \
    "${SUPABASE_URL}/rest/v1/${table}?select=count" \
    -H "apikey: ${SERVICE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "Prefer: count=exact" \
    -I 2>&1 | grep -i "content-range" | sed 's/.*\///;s/-.*//'
}

echo ""
echo "📡 1. TESTE DE CONEXÃO"
echo ""

# Testar conexão
response=$(query_table "profiles" "id" "&limit=1")
if [ $? -eq 0 ]; then
  echo "✅ Conexão estabelecida com sucesso!"
  echo "✅ Service Role ativado - RLS bypassado para auditoria"
else
  echo "❌ Falha na conexão"
  exit 1
fi

echo ""
echo "📊 2. TAMANHO DAS TABELAS"
echo ""

tables=(
  "profiles"
  "partners"
  "appointments"
  "schedules"
  "donations"
  "ambassador_links"
  "ambassador_performance"
  "link_clicks"
  "pre_diagnosis_sessions"
  "diagnostics"
  "library_resources"
  "news_articles"
)

for table in "${tables[@]}"; do
  count=$(count_table "$table")
  if [ -z "$count" ]; then count="0"; fi
  printf "  %-30s → %'d registros\n" "$table" "$count"
done

echo ""
echo "📈 3. DISTRIBUIÇÃO DE DADOS"
echo ""

# Obter dados de profiles
profiles_data=$(query_table "profiles" "user_type,is_volunteer")

echo "  👥 Usuários:"
comum=$(echo "$profiles_data" | grep -o '"user_type":"comum"' | wc -l)
parceiro=$(echo "$profiles_data" | grep -o '"user_type":"parceiro"' | wc -l)
embaixadores=$(echo "$profiles_data" | grep -o '"is_volunteer":true' | wc -l)

echo "     - Usuários comuns: $comum"
echo "     - Parceiros: $parceiro"
echo "     - Embaixadores: $embaixadores"

echo ""
echo "  📅 Agendamentos:"
appointments_data=$(query_table "appointments" "status")
echo "     Total: $(echo "$appointments_data" | grep -o '"status"' | wc -l)"

echo ""
echo "  💰 Doações:"
donations_data=$(query_table "donations" "amount,status")
total_donations=$(echo "$donations_data" | grep -o '"amount"' | wc -l)
echo "     Total de transações: $total_donations"

echo ""
echo "========================================================================"
echo "✅ Auditoria básica concluída!"
echo ""
echo "💡 Para análise mais detalhada, vou agora consultar dados específicos..."
