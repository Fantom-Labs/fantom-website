# Fantom — Website `project.md`

Fonte única de verdade do projeto do novo site da Fantom (`fantom.website`).
Consolida posicionamento, conteúdo, arquitetura e stack técnica.

---

## 1. Visão geral

A Fantom é a sócia estratégica de tecnologia e design por trás de produtos que viram negócios de verdade. O novo site substitui a presença atual (subposicionada e incompleta) e materializa o reposicionamento de marca: de "explorador/agência invisível" para autoridade que atua nos bastidores das decisões que importam.

O site é a principal peça de prova desse reposicionamento. Como a Fantom se vende como tech house, o próprio site é portfólio: precisa ter acabamento de site premium (nível Framer) construído em código próprio, com animações, parallax e cases imersivos, mantendo seriedade e performance.

- **Domínio:** fantom.website
- **Idioma:** PT-BR (inglês descartado por ora)
- **Formato v1:** página única (one-page) com âncoras no menu; páginas de case dedicadas em fase seguinte
- **CTA único:** "Falar com a Fantom" (a triagem parceria vs. projeto acontece na conversa, não na navegação)

---

## 2. Posicionamento e marca

**Positioning statement:**
> A Fantom é a sócia estratégica de tecnologia e design por trás de produtos que viram negócios de verdade. Atuamos como parceira, não fornecedora, de founders e empresas que querem construir tecnologia rentável e relevante, com participação societária em parte do que construímos, como a KOMMUchat.

**Golden Circle:**
- **Porquê:** tecnologia e design bem feitos criam valor real — produtos que geram receita e resolvem problema de verdade.
- **Como:** entramos como sócios estratégicos por trás dos produtos e negócios, com risco e resultado compartilhados.
- **O quê:** websites, SaaS e sistemas powered by AI, do primeiro rascunho à receita.

**Categoria de mercado:** estúdio de produtos tecnológicos e sócia estratégica de tecnologia (não "agência", não "consultoria").

**Hierarquia de público:**
1. Founders/empresas buscando parceria societária (move o modelo de negócio-alvo)
2. Talentos (sem time forte não há produto próprio)
3. Investidores e mercado (amplifica os anteriores)
4. Empresas buscando desenvolvimento de projeto (canal de receita e portfólio)

### Regras de copy (não negociáveis)
- **Sem travessões** em nenhuma copy.
- **Sem afirmações negativas** do tipo "não somos fornecedora / não somos agência". A autoridade é implícita, construída por método, prova e detalhe, nunca declarada por negação nem por reclamação de crédito.
- Nomes de parceiros são citados **no site** (na Prova), mas **ocultos no Instagram** (bio afirma só o posicionamento).

**Bio Instagram (em uso):** "Sócia estratégica de tecnologia e design por trás de negócios reais."

---

---

## 3. Empresa

- **Fundadores:** Múcio Miranda (founder, CTO, desenvolvedor e designer) e Caio Torres (cofundador, atendimento ao cliente e suporte técnico).
- **Decisão de site:** fundadores aparecem com nome e foto (alinhado a founder-led content). Na página, o time entra como assinatura/rodapé, não como seção central.
- **Relação KOMMUchat:** Fantom (Múcio e Caio) cofundou a KOMMUchat junto com Arthur Eickmann, da KOMMU. Fantom detém 50%. Pode ser citado explicitamente no site.
- **Parcerias de ecossistema:** agências parceiras de tráfego pago e marketing de conteúdo (a Fantom entrega a base de tecnologia e design; aquisição/conteúdo via parceiros, ex. KOMMU).

---

## 4. O que entregamos

- **Websites** — sites institucionais e plataformas com identidade própria, focados em conversão.
- **SaaS** — produtos digitais completos, do zero ao produto rodando.
- **Sistemas powered by AI** — automações e ferramentas com IA que resolvem um problema real de negócio.
- **Criação de imagens** — direção e produção de imagem de alta qualidade (caso Trattoria Alesa).

---

## 5. Portfólio (cases)

| Case | Tipo | Vertical | Status |
|---|---|---|---|
| KOMMUchat | Parceria com equity (50%) | Saúde | Ativo, clínicas em todo o Brasil |
| GeoService | Projeto | Setor público (CAGEPA) | Em desenvolvimento (MVP) |
| Dr. Deoclides | Projeto | Saúde | Site no ar há poucos dias |
| Med HandsOn | Projeto | Educação médica | Ativo |
| Trattoria Alesa | Projeto | Hospitalidade (Augsburg, DE) | Ativo |
| Growlab AI | Projeto | EdTech / SaaS B2B | Entregue (Web Summit Rio 2025) |

**KOMMUchat** — Cofundada com a KOMMU, ao lado de Arthur Eickmann. Secretária virtual com IA que atende, agenda e faz follow up 24h, com CRM e integração de agenda. Clientes relatam aumento de até 30% nos agendamentos. *(Confirmar se o dado dos 30% pode ser usado.)*

**GeoService** — Dashboard de gestão de ordens de serviço para manutenção urbana, com mapa em tempo real, histórico auditável e indicadores por etapa. Cliente: CAGEPA. Stack do produto: React 19 + Vite + TS + Tailwind v4 + shadcn/ui + TanStack Query + Zustand + Laravel Echo + Leaflet + Recharts.

**Dr. Deoclides** — Neurocirurgião de coluna (fellowship em Londres, formação na Alemanha) sem posicionamento digital próprio, só dados de terceiros. Site comunica segurança para uma decisão de alto risco emocional. Poucos dias no ar, engajamento em outro patamar. Tráfego pago começando em parceria com a KOMMU.

**Med HandsOn** — Plataforma para a única escola médica do Brasil com cirurgias reais. Cursos de R$15 a 25 mil, vendidos por autoridade.

**Trattoria Alesa** — Site e criação de imagens para restaurante italiano que precisava parecer a cozinha da própria nonna. Vídeo, fotografia editorial e reserva via WhatsApp.

**Growlab AI** — Startup paraibana de treinamento profissional e plataforma SaaS B2B com gamificação. Site construído a tempo do Web Summit Rio 2025. Resultado: participação confirmada e investimento captado.

---

## 6. Estrutura da Home (one-page)

**Nav:** Início · Portfólio · O que fazemos · Método · FAQ · Contato

1. **#início (Hero)** — headline + linha de apoio + CTA. Loader ASCII converte-se no frame da hero.
2. **#portfolio (Prova)** — 6 cards de case, filtráveis por tipo (informativo).
3. **#o-que-fazemos** — o que entregamos + os dois formatos (sócios / projeto) + ecossistema de parceiros.
4. **#metodo** — "Soluções": badge + headline + parágrafo + 3 cards (churn, performance/segurança, suporte).
5. **#faq** — objeções principais (faz o trabalho da triagem que foi tirada da navegação).
6. **#contato** — CTA final.
7. **Rodapé** — assinatura dos fundadores.

Copy completa versionada em `fantom-website-home.md`.

**Hero (versão atual):**
> `Websites · SaaS · Sistemas com IA`
> **Somos um time de tecnologia e design para negócios e startups**
> Da primeira reunião ao produto gerando receita, cuidamos de cada detalhe do seu projeto em todos os estágios.
> `[ Falar com a Fantom ]` — componente `liquid-metal-button` (shader de metal líquido + ícone de WhatsApp)
> `+ 50 negócios acelerados` — carrossel de logos de clientes (rolagem automática, componente `logo-marquee`)

Copy é a única fonte de verdade em `src/components/motion/lobby.tsx` (`EYEBROW_TEXT`/`HEADLINE_TEXT`/`SUBHEAD_TEXT`/`CTA_LABEL`) — reajustar aqui sempre que o texto mudar lá.

---

## 7. Direção de experiência (UX/UI)

Objetivo: qualidade e imersão de sites Framer, construídas em código próprio, sem Framer. Uso estratégico e sóbrio de tecnologias modernas, mantendo seriedade de autoridade.

- **Loader de entrada (desktop):** a própria composição da tv (arte ASCII em loop, componente `mo-mosaic`) em zoom de tela cheia, com "CARREGANDO" + barra de progresso (~2.6s) no lugar do "EXPLORAR" clicável — não dá pra rolar manualmente enquanto carrega. Ao terminar, rola sozinho pra section 2 (hero) e nunca mais aparece de novo na mesma sessão (subir pra section 1 e descer não religa o loader).
- **Mobile:** sem o loader/zoom de tela cheia — o site já começa direto na composição assentada da section 2 (tv + hero), a fase de zoom-in não existe nessa largura.
- **Transição loader → hero (desktop):** o frame (tv) desloca pra esquerda ao fim do zoom, liberando uma coluna à direita — eyebrow, H1, subhead e CTA entram ali em stagger (~80ms entre cada), da direita pra esquerda.
- **H1 da hero:** efeito sutil de separação de canais RGB (aberração cromática, ~1.5px de franja) via WebGL, componente `neon-rgbtext-effect` — mede a fonte/posição reais do heading por trás (herda o tamanho responsivo já resolvido) e substitui o texto visualmente só depois do primeiro desenho confirmado com sucesso; sem suporte a WebGL, o texto normal (branco, sólido) continua visível (progressive enhancement).
- **Seções institucionais:** parallax responsivo ao mouse (`mouse-responsive-background`), gradientes animados em WebGL (`animated-gradient`) como fundo de seções, reveals por scroll.
- **Cases:** apresentação imersiva; páginas dedicadas por case em fase posterior (conteúdo via Sanity).
- **Imagens:** foco em alta qualidade, pipeline de otimização via Sanity + next/image.

---

## 8. Stack técnica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework / build | **Next.js 16 (App Router)** + React 19.2 | SSR/SSG para SEO e GEO; casa com Sanity; reaproveita conhecimento do time (GeoService) |
| Linguagem | **TypeScript** | Premissa dos componentes; segurança de tipo |
| Estilização | **Tailwind CSS v4** | Premissa dos componentes colados |
| Componentes | **shadcn/ui** (sobre Radix) | Premissa; base acessível; pasta `/components/ui` |
| Animação (base) | **Motion / Framer Motion** | `layoutId` para a transição loader→hero; `useScroll`/`useTransform` para parallax e reveals |
| Smooth scroll | **Lenis** | Scroll amortecido, o "feel" característico dos sites premium |
| Animação (escalada) | **GSAP + ScrollTrigger** *(só se necessário)* | Timelines complexas que o Motion não cobrir bem |
| Efeitos WebGL | WebGL2 (componente próprio `animated-gradient`) | Gradientes/shaders de fundo |
| CMS | **Sanity** | Conteúdo e imagens dos cases; Studio embutido em `/studio` |
| Imagens | **next/image** + `@sanity/image-url` | Pipeline de otimização (AVIF/WebP, crop, hotspot) |
| Fontes | **next/font** | Auto-host, sem layout shift |
| Deploy | **Netlify** | Suporte nativo a Next.js via adapter OpenNext, zero-config para SSR/ISR/Route Handlers |

**Resumo:** Next.js 16 + TS + Tailwind v4 + shadcn/ui + Motion + Lenis + Sanity + next/image, na Netlify.

### Estrutura de pastas (proposta)

```
src/
├── app/
│   ├── (site)/
│   │   ├── page.tsx            # home one-page
│   │   └── cases/[slug]/       # páginas de case (fase 2)
│   ├── studio/[[...tool]]/     # Sanity Studio embutido
│   └── layout.tsx
├── components/
│   ├── ui/                     # shadcn + componentes colados (mo-mosaic, animated-gradient, etc.)
│   ├── sections/               # hero, portfolio, metodo, faq, contato
│   └── motion/                 # wrappers de animação (loader→hero, reveals, parallax)
├── sanity/
│   ├── schemas/                # case, etc.
│   ├── lib/                    # client, image-url, queries (GROQ)
│   └── env.ts
├── lib/                        # utils (cn), lenis provider
└── styles/                     # globals
```

O alias `@` aponta para `./src`.

### Schema Sanity — `case` (proposta inicial)

```ts
{
  name: 'case',
  type: 'document',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { name: 'vertical', type: 'string' },      // Saúde, Setor público, EdTech...
    { name: 'type', type: 'string' },          // 'parceria' | 'projeto'
    { name: 'equity', type: 'string' },        // ex: "50%" (opcional)
    { name: 'status', type: 'string' },        // ativo, em desenvolvimento, entregue
    { name: 'summary', type: 'text' },         // resumo do card
    { name: 'cover', type: 'image', options: { hotspot: true } },
    { name: 'gallery', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] },
    { name: 'body', type: 'array', of: [{ type: 'block' }] },  // Portable Text
    { name: 'metrics', type: 'array', of: [{ type: 'object', fields: [
        { name: 'label', type: 'string' },
        { name: 'value', type: 'string' },
    ]}]},
    { name: 'order', type: 'number' },
  ]
}
```

---

## 9. Requisitos de performance e acessibilidade

Críticos porque a Fantom se vende como autoridade técnica (site lento contradiz o discurso e mata o GEO):

- **Limite de contextos WebGL** (~16 por página): no máximo um gradiente por seção visível; desmontar via IntersectionObserver quando sai da viewport. Vários simultâneos derrubam o mobile.
- **`prefers-reduced-motion`:** loader, parallax e shaders precisam de fallback estático. Acessibilidade + público que acessa de máquina fraca/corporativa (CAGEPA, investidores).
- **Loader não bloqueia o LCP:** texto da hero e conteúdo existem no HTML desde o início (indexáveis por Google e IAs), mesmo cobertos visualmente pela animação.
- **Core Web Vitals** como meta de projeto: imagens otimizadas, vídeo do loader com poster, code splitting das seções pesadas.
- **SEO/GEO:** conteúdo renderizado no servidor, metadados, dados estruturados. Coerência com a pauta de autoridade da marca (GEO).

---

## 10. Roadmap de fases

1. **Fase 1 — Home one-page.** Estrutura, copy, loader→hero, seções com animação, FAQ, contato.
2. **Fase 2 — Sanity + páginas de case.** CMS para textos e imagens; rotas `/cases/[slug]` imersivas.
3. **Fase 3 — Blog/conteúdo de autoridade.** Hub dos 10 temas de inbound (MDX ou Sanity), reforço de GEO.

---

## 11. Pendências

- [ ] Confirmar uso do dado "aumento de até 30%" (KOMMUchat)
- [ ] Ano de fundação da Fantom
- [ ] Layout definitivo da hero (frame à esquerda com texto em coluna vs. composição criativa)
- [ ] Identidade visual (logo, paleta, tipografia) — não iniciada; site nasce com copy + estrutura, visual entra como módulo próprio
- [ ] Fotos e frase de trajetória dos fundadores
- [ ] Definir se o blog (fase 3) usa MDX ou Sanity
- [ ] Decisão de layout/versão final do Hero (6 opções de copy em aberto)
```
