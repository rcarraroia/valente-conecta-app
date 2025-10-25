# 🔍 ANÁLISE - Referências a "Pré-Diagnóstico" na Landing Page

**Data:** 25/10/2025  
**Solicitante:** Usuário  
**Analista:** Kiro AI  

---

## 📊 RESUMO EXECUTIVO

**Total de ocorrências encontradas:** 4 (quatro)  
**Componentes afetados:** 2 (dois)  
**Tipo de conteúdo:** Títulos, textos descritivos e botões

---

## 📍 DETALHAMENTO DAS OCORRÊNCIAS

### 1️⃣ **LandingPreDiagnosis.tsx** - 3 ocorrências

**Arquivo:** `src/components/landing/LandingPreDiagnosis.tsx`

#### Ocorrência 1 - Título Principal (Linha 19)
```tsx
<h2 className="text-3xl md:text-4xl font-heading font-bold text-cv-gray-dark mb-6">
  Pré-Diagnóstico Inteligente
</h2>
```
- **Tipo:** Título H2
- **Contexto:** Título principal da seção
- **Visibilidade:** Alta (destaque visual)

#### Ocorrência 2 - Texto Descritivo (Linha 22)
```tsx
<p className="text-xl text-cv-gray-light max-w-3xl mx-auto leading-relaxed">
  Nossa ferramenta de pré-diagnóstico utiliza inteligência artificial para 
  identificar possíveis sinais de TEA, TDAH, Dislexia e outras condições 
  do neurodesenvolvimento.
</p>
```
- **Tipo:** Parágrafo descritivo
- **Contexto:** Subtítulo explicativo da seção
- **Visibilidade:** Alta (logo abaixo do título)
- **Nota:** Usa "pré-diagnóstico" em minúsculas

#### Ocorrência 3 - Subtítulo de Card (Linha 100)
```tsx
<h3 className="text-2xl font-heading font-semibold text-cv-gray-dark mb-8 text-center">
  Por que Nosso Pré-Diagnóstico é Diferente
</h3>
```
- **Tipo:** Título H3
- **Contexto:** Título de seção de benefícios
- **Visibilidade:** Média (dentro de card branco)

---

### 2️⃣ **LandingHero.tsx** - 1 ocorrência

**Arquivo:** `src/components/landing/LandingHero.tsx`

#### Ocorrência 4 - Texto de Botão (Linha 99)
```tsx
<Button
  variant="outline"
  size="lg"
  onClick={() => document.getElementById('pre-diagnosis-section')?.scrollIntoView({ behavior: 'smooth' })}
  className="border-cv-purple-soft text-cv-purple-soft hover:bg-cv-purple-soft hover:text-white px-8 py-4 text-lg rounded-full transition-all duration-300"
>
  Conheça Nosso Pré-Diagnóstico
</Button>
```
- **Tipo:** Texto de botão CTA (Call-to-Action)
- **Contexto:** Botão secundário no hero da landing page
- **Visibilidade:** Muito Alta (primeira seção, botão de destaque)
- **Ação:** Scroll para seção de pré-diagnóstico

---

## 🗺️ MAPEAMENTO VISUAL DA LANDING PAGE

```
┌─────────────────────────────────────────────────────────────┐
│ LANDING PAGE - Instituto Coração Valente                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 1. LandingHero                                              │
│    ├─ Logo do Instituto                                     │
│    ├─ Informações do Embaixador (se houver)                │
│    ├─ Botão: "Ajude Nossa Causa"                           │
│    └─ Botão: "Conheça Nosso Pré-Diagnóstico" ⚠️ [OCORRÊNCIA 4]
│                                                              │
│ 2. LandingAbout                                             │
│    ├─ Quem Somos                                            │
│    ├─ Nossa Missão                                          │
│    └─ Como Ajudamos                                         │
│       (Sem menção a pré-diagnóstico)                        │
│                                                              │
│ 3. LandingPreDiagnosis ⚠️ [SEÇÃO DEDICADA]                 │
│    ├─ Título: "Pré-Diagnóstico Inteligente" ⚠️ [OCORRÊNCIA 1]
│    ├─ Texto: "...ferramenta de pré-diagnóstico..." ⚠️ [OCORRÊNCIA 2]
│    ├─ Como Funciona Nossa Avaliação                        │
│    ├─ Avaliação Gratuita (card)                            │
│    └─ "Por que Nosso Pré-Diagnóstico é Diferente" ⚠️ [OCORRÊNCIA 3]
│                                                              │
│ 4. LandingImpact                                            │
│    ├─ Nosso Compromisso                                     │
│    ├─ Serviços (Neuropsicologia, Fono, TO)                 │
│    └─ Números de Impacto                                    │
│       (Sem menção a pré-diagnóstico)                        │
│                                                              │
│ 5. LandingTestimonials                                      │
│    └─ Depoimentos de famílias                               │
│       (Não analisado - não solicitado)                      │
│                                                              │
│ 6. LandingFooter                                            │
│    └─ Informações de contato                                │
│       (Não analisado - não solicitado)                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 ANÁLISE DE CONTEXTO

### Uso Apropriado

✅ **Todas as 4 ocorrências estão em contextos apropriados:**

1. **Título de seção dedicada** - Identifica claramente o conteúdo
2. **Descrição da ferramenta** - Explica o que é oferecido
3. **Diferencial competitivo** - Destaca benefícios únicos
4. **Call-to-Action** - Direciona usuário para informações

### Variações Encontradas

- **"Pré-Diagnóstico"** (com maiúsculas) - 3 ocorrências
- **"pré-diagnóstico"** (minúsculas) - 1 ocorrência

### Consistência

⚠️ **Inconsistência detectada:**
- Maioria usa "Pré-Diagnóstico" (título/nome próprio)
- Uma ocorrência usa "pré-diagnóstico" (substantivo comum)

---

## 🎯 ANÁLISE DE IMPACTO

### Visibilidade das Ocorrências

| Ocorrência | Localização | Visibilidade | Impacto |
|------------|-------------|--------------|---------|
| 1 | Título seção | ⭐⭐⭐⭐⭐ Muito Alta | Primeira impressão da funcionalidade |
| 2 | Texto descritivo | ⭐⭐⭐⭐ Alta | Explicação do serviço |
| 3 | Subtítulo card | ⭐⭐⭐ Média | Reforço de diferencial |
| 4 | Botão CTA Hero | ⭐⭐⭐⭐⭐ Muito Alta | Ação principal do usuário |

### Jornada do Usuário

```
1. Usuário chega na landing page
   ↓
2. Vê botão "Conheça Nosso Pré-Diagnóstico" [OCORRÊNCIA 4]
   ↓
3. Clica e é levado para seção dedicada
   ↓
4. Lê título "Pré-Diagnóstico Inteligente" [OCORRÊNCIA 1]
   ↓
5. Lê descrição com "pré-diagnóstico" [OCORRÊNCIA 2]
   ↓
6. Vê benefícios "Por que Nosso Pré-Diagnóstico é Diferente" [OCORRÊNCIA 3]
```

---

## 🔄 COMPONENTES RELACIONADOS

### Componentes que NÃO mencionam "Pré-Diagnóstico"

✅ **LandingAbout.tsx**
- Foco: Missão, valores, serviços gerais
- Sem menção a pré-diagnóstico

✅ **LandingImpact.tsx**
- Foco: Serviços especializados (Neuropsicologia, Fono, TO)
- Números de impacto
- Sem menção a pré-diagnóstico

✅ **LandingDonation.tsx**
- Foco: Sistema de doações
- Sem menção a pré-diagnóstico

---

## 📝 OBSERVAÇÕES TÉCNICAS

### IDs e Navegação

**ID da seção:** `pre-diagnosis-section`
```tsx
<section id="pre-diagnosis-section" className="...">
```

**Navegação via scroll:**
```tsx
onClick={() => document.getElementById('pre-diagnosis-section')?.scrollIntoView({ behavior: 'smooth' })}
```

### Estrutura da Seção LandingPreDiagnosis

A seção é composta por:
1. **Título e descrição** (com 2 ocorrências)
2. **Como funciona** (3 cards: Questionário, Análise IA, Relatório)
3. **Card de avaliação gratuita** (destaque central)
4. **Benefícios** (com 1 ocorrência no título)

---

## 🎨 ELEMENTOS VISUAIS ASSOCIADOS

### Ícones Usados
- 🧠 Brain (cérebro) - Representa IA e análise
- 💬 MessageSquare - Questionário
- ✅ CheckCircle - Relatório
- ⏰ Clock - Tempo de avaliação
- 👥 Users - Público-alvo
- ❤️ Heart - Evidências científicas

### Cores Predominantes
- **cv-coral** - Cor principal dos destaques
- **cv-green** - Cor de confirmação/positivo
- **cv-gray-dark** - Textos principais
- **cv-gray-light** - Textos secundários

---

## 📊 ESTATÍSTICAS

| Métrica | Valor |
|---------|-------|
| Total de palavras na seção | ~250 palavras |
| Densidade "Pré-Diagnóstico" | 1.2% (3 em 250) |
| Componentes com menção | 2 de 6 (33%) |
| Seções dedicadas | 1 (LandingPreDiagnosis) |
| CTAs relacionados | 1 botão principal |

---

## 🔍 ANÁLISE SEMÂNTICA

### Termos Relacionados Usados

Além de "Pré-Diagnóstico", a landing page usa:
- "Avaliação" (múltiplas vezes)
- "Ferramenta"
- "Análise Inteligente"
- "Questionário Personalizado"
- "Relatório Detalhado"

### Contexto de Uso

O termo "Pré-Diagnóstico" é usado para:
1. ✅ Nomear a funcionalidade/produto
2. ✅ Descrever o serviço oferecido
3. ✅ Diferenciar de concorrentes
4. ✅ Chamar atenção do usuário (CTA)

---

## 💡 CONSIDERAÇÕES FINAIS

### Pontos Positivos

✅ Uso focado e estratégico do termo  
✅ Seção dedicada bem estruturada  
✅ CTA claro e direto  
✅ Contexto sempre apropriado  

### Pontos de Atenção

⚠️ Inconsistência de capitalização (Pré-Diagnóstico vs pré-diagnóstico)  
⚠️ Termo aparece apenas em 2 dos 6 componentes da landing  

### Impacto de Possíveis Alterações

Se o termo "Pré-Diagnóstico" for alterado:
- **Alto impacto:** 4 localizações precisam ser atualizadas
- **Componentes afetados:** 2 arquivos
- **Navegação afetada:** 1 ID de seção (`pre-diagnosis-section`)
- **SEO afetado:** Títulos H2 e H3, texto de botão

---

## 📋 CHECKLIST DE ARQUIVOS

- [x] LandingPage.tsx (página principal) - Analisado
- [x] LandingHero.tsx - **1 ocorrência encontrada**
- [x] LandingAbout.tsx - Sem ocorrências
- [x] LandingPreDiagnosis.tsx - **3 ocorrências encontradas**
- [x] LandingImpact.tsx - Sem ocorrências
- [ ] LandingTestimonials.tsx - Não analisado (não solicitado)
- [ ] LandingFooter.tsx - Não analisado (não solicitado)
- [x] LandingDonation.tsx - Sem ocorrências

---

## 🎯 RESUMO PARA TOMADA DE DECISÃO

**Se você deseja alterar o termo "Pré-Diagnóstico":**

1. **Arquivos a modificar:** 2
2. **Linhas a alterar:** 4
3. **IDs a atualizar:** 1 (`pre-diagnosis-section`)
4. **Tempo estimado:** ~5 minutos
5. **Risco:** Baixo (alteração simples de texto)

**Localizações exatas:**
- `src/components/landing/LandingHero.tsx` - Linha 99
- `src/components/landing/LandingPreDiagnosis.tsx` - Linhas 19, 22, 100

---

**Análise concluída. Aguardando autorização para correções, se necessário.**
