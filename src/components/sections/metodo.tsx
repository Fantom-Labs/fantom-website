"use client"

import { useRef, useState } from "react"
import { useIsMobileLayout } from "@/components/motion/lobby"
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

// mobile (Figma node 1437:927): layout bem diferente do desktop — conteúdo
// centralizado (não alinhado à esquerda) e os 3 feature cards viram um
// carrossel de UM card por vez (scroll-snap horizontal nativo, sem lib de
// gesto) com dots de paginação embaixo, em vez dos 3 cards empilhados
// verticalmente do desktop. Sem métricas (+50/+100) — não existem nesse
// frame do Figma, foram removidas de propósito nessa versão mobile.
function MetodoCardMobile() {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollerRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    const el = scrollerRef.current
    if (!el) return
    setActiveIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  const scrollToIndex = (index: number) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" })
  }

  return (
    <CardFrame className="items-center text-center">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 shrink-0 bg-[#3448ff]" aria-hidden="true" />
          <span className="text-sm tracking-[0.2em] text-white/70 uppercase">Soluções</span>
        </div>

        <h2 className="mt-4 text-4xl leading-[40px] font-medium text-white">
          Crescimento acelerado com resultados metrificáveis
        </h2>

        <p className="mt-4 text-white/70">
          Criamos soluções digitais que ajudam a vender e automatizar tarefas,
          combinando design e tecnologia.
        </p>
      </div>

      {/* overflow-x-auto + snap-x nativo (sem drag/gesto em JS): funciona
          com o swipe padrão do dedo no touch, sem precisar reimplementar
          gesture handling — scrollbar escondida via utilitários arbitrários
          (mesmo padrão do html::-webkit-scrollbar em globals.css). */}
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="mt-8 flex w-full snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {METHOD_FEATURES.map(({ icon, title, description }) => (
          <div
            key={title}
            className="flex w-full shrink-0 snap-center flex-col items-center rounded-[8px] border border-white/15 bg-white/[0.02] p-8 text-center backdrop-blur-[12px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={icon} alt="" aria-hidden="true" className="h-[62px] w-[62px]" />
            <p className="mt-6 w-full text-2xl font-medium text-white">{title}</p>
            <p className="mt-4 w-full text-lg font-normal text-white/60">{description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {METHOD_FEATURES.map((feature, index) => (
          <button
            key={feature.title}
            type="button"
            aria-label={`Ir pro card ${index + 1} de ${METHOD_FEATURES.length}`}
            aria-current={index === activeIndex}
            onClick={() => scrollToIndex(index)}
            className={`h-3 w-3 shrink-0 rounded-full bg-white transition-opacity ${index === activeIndex ? "opacity-100" : "opacity-30"}`}
          />
        ))}
      </div>
    </CardFrame>
  )
}

// conteúdo puro (sem consciência de scroll/motion) — reaproveitado tanto no
// branch pinado do desktop (dentro do slide horizontal de o-que-fazemos.tsx)
// quanto no fallback empilhado (reduced-motion). O mobile ganhou seu próprio
// layout (MetodoCardMobile, ver acima) — diferente o bastante do desktop
// (centralizado + carrossel em vez de grid) que não compensava tentar
// encaixar tudo num componente CSS-responsivo só.
export function MetodoCard() {
  const isMobileLayout = useIsMobileLayout()

  if (isMobileLayout) {
    return <MetodoCardMobile />
  }

  return (
    <CardFrame>
      {/* duas colunas (mesmo padrão de grid do ServiceCard, em
          o-que-fazemos.tsx): texto (badge/heading/parágrafo) alinhado à
          esquerda numa coluna, os 3 cards empilhados VERTICALMENTE na
          outra — pedido explícito: "conteúdo alinhado à esquerda... e à
          direita dentro do frame alinhados verticalmente os 3 cards".
          Badge: mesmo design do ServiceCard (dot quadrado azul + label). */}
      <div className="grid gap-8 sm:min-h-0 sm:flex-1 lg:grid-cols-[1fr_1fr] lg:gap-10">
        <div className="flex flex-col justify-start pb-[77px]">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 shrink-0 bg-[#3448ff]" aria-hidden="true" />
            <span className="text-sm tracking-[0.2em] text-white/70 uppercase">Soluções</span>
          </div>

          <h2 className="mt-4 w-[calc(100%-48px)] text-3xl font-medium text-white sm:mt-6 sm:text-4xl">
            Crescimento acelerado com resultados metrificáveis
          </h2>

          <p className="mt-4 w-[calc(100%-48px)] text-white/70">
            Criamos soluções digitais que ajudam a vender e automatizar tarefas,
            combinando design e tecnologia.
          </p>

          {/* métricas: scramble uma vez só, quando aparecem na tela
              (scrambleOnVisible, ver text-scramble.tsx) — não em loop
              (autoScramble), mas também rescrambla no hover (mesmo
              comportamento dos itens do icon-menu) — pedido explícito:
              "use o efeito do text-scramble quando elas estiverem
              aparecendo" + "ao passar o cursor pelas métricas deve também
              ocorrer o efeito text-scramble". */}
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
