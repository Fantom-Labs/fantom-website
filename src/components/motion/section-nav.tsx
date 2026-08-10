"use client"

import { useEffect, useState } from "react"
import { useMotionValueEvent, useScroll } from "motion/react"
import { LOBBY_SCROLL_HEIGHT_VH, LOBBY_SECTIONS, getActiveLobbySection } from "@/components/motion/lobby"

// seções da home (project.md, seção 6: Início · Portfólio · O que
// fazemos · Método · FAQ · Contato). As 2 primeiras vêm de LOBBY_SECTIONS
// — fonte única de verdade compartilhada com o Lobby, que já define onde
// (no scroll) cada uma começa. As demais já são (ou serão) seções reais
// no DOM: o IntersectionObserver abaixo assume pra elas.
const SECTIONS = [
  ...LOBBY_SECTIONS.map(({ id, label }) => ({ id, label })),
  { id: "o-que-fazemos", label: "O que fazemos" },
  { id: "metodo", label: "Método" },
  { id: "faq", label: "FAQ" },
  { id: "contato", label: "Contato" },
]

// substitui a scrollbar tradicional: barras horizontais empilhadas à
// direita, meia altura, indicando a seção atual pela cor (branco vs cinza).
export function SectionNav() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id)

  // TEMPORÁRIO: ainda não existem seções reais no DOM pra observar (o
  // lobby ocupa o topo da página sozinho), então usamos o progresso do
  // próprio scroll do lobby (mesma tabela LOBBY_SECTIONS que o Lobby usa)
  // pra saber em qual das 3 primeiras seções estamos. Quando as seções
  // reais existirem, o IntersectionObserver abaixo assume — pras 6.
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", (y) => {
    const lobbyMaxScroll = (LOBBY_SCROLL_HEIGHT_VH / 100) * window.innerHeight - window.innerHeight
    if (lobbyMaxScroll <= 0) return
    const progress = y / lobbyMaxScroll
    setActiveId(LOBBY_SECTIONS[getActiveLobbySection(progress)].id)
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
      { rootMargin: "-40% 0px -40% 0px", threshold: [0.1, 0.25, 0.5, 0.75, 1] }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

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
          className={`h-0.5 w-8 rounded-full transition-colors duration-300 hover:bg-white ${
            activeId === section.id ? "bg-white" : "bg-gray-300"
          }`}
        />
      ))}
    </nav>
  )
}
