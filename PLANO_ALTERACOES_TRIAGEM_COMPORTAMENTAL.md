# 📋 PLANO DE ALTERAÇÕES - TRIAGEM COMPORTAMENTAL

**Data:** 25/10/2025  
**Solicitante:** Usuário  
**Status:** ⏳ Aguardando Autorização  

---

## 🎯 RESUMO DAS ALTERAÇÕES SOLICITADAS

1. ✏️ Alterar "Pré-Diagnóstico" para "Triagem Comportamental"
2. 🔘 Alterar botão "Saiba Mais" para "Faça Sua Triagem Grátis"
3. 📱 Atualizar redes sociais no rodapé (manter só Instagram)
4. 🔗 Verificar e corrigir links úteis no rodapé
5. 📍 Atualizar informações de contato

---

## 1️⃣ ALTERAÇÃO DE TERMINOLOGIA

### 📝 Substituir "Pré-Diagnóstico" por "Triagem Comportamental"

#### Arquivo A: `src/components/landing/LandingHero.tsx`

**Linha 99 - Botão CTA:**
```tsx
// ❌ ATUAL:
<Button
  variant="outline"
  size="lg"
  onClick={() => document.getElementById('pre-diagnosis-section')?.scrollIntoView({ behavior: 'smooth' })}
  className="border-cv-purple-soft text-cv-purple-soft hover:bg-cv-purple-soft hover:text-white px-8 py-4 text-lg rounded-full transition-all duration-300"
>
  Conheça Nosso Pré-Diagnóstico
</Button>

// ✅ NOVO:
<Button
  variant="outline"
  size="lg"
  onClick={() => document.getElementById('triagem-comportamental-section')?.scrollIntoView({ behavior: 'smooth' })}
  className="border-cv-purple-soft text-cv-purple-soft hover:bg-cv-purple-soft hover:text-white px-8 py-4 text-lg rounded-full transition-all duration-300"
>
  Conheça Nossa Triagem Comportamental
</Button>
```

---

#### Arquivo B: `src/components/landing/LandingPreDiagnosis.tsx`

**Alteração 1 - ID da Seção (Linha 14):**
```tsx
// ❌ ATUAL:
<section id="pre-diagnosis-section" className="py-20 bg-gradient-to-br from-cv-coral/5 to-cv-green/5">

// ✅ NOVO:
<section id="triagem-comportamental-section" className="py-20 bg-gradient-to-br from-cv-coral/5 to-cv-green/5">
```

**Alteração 2 - Título Principal (Linha 19):**
```tsx
// ❌ ATUAL:
<h2 className="text-3xl md:text-4xl font-heading font-bold text-cv-gray-dark mb-6">
  Pré-Diagnóstico Inteligente
</h2>

// ✅ NOVO:
<h2 className="text-3xl md:text-4xl font-heading font-bold text-cv-gray-dark mb-6">
  Sistema de Triagem Comportamental
</h2>
```

**Alteração 3 - Texto Descritivo (Linha 22):**
```tsx
// ❌ ATUAL:
<p className="text-xl text-cv-gray-light max-w-3xl mx-auto leading-relaxed">
  Nossa ferramenta de pré-diagnóstico utiliza inteligência artificial para identificar possíveis sinais de TEA, TDAH, Dislexia e outras condições do neurodesenvolvimento.
</p>

// ✅ NOVO:
<p className="text-xl text-cv-gray-light max-w-3xl mx-auto leading-relaxed">
  Nossa ferramenta de triagem comportamental utiliza inteligência artificial para identificar possíveis sinais de TEA, TDAH, Dislexia e outras condições do neurodesenvolvimento.
</p>
```

**Alteração 4 - Subtítulo de Benefícios (Linha 100):**
```tsx
// ❌ ATUAL:
<h3 className="text-2xl font-heading font-semibold text-cv-gray-dark mb-8 text-center">
  Por que Nosso Pré-Diagnóstico é Diferente
</h3>

// ✅ NOVO:
<h3 className="text-2xl font-heading font-semibold text-cv-gray-dark mb-8 text-center">
  Por que Nossa Triagem Comportamental é Diferente
</h3>
```

---

## 2️⃣ ALTERAÇÃO DO BOTÃO NO CARD "AVALIAÇÃO GRATUITA"

#### Arquivo: `src/components/landing/LandingPreDiagnosis.tsx`

**Localização:** Aproximadamente linha 85-95 (dentro do card branco)

```tsx
// ❌ ATUAL:
<Button
  onClick={scrollToTestimonials}
  className="w-full bg-cv-coral hover:bg-cv-coral/90 text-white py-3 rounded-full font-semibold"
>
  Saiba Mais Sobre Nossos Resultados
</Button>

// ✅ NOVO:
<Button
  onClick={() => window.location.href = 'https://www.coracaovalente.org.br/diagnosis/chat'}
  className="w-full bg-cv-coral hover:bg-cv-coral/90 text-white py-3 rounded-full font-semibold"
>
  Faça Sua Triagem Grátis
</Button>
```

**Observação:** Remover a função `scrollToTestimonials` se não for mais usada.

---

## 3️⃣ ALTERAÇÕES NO RODAPÉ - REDES SOCIAIS

#### Arquivo: `src/components/landing/LandingFooter.tsx`

**Seção de Redes Sociais (Linhas 23-35):**

```tsx
// ❌ ATUAL:
<div className="flex space-x-4">
  <a href="#" className="w-10 h-10 bg-cv-coral/20 rounded-full flex items-center justify-center hover:bg-cv-coral/30 transition-colors">
    <Facebook className="w-5 h-5" />
  </a>
  <a href="#" className="w-10 h-10 bg-cv-coral/20 rounded-full flex items-center justify-center hover:bg-cv-coral/30 transition-colors">
    <Instagram className="w-5 h-5" />
  </a>
  <a href="#" className="w-10 h-10 bg-cv-coral/20 rounded-full flex items-center justify-center hover:bg-cv-coral/30 transition-colors">
    <Linkedin className="w-5 h-5" />
  </a>
</div>

// ✅ NOVO:
<div className="flex space-x-4">
  <a 
    href="https://www.instagram.com/coracaovalente.ong/" 
    target="_blank" 
    rel="noopener noreferrer"
    className="w-10 h-10 bg-cv-coral/20 rounded-full flex items-center justify-center hover:bg-cv-coral/30 transition-colors"
  >
    <Instagram className="w-5 h-5" />
  </a>
</div>
```

**Imports a remover (Linha 2):**
```tsx
// ❌ ATUAL:
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';

// ✅ NOVO:
import { Heart, Phone, MapPin, Instagram } from 'lucide-react';
```
*Remover: Mail, Facebook, Linkedin*

---

## 4️⃣ ALTERAÇÕES NO RODAPÉ - CONTATO

#### Arquivo: `src/components/landing/LandingFooter.tsx`

**Seção de Contato (Linhas 40-62):**

```tsx
// ❌ ATUAL:
<div>
  <h4 className="text-lg font-semibold mb-6">Contato</h4>
  <div className="space-y-4">
    <div className="flex items-start gap-3">
      <MapPin className="w-5 h-5 text-cv-coral flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-gray-300">Rua Exemplo, 123</p>
        <p className="text-gray-300">São Paulo - SP</p>
        <p className="text-gray-300">CEP: 01234-567</p>
      </div>
    </div>
    
    <div className="flex items-center gap-3">
      <Phone className="w-5 h-5 text-cv-coral" />
      <span className="text-gray-300">(11) 99999-9999</span>
    </div>
    
    <div className="flex items-center gap-3">
      <Mail className="w-5 h-5 text-cv-coral" />
      <span className="text-gray-300">contato@coracaovalente.com.br</span>
    </div>
  </div>
</div>

// ✅ NOVO:
<div>
  <h4 className="text-lg font-semibold mb-6">Contato</h4>
  <div className="space-y-4">
    <div className="flex items-start gap-3">
      <MapPin className="w-5 h-5 text-cv-coral flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-gray-300">Ipatinga - MG</p>
        <p className="text-gray-300">CEP: 35162-820</p>
      </div>
    </div>
    
    <div className="flex items-center gap-3">
      <Phone className="w-5 h-5 text-cv-coral" />
      <span className="text-gray-300">+55 31 98803-6923</span>
    </div>
  </div>
</div>
```

---

## 5️⃣ ALTERAÇÕES NO RODAPÉ - LINKS ÚTEIS

#### Arquivo: `src/components/landing/LandingFooter.tsx`

**Seção Links Úteis (Linhas 66-75):**

### 🔍 ROTAS DISPONÍVEIS NO SISTEMA:

Baseado em `src/App.tsx`, as rotas disponíveis são:
- `/` - Página inicial (Index)
- `/auth` - Autenticação
- `/landing` - Landing page
- `/diagnosis` - Dashboard de diagnóstico
- `/diagnosis/chat` - Chat de triagem
- `/diagnosis/reports` - Relatórios
- `/verificar/:hash` - Verificação de recibo

### 📝 MAPEAMENTO SUGERIDO:

```tsx
// ❌ ATUAL:
<div>
  <h4 className="text-lg font-semibold mb-6">Links Úteis</h4>
  <div className="space-y-3">
    <a href="#" className="block text-gray-300 hover:text-cv-coral transition-colors">Sobre Nós</a>
    <a href="#" className="block text-gray-300 hover:text-cv-coral transition-colors">Nossos Serviços</a>
    <a href="#" className="block text-gray-300 hover:text-cv-coral transition-colors">Como Ajudar</a>
    <a href="#" className="block text-gray-300 hover:text-cv-coral transition-colors">Seja um Parceiro</a>
    <a href="#" className="block text-gray-300 hover:text-cv-coral transition-colors">Transparência</a>
  </div>
</div>

// ✅ NOVO (OPÇÃO 1 - Scroll na mesma página):
<div>
  <h4 className="text-lg font-semibold mb-6">Links Úteis</h4>
  <div className="space-y-3">
    <a 
      href="#about-section" 
      onClick={(e) => {
        e.preventDefault();
        document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
      }}
      className="block text-gray-300 hover:text-cv-coral transition-colors cursor-pointer"
    >
      Sobre Nós
    </a>
    <a 
      href="#triagem-comportamental-section"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById('triagem-comportamental-section')?.scrollIntoView({ behavior: 'smooth' });
      }}
      className="block text-gray-300 hover:text-cv-coral transition-colors cursor-pointer"
    >
      Triagem Comportamental
    </a>
    <a 
      href="/auth" 
      className="block text-gray-300 hover:text-cv-coral transition-colors"
    >
      Como Ajudar
    </a>
    <a 
      href="/auth" 
      className="block text-gray-300 hover:text-cv-coral transition-colors"
    >
      Seja um Parceiro
    </a>
    <a 
      href="https://www.coracaovalente.org.br/diagnosis/chat" 
      className="block text-gray-300 hover:text-cv-coral transition-colors"
    >
      Fazer Triagem
    </a>
  </div>
</div>
```

**⚠️ ATENÇÃO:** Os links de scroll só funcionam se o usuário estiver na landing page. Se estiver em outra página, precisará navegar primeiro.

---

## 📊 RESUMO DAS ALTERAÇÕES

### Arquivos a Modificar: 2

| Arquivo | Alterações | Linhas Afetadas |
|---------|-----------|-----------------|
| `LandingHero.tsx` | 1 alteração | Linha 99 |
| `LandingPreDiagnosis.tsx` | 5 alterações | Linhas 14, 19, 22, 85-95, 100 |
| `LandingFooter.tsx` | 3 seções | Linhas 2, 23-35, 40-75 |

### Total de Alterações: 9

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Terminologia
- [ ] Alterar botão no Hero: "Pré-Diagnóstico" → "Triagem Comportamental"
- [ ] Alterar ID da seção: `pre-diagnosis-section` → `triagem-comportamental-section`
- [ ] Alterar título H2: "Pré-Diagnóstico Inteligente" → "Sistema de Triagem Comportamental"
- [ ] Alterar texto descritivo: "pré-diagnóstico" → "triagem comportamental"
- [ ] Alterar subtítulo H3: "Pré-Diagnóstico" → "Triagem Comportamental"

### Botão Avaliação Gratuita
- [ ] Alterar texto: "Saiba Mais Sobre Nossos Resultados" → "Faça Sua Triagem Grátis"
- [ ] Alterar ação: scroll → redirect para `https://www.coracaovalente.org.br/diagnosis/chat`

### Rodapé - Redes Sociais
- [ ] Remover imports: Facebook, Linkedin, Mail
- [ ] Remover ícones: Facebook, Linkedin
- [ ] Manter apenas Instagram com link: `https://www.instagram.com/coracaovalente.ong/`
- [ ] Adicionar `target="_blank"` e `rel="noopener noreferrer"`

### Rodapé - Contato
- [ ] Remover: Rua Exemplo, 123
- [ ] Alterar cidade: "São Paulo - SP" → "Ipatinga - MG"
- [ ] Alterar CEP: "01234-567" → "35162-820"
- [ ] Alterar telefone: "(11) 99999-9999" → "+55 31 98803-6923"
- [ ] Remover: Email completo

### Rodapé - Links Úteis
- [ ] Verificar e corrigir rota "Sobre Nós"
- [ ] Alterar "Nossos Serviços" → "Triagem Comportamental"
- [ ] Verificar rota "Como Ajudar"
- [ ] Verificar rota "Seja um Parceiro"
- [ ] Adicionar/Verificar "Fazer Triagem"

---

## ⚠️ PONTOS DE ATENÇÃO

### 1. Navegação entre páginas
Os links de scroll (`#about-section`) só funcionam na landing page. Se o usuário estiver em outra página, precisará:
- Navegar para `/landing` primeiro
- Depois fazer scroll para a seção

**Solução sugerida:** Usar `useNavigate` do React Router para navegação programática.

### 2. URL Externa vs Interna
O botão "Faça Sua Triagem Grátis" redireciona para:
- **URL fornecida:** `https://www.coracaovalente.org.br/diagnosis/chat`
- **Rota interna:** `/diagnosis/chat`

**Pergunta:** Deve usar a URL externa ou a rota interna?

### 3. Função `scrollToTestimonials`
Após alterar o botão, a função `scrollToTestimonials` pode não ser mais necessária. Verificar se é usada em outro lugar.

---

## 🎯 IMPACTO DAS ALTERAÇÕES

### SEO
- ✅ Melhora: Termo "Triagem Comportamental" é mais técnico e específico
- ⚠️ Atenção: Atualizar meta tags e descrições se existirem

### UX
- ✅ Melhora: Botão "Faça Sua Triagem Grátis" é mais direto e acionável
- ✅ Melhora: Informações de contato mais precisas
- ✅ Melhora: Link direto para Instagram

### Navegação
- ⚠️ Atenção: ID da seção mudou, verificar se há outros links apontando para ela
- ⚠️ Atenção: Links úteis precisam de lógica de navegação adequada

---

## 📝 OBSERVAÇÕES FINAIS

### Dúvidas para Esclarecer:

1. **URL do botão "Faça Sua Triagem Grátis":**
   - Usar URL externa: `https://www.coracaovalente.org.br/diagnosis/chat`
   - Ou rota interna: `/diagnosis/chat`?

2. **Links Úteis - Comportamento:**
   - Scroll na mesma página (só funciona na landing)?
   - Ou navegar para páginas específicas?

3. **Termo preferido:**
   - "Sistema de Triagem Comportamental" (mais formal)
   - "Triagem Comportamental" (mais direto)
   - Usar ambos em contextos diferentes?

---

## ✅ PRONTO PARA IMPLEMENTAR

Todas as alterações foram mapeadas e documentadas.

**Aguardando sua autorização para prosseguir com as correções!** 🚀
