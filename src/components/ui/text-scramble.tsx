"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*"

interface TextScrambleProps {
  text: string
  className?: string
  onClick?: () => void
  // dispara o scramble sozinho, em loop, sem depender de hover — usado no
  // loader (texto "CARREGANDO"), que não é clicável. Quando true, renderiza
  // como <div> (não <button>) e some com chevron/glow/sublinhado-no-hover,
  // affordances que só fazem sentido pra um elemento interativo.
  autoScramble?: boolean
}

// intervalo (ms) entre repetições do scramble no modo autoScramble — dá o
// efeito de "piscando/carregando" continuamente enquanto o loader roda.
const AUTO_SCRAMBLE_INTERVAL_MS = 1400

// cores diretas (branco/preto), não os tokens semânticos do shadcn
// (text-foreground, bg-primary, bg-border) — esses assumem um tema claro
// e ficariam quase invisíveis contra o fundo preto do lobby.
export function TextScramble({ text, className = "", onClick, autoScramble = false }: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(text)
  const [isHovering, setIsHovering] = useState(false)
  const [isScrambling, setIsScrambling] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const frameRef = useRef(0)

  const scramble = useCallback(() => {
    setIsScrambling(true)
    frameRef.current = 0
    const duration = text.length * 3

    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      frameRef.current++

      const progress = frameRef.current / duration
      const revealedLength = Math.floor(progress * text.length)

      const newText = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " "
          if (i < revealedLength) return text[i]
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        })
        .join("")

      setDisplayText(newText)

      if (frameRef.current >= duration) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setDisplayText(text)
        setIsScrambling(false)
      }
    }, 30)
  }, [text])

  const handleMouseEnter = () => {
    setIsHovering(true)
    scramble()
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
  }

  useEffect(() => {
    if (!autoScramble) return
    // setTimeout(0), não chamada direta: setState síncrono dentro do corpo
    // do efeito dispara cascading renders (regra do react-hooks) — adiar
    // pra fora do corpo síncrono resolve, sem atraso perceptível.
    const kickoff = setTimeout(scramble, 0)
    const loop = setInterval(scramble, AUTO_SCRAMBLE_INTERVAL_MS)
    return () => {
      clearTimeout(kickoff)
      clearInterval(loop)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- scramble já depende de text
  }, [autoScramble, text])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const content = (
    <>
      <span className="relative flex items-center gap-2 font-mono text-sm tracking-widest uppercase">
        {displayText.split("").map((char, i) => (
          <span
            key={i}
            className={`inline-block transition-all duration-150 ${
              isScrambling && char !== text[i] ? "scale-110 text-white" : "text-white/80"
            }`}
            style={{
              transitionDelay: `${i * 10}ms`,
            }}
          >
            {char}
          </span>
        ))}
        {!autoScramble && (
          <ChevronDown
            aria-hidden="true"
            className={`h-3.5 w-3.5 shrink-0 text-white/80 transition-transform duration-300 ${
              isHovering ? "translate-y-0.5" : ""
            }`}
          />
        )}
      </span>

      {!autoScramble && (
        <>
          {/* linha animada */}
          <span className="relative mt-2 h-px w-full overflow-hidden">
            <span
              className={`absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 ease-out ${
                isHovering ? "scale-x-100" : ""
              }`}
            />
            <span className="absolute inset-0 bg-white/20" />
          </span>

          {/* glow sutil no hover */}
          <span
            className={`absolute -inset-4 -z-10 rounded-lg bg-white/5 opacity-0 transition-opacity duration-300 ${
              isHovering ? "opacity-100" : ""
            }`}
          />
        </>
      )}
    </>
  )

  if (autoScramble) {
    return <div className={`relative inline-flex flex-col select-none ${className}`}>{content}</div>
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative inline-flex flex-col appearance-none border-0 bg-transparent p-0 text-left select-none ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {content}
    </button>
  )
}
