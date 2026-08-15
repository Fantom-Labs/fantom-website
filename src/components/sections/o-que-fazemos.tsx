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
  const lenis = useLenis()
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
  // posição de scroll realmente está se movendo).
  const SNAP_IDLE_MS = 150
  const snapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setIsMetodoCurrent(v >= (SLIDE_RANGE[0] + SLIDE_RANGE[1]) / 2)

    if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current)
    if (isMobileLayout || prefersReducedMotion || !lenis) return
    // já assentado numa ponta (não estritamente DENTRO do slide) — nada
    // pra completar.
    if (v <= SLIDE_RANGE[0] || v >= SLIDE_RANGE[1]) return
    snapTimeoutRef.current = setTimeout(() => {
      const target = v >= (SLIDE_RANGE[0] + SLIDE_RANGE[1]) / 2 ? getMetodoScrollTarget() : getSectionThreeStart()
      lenis.scrollTo(target, { lock: true })
    }, SNAP_IDLE_MS)
  })

  // slide automático entre os dois cards (pedido explícito: "quando rola
  // pra baixo na section 3, vai sozinho pra 4, e quando rola pra cima na 4
  // vai direto pra 3, como um slide, mas seguindo a lógica atual") — mesmo
  // padrão do auto-advance/reverso section2->3 em lobby.tsx: parado numa
  // ponta (card 1 ou card 2 em repouso, fora do trecho ativo do slide) +
  // uma rolada NOVA na direção de avançar dispara o salto completo pro
  // outro lado. Complementa (não substitui) o auto-complete de
  // meio-de-slide acima: aquele cobre "não travar NO MEIO"; este cobre
  // "não precisar arrastar manualmente desde o repouso".
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

  const slideForwardFiredRef = useRef(false)
  const slideReverseFiredRef = useRef(false)
  const slideForwardArmedAtRef = useRef<number | null>(null)
  const slideReverseArmedAtRef = useRef<number | null>(null)
  useLenis(
    (lenisInstance) => {
      if (prefersReducedMotion || isMobileLayout) return
      const progress = scrollYProgress.get()
      const atRest = Math.abs(lenisInstance.velocity) < VELOCITY_REST_PX

      // volta a cruzar pro lado oposto de onde disparou/armou por último —
      // conta como nova "visita" a essa ponta, rearma o gatilho dela
      // (mesmo padrão de wasBeyondSectionThreeRef em lobby.tsx, só que os
      // dois lados vivem no mesmo pin aqui, então é só checar a posição
      // atual).
      if (progress > SLIDE_RANGE[0]) {
        slideForwardFiredRef.current = false
        slideForwardArmedAtRef.current = null
      }
      if (progress < SLIDE_RANGE[1]) {
        slideReverseFiredRef.current = false
        slideReverseArmedAtRef.current = null
      }

      // em repouso no card 1 (section 3): primeiro precisa ACOMODAR de
      // verdade (arma), só then uma rolada de wheel NOVA (depois do
      // instante em que armou) dispara.
      //
      // nearPinStart: sem isso, "progress <= SLIDE_RANGE[0]" também é
      // verdade ANTES do usuário sequer chegar perto deste pin (o valor de
      // scrollYProgress fica "clampado" em 0 enquanto a página está longe
      // do container, não só quando genuinamente em repouso no início dele
      // — mesmo container, dois motivos diferentes pro mesmo número) — sem
      // esse check extra, o gatilho armava sozinho já no carregamento da
      // página (scroll=0, velocity=0 também "parece" repouso).
      if (progress <= SLIDE_RANGE[0] && !slideForwardFiredRef.current) {
        const nearPinStart = Math.abs(lenisInstance.scroll - getSectionThreeStart()) < 50
        if (slideForwardArmedAtRef.current === null) {
          if (atRest && nearPinStart) slideForwardArmedAtRef.current = Date.now()
          return
        }
        if (lastWheelRef.current.at > slideForwardArmedAtRef.current && lastWheelRef.current.deltaY > 0) {
          slideForwardFiredRef.current = true
          autoJumpScrollTo(lenisInstance, getMetodoScrollTarget())
        }
        return
      }

      // em repouso no card 2 (section 4): mesma lógica, sentido oposto.
      // nearPinEnd: mesmo motivo do nearPinStart acima (progress também
      // "clampa" em 1 se o scroll estiver bem depois deste pin, não só
      // genuinamente em repouso no fim dele).
      if (progress >= SLIDE_RANGE[1] && !slideReverseFiredRef.current) {
        const nearPinEnd = Math.abs(lenisInstance.scroll - getMetodoScrollTarget()) < 50
        if (slideReverseArmedAtRef.current === null) {
          if (atRest && nearPinEnd) slideReverseArmedAtRef.current = Date.now()
          return
        }
        if (lastWheelRef.current.at > slideReverseArmedAtRef.current && lastWheelRef.current.deltaY < 0) {
          slideReverseFiredRef.current = true
          autoJumpScrollTo(lenisInstance, getSectionThreeStart())
        }
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
