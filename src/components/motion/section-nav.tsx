"use client"

import { useEffect, useMemo, useState } from "react"
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react"
import { useLenis } from "lenis/react"
import {
  LOBBY_SCROLL_HEIGHT_VH,
  getActiveLobbySection,
  getLobbySections,
  getSectionThreeStart,
  useIsMobileLayout,
} from "@/components/motion/lobby"
import { getFaqScrollTarget, getMetodoScrollTarget } from "@/components/sections/o-que-fazemos"

// substitui a scrollbar tradicional: barras horizontais empilhadas à
// direita, meia altura, indicando a seção atual pela cor (branco vs cinza).
export function SectionNav() {
  const isMobileLayout = useIsMobileLayout()
  const prefersReducedMotion = useReducedMotion()
  const lenis = useLenis()
  // seções da home (project.md, seção 6: Início · Portfólio · O que
  // fazemos · Método · FAQ · Contato). As 2 primeiras vêm de
  // getLobbySections — fonte única de verdade compartilhada com o Lobby,
  // que já define onde (no scroll) cada uma começa, já que ainda não
  // existem como elementos reais no DOM (o lobby ocupa o topo da página
  // sozinho). As demais já são seções reais no DOM: o IntersectionObserver
  // abaixo assume pra elas.
  //
  // mobile: "início" nunca aparece como ponto separado — no mobile ela
  // mostra a MESMA tela que "portfólio" desde o início (ver comentário
  // grande em getLobbySections, no lobby.tsx), então incluir os dois
  // pontos aqui faria o nav "avançar" sem nenhuma mudança visual
  // correspondente. Só "portfólio" entra, já como primeiro ponto.
  const SECTIONS = useMemo(() => {
    const lobbySections = getLobbySections(isMobileLayout)
    const leading = isMobileLayout ? lobbySections.slice(1) : lobbySections
    return [
      ...leading.map(({ id, label }) => ({ id, label })),
      { id: "o-que-fazemos", label: "O que fazemos" },
      { id: "metodo", label: "Método" },
      { id: "faq", label: "FAQ" },
      { id: "contato", label: "Contato" },
    ]
  }, [isMobileLayout])
  const [activeId, setActiveId] = useState(SECTIONS[0].id)
  // isMobileLayout só é confirmado depois do mount (ver useIsMobileLayout
  // no lobby.tsx) — o valor inicial de activeId acima usa o SSR/primeiro
  // render (sempre desktop, "inicio"). Se o dispositivo for mobile de
  // verdade, "inicio" some da lista (ver SECTIONS acima) e activeId
  // ficaria "preso" num id que não existe mais em nenhum ponto do nav até
  // o próximo evento de scroll/interseção — sincroniza assim que SECTIONS
  // muda, só quando o id atual deixou de ser válido (não reseta à toa se
  // o usuário já tiver avançado pra outra seção real).
  useEffect(() => {
    const syncActiveIdIfStale = () => {
      setActiveId((current) => (SECTIONS.some((section) => section.id === current) ? current : SECTIONS[0].id))
    }
    syncActiveIdIfStale()
  }, [SECTIONS])

  // TEMPORÁRIO (desktop only): "início"/"portfólio" ainda não existem como
  // elementos reais no DOM lá (o lobby ocupa o topo da página sozinho, com
  // scroll-jacking — ver lobby.tsx), então usamos o progresso do próprio
  // scroll do lobby (mesma tabela que o Lobby usa) enquanto o scroll ainda
  // está dentro do lobby. A PARTIR DAÍ (y > lobbyMaxScroll, já saiu do
  // lobby), este efeito para de mexer no activeId — o IntersectionObserver
  // abaixo assume sozinho pra qualquer seção real no DOM (o-que-fazemos e
  // as próximas). Sem esse guard, este handler dispara em TODO scroll da
  // página inteira (não só dentro do lobby) e ficava sobrescrevendo o que
  // o observer acabou de setar, sempre de volta pra "portfolio" — por isso
  // o nav não acompanhava a seção 3 em diante.
  //
  // Mobile nem entra aqui: a section 2 (id="portfolio") já é um elemento
  // real no DOM lá (sem scroll-jacking, ver o branch isMobileLayout em
  // Lobby()), então o IntersectionObserver abaixo já cobre ela sozinho,
  // junto com o-que-fazemos/método/faq/contato — nenhuma tabela de
  // progresso simulada é necessária.
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", (y) => {
    // último degrau da página (footer, id="contato"): mais baixo que a
    // viewport, então nunca cruza a faixa central de 20% que o
    // IntersectionObserver abaixo usa pra decidir "seção ativa" (rootMargin
    // "-40% 0px -40% 0px") — rolando até o fim de verdade, ele fica preso
    // na faixa DE BAIXO da tela, nunca no meio. Sem isso, o ponto "Contato"
    // nunca acende, mesmo com o rodapé inteiro visível. Só força quando
    // está realmente no fim (scroll não tem mais pra onde ir, com 2px de
    // folga pra arredondamento) — em qualquer outro ponto o
    // IntersectionObserver continua sendo a única fonte de verdade.
    if (y + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      setActiveId(SECTIONS[SECTIONS.length - 1].id)
      return
    }
    if (isMobileLayout) return
    const lobbyMaxScroll = (LOBBY_SCROLL_HEIGHT_VH / 100) * window.innerHeight - window.innerHeight
    if (lobbyMaxScroll <= 0 || y > lobbyMaxScroll) return
    const progress = y / lobbyMaxScroll
    const lobbySections = getLobbySections(isMobileLayout)
    const activeIndex = getActiveLobbySection(progress, isMobileLayout)
    setActiveId(lobbySections[activeIndex].id)
  })

  useEffect(() => {
    const elements = SECTIONS.map((section) =>
      document.getElementById(section.id)
    ).filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (mostVisible) setActiveId(mostVisible.target.id)
      },
      // threshold inclui 0: uma seção mais alta que a viewport nunca atinge
      // uma intersecção de 10% da própria área com essa rootMargin (a faixa
      // central "enxergada" é só 20% da viewport) — sem o 0 na lista, o
      // browser nunca cruza nenhum threshold configurado pra ela e o
      // callback simplesmente para de disparar depois da chamada inicial.
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [SECTIONS])

  return (
    <nav
      aria-label="Navegação de seções"
      // z-[60]: fica acima do lobby (z-50), visível mesmo antes de sair dele.
      className="fixed right-5 bottom-5 z-[60] flex flex-col items-end gap-4 sm:right-8 sm:bottom-8"
    >
      {SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          aria-label={section.label}
          aria-current={activeId === section.id ? "true" : undefined}
          // "o-que-fazemos"/"metodo"/"faq": âncora nativa (href="#id") não
          // dá conta pra NENHUM dos três — os três cards são absolute
          // inset-0 dentro do MESMO wrapper sticky no branch pinado do
          // desktop (ver o-que-fazemos.tsx), então os três SEMPRE reportam a
          // mesma posição vertical (getBoundingClientRect().top já é 0, "já
          // chegou") não importa em qual sub-posição do slide o scroll
          // esteja — só a posição horizontal (translateX) muda. Clicar em
          // "O que fazemos" a partir do estado com #metodo visível
          // confirma isso na prática: a âncora nativa vê o elemento já
          // "no topo" e não rola nada, deixando o slide horizontal
          // errado no lugar (bug encontrado testando a versão que só
          // interceptava "metodo") — precisa do alvo calculado explícito
          // nos TRÊS. Só intercepta quando o branch pinado está de fato
          // ativo (!isMobileLayout && !prefersReducedMotion) — nos dois
          // fallbacks (mobile, reduced-motion) as três são sections
          // empilhadas normais, com geometria vertical PRÓPRIA cada uma, e
          // a âncora nativa já resolve certo.
          onClick={(event) => {
            if (isMobileLayout || prefersReducedMotion) return
            // lock: true — sem isso, navegar pra "metodo" (alvo além de
            // sectionThreeStart) animava PASSANDO por esse limiar, e o
            // auto-advance do lobby (que observa QUALQUER scroll cruzando
            // sectionThreeStart em direção positiva, não só rolagem real
            // de wheel/touch — ver lobby.tsx) sequestrava a animação no
            // meio do caminho, sobrescrevendo com o PRÓPRIO alvo dele
            // (bug encontrado testando: clicar "Método" pousava em "O que
            // fazemos"). lock:true trava o Lenis pela duração inteira
            // dessa navegação — scrollTo() do Lenis já rejeita qualquer
            // OUTRA chamada de scrollTo (inclusive a do auto-advance)
            // enquanto isLocked, então a navegação clicada sempre vence.
            if (section.id === "metodo") {
              event.preventDefault()
              lenis?.scrollTo(getMetodoScrollTarget(), { lock: true })
            } else if (section.id === "faq") {
              event.preventDefault()
              lenis?.scrollTo(getFaqScrollTarget(), { lock: true })
            } else if (section.id === "o-que-fazemos") {
              event.preventDefault()
              lenis?.scrollTo(getSectionThreeStart(), { lock: true })
            }
          }}
          // inativo: bem apagado (opacidade baixa, sem brilho) — ativo:
          // mais alto, opacidade cheia e um glow, pra contrastar de
          // verdade contra o fundo escuro (bg-gray-300 antigo quase não se
          // diferenciava do bg-white do ativo). largura fixa nos dois
          // estados — só altura, opacidade e brilho mudam.
          className={`w-8 rounded-full transition-all duration-300 ${
            activeId === section.id
              ? "h-1 bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.7)]"
              : "h-0.5 bg-white/25 hover:bg-white/60"
          }`}
        />
      ))}
    </nav>
  )
}
