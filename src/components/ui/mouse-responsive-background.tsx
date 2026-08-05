"use client"

import { useEffect, useRef, type ReactNode } from "react"

// Envolve o conteúdo (imagem, vídeo, etc.) num elemento levemente maior
// que se desloca com o mouse, criando parallax. O pai precisa ter
// overflow-hidden pra esconder o excedente de 10%.
export function MouseResponsiveBackground({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleMouseMove = (e: MouseEvent) => {
      const windowWidth = window.innerWidth / 5
      const windowHeight = window.innerHeight / 5
      const mouseX = e.clientX / windowWidth
      const mouseY = e.clientY / windowHeight
      el.style.transform = `translate3d(-${mouseX}%, -${mouseY}%, 0)`
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{ transform: "translate3d(0, 0, 0)" }}
    >
      {children}
    </div>
  )
}
