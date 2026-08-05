---
name: sincroniza-project-md
description: >-
  Use SEMPRE no início de qualquer task técnica deste repositório (o site da
  Fantom, fantom.website) para ler o `project.md` antes de agir, e SEMPRE que
  qualquer decisão técnica mudar o estado real do projeto — mesmo que o usuário
  não peça. Gatilhos de atualização incluem: adicionar/remover dependência
  (Motion, Lenis, Sanity, shadcn/ui, etc.), mudar de stack ou versão, criar
  nova pasta em `src/`, adicionar um componente novo em `components/ui`, alterar
  o schema do Sanity (`case` e afins), mudar o fluxo do loader→hero, adicionar
  uma seção nova na home, criar página de case, definir requisito de
  performance/SEO, ou tomar qualquer decisão de arquitetura. O `project.md` é a
  fonte única de verdade do projeto e não pode divergir do código.
---

# Sincronização do `project.md` (fonte única de verdade)

O arquivo `project.md` na raiz do repositório é a **fonte única de verdade** do
site da Fantom. Ele descreve posicionamento, conteúdo, arquitetura, stack,
schema do Sanity e requisitos de performance. O código e o `project.md` **nunca
podem divergir**.

Esta skill tem duas regras.

---

## Regra 1 — Ler antes de agir

No início de **qualquer** task técnica:

1. Ler o `project.md` primeiro (em especial as seções 9 Stack, 8 UX/UI, e a
   seção do schema Sanity).
2. Conferir se a task é coerente com o que está documentado.
3. Se a task **contradiz** o `project.md` (ex.: pediram para usar GSAP como base
   quando o doc define Motion + Lenis; ou usar Vite quando o doc define
   Next.js 15), **PARAR e sinalizar**. Não improvisar, não escolher em silêncio.

   > Ex.: "O `project.md` (seção 9) define Motion como camada base de animação e
   > GSAP só como escalada. A task pede GSAP direto. Confirma que é uma mudança
   > de decisão, ou sigo com Motion?"

---

## Regra 2 — Atualizar só com aprovação

Ao detectar um gatilho de mudança (lista na `description`), **nunca** edite o
`project.md` por conta própria. Em vez disso:

1. Apresentar, de forma curta:
   - **Seção afetada** (ex.: "Seção 9 — Stack técnica" ou "Schema Sanity `case`")
   - **O que muda** (o diff conceitual, não o texto inteiro)
   - **Motivo** (qual decisão/mudança de código gerou isso)
2. Perguntar: **"Aplico essa atualização no `project.md`?"**
3. Só gravar após o **"sim"** explícito.

### Princípios da edição

- Fazer a **menor edição possível**. Alterar só a linha/tabela/seção afetada.
- **Não duplicar** informação que já existe em outra seção.
- **Não inflar** com detalhes de implementação efêmeros (nome de variável,
  props internas, CSS pontual). O `project.md` descreve decisões e arquitetura,
  não linha de código.
- Manter o tom e a formatação já existentes (tabelas para stack, checklist para
  pendências).
- Se a mudança resolve uma pendência da seção 12, marcar o item `[x]` além de
  aplicar a mudança na seção correspondente.

### Exemplos de gatilho → ação

| Mudança no código | Seção do `project.md` a propor |
|---|---|
| Instalou `lenis` / `motion` / `@sanity/image-url` | Seção 9 (tabela de stack) |
| Criou `src/components/motion/` | Seção 9 (estrutura de pastas) |
| Adicionou campo ao schema `case` | Seção 9 (schema Sanity) |
| Nova seção na home (ex.: depoimentos) | Seção 7 (estrutura da home) |
| Definiu fallback de `prefers-reduced-motion` | Seção 10 (performance/acessibilidade) |
| Fechou o layout da hero | Seção 8 + marcar pendência na seção 12 |
| Confirmou dado dos 30% do KOMMUchat | Seção 6 + marcar pendência na seção 12 |

---

## O que esta skill NÃO faz

- Não edita o `project.md` sem aprovação.
- Não reescreve seções inteiras quando uma linha resolve.
- Não registra detalhes de implementação que mudam toda semana.
