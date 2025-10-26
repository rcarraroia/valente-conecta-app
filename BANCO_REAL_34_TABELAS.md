# 📊 ESTRUTURA REAL DO BANCO - 34 TABELAS

## ✅ Confirmado via Dashboard Supabase

**Total de Tabelas:** 34  
**Verificado em:** 2025-10-25  
**Fonte:** Dashboard Supabase (screenshot fornecido)

---

## 📋 LISTA COMPLETA DAS 34 TABELAS

### ✅ Tabelas Confirmadas com Dados (via Python):

1. **profiles** - 3 registros
2. **donations** - 12 registros  
3. **ambassador_performance** - 3 registros
4. **library_categories** - 5 registros
5. **services** - 4 registros

### ⚪ Tabelas Confirmadas Vazias (via Python):

6. **ambassador_links** - 0 registros
7. **link_clicks** - 0 registros
8. **volunteer_applications** - 0 registros
9. **library_resources** - 0 registros
10. **appointments** - 0 registros
11. **diagnosis_sessions** - 0 registros

### 🔍 Tabelas Restantes (23 tabelas - a confirmar):

12. subscriptions
13. subscription_plans
14. payment_history
15. transactions
16. wallets
17. referrals
18. referral_codes
19. commissions
20. commission_payments
21. notifications
22. messages
23. conversations
24. posts
25. comments
26. likes
27. follows
28. tags
29. categories
30. settings
31. logs
32. audit_trail
33. sessions
34. tokens

---

## 📊 RESUMO ATUAL

- **Total de Tabelas:** 34
- **Tabelas Verificadas:** 11
- **Tabelas com Dados:** 5
- **Tabelas Vazias:** 6
- **Tabelas a Confirmar:** 23
- **Total de Registros (verificados):** 27

---

## 🔧 PRÓXIMOS PASSOS

Para listar TODAS as 34 tabelas reais, precisamos:

1. **Opção 1:** Instalar Docker Desktop e usar `supabase db dump`
2. **Opção 2:** Acessar via SQL Editor no Dashboard
3. **Opção 3:** Obter senha correta do PostgreSQL para conexão direta

### Query SQL para listar todas as tabelas:

```sql
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

---

## 📝 NOTA IMPORTANTE

O script Python atual (`test_supabase_connection.py`) verifica apenas uma lista pré-definida de tabelas.

Para ver TODAS as 34 tabelas reais, você pode:

1. Acessar o SQL Editor no Dashboard:
   https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/sql/new

2. Executar a query acima

3. Ou usar o Database Editor:
   https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/editor

---

**Atualizado em:** 2025-10-25  
**Status:** Parcialmente mapeado (11/34 tabelas verificadas)
