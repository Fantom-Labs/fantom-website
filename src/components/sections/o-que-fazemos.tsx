"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react"
import { useLenis } from "lenis/react"
import { GradientBars } from "@/components/ui/gradient-bars-background"

type ServiceItem = {
  title: string
  description: string
  // imagens de exemplo do serviço: anexadas depois, case a caso (por ora,
  // undefined em alguns — o painel à direita cai no placeholder). Mais de
  // uma imagem: o primeiro hover dispara um ciclo automático (crossfade)
  // que continua mesmo depois que o cursor sai — ver ImageFrame.
  images?: string[]
}

// project.md, seção 4 ("O que entregamos") — mesmo texto usado no
// accordion desta seção (design de referência: Figma node 1353:3014,
// card "01 - Tech").
const SERVICES: ServiceItem[] = [
  {
    title: "Websites",
    description:
      "Sites institucionais e plataformas com identidade própria, focados em conversão.",
    images: [
      "/images/section-3/websites-s3.png",
      "/images/section-3/websites2-s3.png",
      "/images/section-3/websites3-s3.png",
      "/images/section-3/websites4-s3.png",
      "/images/section-3/websites5-s3.png",
    ],
  },
  {
    title: "SaaS",
    description: "Produtos digitais completos, do zero ao produto rodando.",
    images: ["/images/section-3/saas-s3.png"],
  },
  {
    title: "Sistemas de IA",
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

// intervalo (ms) do ciclo automático disparado pelo primeiro hover — 1s
// ficava mecânico demais ("passando muito rápido"); mais lento junto com
// um crossfade mais longo (ver transition abaixo) dá o ar suave/elegante
// pedido.
const HOVER_ROTATE_MS = 2800

// dono do próprio frame (não só do conteúdo): o mouseenter precisa ficar
// num elemento ESTÁVEL que nunca desmonta enquanto o mouse permanece em
// cima dele — se ficasse na imagem que troca via AnimatePresence, cada
// troca desmonta/remonta o alvo do listener.
function ImageFrame({ service }: { service: ServiceItem }) {
  const images = service.images ?? []
  const [frame, setFrame] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setFrame(0)
    // troca de item: para o ciclo do item ANTERIOR — senão ele continuaria
    // avançando com o `images.length` de quem já não está mais ativo
    // (capturado no closure do interval antigo), dessincronizando do
    // `images` do item atual.
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [service])

  // primeiro hover no item dispara o ciclo (HOVER_ROTATE_MS entre trocas,
  // a primeira já na hora) — depois de iniciado, continua rodando
  // sozinho mesmo com o cursor fora da imagem (pedido explícito: "devem
  // ficar passando, mesmo depois que o cursor passar por cima"). Só para
  // ao trocar de item (useEffect acima) ou desmontar.
  const handleMouseEnter = useCallback(() => {
    if (images.length < 2 || intervalRef.current) return
    setFrame((f) => (f + 1) % images.length)
    intervalRef.current = setInterval(() => {
      setFrame((f) => (f + 1) % images.length)
    }, HOVER_ROTATE_MS)
  }, [images.length])

  const current = images[frame]

  return (
    <div
      onMouseEnter={handleMouseEnter}
      className="relative aspect-[577/580] max-h-full max-w-full overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02]"
    >
      {!current ? (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-white/30">
          Imagem em breve
        </div>
      ) : (
        <>
          {/* sizer invisível, em fluxo normal (visibility, não
              display/opacity — continua ocupando espaço): é o que dá ao
              frame um tamanho intrínseco real pro aspect-ratio +
              max-h/max-w funcionarem (esse cálculo depende de conteúdo
              em fluxo normal contribuindo pro tamanho — as imagens do
              crossfade abaixo são `absolute`, então não contam pra isso
              sozinhas; sem o sizer, o frame colapsava pra 0x0). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current} alt="" aria-hidden="true" className="invisible h-full w-full object-contain" />

          {/* crossfade de verdade: as duas ficam empilhadas (absolute) e
              animam AO MESMO TEMPO (sem mode="wait") — quando uma some a
              outra já está completa, sem instante nenhum sem imagem
              nenhuma nem as duas piscando em sequência. */}
          <AnimatePresence>
            <motion.img
              key={current}
              src={current}
              alt={service.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute inset-0 h-full w-full object-contain"
            />
          </AnimatePresence>
        </>
      )}
    </div>
  )
}

function ServiceCard({
  activeIndex,
  onSelect,
}: {
  activeIndex: number
  onSelect: (index: number) => void
}) {
  const activeService = SERVICES[activeIndex]

  return (
    <div className="relative z-10 flex h-[85vh] w-[80vw] flex-col rounded-[20px] border border-white/15 bg-white/[0.03] p-6 backdrop-blur-lg sm:p-8 lg:p-16">
      <div className="mb-3 flex items-center gap-3 sm:mb-4">
        <span className="h-3 w-3 shrink-0 bg-[#3448ff]" aria-hidden="true" />
        <span className="text-sm tracking-[0.2em] text-white/70 uppercase">
          O que fazemos
        </span>
      </div>

      <h2 className="mb-4 text-3xl font-medium text-white sm:mb-6 sm:text-4xl">
        Tecnologia e Design
      </h2>

      {/* coluna da imagem mais larga que a do texto (0.85fr/1.15fr, não
          1fr/1fr): a imagem estava limitada pela LARGURA da própria
          coluna, não pela altura da linha (sobrava ~9px de altura livre
          antes desse ajuste) — pedido do usuário pra aumentar o tamanho
          das imagens da section. */}
      <div className="grid min-h-0 flex-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
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
          <ImageFrame service={activeService} />
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

  // trava o índice controlado pelo scroll enquanto um clique (handleSelect)
  // está rolando a página programaticamente até a posição do item clicado
  // — sem isso, ESTE listener reagia a cada posição intermediária que o
  // scrollTo atravessa no caminho (ex.: clicar no item 4 vindo do item 1
  // passa pelas faixas de scroll dos itens 2 e 3), fazendo o texto
  // "piscar" por eles antes de acomodar no item certo (o engasgo
  // reportado). Só o listener respeita a trava; o clique sempre escreve
  // direto no estado.
  const manualSelectRef = useRef(false)
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (manualSelectRef.current) return
    const index = Math.min(SERVICES.length - 1, Math.floor(v * SERVICES.length))
    setActiveIndex(index)
  })

  // clique num item: além de trocar o texto na hora (feedback imediato),
  // rola suavemente até o trecho do scroll "dono" daquele item — assim o
  // scroll da página fica consistente com o item exibido mesmo se o
  // usuário rolar manualmente depois. A trava acima segura o índice
  // clicado até a rolagem terminar de acomodar.
  const handleSelect = useCallback(
    (index: number) => {
      setActiveIndex(index)
      const container = containerRef.current
      if (!container) return
      manualSelectRef.current = true
      const containerTop = container.getBoundingClientRect().top + window.scrollY
      const scrollable = container.offsetHeight - window.innerHeight
      const target = containerTop + ((index + 0.5) / SERVICES.length) * scrollable
      const release = () => {
        manualSelectRef.current = false
      }
      if (lenis) lenis.scrollTo(target, { duration: 1, onComplete: release })
      else {
        window.scrollTo({ top: target, behavior: "smooth" })
        setTimeout(release, 1000)
      }
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
        <GradientBars numBars={15} animationDuration={2} className="z-0" />
        <ServiceCard activeIndex={activeIndex} onSelect={handleSelect} />
      </div>
    </section>
  )
}
