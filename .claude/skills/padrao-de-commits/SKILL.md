---
name: padrao-de-commits
description: >-
  Use SEMPRE que houver mudanças prontas no repositório do site da Fantom — um
  arquivo, uma task ou um bloco coerente concluído — para propor um commit,
  mesmo que o usuário não peça. Dispara ao terminar um componente, uma seção da
  home, um ajuste no schema do Sanity, uma correção, ou qualquer alteração
  fechada. Garante histórico de git limpo no padrão do projeto. DUAS REGRAS
  INEGOCIÁVEIS: nunca dar `git push` (push é sempre manual, feito pelo usuário);
  e sempre propor a mensagem e esperar o "ok" antes de rodar `git commit`.
---

# Padrão de commits — site da Fantom

Mantém o histórico de git limpo e consistente. Este repositório trabalha com
**commit direto na `main`** (sem branches de feature nem PR), então cada commit
precisa ser coerente e bem descrito.

---

## Duas regras inegociáveis

1. **NUNCA dar `git push`.** O push é sempre manual, feito pelo usuário. A skill
   pode preparar e commitar, mas para no commit.
2. **SEMPRE propor a mensagem e esperar o "ok" antes de `git commit`.** Nunca
   commitar em silêncio.

---

## Fluxo

Quando houver mudanças prontas (uma task, um arquivo ou um bloco coerente
concluído), **proponha o commit mesmo sem o usuário pedir**:

1. Rodar `git status` para ver o que está modificado/staged.
2. Propor `git add` só dos arquivos **relevantes** àquele propósito (staging
   seletivo). Não usar `git add .` cego se houver mudanças de propósitos
   diferentes misturadas.
3. Apresentar:
   - A **mensagem** no padrão (abaixo)
   - A **lista de arquivos** que entram no commit
4. Perguntar: **"Commito assim?"**
5. Só rodar `git commit` após o **"ok"**.
6. **Parar.** Não dar push. Lembrar o usuário, se relevante, que o push é manual.

### Um propósito por commit

Se as mudanças têm **dois propósitos** (ex.: criou o componente do loader **e**
corrigiu um bug no schema do Sanity), propor **dois commits separados** com
staging seletivo — não juntar tudo em um.

---

## Padrão da mensagem

```
[emoji] [tipo]: [mensagem curta em minúsculas]
```

- Em **português**, no **imperativo** ("adiciona", "corrige", "ajusta"), um
  propósito por commit.
- Mensagem curta e objetiva, tudo em minúsculas.

### Tabela de tipos

| Emoji | Tipo | Uso |
|---|---|---|
| ✨ | feature | nova funcionalidade |
| 🐛 | fix | correção de bug |
| 📝 | docs | documentação (inclui `project.md`) |
| 🎨 | style | mudanças visuais/UI sem alterar lógica |
| ♻️ | refactor | refatoração |
| 🧪 | test | testes |
| 🚀 | deploy | deploy, CI/CD, configuração da Vercel |
| 🔒️ | security | segurança |
| 🧹 | chore | dependências, tarefas de manutenção |

---

## Exemplos reais deste projeto

```
✨ feature: adiciona loader ascii com transição para o frame da hero
🎨 style: aplica gradiente animado webgl no fundo da seção de método
♻️ refactor: extrai wrappers de animação para components/motion
🐛 fix: desmonta contexto webgl ao sair da viewport
📝 docs: atualiza stack no project.md com lenis e motion
🧹 chore: instala @sanity/image-url e configura client
🚀 deploy: adiciona revalidação isr via webhook do sanity
🔒️ security: move token do sanity para variável de ambiente
```

---

## Contexto de git deste projeto

- **Branch única:** `main`. Commits vão direto na `main`, sem PR.
- **Push:** sempre manual, pelo usuário. A skill nunca dá push.
- **Repositório único:** o Next.js e o Sanity Studio (embutido em
  `src/app/studio`) vivem no mesmo repo — não é monorepo com pacotes separados.
- **Deploy:** Vercel, disparado no push manual para `main`.

---

## O que esta skill NÃO faz

- Não dá `git push` em nenhuma hipótese.
- Não commita sem o "ok" do usuário.
- Não junta propósitos diferentes num mesmo commit.
- Não faz `git add .` cego quando há mudanças de propósitos distintos.
