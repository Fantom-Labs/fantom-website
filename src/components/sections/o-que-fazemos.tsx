"use client"

import { useCallback, useRef, useState } from "react"
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react"
import { useLenis } from "lenis/react"
import { FallingPattern } from "@/components/ui/falling-pattern"

type ServiceItem = {
  title: string
  description: string
  // imagem de exemplo do serviço: anexada depois, case a caso (por ora,
  // undefined em alguns — o painel à direita cai no placeholder).
  image?: string
}

// project.md, seção 4 ("O que entregamos") — mesmo texto usado no
// accordion desta seção (design de referência: Figma node 1353:3014,
// card "01 - Tech").
const SERVICES: ServiceItem[] = [
  {
    title: "Websites",
    description:
      "Sites institucionais e plataformas com identidade própria, focados em conversão.",
    image: "/images/section-3/websites-s3.png",
  },
  {
    title: "SaaS",
    description: "Produtos digitais completos, do zero ao produto rodando.",
    image: "/images/section-3/saas-s3.png",
  },
  {
    title: "Sistemas powered by AI",
    description:
      "Automações e ferramentas com IA que resolvem um problema real de negócio.",
  },
  {
    title: "Design",
    description:
      "Interfaces e identidade visual sob medida, alinhadas ao produto e à marca.",
  },
]

// altura de scroll (vh) dedicada a cada item: a section fica "presa"
// (sticky) por SERVICES.length * ITEM_SCROLL_VH de scroll, e o progresso
// dentro dessa janela decide qual item está ativo — mesmo padrão
// scroll-linked já usado no Lobby (useScroll com target+offset ["start
// start", "end end"]), sem precisar de GSAP ScrollTrigger pra um stepper
// simples como este.
const ITEM_SCROLL_VH = 100

function ServiceCard({
  activeIndex,
  onSelect,
}: {
  activeIndex: number
  onSelect: (index: number) => void
}) {
  const activeService = SERVICES[activeIndex]

  return (
    <div className="relative z-10 flex h-[80vh] w-[80vw] flex-col rounded-[20px] border border-white/15 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8 lg:p-10">
      <div className="mb-3 flex items-center gap-3 sm:mb-4">
        <span className="h-3 w-3 shrink-0 bg-[#3448ff]" aria-hidden="true" />
        <span className="text-sm tracking-[0.2em] text-white/70 uppercase">
          O que fazemos
        </span>
      </div>

      <h2 className="mb-4 text-3xl font-medium text-white sm:mb-6 sm:text-4xl">
        Tecnologia e Design
      </h2>

      <div className="grid min-h-0 flex-1 gap-8 lg:grid-cols-2 lg:gap-16">
        <ul className="flex min-h-0 flex-col justify-center overflow-y-auto pr-2">
          {SERVICES.map((service, index) => {
            const isActive = index === activeIndex
            return (
              <li
                key={service.title}
                className="border-t border-white/15 first:border-t-0"
              >
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  aria-expanded={isActive}
                  className="w-full py-3 text-left lg:py-4"
                >
                  <span
                    className={`block text-lg font-medium tracking-[0.01em] transition-colors duration-300 sm:text-xl ${
                      isActive ? "text-white" : "text-white/50"
                    }`}
                  >
                    {service.title}
                  </span>

                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isActive ? "mt-2 grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <p className="overflow-hidden text-sm leading-relaxed text-white/60">
                      {service.description}
                    </p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="flex h-full min-h-0 min-w-0 items-center justify-center">
          {/* proporção fixa em 577/580 (mesma geometria do painel no
              design de referência, Figma node 1353:3213): o frame nunca
              estica pra fora da proporção da imagem, só encolhe pra
              caber no espaço disponível (largura e altura), como um
              object-fit: contain aplicado ao frame inteiro. */}
          <div className="relative aspect-[577/580] max-h-full max-w-full overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02]">
            {activeService.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeService.image}
                alt={activeService.title}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-white/30">
                Imagem em breve
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function OQueFazemos() {
  const prefersReducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const lenis = useLenis()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const index = Math.min(SERVICES.length - 1, Math.floor(v * SERVICES.length))
    setActiveIndex(index)
  })

  // clique num item: além de trocar o texto na hora (feedback imediato),
  // rola suavemente até o trecho do scroll "dono" daquele item — senão o
  // próximo tick de scroll (o listener acima) puxaria o índice de volta
  // pra posição real da página, brigando com o clique.
  const handleSelect = useCallback(
    (index: number) => {
      setActiveIndex(index)
      const container = containerRef.current
      if (!container) return
      const containerTop = container.getBoundingClientRect().top + window.scrollY
      const scrollable = container.offsetHeight - window.innerHeight
      const target = containerTop + ((index + 0.5) / SERVICES.length) * scrollable
      if (lenis) lenis.scrollTo(target, { duration: 1 })
      else window.scrollTo({ top: target, behavior: "smooth" })
    },
    [lenis]
  )

  // motion reduzido: sem scroll-jacking (nada de altura extra artificial),
  // card normal, itens só clicáveis (project.md, seção 9).
  if (prefersReducedMotion) {
    return (
      <section
        id="o-que-fazemos"
        className="relative flex min-h-screen items-center justify-center bg-black py-12"
      >
        <ServiceCard activeIndex={activeIndex} onSelect={setActiveIndex} />
      </section>
    )
  }

  return (
    <section
      id="o-que-fazemos"
      ref={containerRef}
      className="relative bg-black"
      style={{ height: `${SERVICES.length * ITEM_SCROLL_VH}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center">
        {/* cor/fundo explícitos (não os defaults var(--primary)/
            var(--background) do componente): o tema ativo do projeto é
            claro (sem .dark em globals.css), então os tokens semânticos
            renderizariam quase invisíveis contra o preto da section —
            mesmo ajuste já feito nos outros componentes colados
            (neon-button, text-scramble). */}
        <FallingPattern
          color="rgba(255,255,255,0.18)"
          backgroundColor="#000000"
          className="absolute inset-0 z-0 [mask-image:radial-gradient(ellipse_at_center,transparent,black)]"
        />
        <ServiceCard activeIndex={activeIndex} onSelect={handleSelect} />
      </div>
    </section>
  )
}
