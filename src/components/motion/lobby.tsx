"use client"

import { useEffect } from "react"
import { useReducedMotion } from "motion/react"
import { AsciiArt } from "@/components/ui/mo-mosaic"

// mesmo poster usado pelo <AsciiArt>, servido como fallback estático
// quando o usuário prefere motion reduzido (project.md, seção 10).
const POSTER_SRC =
  "https://assets.21st.dev/ascii-recipes/thumbnails/user_39AUrstSGWJUKmRU9spgBJgd1hs/95b377f8-e226-434d-be5c-2c7159b3e244.webp"

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
      <div className="absolute inset-0">
        {prefersReducedMotion ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={POSTER_SRC}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <AsciiArt className="h-full w-full" />
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
        className="pointer-events-none fixed left-2 right-2 top-3 z-20 h-auto w-[calc(100vw-16px)]"
      />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-centralized.svg"
          alt="Fantom"
          className="w-56 sm:w-80"
        />
        {/* TODO: texto "Acessando..." + barra de progresso desativados por
            enquanto (project.md, seção 12). */}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-left.png"
        alt="Fantom"
        className="absolute left-5 top-8 z-20 max-w-[88px] sm:left-8 sm:top-8"
      />

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