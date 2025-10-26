#!/usr/bin/env python3
"""
Análise completa do sistema de profissionais parceiros - Instituto Coração Valente
Verifica estado atual das tabelas, dados e estrutura
"""

from supabase import create_client, Client
import json

# Configurações do Instituto Coração Valente
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw"

def analyze_professionals_system():
    """Análise completa do sistema de profissionais parceiros"""
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    print("=" * 80)
    print("ANÁLISE COMPLETA DO SISTEMA DE PROFISSIONAIS PARCEIROS - INSTITUTO CORAÇÃO VALENTE")
    print("=" * 80)
    
    # Tabelas relacionadas aos profissionais
    professional_tables = {
        'partners': 'Profissionais Parceiros',
        'schedules': 'Horários dos Profissionais',
        'appointments': 'Agendamentos',
        'profiles': 'Perfis de Usuários (inclui profissionais)'
    }
    
    results = {}
    
    for table, description in professional_tables.items():
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
                        elif isinstance(value, list) and len(value) > 3:
                            value = value[:3] + ["..."]
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
    
    # Análise específica dos profissionais
    print(f"\n👨‍⚕️ ANÁLISE DOS PROFISSIONAIS PARCEIROS")
    print("-" * 60)
    
    if results.get('partners', {}).get('exists'):
        try:
            partners = supabase.table('partners').select('*').execute()
            
            print(f"📊 Estatísticas dos profissionais:")
            print(f"   Total: {len(partners.data)}")
            
            # Análise por status
            active_count = 0
            inactive_count = 0
            specialties = {}
            
            for partner in partners.data:
                if partner.get('is_active'):
                    active_count += 1
                else:
                    inactive_count += 1
                
                # Contar especialidades
                specialty = partner.get('specialty', 'Não informado')
                specialties[specialty] = specialties.get(specialty, 0) + 1
                
                # Especialidades adicionais (JSONB)
                additional_specs = partner.get('specialties', [])
                if isinstance(additional_specs, list):
                    for spec in additional_specs:
                        if isinstance(spec, str):
                            specialties[spec] = specialties.get(spec, 0) + 1
            
            print(f"   Ativos: {active_count}")
            print(f"   Inativos: {inactive_count}")
            
            print(f"\n📂 Profissionais por especialidade:")
            for specialty, count in specialties.items():
                print(f"   - {specialty}: {count} profissionais")
                
        except Exception as e:
            print(f"❌ Erro ao analisar profissionais: {e}")
    
    # Análise dos horários
    print(f"\n⏰ ANÁLISE DOS HORÁRIOS")
    print("-" * 60)
    
    if results.get('schedules', {}).get('exists'):
        try:
            schedules = supabase.table('schedules').select('*').execute()
            
            print(f"📊 Estatísticas dos horários:")
            print(f"   Total: {len(schedules.data)}")
            
            # Análise por dia da semana
            days = {}
            available_count = 0
            
            for schedule in schedules.data:
                day = schedule.get('day_of_week', 'Não informado')
                days[day] = days.get(day, 0) + 1
                
                if schedule.get('is_available'):
                    available_count += 1
            
            print(f"   Disponíveis: {available_count}")
            print(f"   Indisponíveis: {len(schedules.data) - available_count}")
            
            print(f"\n📅 Horários por dia da semana:")
            for day, count in days.items():
                print(f"   - {day}: {count} horários")
                
        except Exception as e:
            print(f"❌ Erro ao analisar horários: {e}")
    
    # Análise dos agendamentos
    print(f"\n📅 ANÁLISE DOS AGENDAMENTOS")
    print("-" * 60)
    
    if results.get('appointments', {}).get('exists'):
        try:
            appointments = supabase.table('appointments').select('*').execute()
            
            print(f"📊 Estatísticas dos agendamentos:")
            print(f"   Total: {len(appointments.data)}")
            
            # Análise por status
            statuses = {}
            
            for appointment in appointments.data:
                status = appointment.get('status', 'Não informado')
                statuses[status] = statuses.get(status, 0) + 1
            
            print(f"\n📋 Agendamentos por status:")
            for status, count in statuses.items():
                print(f"   - {status}: {count} agendamentos")
                
        except Exception as e:
            print(f"❌ Erro ao analisar agendamentos: {e}")
    
    # Análise dos perfis (user_type = 'parceiro')
    print(f"\n👤 ANÁLISE DOS PERFIS DE PROFISSIONAIS")
    print("-" * 60)
    
    if results.get('profiles', {}).get('exists'):
        try:
            # Buscar perfis de parceiros
            profiles = supabase.table('profiles').select('*').eq('user_type', 'parceiro').execute()
            
            print(f"📊 Perfis de profissionais:")
            print(f"   Total: {len(profiles.data)}")
            
            if len(profiles.data) > 0:
                print(f"\n📋 Dados dos perfis:")
                for i, profile in enumerate(profiles.data[:3], 1):
                    print(f"   Perfil {i}:")
                    print(f"     Nome: {profile.get('full_name', 'N/A')}")
                    print(f"     Email: {profile.get('email', 'N/A')}")
                    print(f"     Telefone: {profile.get('phone', 'N/A')}")
                    print(f"     Cidade: {profile.get('city', 'N/A')}")
                    print(f"     Voluntário: {profile.get('is_volunteer', False)}")
                
        except Exception as e:
            print(f"❌ Erro ao analisar perfis: {e}")
    
    # Análise de relacionamentos
    print(f"\n🔗 ANÁLISE DE RELACIONAMENTOS")
    print("-" * 60)
    
    try:
        # Verificar relacionamento partners -> profiles
        if results.get('partners', {}).get('count', 0) > 0:
            partners_with_profiles = supabase.table('partners').select('''
                id,
                user_id,
                full_name,
                profiles!inner(id, full_name, user_type)
            ''').execute()
            
            print(f"👥 Profissionais com perfis vinculados: {len(partners_with_profiles.data)}")
            
        # Verificar relacionamento schedules -> partners
        if results.get('schedules', {}).get('count', 0) > 0:
            schedules_with_partners = supabase.table('schedules').select('''
                id,
                partner_id,
                day_of_week,
                partners!inner(id, full_name)
            ''').execute()
            
            print(f"⏰ Horários com profissionais vinculados: {len(schedules_with_partners.data)}")
            
        # Verificar relacionamento appointments -> partners
        if results.get('appointments', {}).get('count', 0) > 0:
            appointments_with_partners = supabase.table('appointments').select('''
                id,
                partner_id,
                status,
                partners!inner(id, full_name)
            ''').execute()
            
            print(f"📅 Agendamentos com profissionais vinculados: {len(appointments_with_partners.data)}")
            
    except Exception as e:
        print(f"❌ Erro ao analisar relacionamentos: {e}")
    
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
        results = analyze_professionals_system()
        print(f"\n✅ Análise concluída com sucesso!")
    except Exception as e:
        print(f"\n❌ Erro na análise: {e}")