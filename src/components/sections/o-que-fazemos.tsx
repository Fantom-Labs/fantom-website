"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react"
import { useLenis } from "lenis/react"
import { CardFrame } from "@/components/ui/card-frame"
import { GradientBars } from "@/components/ui/gradient-bars-background"
import { autoJumpScrollTo, getSection2ScrollTarget, getSectionThreeStart, useIsMobileLayout } from "@/components/motion/lobby"
import { MetodoCard } from "@/components/sections/metodo"

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
      "/images/section-3/websites1-s3.png",
      "/images/section-3/websites2-s3.png",
      "/images/section-3/websites4-s3.png",
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
    <CardFrame>
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
      <div className="grid gap-8 sm:min-h-0 sm:flex-1 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
        {/* overflow-y-auto/min-h-0 só a partir do sm: no mobile a lista
            cresce junto com o conteúdo (sem scrollbar interna, ver o
            comentário grande no h-auto do CardFrame) — no desktop
            continua cabendo dentro da altura fixa da linha (min-h-0 é o
            que permite ela encolher pra caber ali, com scroll interno se
            precisar). */}
        <ul className="flex flex-col justify-center pr-2 sm:min-h-0 sm:overflow-y-auto">
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

        <div className="flex min-w-0 items-center justify-center sm:h-full sm:min-h-0">
          {/* proporção fixa em 577/580 (mesma geometria do painel no
              design de referência, Figma node 1353:3213): o frame nunca
              estica pra fora da proporção da imagem, só encolhe pra
              caber no espaço disponível (largura e altura), como um
              object-fit: contain aplicado ao frame inteiro. */}
          <ImageFrame service={activeService} />
        </div>
      </div>
    </CardFrame>
  )
}

// altura (vh) do bloco pinado que contém os cards das sections 3 e 4 —
// menor que o LOBBY_SCROLL_HEIGHT_VH do lobby.tsx (300vh): aqui é só um
// slide horizontal num eixo só, sem as várias fases (zoom + shift + pausa)
// que o zoom da tv precisa. h-screen no wrapper sticky, então 220vh dá
// 120vh de distância pinada de verdade — o bastante pra um "detém no card
// 1 → desliza → detém no card 2" deliberado, sem zona morta exagerada.
const PIN_SCROLL_HEIGHT_VH = 220
// fração de scrollYProgress onde o slide de fato acontece — antes de 0.2 e
// depois de 0.75 o scroll "detém" em cada card (nada se move ainda/mais),
// dando tempo de ler antes da troca.
const SLIDE_RANGE: [number, number] = [0.2, 0.75]

// alvo (px de scroll) de onde o card da section 4 (#metodo) fica
// centralizado. Os dois cards (#o-que-fazemos e #metodo) compartilham a
// MESMA geometria vertical — os dois são "absolute inset-0" dentro do
// mesmo wrapper sticky, só a posição HORIZONTAL (translateX) diferencia —
// então um href="#metodo"/scrollIntoView nativo não consegue expressar
// "role até o ponto em que o slide horizontal já terminou", só "role até o
// topo vertical deste elemento" (que é idêntico ao do outro card). Por
// isso um alvo calculado explícito, mesmo padrão de
// getSection2ScrollTarget/getSectionThreeStart no lobby.tsx — usado pelo
// interceptor de clique no ponto "Método" do SectionNav.
export function getMetodoScrollTarget(): number {
  const pinTop = getSectionThreeStart()
  const pinnedDistance = (PIN_SCROLL_HEIGHT_VH / 100) * window.innerHeight - window.innerHeight
  return pinTop + SLIDE_RANGE[1] * pinnedDistance + 2
}

export function OQueFazemos() {
  const prefersReducedMotion = useReducedMotion()
  const isMobileLayout = useIsMobileLayout()
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })
  const cardOneX = useTransform(scrollYProgress, SLIDE_RANGE, ["0%", "-100%"])
  const cardTwoX = useTransform(scrollYProgress, SLIDE_RANGE, ["100%", "0%"])

  // qual card está "corrente" (metade do slide) — só pra alternar `inert`
  // no card fora de tela (ver JSX do branch pinado): sem isso, os botões
  // reais do ServiceCard continuam focáveis via Tab mesmo transladados pra
  // fora da viewport (e vice-versa quando o card 2 está fora).
  const [isMetodoCurrent, setIsMetodoCurrent] = useState(false)
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setIsMetodoCurrent(v >= (SLIDE_RANGE[0] + SLIDE_RANGE[1]) / 2)
  })

  // rolar pra CIMA a partir do topo do bloco (section 3+4) deve voltar
  // direto pro "resting point" da section 2, pulando o mesmo trecho morto
  // do lobby que o auto-advance section2->3 já pula na descida (ver
  // useLenis em lobby.tsx) — sem isso, subir daqui exigia rolar
  // manualmente por ~1800px de lobby sem nada acontecendo visualmente
  // (fricção reportada, espelhada da que já existia na descida).
  // REVERSE_EDGE_PX: janela (em px de scroll), pros DOIS lados do topo real
  // do bloco, que conta como "borda de saída" — bem dentro dele uma rolada
  // pra cima/baixo pequena continua normal, só perto da borda de verdade é
  // que dispara o salto.
  //
  // IMPORTANTE: checar só o limite de CIMA (scroll > sectionTop + edge) não
  // bastava — sem checar também o limite de BAIXO, uma rolada pra cima em
  // QUALQUER lugar ANTES do bloco (inclusive lá no topo da página)
  // disparava o salto por engano — o que corrompia o auto-advance da
  // PRÓPRIA section 2 (bug reportado: descer nulo depois de ter subido).
  // Com os dois limites, o gatilho só existe mesmo bem perto do topo de
  // verdade do bloco.
  //
  // isMobileLayout: mobile não tem o bloco pinado nem o "trecho morto" pra
  // pular (a section 2 lá é fluxo normal, sem scroll-jacking, ver
  // lobby.tsx) — nada pra este gatilho fazer, o scroll de volta já é 100%
  // nativo/simples.
  const REVERSE_EDGE_PX = 24
  const reverseFiredRef = useRef(false)
  useLenis(
    (lenisInstance) => {
      if (prefersReducedMotion || isMobileLayout) return
      const container = containerRef.current
      if (!container) return
      const containerTop = container.getBoundingClientRect().top + window.scrollY
      const nearTopEdge =
        lenisInstance.scroll >= containerTop - REVERSE_EDGE_PX &&
        lenisInstance.scroll <= containerTop + REVERSE_EDGE_PX
      if (!nearTopEdge) {
        // longe da borda (bem dentro do bloco OU em qualquer lugar antes
        // dele) — nada a fazer, mas destrava o gatilho pra próxima vez que
        // o scroll passar perto da borda de verdade.
        reverseFiredRef.current = false
        return
      }
      if (reverseFiredRef.current) return
      // rolou pra baixo (ou parado): não é um pedido de sair pra cima.
      if (lenisInstance.direction >= 0) return
      reverseFiredRef.current = true
      // autoJumpScrollTo (não scrollTo direto com lock:true): trava o
      // scroll só por um instante curto (AUTO_JUMP_LOCK_GUARD_MS, pra
      // absorver o momentum residual da própria rolada que disparou o
      // gatilho), não pela animação inteira — travar pelo tempo todo
      // (versão anterior) fazia o usuário, ao subir pra section 2 e tentar
      // descer de novo rápido, cair bem dentro dessa janela travada (bug
      // reportado, ver comentário grande em autoJumpScrollTo no lobby.tsx).
      // duration FIXA (getAutoJumpDuration sem argumento) — mesma duração
      // do salto section2->3 sempre, não proporcional à distância real
      // deste salto específico; ver comentário grande em
      // getAutoJumpDuration no lobby.tsx pra entender por que precisa ser
      // fixa (não só a mesma velocidade média) pros dois sentidos lerem
      // como igualmente rápidos.
      autoJumpScrollTo(lenisInstance, getSection2ScrollTarget())
    },
    [prefersReducedMotion, isMobileLayout]
  )

  // fallback estático (motion reduzido): as duas sections empilham
  // normalmente, sem fundo animado (GradientBars) nem slide nenhum — mesma
  // convenção já usada em Lobby() pra motion reduzido.
  if (prefersReducedMotion) {
    return (
      <>
        <section id="o-que-fazemos" className="relative flex min-h-screen items-center justify-center bg-black py-12">
          <ServiceCard activeIndex={activeIndex} onSelect={setActiveIndex} />
        </section>
        <section id="metodo" className="relative flex min-h-screen items-center justify-center bg-black py-12">
          <MetodoCard />
        </section>
      </>
    )
  }

  // mobile: sem scroll-jacking (pedido explícito, mesma decisão já tomada
  // pro resto do mobile, ver lobby.tsx) — as duas sections empilham
  // normalmente, cada uma com seu próprio fundo (GradientBars é só CSS,
  // sem contexto WebGL — barato manter duas instâncias montadas).
  if (isMobileLayout) {
    return (
      <>
        <section id="o-que-fazemos" className="relative flex min-h-screen items-center justify-center bg-black py-12">
          <GradientBars numBars={15} animationDuration={2} className="z-0" />
          <ServiceCard activeIndex={activeIndex} onSelect={setActiveIndex} />
        </section>
        <section id="metodo" className="relative flex min-h-screen items-center justify-center bg-black py-12">
          <GradientBars numBars={15} animationDuration={2} className="z-0" />
          <MetodoCard />
        </section>
      </>
    )
  }

  // desktop: transição horizontal pinada (pedido explícito) — o card da
  // section 3 desliza pra fora à esquerda enquanto o card da section 4
  // entra pela direita, sobre o MESMO fundo (GradientBars, uma instância
  // só) que permanece parado. Mesmo padrão mecânico do zoom do lobby
  // (container alto + sticky + useTransform), só que num eixo só
  // (translateX) e sem lógica de auto-jump/pausa — aqui é scrubado
  // continuamente pelo próprio scroll, reversível de graça (subir
  // simplesmente volta o transform, não precisa de gatilho nenhum).
  //
  // overflow-hidden no wrapper sticky não é decorativo: sem ele, o
  // wrapper fora de tela (translated ±100%) expandiria a região de scroll
  // HORIZONTAL da página inteira, aparecendo como uma scrollbar horizontal
  // visível durante o slide.
  return (
    <div ref={containerRef} className="relative" style={{ height: `${PIN_SCROLL_HEIGHT_VH}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        <GradientBars numBars={15} animationDuration={2} className="z-0" />

        <motion.div
          id="o-que-fazemos"
          style={{ x: cardOneX }}
          inert={isMetodoCurrent}
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          <ServiceCard activeIndex={activeIndex} onSelect={setActiveIndex} />
        </motion.div>

        <motion.div
          id="metodo"
          style={{ x: cardTwoX }}
          inert={!isMetodoCurrent}
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          <MetodoCard />
        </motion.div>
      </div>
    </div>
  )
}
