import { CardFrame } from "@/components/ui/card-frame"

// ícones próprios (public/icon-*.svg) — dois tons (azul #5699FF + escuro
// #161616), casam com o design de referência; substituem os ícones
// lucide-react usados como placeholder na primeira versão.
const METHOD_FEATURES = [
  {
    icon: "/icon-churn.svg",
    title: "Redução de Churn em até 50%",
    description: "UX aplicado com tecnologias de alta performance",
  },
  {
    icon: "/icon-security.svg",
    title: "Performance e Segurança",
    description: "Soluções digitais robustas, seguras e escaláveis.",
  },
  {
    icon: "/icon-support.svg",
    title: "Suporte com especialistas",
    description: "Expertise aplicada com inteligência.",
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
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 shrink-0 bg-[#3448ff]" aria-hidden="true" />
            <span className="text-sm tracking-[0.2em] text-white/70 uppercase">Soluções</span>
          </div>

          <h2 className="mt-4 text-3xl font-medium text-white sm:mt-6 sm:text-4xl">
            Crescimento acelerado com resultados metrificáveis
          </h2>

          <p className="mt-4 text-white/70">
            A Fantom é uma parceira estratégica. Criamos soluções digitais que ajudam a vender e executar,
            combinando UX, desenvolvimento web e tecnologias de IA próprias para reduzir churn, aumentar taxas de
            conversão e gerar receita.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4 sm:gap-6">
          {METHOD_FEATURES.map(({ icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-white/15 bg-white/[0.02] p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon} alt="" aria-hidden="true" className="h-10 w-10" />
              <p className="mt-4 font-medium text-white">{title}</p>
              <p className="mt-2 text-sm text-white/60">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </CardFrame>
  )
}
