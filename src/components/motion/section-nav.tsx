"use client"

import { useEffect, useMemo, useState } from "react"
import { useMotionValueEvent, useScroll } from "motion/react"
import {
  LOBBY_SCROLL_HEIGHT_VH,
  getActiveLobbySection,
  getLobbySections,
  useIsMobileLayout,
} from "@/components/motion/lobby"

// substitui a scrollbar tradicional: barras horizontais empilhadas à
// direita, meia altura, indicando a seção atual pela cor (branco vs cinza).
export function SectionNav() {
  const isMobileLayout = useIsMobileLayout()
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

  // TEMPORÁRIO: as 2 primeiras seções (início/portfólio) ainda não existem
  // como elementos reais no DOM (o lobby ocupa o topo da página sozinho),
  // então usamos o progresso do próprio scroll do lobby (mesma tabela que
  // o Lobby usa) enquanto o scroll ainda está dentro do lobby. A PARTIR
  // DAÍ (y > lobbyMaxScroll, já saiu do lobby), este efeito para de mexer
  // no activeId — o IntersectionObserver abaixo assume sozinho pra
  // qualquer seção real no DOM (o-que-fazemos e as próximas). Sem esse
  // guard, este handler dispara em TODO scroll da página inteira (não só
  // dentro do lobby) e ficava sobrescrevendo o que o observer acabou de
  // setar, sempre de volta pra "portfolio" — por isso o nav não
  // acompanhava a seção 3 em diante.
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", (y) => {
    const lobbyMaxScroll = (LOBBY_SCROLL_HEIGHT_VH / 100) * window.innerHeight - window.innerHeight
    if (lobbyMaxScroll <= 0 || y > lobbyMaxScroll) return
    const progress = y / lobbyMaxScroll
    const lobbySections = getLobbySections(isMobileLayout)
    const activeIndex = getActiveLobbySection(progress, isMobileLayout)
    // mobile: "início" (índice 0) nunca vira o activeId — SECTIONS já não
    // tem ponto pra ela (ver useSections), então cai sempre em
    // "portfólio" (o próprio SECTIONS[0] no mobile).
    setActiveId(isMobileLayout ? lobbySections[1].id : lobbySections[activeIndex].id)
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
