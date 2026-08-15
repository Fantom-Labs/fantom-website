"use client"

import { useEffect, useRef, useState } from "react"
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
import { FaqCard } from "@/components/sections/faq"

type ServiceItem = {
  title: string
  description: string
  // imagens de exemplo do serviço: anexadas depois, case a caso (por ora,
  // undefined em alguns — o painel à direita cai no placeholder). Mais de
  // uma imagem: ciclo automático (crossfade) enquanto o item estiver
  // selecionado — ver ImageFrame.
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
    images: ["/images/section-3/saas-s3.png", "/images/section-3/saas2-s3.png"],
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

// intervalo (ms) do ciclo automático do item selecionado — pedido
// explícito: "devem passar automaticamente também, pode ser uns 3
// segundos". Crossfade mais longo (ver transition abaixo) dá o ar
// suave/elegante pedido.
const AUTO_ROTATE_MS = 3000

function ImageFrame({ service }: { service: ServiceItem }) {
  const images = service.images ?? []
  const [frame, setFrame] = useState(0)

  // roda sozinho pro item selecionado, sem precisar de hover (pedido
  // explícito: "as imagens do item selecionado devem passar
  // automaticamente também") — reseta o frame e reinicia o ciclo toda vez
  // que troca de item, pra sempre começar da primeira imagem.
  useEffect(() => {
    // setState síncrono aqui de propósito, sem adiar em setTimeout(0): um
    // adiamento deixaria `frame` (índice do item ANTERIOR) e `images`
    // (array do item NOVO, já trocado) descasados por um tick — se o item
    // anterior tinha mais imagens que o novo, esse índice cai fora do
    // array e o placeholder "Imagem em breve" pisca por um frame, violando
    // o pedido explícito de "o frame vazio não aparece em nenhum momento".
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset de estado local ao trocar de item (prop `service`), não sincronização com sistema externo
    setFrame(0)
    if (images.length < 2) return
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % images.length)
    }, AUTO_ROTATE_MS)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- images deriva de service, comparar só service evita recriar o interval a cada render
  }, [service])

  const current = images[frame]

  return (
    <div className="relative aspect-[577/580] max-h-full max-w-full overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02]">
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

// altura (vh) do bloco pinado que contém os cards das sections 3, 4 e 5 —
// menor que o LOBBY_SCROLL_HEIGHT_VH do lobby.tsx (300vh): aqui é só um
// slide horizontal num eixo só, sem as várias fases (zoom + shift + pausa)
// que o zoom da tv precisa. h-screen no wrapper sticky, então 340vh dá
// 240vh de distância pinada de verdade — o bastante pra dois ciclos
// "detém → desliza → detém" deliberados (card1→card2, depois card2→card3),
// sem zona morta exagerada. Cresceu de 220vh (só 1 transição, 2 cards) na
// mesma proporção de quando o FAQ (3º card) entrou.
const PIN_SCROLL_HEIGHT_VH = 340
// frações de scrollYProgress onde cada slide de fato acontece — um par por
// transição (card1↔card2, card2↔card3). Fora desses trechos o scroll
// "detém" em cada card (nada se move ainda/mais), dando tempo de ler antes
// da troca. dwell do meio (entre os dois pares, onde o card2/método fica em
// repouso) um pouco mais largo que os das pontas: é o card com mais
// conteúdo pra ler.
const SLIDE_RANGE_1: [number, number] = [0.15, 0.35]
const SLIDE_RANGE_2: [number, number] = [0.65, 0.85]

// alvo (px de scroll) de onde o card da section 4 (#metodo) fica
// centralizado. Os três cards (#o-que-fazemos, #metodo, #faq) compartilham
// a MESMA geometria vertical — todos são "absolute inset-0" dentro do
// mesmo wrapper sticky, só a posição HORIZONTAL (translateX) diferencia —
// então um href="#metodo"/scrollIntoView nativo não consegue expressar
// "role até o ponto em que o slide horizontal já terminou", só "role até o
// topo vertical deste elemento" (idêntico nos três). Por isso um alvo
// calculado explícito, mesmo padrão de getSection2ScrollTarget/
// getSectionThreeStart no lobby.tsx — usado pelo interceptor de clique nos
// pontos "Método"/"FAQ" do SectionNav.
export function getMetodoScrollTarget(): number {
  const pinTop = getSectionThreeStart()
  const pinnedDistance = (PIN_SCROLL_HEIGHT_VH / 100) * window.innerHeight - window.innerHeight
  return pinTop + SLIDE_RANGE_1[1] * pinnedDistance + 2
}

// mesma lógica de getMetodoScrollTarget, só que pro fim da SEGUNDA
// transição (card2→card3) — onde o card da section 5 (#faq) fica
// centralizado.
export function getFaqScrollTarget(): number {
  const pinTop = getSectionThreeStart()
  const pinnedDistance = (PIN_SCROLL_HEIGHT_VH / 100) * window.innerHeight - window.innerHeight
  return pinTop + SLIDE_RANGE_2[1] * pinnedDistance + 2
}

// gatilho genérico de avanço/reverso do slide automático (ver useLenis mais
// abaixo) — "parado numa ponta (posição perto do alvo + velocidade ~0) +
// uma rolada NOVA na direção certa dispara o salto completo pro outro
// lado". Usado 4x (forward/reverso dos dois pares de cards, 1↔2 e 2↔3),
// mesma lógica exata pros 4 casos, só mudam os limiares de posição/wheel e
// o alvo do salto — extraído num helper só, não duplicado 4x, porque esse
// mecanismo já passou por várias rodadas de debugging nesta sessão (bugs
// de encadeamento indevido entre lobby→card1→card2, ver comentários
// grandes mais abaixo) e duplicar aumentava o risco de um dos 4 pontos
// ficar com um bug que os outros já não têm.
type EdgeTriggerRefs = {
  firedRef: { current: boolean }
  armedAtRef: { current: number | null }
}

function checkEdgeTrigger(
  refs: EdgeTriggerRefs,
  atRest: boolean,
  nearPin: boolean,
  wheel: { at: number; deltaY: number },
  wheelSign: 1 | -1,
  fire: () => void
) {
  if (refs.firedRef.current) return
  if (refs.armedAtRef.current === null) {
    if (atRest && nearPin) refs.armedAtRef.current = Date.now()
    return
  }
  const wheelIsFresh = wheel.at > refs.armedAtRef.current
  const wheelSignMatches = wheelSign > 0 ? wheel.deltaY > 0 : wheel.deltaY < 0
  if (wheelIsFresh && wheelSignMatches) {
    refs.firedRef.current = true
    fire()
  }
}

function resetEdgeTrigger(refs: EdgeTriggerRefs) {
  refs.firedRef.current = false
  refs.armedAtRef.current = null
}

export function OQueFazemos() {
  const prefersReducedMotion = useReducedMotion()
  const isMobileLayout = useIsMobileLayout()
  const lenis = useLenis()
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })
  // cada card mapeado ao longo do progress INTEIRO (não só do seu próprio
  // trecho de slide): fica esperando fora de tela (100%/-100%) até chegar
  // sua vez, desliza durante o par de breakpoints que lhe cabe, e
  // permanece na posição final depois disso — useTransform aceita ranges
  // multi-ponto (piecewise), não só 2 pontos, por isso dá pra expressar
  // "espera → desliza → fica" numa chamada só por card.
  const cardOneX = useTransform(
    scrollYProgress,
    [0, SLIDE_RANGE_1[0], SLIDE_RANGE_1[1], 1],
    ["0%", "0%", "-100%", "-100%"]
  )
  const cardTwoX = useTransform(
    scrollYProgress,
    [0, SLIDE_RANGE_1[0], SLIDE_RANGE_1[1], SLIDE_RANGE_2[0], SLIDE_RANGE_2[1], 1],
    ["100%", "100%", "0%", "0%", "-100%", "-100%"]
  )
  const cardThreeX = useTransform(
    scrollYProgress,
    [0, SLIDE_RANGE_2[0], SLIDE_RANGE_2[1], 1],
    ["100%", "100%", "0%", "0%"]
  )

  // qual card está "corrente" (0/1/2) — só pra alternar `inert` nos cards
  // fora de tela (ver JSX do branch pinado): sem isso, os botões/accordions
  // reais dos cards não-correntes continuam focáveis via Tab mesmo
  // transladados pra fora da viewport.
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const midpoint1 = (SLIDE_RANGE_1[0] + SLIDE_RANGE_1[1]) / 2
  const midpoint2 = (SLIDE_RANGE_2[0] + SLIDE_RANGE_2[1]) / 2
  // auto-complete do slide (pedido explícito: "não deve ser possível parar
  // a rolagem no meio entre as seções") — debounce: a cada mudança de
  // scrollYProgress, cancela o timer anterior e agenda um novo. Só quando
  // o valor fica PARADO de verdade por SNAP_IDLE_MS (nenhuma mudança nova
  // reagenda o timer nesse meio tempo) é que ele finalmente dispara —
  // funciona tanto pra um usuário que soltou o input quanto pra uma
  // rolada contínua que ainda está em andamento (cada frame de mudança
  // continua adiando o snap, mesmo padrão de debounce que resolveu o
  // auto-advance da section 2->3 em lobby.tsx, só que aqui via mudança de
  // valor em vez de input bruto — mais simples, não precisa de listener
  // de wheel/touch separado, já que scrollYProgress só muda enquanto a
  // posição de scroll realmente está se movendo). Agora com dois pares de
  // breakpoints (2 transições, 3 cards): descobre em qual dos dois o
  // progress está ANTES de decidir o alvo do snap.
  const SNAP_IDLE_MS = 150
  const snapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setCurrentCardIndex(v < midpoint1 ? 0 : v < midpoint2 ? 1 : 2)

    if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current)
    if (isMobileLayout || prefersReducedMotion || !lenis) return
    const inSlide1 = v > SLIDE_RANGE_1[0] && v < SLIDE_RANGE_1[1]
    const inSlide2 = v > SLIDE_RANGE_2[0] && v < SLIDE_RANGE_2[1]
    // já assentado numa ponta (não estritamente DENTRO de nenhum dos dois
    // trechos de slide) — nada pra completar.
    if (!inSlide1 && !inSlide2) return
    snapTimeoutRef.current = setTimeout(() => {
      const target = inSlide1
        ? v >= midpoint1
          ? getMetodoScrollTarget()
          : getSectionThreeStart()
        : v >= midpoint2
          ? getFaqScrollTarget()
          : getMetodoScrollTarget()
      lenis.scrollTo(target, { lock: true })
    }, SNAP_IDLE_MS)
  })

  // slide automático entre os cards (pedido explícito: "quando rola pra
  // baixo na section 3, vai sozinho pra 4, e quando rola pra cima na 4 vai
  // direto pra 3, como um slide, mas seguindo a lógica atual" — mesma
  // lógica estendida agora pro par card2↔card3/#faq) — mesmo padrão do
  // auto-advance/reverso section2->3 em lobby.tsx: parado numa ponta (um
  // card em repouso, fora do trecho ativo do slide) + uma rolada NOVA na
  // direção de avançar dispara o salto completo pro outro lado. Complementa
  // (não substitui) o auto-complete de meio-de-slide acima: aquele cobre
  // "não travar NO MEIO"; este cobre "não precisar arrastar manualmente
  // desde o repouso".
  //
  // "armar" via VELOCIDADE (não input bruto/wheel-touch, tentativa
  // anterior): o salto section2->3 do lobby (autoJumpScrollTo) TAMBÉM
  // cruza esse mesmo limiar de progress ao entrar neste pin — como é uma
  // animação puramente programática (sem nenhum wheel/touch novo
  // acontecendo durante ela), um gate baseado em "faz tempo que não chega
  // input bruto" ficava satisfeito ENQUANTO essa animação alheia ainda
  // estava em voo, e o gatilho disparava sozinho no meio dela, encadeando
  // direto pro card 2 sem o usuário ter pedido uma segunda vez (bug
  // encontrado testando: a chegada vinda do lobby já continuava sozinha
  // até a section 4). Velocidade resolve isso: só arma quando o scroll
  // genuinamente ACOMODOU (velocity ~0) — não importa QUEM causou o
  // movimento anterior (lobby, este mesmo componente, ou o usuário), só
  // dispara depois que ele realmente parou. Só então uma rolada NOVA
  // (direction virando > 0 ou < 0 de novo) dispara o salto.
  const VELOCITY_REST_PX = 0.05
  // lenisInstance.direction NÃO reseta pra 0 quando o scroll acomoda —
  // reset() (chamado ao completar qualquer scrollTo) zera isLocked/
  // isScrolling/velocity, mas NÃO mexe em `direction` (ver
  // node_modules/lenis/dist/lenis.mjs): ele fica "grudado" no último sinal
  // não-nulo indefinidamente. Usar "direction > 0" pra decidir SE disparar
  // (versão anterior) disparava sozinho assim que "armava", mesmo sem
  // nenhuma rolada nova de verdade — porque o sinal residual da PRÓPRIA
  // animação que trouxe o scroll até aqui ainda estava lá (bug encontrado
  // testando: chegar em #o-que-fazemos vindo do lobby continuava sozinho
  // até #metodo mesmo depois do fix de velocidade acima). Em vez disso,
  // rastreia o evento de wheel bruto mais recente (timestamp + sinal do
  // deltaY) — só conta como "pedido novo" um evento que aconteceu DEPOIS
  // do instante em que armou.
  const lastWheelRef = useRef({ at: 0, deltaY: 0 })
  useEffect(() => {
    const markWheel = (event: WheelEvent) => {
      lastWheelRef.current = { at: Date.now(), deltaY: event.deltaY }
    }
    window.addEventListener("wheel", markWheel, { passive: true })
    return () => window.removeEventListener("wheel", markWheel)
  }, [])

  // um par de refs (fired + armedAt) por edge — 4 edges no total: forward1
  // (card1→card2), reverse1 (card2→card1), forward2 (card2→card3), reverse2
  // (card3→card2). checkEdgeTrigger/resetEdgeTrigger (definidos acima do
  // componente) implementam a lógica compartilhada; cada edge só passa os
  // limiares de posição/wheel/alvo que lhe cabem.
  const forward1Ref = useRef(false)
  const forward1ArmedAtRef = useRef<number | null>(null)
  const reverse1Ref = useRef(false)
  const reverse1ArmedAtRef = useRef<number | null>(null)
  const forward2Ref = useRef(false)
  const forward2ArmedAtRef = useRef<number | null>(null)
  const reverse2Ref = useRef(false)
  const reverse2ArmedAtRef = useRef<number | null>(null)
  useLenis(
    (lenisInstance) => {
      if (prefersReducedMotion || isMobileLayout) return
      const progress = scrollYProgress.get()
      const atRest = Math.abs(lenisInstance.velocity) < VELOCITY_REST_PX
      const wheel = lastWheelRef.current

      // dwell2 (card2/método em repouso, entre as duas transições): zona
      // com vizinho dos DOIS lados — diferente de dwell1/dwell3 (abertas
      // contra os limites naturais 0/1 do progress, sem "mais além" pra
      // vazar). reverse1 (card2→card1) e forward2 (card2→card3) MORAM
      // aqui, os dois.
      const inDwell2 = progress >= SLIDE_RANGE_1[1] && progress < SLIDE_RANGE_2[0]

      // volta a cruzar pro lado oposto de onde disparou/armou por último —
      // conta como nova "visita" a essa ponta, rearma o gatilho dela (mesmo
      // padrão de wasBeyondSectionThreeRef em lobby.tsx). forward1/reverse2
      // resetam num limiar só (mesma semântica original de 2 cards: a
      // própria zona deles já é aberta contra 0/1, não tem "mais além").
      // reverse1/forward2 precisam resetar saindo de dwell2 por QUALQUER
      // lado — sem isso, ficar armado numa visita antiga a dwell2 (ex.:
      // reverse1 arma ali, mas o usuário segue em frente até o card3 sem
      // nunca disparar reverse1) sobrevivia indefinidamente e disparava
      // sozinho bem mais tarde, em cima de um wheel completamente não
      // relacionado (bug encontrado testando o round-trip completo
      // card1→2→3→2→1: um único up-nudge vindo do card3 disparava reverse2
      // E o reverse1 "esquecido" ao mesmo tempo, pulando direto pro card1
      // em vez de parar no card2).
      if (progress > SLIDE_RANGE_1[0]) resetEdgeTrigger({ firedRef: forward1Ref, armedAtRef: forward1ArmedAtRef })
      if (!inDwell2) resetEdgeTrigger({ firedRef: reverse1Ref, armedAtRef: reverse1ArmedAtRef })
      if (!inDwell2) resetEdgeTrigger({ firedRef: forward2Ref, armedAtRef: forward2ArmedAtRef })
      if (progress < SLIDE_RANGE_2[1]) resetEdgeTrigger({ firedRef: reverse2Ref, armedAtRef: reverse2ArmedAtRef })

      // nearPin em cada checagem: sem isso, os limiares de progress abaixo
      // também são verdade ANTES do usuário sequer chegar perto do pin (o
      // valor de scrollYProgress fica "clampado" em 0 ou 1 enquanto a
      // página está longe do container, não só quando genuinamente em
      // repouso numa ponta dele — mesmo container, dois motivos diferentes
      // pro mesmo número) — sem esse check extra, o gatilho armava sozinho
      // já no carregamento da página.
      if (progress <= SLIDE_RANGE_1[0]) {
        const nearPinStart = Math.abs(lenisInstance.scroll - getSectionThreeStart()) < 50
        checkEdgeTrigger({ firedRef: forward1Ref, armedAtRef: forward1ArmedAtRef }, atRest, nearPinStart, wheel, 1, () =>
          autoJumpScrollTo(lenisInstance, getMetodoScrollTarget())
        )
      }
      if (inDwell2) {
        const nearMetodo = Math.abs(lenisInstance.scroll - getMetodoScrollTarget()) < 50
        checkEdgeTrigger({ firedRef: reverse1Ref, armedAtRef: reverse1ArmedAtRef }, atRest, nearMetodo, wheel, -1, () =>
          autoJumpScrollTo(lenisInstance, getSectionThreeStart())
        )
        checkEdgeTrigger({ firedRef: forward2Ref, armedAtRef: forward2ArmedAtRef }, atRest, nearMetodo, wheel, 1, () =>
          autoJumpScrollTo(lenisInstance, getFaqScrollTarget())
        )
      }
      if (progress >= SLIDE_RANGE_2[1]) {
        const nearFaq = Math.abs(lenisInstance.scroll - getFaqScrollTarget()) < 50
        checkEdgeTrigger({ firedRef: reverse2Ref, armedAtRef: reverse2ArmedAtRef }, atRest, nearFaq, wheel, -1, () =>
          autoJumpScrollTo(lenisInstance, getMetodoScrollTarget())
        )
      }
    },
    [prefersReducedMotion, isMobileLayout]
  )

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
  const reverseArmedAtRef = useRef<number | null>(null)
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
        reverseArmedAtRef.current = null
        return
      }
      if (reverseFiredRef.current) return
      // precisa ACOMODAR de verdade nesta borda antes de armar — sem isso,
      // o salto reverso NOVO da section 4 pro card 1 (ver useLenis logo
      // acima) pousa EXATAMENTE nesta borda como parte de uma rolada pra
      // cima já em andamento, e esse gatilho disparava de novo em cima do
      // mesmo movimento, encadeando section4 -> section3 -> lobby numa
      // rolada só (bug encontrado testando o slide automático da section
      // 4: "quando rola pra cima na 4 vai direto pra 3" virou "vai direto
      // pro lobby"). Mesmo padrão de VELOCITY_REST_PX + lastWheelRef do
      // useLenis acima (não lenisInstance.direction — ele fica "grudado"
      // no último sinal não-nulo mesmo depois do scroll acomodar de
      // verdade, ver comentário grande lá).
      if (reverseArmedAtRef.current === null) {
        if (Math.abs(lenisInstance.velocity) < VELOCITY_REST_PX) reverseArmedAtRef.current = Date.now()
        return
      }
      if (!(lastWheelRef.current.at > reverseArmedAtRef.current && lastWheelRef.current.deltaY < 0)) return
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

  // fallback estático (motion reduzido): as três sections empilham
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
        <section id="faq" className="relative flex min-h-screen items-center justify-center bg-black py-12">
          <FaqCard />
        </section>
      </>
    )
  }

  // mobile: sem scroll-jacking (pedido explícito, mesma decisão já tomada
  // pro resto do mobile, ver lobby.tsx) — as três sections empilham
  // normalmente, cada uma com seu próprio fundo (GradientBars é só CSS,
  // sem contexto WebGL — barato manter as três instâncias montadas).
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
        <section id="faq" className="relative flex min-h-screen items-center justify-center bg-black py-12">
          <GradientBars numBars={15} animationDuration={2} className="z-0" />
          <FaqCard />
        </section>
      </>
    )
  }

  // desktop: transição horizontal pinada (pedido explícito, agora
  // estendida pra um 3º card: "a section 5 deve ter o mesmo princípio da
  // section 3 e 4, mesma transição de card que ocorre da section 3 pra 4")
  // — cada card desliza pra fora à esquerda enquanto o próximo entra pela
  // direita, sobre o MESMO fundo (GradientBars, uma instância só) que
  // permanece parado. Mesmo padrão mecânico do zoom do lobby (container
  // alto + sticky + useTransform), só que num eixo só (translateX) e sem
  // lógica de auto-jump/pausa NO SCRUB em si — aqui é scrubado
  // continuamente pelo próprio scroll, reversível de graça (subir
  // simplesmente volta o transform, não precisa de gatilho nenhum; o
  // auto-advance/reverso de mais acima só cobre o "parado numa ponta +
  // rolada nova").
  //
  // overflow-hidden no wrapper sticky não é decorativo: sem ele, os
  // wrappers fora de tela (translated ±100%) expandiriam a região de
  // scroll HORIZONTAL da página inteira, aparecendo como uma scrollbar
  // horizontal visível durante o slide.
  return (
    <div ref={containerRef} className="relative" style={{ height: `${PIN_SCROLL_HEIGHT_VH}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        <GradientBars numBars={15} animationDuration={2} className="z-0" />

        <motion.div
          id="o-que-fazemos"
          style={{ x: cardOneX }}
          inert={currentCardIndex !== 0}
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          <ServiceCard activeIndex={activeIndex} onSelect={setActiveIndex} />
        </motion.div>

        <motion.div
          id="metodo"
          style={{ x: cardTwoX }}
          inert={currentCardIndex !== 1}
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          <MetodoCard />
        </motion.div>

        <motion.div
          id="faq"
          style={{ x: cardThreeX }}
          inert={currentCardIndex !== 2}
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          <FaqCard />
        </motion.div>
      </div>
    </div>
  )
}
