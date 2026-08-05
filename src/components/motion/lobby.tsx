"use client"

import { useEffect } from "react"
import { useReducedMotion } from "motion/react"
import { AsciiArt } from "@/components/ui/mo-mosaic"
import { MouseResponsiveBackground } from "@/components/ui/mouse-responsive-background"

// mesmo poster usado pelo <AsciiArt>, servido como fallback estático
// quando o usuário prefere motion reduzido (project.md, seção 10).
const POSTER_SRC =
  "https://assets.21st.dev/ascii-recipes/thumbnails/user_39AUrstSGWJUKmRU9spgBJgd1hs/95b377f8-e226-434d-be5c-2c7159b3e244.webp"

// margem única da moldura (esquerda, direita, topo). Um só valor: left,
// right e a largura calculada nunca desincronizam entre si.
const FRAME_MARGIN = 16 // px

// TODO: por enquanto sem saída definida (texto "Acessando..." e barra de
// progresso desativados). Sai e revela o site quando a transição real
// loader→hero for definida (project.md, seção 12).
export function Lobby() {
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute inset-0 overflow-hidden">
        {prefersReducedMotion ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={POSTER_SRC}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <MouseResponsiveBackground className="absolute left-0 top-0 h-[110%] w-[110%]">
            <AsciiArt className="h-full w-full" />
          </MouseResponsiveBackground>
        )}
      </div>

      {/* moldura decorativa: acompanha o tamanho da tela, sempre a 16px
          das bordas esquerda, direita e topo (proporção original do svg
          define a altura, sem margem fixa embaixo). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/bg-frame.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed z-20 h-auto"
        style={{
          left: FRAME_MARGIN,
          right: FRAME_MARGIN,
          top: FRAME_MARGIN,
          width: `calc(100vw - ${FRAME_MARGIN * 2}px)`,
        }}
      />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6">
        {prefersReducedMotion ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/images/logo-centralized.svg"
            alt="Fantom"
            className="w-[416px] sm:w-[416px]"
          />
        ) : (
          <MouseResponsiveBackground>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-centralized.svg"
              alt="Fantom"
              className="w-[416px] sm:w-[416px]"
            />
          </MouseResponsiveBackground>
        )}
        {/* TODO: texto "Acessando..." + barra de progresso desativados por
            enquanto (project.md, seção 12). */}
      </div>

      {/* espelha exatamente a caixa do botão de menu (mesma altura h-11,
          mesmos offsets top/left↔right) pra alinhar os centros visuais. */}
      <div className="absolute left-5 top-5 z-20 flex h-11 items-center sm:left-8 sm:top-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-left.svg" alt="Fantom" className="max-w-[88px]" />
      </div>

      {/* TODO: sem funcionalidade ainda, só o visual do botão (menu real vem depois). */}
      <button
        type="button"
        aria-label="Abrir menu"
        className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center sm:right-8 sm:top-8"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-menu.svg" alt="" className="h-6 w-6" />
      </button>
    </div>
  )
}