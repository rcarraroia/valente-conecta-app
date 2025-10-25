import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://corrklfwxfuqusfzwbls.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTczNTQxNSwiZXhwIjoyMDY1MzExNDE1fQ.f27cTcOvXM83cmnsqehYHJb0ao_kU3qirMbSUutdxlc';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...\n');

  try {
    // Testar com profiles
    const { data: profiles, error: profilesError, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: false })
      .limit(5);

    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError);
    } else {
      console.log(`✅ Profiles encontrados: ${count || profiles?.length || 0}`);
      if (profiles && profiles.length > 0) {
        console.log('Primeiros registros:', JSON.stringify(profiles.slice(0, 2), null, 2));
      }
    }

    // Testar doações
    const { data: donations, error: donationsError } = await supabase
      .from('donations')
      .select('id, amount, status')
      .limit(5);

    if (donationsError) {
      console.error('❌ Erro ao buscar donations:', donationsError);
    } else {
      console.log(`\n✅ Doações encontradas: ${donations?.length || 0}`);
      if (donations && donations.length > 0) {
        console.log('Primeiras doações:', JSON.stringify(donations, null, 2));
      }
    }

    // Testar appointments
    const { data: appointments, error: apptError } = await supabase
      .from('appointments')
      .select('id, status')
      .limit(5);

    if (apptError) {
      console.error('❌ Erro ao buscar appointments:', apptError);
    } else {
      console.log(`\n✅ Agendamentos encontrados: ${appointments?.length || 0}`);
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testConnection();
