"use client"

import { ReactLenis } from "lenis/react"
import type { ReactNode } from "react"

// scroll amortecido global (project.md, seção 7 — "Smooth scroll: Lenis").
// Sem isso, o scroll do mouse/trackpad avança em incrementos discretos, e
// tudo que é scroll-linked (useScroll/useTransform do Motion no lobby: o
// zoom da tv, o deslocamento, o fade do "EXPLORAR", a órbita das pedras)
// atualiza em saltos perceptíveis — "em degraus" em vez de contínuo.
//
// root: opera direto no window/document.documentElement (mesmo scroll
// nativo que o resto do site já usa via useScroll), não um wrapper/content
// isolado — position:sticky, IntersectionObserver etc. continuam
// funcionando sem mudança em nenhum outro componente.
//
// Só Motion + Lenis por enquanto (não GSAP ScrollTrigger): pra um zoom out
// simples entre seções, Motion + sticky já resolve. GSAP só entraria se
// precisássemos encadear várias etapas sincronizadas num mesmo pin.
export function LenisProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2 }}>
      {children}
    </ReactLenis>
  )
}
