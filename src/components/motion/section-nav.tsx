"use client"

import { useEffect, useState } from "react"

// seções da home (project.md, seção 6: Início · Portfólio · O que
// fazemos · Método · FAQ · Contato).
const SECTIONS = [
  { id: "inicio", label: "Início" },
  { id: "portfolio", label: "Portfólio" },
  { id: "o-que-fazemos", label: "O que fazemos" },
  { id: "metodo", label: "Método" },
  { id: "faq", label: "FAQ" },
  { id: "contato", label: "Contato" },
]

// substitui a scrollbar tradicional: barras horizontais empilhadas no
// canto inferior direito, indicando a seção atual pela cor (branco vs cinza).
export function SectionNav() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id)

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
      className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-4 sm:bottom-8 sm:right-8"
    >
      {SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          aria-label={section.label}
          aria-current={activeId === section.id ? "true" : undefined}
          className={`h-0.5 w-8 rounded-full transition-colors duration-300 hover:bg-white ${
            activeId === section.id ? "bg-white" : "bg-gray-500"
          }`}
        />
      ))}
    </nav>
  )
}
