import { CardFrame } from "@/components/ui/card-frame"
import { TextScramble } from "@/components/ui/text-scramble"

const METRICS = [
  { value: "+50", label: "negócios desenvolvidos" },
  { value: "+100", label: "projetos entregues" },
]

// ícones próprios (public/icon-*.svg) — dois tons (azul #5699FF + escuro
// #161616), casam com o design de referência; substituem os ícones
// lucide-react usados como placeholder na primeira versão.
const METHOD_FEATURES = [
  {
    icon: "/icon-churn.svg",
    title: "Redução de Churn em até 50%",
    description: "UX aplicado a tecnologias de alta performance e acompanhamento dos usuários para implementação contínua de melhorias.",
  },
  {
    icon: "/icon-security.svg",
    title: "Performance e Segurança",
    description: "Soluções digitais robustas, seguras e escaláveis com toda a infra e arquitetura necessárias para atingir milhões de usuários.",
  },
  {
    icon: "/icon-support.svg",
    title: "Suporte com especialistas",
    description: "Trabalhamos com um suporte contínuo e assessoria com experts para cada projeto.",
  },
]

// conteúdo puro (sem consciência de scroll/motion) — reaproveitado tanto no
// branch pinado do desktop (dentro do slide horizontal de o-que-fazemos.tsx)
// quanto no fallback empilhado (mobile/reduced-motion).
export function MetodoCard() {
  return (
    <CardFrame>
      {/* duas colunas (mesmo padrão de grid do ServiceCard, em
          o-que-fazemos.tsx): texto (badge/heading/parágrafo) alinhado à
          esquerda numa coluna, os 3 cards empilhados VERTICALMENTE na
          outra — pedido explícito: "conteúdo alinhado à esquerda... e à
          direita dentro do frame alinhados verticalmente os 3 cards". Só
          empilha lado a lado a partir do lg: (mobile/tablet continuam em
          fluxo normal, uma coluna só). Badge: mesmo design do ServiceCard
          (dot quadrado azul + label). */}
      <div className="grid gap-8 sm:min-h-0 sm:flex-1 lg:grid-cols-[1fr_1fr] lg:gap-10">
        <div className="flex flex-col justify-start pb-[77px]">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 shrink-0 bg-[#3448ff]" aria-hidden="true" />
            <span className="text-sm tracking-[0.2em] text-white/70 uppercase">Soluções</span>
          </div>

          <h2 className="mt-4 w-[calc(100%-16px)] text-3xl font-medium text-white sm:mt-6 sm:text-4xl">
            Crescimento acelerado com resultados metrificáveis
          </h2>

          <p className="mt-4 w-[calc(100%-16px)] text-white/70">
            Criamos soluções digitais que ajudam a vender e automatizar tarefas,
            combinando design e tecnologia.
          </p>

          {/* métricas: scramble uma vez só, quando aparecem na tela
              (scrambleOnVisible, ver text-scramble.tsx) — não em loop
              (autoScramble) nem por hover (comportamento padrão): pedido
              explícito: "use o efeito do text-scramble quando elas
              estiverem aparecendo". */}
          <div className="mt-auto flex flex-wrap gap-6 pt-6">
            {METRICS.map((metric) => (
              <div key={metric.label}>
                <TextScramble text={metric.value} scrambleOnVisible showAffordances={false} textSizeClassName="text-2xl" />
                <p className="mt-1 max-w-[10rem] text-xs text-white/50 uppercase tracking-[0.15em]">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* cards mais compactos (p-4 não p-5, ícone h-8 não h-10, mt-3 não
            mt-4, gap-3/sm:gap-4 não gap-4/sm:gap-6): com a copy mais longa
            das descrições, os 3 cards empilhados passaram a ocupar mais
            altura que o frame (h-[85vh], fixo) em janelas mais baixas —
            "os cards no total ocupam uma altura maior que o frame
            principal" (bug reportado). Não aumentar a altura do frame pra
            compensar: ele fica centralizado num wrapper sticky com
            overflow-hidden (ver o branch pinado do desktop em
            o-que-fazemos.tsx) — crescer além da altura da viewport
            cortaria o topo/base dos cards em vez de só "vazar" a borda
            arredondada como acontece hoje. */}
        <div className="flex flex-col justify-center gap-3 sm:gap-4">
          {METHOD_FEATURES.map(({ icon, title, description }) => (
            <div key={title} className="w-[calc(100%-20px)] rounded-[8px] border border-white/15 bg-white/[0.02] p-4 pl-[18px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon} alt="" aria-hidden="true" className="h-8 w-8" />
              <p className="mt-3 font-medium text-white">{title}</p>
              <p className="mt-2 text-sm text-white/60">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </CardFrame>
  )
}
