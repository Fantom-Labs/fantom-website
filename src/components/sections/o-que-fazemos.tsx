"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useLenis } from "lenis/react"
import { GradientBars } from "@/components/ui/gradient-bars-background"
import { getAutoJumpDuration, getSection2ScrollTarget } from "@/components/motion/lobby"

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
    images: ["/images/section-3/websites2-s3.png", "/images/section-3/websites4-s3.png"],
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
    // largura no mobile: calc(100vw-40px), não 80vw — 80vw deixava a margem
    // (~39px numa tela de 390px) maior que a do logo/menu-icon (left-5/
    // right-5, 20px, ver LobbyChrome), o frame ficava "flutuando" fora do
    // alinhamento do resto do chrome fixo da página (pedido explícito:
    // "aumentar a largura do frame deixando a margem igual à do
    // menu-icon"). Volta a 80vw a partir do sm: (desktop mantém como já
    // estava, só o mobile mudou).
    <div className="relative z-10 flex h-[85vh] w-[calc(100vw-40px)] flex-col rounded-[20px] border border-white/15 bg-white/[0.03] p-6 backdrop-blur-lg sm:w-[80vw] sm:p-8 lg:p-16">
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
  const sectionRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // rolar pra CIMA a partir do topo da section deve voltar direto pro
  // "resting point" da section 2, pulando o mesmo trecho morto do lobby que
  // o auto-advance section2->3 já pula na descida (ver useLenis em
  // lobby.tsx) — sem isso, subir daqui exigia rolar manualmente por ~1800px
  // de lobby sem nada acontecendo visualmente (fricção reportada, espelhada
  // da que já existia na descida). REVERSE_EDGE_PX: janela (em px de
  // scroll), pros DOIS lados do topo real da section, que conta como "borda
  // de saída" — bem dentro da section uma rolada pra cima/baixo pequena
  // continua normal, só perto da borda de verdade é que dispara o salto.
  //
  // IMPORTANTE: checar só o limite de CIMA (scroll > sectionTop + edge) não
  // bastava — sem checar também o limite de BAIXO, uma rolada pra cima em
  // QUALQUER lugar ANTES da section (inclusive lá no topo da página)
  // disparava o salto por engano — o que corrompia o auto-advance da
  // PRÓPRIA section 2 (bug reportado: descer nulo depois de ter subido).
  // Com os dois limites, o gatilho só existe mesmo bem perto do topo de
  // verdade da section.
  const REVERSE_EDGE_PX = 24
  const reverseFiredRef = useRef(false)
  useLenis(
    (lenisInstance) => {
      if (prefersReducedMotion) return
      const section = sectionRef.current
      if (!section) return
      const sectionTop = section.getBoundingClientRect().top + window.scrollY
      const nearTopEdge =
        lenisInstance.scroll >= sectionTop - REVERSE_EDGE_PX &&
        lenisInstance.scroll <= sectionTop + REVERSE_EDGE_PX
      if (!nearTopEdge) {
        // longe da borda (bem dentro da section OU em qualquer lugar antes
        // dela) — nada a fazer, mas destrava o gatilho pra próxima vez que o
        // scroll passar perto da borda de verdade.
        reverseFiredRef.current = false
        return
      }
      if (reverseFiredRef.current) return
      // rolou pra baixo (ou parado): não é um pedido de sair pra cima.
      if (lenisInstance.direction >= 0) return
      reverseFiredRef.current = true
      // lock: true — mesmo motivo do auto-advance section2->3: sem isso o
      // momentum residual da própria rolada que disparou o gatilho
      // continuava brigando com o alvo do scrollTo. duration FIXA
      // (getAutoJumpDuration sem argumento) — mesma duração do salto
      // section2->3 sempre, não proporcional à distância real deste salto
      // específico; ver comentário grande em getAutoJumpDuration no
      // lobby.tsx pra entender por que precisa ser fixa (não só a mesma
      // velocidade média) pros dois sentidos lerem como igualmente rápidos.
      const target = getSection2ScrollTarget()
      lenisInstance.scrollTo(target, {
        duration: getAutoJumpDuration(),
        lock: true,
      })
    },
    [prefersReducedMotion]
  )

  // sem scroll-jacking (nada de altura extra artificial): a section ocupa
  // uma tela só, os itens trocam apenas por clique (project.md, seção 9) —
  // removida a navegação por scroll entre os itens (pedido explícito:
  // "vamos remover a navegação por scroll nos itens da section 3"; era o
  // mesmo comportamento que o fallback de motion reduzido já tinha, agora é
  // o único). GradientBars (fundo animado) só entra sem motion reduzido.
  return (
    <section
      id="o-que-fazemos"
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center bg-black py-12"
    >
      {!prefersReducedMotion && <GradientBars numBars={15} animationDuration={2} className="z-0" />}
      <ServiceCard activeIndex={activeIndex} onSelect={setActiveIndex} />
    </section>
  )
}
