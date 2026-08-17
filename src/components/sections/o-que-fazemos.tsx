"use client"

import { useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
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
// menor que o LOBBY_SCROLL_HEIGHT_VH do lobby.tsx (300vh). h-screen no
// wrapper sticky, então 280vh dá 180vh de distância pinada de verdade —
// dividida em 3 terços iguais de "descanso" (~60vh cada), um por card.
// Diferente da versão anterior (slide horizontal contínuo): a transição
// agora é disparada por índice (ver getCardMotionState), não mais
// escrubada 1:1 com o scroll — não precisa mais reservar espaço de scroll
// pra uma zona de "arrasto manual", só o suficiente pra cada card ter uma
// faixa de repouso confortável.
const PIN_SCROLL_HEIGHT_VH = 280
// limiares (fração de scrollYProgress) que dividem o pin em 3 terços —
// substituem os antigos SLIDE_RANGE_1/2 (zonas de slide contínuo): aqui é
// só o ponto onde currentCardIndex muda de um card pro próximo, sem zona
// de scrub no meio.
const DWELL_THRESHOLD_1 = 1 / 3
const DWELL_THRESHOLD_2 = 2 / 3

// quanto do card ANTERIOR fica visível "espiando" atrás do card corrente —
// pedido explícito: "deve vir de baixo e parar um pouco antes de preencher
// o frame anterior", efeito de baralho de cartas (confirmado com o
// usuário: o peek persiste no repouso, não é só um instante de transição).
// negativo (sobe, não desce): o espaço sobrando fica em CIMA — o card
// corrente sempre assenta em y:0 (não muda por causa do anterior); é o
// card que VIRA anterior que sobe um pouco (y:0 → -PEEK_OFFSET_PX),
// deixando o topo dele à mostra por cima do corrente (pedido explícito:
// "o espaço sobrando deve ser em cima, não embaixo" — tentativa anterior
// movia o card corrente pra +48px, sobrando embaixo).
//
// -20px: espaço entre uma camada da pilha e a próxima (pedido explícito:
// "o espaço entre os cards está muito grande, deixe 20px" — ajuste fino
// depois de já ter passado por -8px, muito sutil, e -32px, grande demais).
//
// (histórico: começou em -48px, empurrando o topo do frame de 2
// profundidades pra FORA da área visível — pedido explícito: "o frame da
// section anterior está subindo no scroll, o que faz ele ficar acima da
// área visível da tela". Caiu pra -24px, depois pra -8px por causa disso,
// depois subiu pra -32px a pedido do usuário e voltou a cortar em janelas
// mais baixas — daí o BASE_Y_OFFSET_PX logo abaixo, que abre vão extra em
// vez de mexer nesse espaçamento entre camadas. Com -20px o vão necessário
// pra 2 profundidades é bem menor — 2×-20px=-40px — cabendo com folga
// ainda maior que -32px em qualquer altura de janela testada.)
const PEEK_OFFSET_PX = -20

// desloca a pilha inteira (corrente + todas as camadas de peek) pra baixo
// em px fixos — abre vão extra ACIMA do CardFrame sem precisar reduzir
// PEEK_OFFSET_PX (que o usuário já pediu especificamente pra aumentar).
// Motivo de ser px fixo, não vh: o vão natural do wrapper (7.5vh acima do
// CardFrame centralizado, sm:h-[85vh] em h-screen) encolhe junto com a
// altura da janela, mas a profundidade da pilha (2×PEEK_OFFSET_PX=-64px)
// é fixa em px — em janelas baixas (medido: a partir de ~800px de altura)
// o vão relativo (vh) fica menor que a pilha fixa (px) e a camada mais
// funda corta o topo da tela. 24px garante margem confortável mesmo numa
// janela de 650px de altura (vão de 48.75px, sobrando ~9px depois do
// deslocamento) sem deslocar o card corrente o bastante pra ser percebido
// em janelas normais.
const BASE_Y_OFFSET_PX = 24

// duração (segundos) da animação de posição de cada card — reaproveitada
// também pra atrasar o sumiço do CONTEÚDO do card anterior (ver
// lastCardIndex em OQueFazemos), então as duas ficam sincronizadas mesmo
// sem serem literalmente a mesma animação.
const CARD_TRANSITION_DURATION = 0.6

// estado de posição/z-index de um card dado seu próprio índice e o índice
// CORRENTE — usado pelos 3 motion.div no branch pinado do desktop (ver
// JSX mais abaixo). TODOS os cards já visitados (cardIndex < currentIndex)
// ficam empilhados/acumulados (pedido explícito: "da section 4 pra 5 deve
// ficar acumulados os 3 frames" — não só o imediatamente anterior) — mas a
// profundidade de cada um é FIXA pelo próprio índice, não pela distância
// até o corrente: um card que já assentou no peek NÃO se move de novo
// quando um card MAIS NOVO entra na pilha atrás dele (pedido explícito:
// "no scroll o frame da section anterior sobe, ele deve ficar parado" — a
// versão anterior recalculava a distância a cada transição, fazendo o
// peek mais antigo derivar/animar de novo toda vez que um 3º card
// entrava). Como a navegação é sempre linear (0→1→2), a ORDEM de quando
// cada card é demovido pela primeira vez nunca muda — por isso um slot
// fixo por índice já garante a pilha certa sem precisar rastrear
// histórico à parte. Só os que ainda não chegaram (cardIndex > currentIndex)
// ficam fora de tela.
//
// depth = 2 - cardIndex (não cardIndex + 1): o card MAIS ANTIGO (índice
// menor) fica na profundidade MAIOR (mais pro fundo da pilha), e o mais
// RECENTE fica na profundidade MENOR (mais na frente, logo atrás do
// corrente) — pedido explícito: "corrija para ficar na ordem lógica,
// section 3, 4 e 5 (de cima pra baixo)". A fórmula anterior (cardIndex+1)
// fazia o oposto: o card mais antigo (section 3) ficava na profundidade
// RASA (na frente), reaparecendo por cima de novo a cada transição em vez
// de afundar pra trás — o "2" é o índice do último card (2 cards podem
// virar peek no máximo, 0 e 1; o card de índice 2 nunca é peek, só
// corrente ou fora de tela), então essa fórmula continua fixa só pelo
// PRÓPRIO índice (preserva o "nunca re-anima" acima).
function getCardMotionState(cardIndex: number, currentIndex: number): { y: number | string; zIndex: number } {
  if (cardIndex === currentIndex) return { y: BASE_Y_OFFSET_PX, zIndex: 3 }
  if (cardIndex > currentIndex) return { y: "100%", zIndex: 0 }
  const depth = 2 - cardIndex
  return { y: depth * PEEK_OFFSET_PX + BASE_Y_OFFSET_PX, zIndex: 3 - depth }
}

// alvo (px de scroll) de onde o card da section 4 (#metodo) fica em
// repouso — o MEIO do 2º terço do pin, não mais uma borda de zona de
// slide (esse conceito não existe mais). Os três cards (#o-que-fazemos,
// #metodo, #faq) compartilham a MESMA geometria vertical — todos são
// "absolute inset-0" dentro do mesmo wrapper sticky, só a posição Y
// (translateY, agora) e o z-index diferenciam — então um
// href="#metodo"/scrollIntoView nativo não consegue expressar "role até o
// ponto em que este card já está na frente", só "role até o topo vertical
// deste elemento" (idêntico nos três). Por isso um alvo calculado
// explícito, mesmo padrão de getSection2ScrollTarget/getSectionThreeStart
// no lobby.tsx — usado pelo interceptor de clique nos pontos
// "Método"/"FAQ" do SectionNav.
export function getMetodoScrollTarget(): number {
  const pinTop = getSectionThreeStart()
  const pinnedDistance = (PIN_SCROLL_HEIGHT_VH / 100) * window.innerHeight - window.innerHeight
  return pinTop + ((DWELL_THRESHOLD_1 + DWELL_THRESHOLD_2) / 2) * pinnedDistance + 2
}

// mesma lógica de getMetodoScrollTarget, só que o MEIO do 3º terço — onde
// o card da section 5 (#faq) fica em repouso.
export function getFaqScrollTarget(): number {
  const pinTop = getSectionThreeStart()
  const pinnedDistance = (PIN_SCROLL_HEIGHT_VH / 100) * window.innerHeight - window.innerHeight
  return pinTop + ((DWELL_THRESHOLD_2 + 1) / 2) * pinnedDistance + 2
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
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // qual card está "corrente" (0/1/2) — dirige a posição/z-index de todos
  // os 3 (ver getCardMotionState, JSX do branch pinado) e alterna `inert`
  // nos cards fora de tela: sem isso, os botões/accordions reais dos cards
  // não-correntes continuam focáveis via Tab mesmo transladados pra fora
  // da viewport. Diferente da versão em slide horizontal (posição = função
  // CONTÍNUA do scroll): aqui a posição é função do ÍNDICE, animado pelo
  // Motion com duração fixa — o scroll só decide QUANDO o índice muda; uma
  // vez que muda, a animação sempre roda até o fim, não importa o que o
  // scroll faça depois. É isso que garante "nunca fica parado no meio"
  // (pedido explícito) de forma estrutural, não por um debounce tentando
  // corrigir depois — não existe mais posição intermediária pra travar.
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setCurrentCardIndex(v < DWELL_THRESHOLD_1 ? 0 : v < DWELL_THRESHOLD_2 ? 1 : 2)
  })

  // conteúdo de verdade só aparece em DOIS cards ao mesmo tempo durante uma
  // transição: o CORRENTE (imediato — pedido explícito: "o conteúdo da
  // section destino só está aparecendo no card quando termina o scroll",
  // ou seja, NÃO pode esperar) e o ANTERIOR, que continua mostrando
  // conteúdo até o card corrente cruzar a METADE da tela (pedido explícito:
  // "o conteúdo da section anterior deve sumir antes, assim que o frame da
  // section seguinte atinge metade da tela" — tentativa anterior usava um
  // atraso FIXO, CARD_TRANSITION_DURATION inteiro; agora é atrelado à
  // posição de verdade do card que está subindo, via onUpdate/handleCardUpdate
  // abaixo). Depois de cruzar, `lastCardIndex` alcança `currentCardIndex` e
  // só o corrente continua com conteúdo. Os demais (fora de tela, 2+ passos
  // de distância) mostram só o CardFrame vazio (ver JSX do branch pinado).
  const [lastCardIndex, setLastCardIndex] = useState(0)
  // onUpdate roda só no cliente, durante frames de animação de verdade —
  // seguro usar window.innerHeight aqui (diferente de dentro do render, que
  // roda também no servidor). `latest.y` já vem resolvido em px pelo Motion
  // mesmo quando o alvo original foi uma string tipo "100%" (resolvida uma
  // vez pro tamanho real do elemento no início da animação, ver
  // getCardMotionState) — não precisa parsear porcentagem manualmente.
  const handleCardUpdate = (cardIndex: number) => (latest: { y?: number | string }) => {
    if (cardIndex !== currentCardIndex) return
    const y = typeof latest.y === "number" ? latest.y : Number.parseFloat(String(latest.y ?? ""))
    if (!Number.isNaN(y) && Math.abs(y) <= window.innerHeight / 2) setLastCardIndex(currentCardIndex)
  }

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

      // "dentro deste pin de verdade" — substitui o antigo nearPin por
      // alvo específico (proximidade de 50px de uma borda de slide): com
      // terços largos (~60vh cada) o alvo de repouso agora é o MEIO do
      // terço, não uma borda, então checar só proximidade dele deixaria a
      // maior parte de cada terço fora do alcance do gatilho. Em vez
      // disso, um check só (calculado uma vez, reusado pelos 4 edges):
      // "o scroll está genuinamente dentro do range pinado inteiro" —
      // ainda necessário pelo mesmo motivo de sempre: scrollYProgress
      // clampa em 0/1 enquanto a página está longe do container, não só
      // quando genuinamente em repouso numa ponta dele (mesmo número, dois
      // motivos diferentes) — sem esse check, o gatilho armava sozinho já
      // no carregamento da página.
      const pinTop = getSectionThreeStart()
      const pinnedDistance = (PIN_SCROLL_HEIGHT_VH / 100) * window.innerHeight - window.innerHeight
      const withinPin = lenisInstance.scroll >= pinTop - 10 && lenisInstance.scroll <= pinTop + pinnedDistance + 10

      // dwell2 (card2/método em repouso, entre os dois limiares): zona com
      // vizinho dos DOIS lados — diferente de dwell1/dwell3 (abertas
      // contra os limites naturais 0/1 do progress, sem "mais além" pra
      // vazar). reverse1 (card2→card1) e forward2 (card2→card3) MORAM
      // aqui, os dois.
      const inDwell2 = progress >= DWELL_THRESHOLD_1 && progress < DWELL_THRESHOLD_2

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
      if (progress >= DWELL_THRESHOLD_1) resetEdgeTrigger({ firedRef: forward1Ref, armedAtRef: forward1ArmedAtRef })
      if (!inDwell2) resetEdgeTrigger({ firedRef: reverse1Ref, armedAtRef: reverse1ArmedAtRef })
      if (!inDwell2) resetEdgeTrigger({ firedRef: forward2Ref, armedAtRef: forward2ArmedAtRef })
      if (progress < DWELL_THRESHOLD_2) resetEdgeTrigger({ firedRef: reverse2Ref, armedAtRef: reverse2ArmedAtRef })

      if (progress < DWELL_THRESHOLD_1) {
        checkEdgeTrigger({ firedRef: forward1Ref, armedAtRef: forward1ArmedAtRef }, atRest, withinPin, wheel, 1, () =>
          autoJumpScrollTo(lenisInstance, getMetodoScrollTarget())
        )
      }
      if (inDwell2) {
        checkEdgeTrigger({ firedRef: reverse1Ref, armedAtRef: reverse1ArmedAtRef }, atRest, withinPin, wheel, -1, () =>
          autoJumpScrollTo(lenisInstance, getSectionThreeStart())
        )
        checkEdgeTrigger({ firedRef: forward2Ref, armedAtRef: forward2ArmedAtRef }, atRest, withinPin, wheel, 1, () =>
          autoJumpScrollTo(lenisInstance, getFaqScrollTarget())
        )
      }
      if (progress >= DWELL_THRESHOLD_2) {
        checkEdgeTrigger({ firedRef: reverse2Ref, armedAtRef: reverse2ArmedAtRef }, atRest, withinPin, wheel, -1, () =>
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
  // normalmente. Fundo (GradientBars) ÚNICO pras três, não mais uma
  // instância por section — pedido explícito: "já que o background das
  // sections 2,3 e 4 são iguais e não tem transição como no desktop, deixe
  // o bg um só pras 3 sections em vez dos 3 seguidos". absolute inset-0
  // preenche a altura do wrapper relative que envolve as três (soma das
  // três), não mais a altura de uma section só — bg-black sai do wrapper
  // (não mais de cada section), senão o preto de cada uma cobriria o fundo
  // compartilhado por trás.
  //
  // sem min-h-screen: cada section forçava uma tela cheia de altura mesmo
  // com o card (bem mais curto) centralizado ali dentro, deixando um vão
  // vazio grande entre um card e o próximo — pedido explícito: "diminua a
  // distância entre as sections no mobile". Altura vira só a do conteúdo +
  // py-8, aproximando os cards de verdade.
  if (isMobileLayout) {
    return (
      <div className="relative bg-black">
        <GradientBars numBars={15} animationDuration={2} className="z-0 opacity-80" />
        <section id="o-que-fazemos" className="relative flex items-center justify-center py-8">
          <ServiceCard activeIndex={activeIndex} onSelect={setActiveIndex} />
        </section>
        <section id="metodo" className="relative flex items-center justify-center py-8">
          <MetodoCard />
        </section>
        <section id="faq" className="relative flex items-center justify-center py-8">
          <FaqCard />
        </section>
      </div>
    )
  }

  // desktop: transição empilhada pinada — pedido explícito: "em vez dele
  // vir pela esquerda, deve vir de baixo e parar um pouco antes de
  // preencher o frame anterior" (efeito de baralho de cartas: o próximo
  // card sobe de baixo e para no PEEK_OFFSET_PX, deixando o anterior
  // espiar atrás/acima dele) — sobre o MESMO fundo (GradientBars, uma
  // instância só) que permanece parado. Mesmo padrão mecânico de container
  // alto + sticky do zoom do lobby e do slide horizontal anterior, mas a
  // posição de cada card agora é função do ÍNDICE corrente (via
  // getCardMotionState), animada pelo Motion (`animate`, duração fixa) —
  // não mais uma função contínua do scroll (`useTransform`). Único jeito
  // de garantir "nunca fica parado no meio" (pedido explícito): sem uma
  // posição intermediária controlada por scroll, não tem como travar nela.
  //
  // z-index calculado em `style` (não em `animate`): não faz sentido
  // ANIMAR/interpolar z-index (não tem "meio termo" visual), precisa
  // trocar no instante em que o índice muda, pro card que está subindo já
  // nascer por cima do que ele vai cobrir. initial={false}: sem entrada
  // animada no primeiro mount (os 3 já nascem nas posições certas).
  //
  // conteúdo real no card CORRENTE (imediato) e no ANTERIOR (até
  // lastCardIndex alcançar currentCardIndex, ver useEffect com o
  // setTimeout acima) — os demais caem pra um CardFrame vazio (só a
  // moldura, sem children).
  //
  // overflow-hidden no wrapper sticky não é decorativo: sem ele, os cards
  // em y:"100%" (fora de tela, embaixo) expandiriam a região de scroll
  // VERTICAL da página inteira além do que o container pinado já reserva.
  return (
    <div ref={containerRef} className="relative" style={{ height: `${PIN_SCROLL_HEIGHT_VH}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        <GradientBars numBars={15} animationDuration={2} className="z-0" />

        {(() => {
          const oqfMotion = getCardMotionState(0, currentCardIndex)
          const metodoMotion = getCardMotionState(1, currentCardIndex)
          const faqMotion = getCardMotionState(2, currentCardIndex)
          return (
            <>
              <motion.div
                id="o-que-fazemos"
                initial={false}
                animate={{ y: oqfMotion.y }}
                transition={{ duration: CARD_TRANSITION_DURATION, ease: [0.22, 1, 0.36, 1] }}
                onUpdate={handleCardUpdate(0)}
                style={{ zIndex: oqfMotion.zIndex }}
                inert={currentCardIndex !== 0}
                className="absolute inset-0 flex items-center justify-center"
              >
                {currentCardIndex === 0 || lastCardIndex === 0 ? <ServiceCard activeIndex={activeIndex} onSelect={setActiveIndex} /> : <CardFrame />}
              </motion.div>

              <motion.div
                id="metodo"
                initial={false}
                animate={{ y: metodoMotion.y }}
                transition={{ duration: CARD_TRANSITION_DURATION, ease: [0.22, 1, 0.36, 1] }}
                onUpdate={handleCardUpdate(1)}
                style={{ zIndex: metodoMotion.zIndex }}
                inert={currentCardIndex !== 1}
                className="absolute inset-0 flex items-center justify-center"
              >
                {currentCardIndex === 1 || lastCardIndex === 1 ? <MetodoCard /> : <CardFrame />}
              </motion.div>

              <motion.div
                id="faq"
                initial={false}
                animate={{ y: faqMotion.y }}
                transition={{ duration: CARD_TRANSITION_DURATION, ease: [0.22, 1, 0.36, 1] }}
                onUpdate={handleCardUpdate(2)}
                style={{ zIndex: faqMotion.zIndex }}
                inert={currentCardIndex !== 2}
                className="absolute inset-0 flex items-center justify-center"
              >
                {currentCardIndex === 2 || lastCardIndex === 2 ? <FaqCard /> : <CardFrame />}
              </motion.div>
            </>
          )
        })()}
      </div>
    </div>
  )
}
