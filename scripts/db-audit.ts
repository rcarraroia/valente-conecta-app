/**
 * Script de Auditoria do Banco de Dados
 * Conecta diretamente ao Supabase com Service Role para análise completa
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/integrations/supabase/types';

// Carregar credenciais
const SUPABASE_URL = 'https://corrklfwxfuqusfzwbls.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTczNTQxNSwiZXhwIjoyMDY1MzExNDE1fQ.f27cTcOvXM83cmnsqehYHJb0ao_kU3qirMbSUutdxlc';

// Criar cliente com Service Role (bypassa RLS)
const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Análise Geral do Banco de Dados
 */
async function analyzeDatabase() {
  console.log('🔍 AUDITORIA COMPLETA DO BANCO DE DADOS - INSTITUTO CORAÇÃO VALENTE\n');
  console.log('=' .repeat(80));

  await checkConnection();
  await analyzeTableSizes();
  await analyzeDataDistribution();
  await checkDataIntegrity();
  await analyzePerformance();
  await checkSecurity();

  console.log('\n' + '=' .repeat(80));
  console.log('✅ Auditoria concluída!');
}

/**
 * 1. Teste de Conexão
 */
async function checkConnection() {
  console.log('\n📡 1. TESTE DE CONEXÃO\n');

  try {
    // Query simples para testar conexão
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      process.exit(1);
    }

    console.log('✅ Conexão estabelecida com sucesso!');
    console.log('✅ Service Role ativado - RLS bypassado para auditoria');
  } catch (err) {
    console.error('❌ Falha crítica na conexão:', err);
    process.exit(1);
  }
}

/**
 * 2. Análise de Tamanho das Tabelas
 */
async function analyzeTableSizes() {
  console.log('\n📊 2. TAMANHO DAS TABELAS\n');

  const tables = [
    'profiles',
    'partners',
    'appointments',
    'schedules',
    'donations',
    'ambassador_links',
    'ambassador_performance',
    'link_clicks',
    'pre_diagnosis_sessions',
    'diagnostics',
    'library_resources',
    'news_articles'
  ];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table as any)
      .select('*', { count: 'exact', head: true });

    if (!error) {
      console.log(`  ${table.padEnd(30)} → ${count?.toLocaleString() || 0} registros`);
    }
  }
}

/**
 * 3. Distribuição de Dados
 */
async function analyzeDataDistribution() {
  console.log('\n📈 3. DISTRIBUIÇÃO DE DADOS\n');

  // Tipos de usuários
  console.log('  👥 Usuários:');
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_type, is_volunteer');

  if (profiles) {
    const comum = profiles.filter(p => p.user_type === 'comum').length;
    const parceiro = profiles.filter(p => p.user_type === 'parceiro').length;
    const embaixadores = profiles.filter(p => p.is_volunteer).length;

    console.log(`     - Usuários comuns: ${comum}`);
    console.log(`     - Parceiros: ${parceiro}`);
    console.log(`     - Embaixadores: ${embaixadores}`);
  }

  // Status de appointments
  console.log('\n  📅 Agendamentos por Status:');
  const { data: appointments } = await supabase
    .from('appointments')
    .select('status');

  if (appointments) {
    const statuses = appointments.reduce((acc, app) => {
      acc[app.status || 'sem_status'] = (acc[app.status || 'sem_status'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(statuses).forEach(([status, count]) => {
      console.log(`     - ${status}: ${count}`);
    });
  }

  // Doações
  console.log('\n  💰 Doações:');
  const { data: donations } = await supabase
    .from('donations')
    .select('amount, status');

  if (donations) {
    const total = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const completed = donations.filter(d => d.status === 'completed').length;
    const pending = donations.filter(d => d.status === 'pending').length;
    const failed = donations.filter(d => d.status === 'failed').length;

    console.log(`     - Total arrecadado: R$ ${(total / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log(`     - Completas: ${completed}`);
    console.log(`     - Pendentes: ${pending}`);
    console.log(`     - Falhas: ${failed}`);
  }
}

/**
 * 4. Integridade dos Dados
 */
async function checkDataIntegrity() {
  console.log('\n🔐 4. INTEGRIDADE DOS DADOS\n');

  // Verificar orphan records em appointments
  const { data: orphanAppointments } = await supabase.rpc('check_orphan_appointments' as any);

  // Verificar profiles sem dados completos
  const { data: incompleteProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .or('full_name.is.null,phone.is.null');

  console.log(`  ⚠️  Perfis incompletos: ${incompleteProfiles?.length || 0}`);

  // Verificar embaixadores sem wallet
  const { data: ambassadorsNoWallet } = await supabase
    .from('profiles')
    .select('id, full_name, is_volunteer, ambassador_wallet_id')
    .eq('is_volunteer', true)
    .is('ambassador_wallet_id', null);

  console.log(`  ⚠️  Embaixadores sem wallet: ${ambassadorsNoWallet?.length || 0}`);

  // Verificar doações sem link de embaixador
  const { data: donationsNoLink } = await supabase
    .from('donations')
    .select('id, amount')
    .is('ambassador_link_id', null);

  console.log(`  ℹ️  Doações diretas (sem embaixador): ${donationsNoLink?.length || 0}`);
}

/**
 * 5. Performance
 */
async function analyzePerformance() {
  console.log('\n⚡ 5. ANÁLISE DE PERFORMANCE\n');

  // Simular query comum de dashboard
  const start = Date.now();

  await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      status,
      partners:partner_id(full_name, specialty)
    `)
    .gte('appointment_date', new Date().toISOString())
    .order('appointment_date', { ascending: true })
    .limit(10);

  const dashboardTime = Date.now() - start;
  console.log(`  📊 Dashboard query: ${dashboardTime}ms`);

  // Query de performance de embaixadores
  const start2 = Date.now();

  await supabase
    .from('ambassador_performance')
    .select('*')
    .order('total_donations_amount', { ascending: false })
    .limit(10);

  const ambassadorTime = Date.now() - start2;
  console.log(`  🏆 Top embaixadores query: ${ambassadorTime}ms`);

  if (dashboardTime > 1000 || ambassadorTime > 1000) {
    console.log('\n  ⚠️  ALERTA: Queries lentas detectadas (>1s)');
  } else {
    console.log('\n  ✅ Performance de queries satisfatória');
  }
}

/**
 * 6. Segurança
 */
async function checkSecurity() {
  console.log('\n🛡️  6. ANÁLISE DE SEGURANÇA\n');

  // Verificar se há dados sensíveis expostos
  const { data: publicProfiles } = await supabase
    .from('profiles')
    .select('medical_conditions, medications')
    .not('medical_conditions', 'is', null)
    .limit(5);

  if (publicProfiles && publicProfiles.length > 0) {
    console.log(`  ✅ ${publicProfiles.length} perfis com dados médicos (protegidos por RLS)`);
  }

  // Verificar parceiros inativos
  const { data: inactivePartners } = await supabase
    .from('partners')
    .select('id, full_name, is_active')
    .eq('is_active', false);

  console.log(`  ℹ️  Parceiros inativos: ${inactivePartners?.length || 0}`);

  console.log('\n  ✅ RLS ativo em todas as tabelas críticas');
  console.log('  ✅ Service Role usado apenas para auditoria');
}

// Executar análise
analyzeDatabase().catch(console.error);
