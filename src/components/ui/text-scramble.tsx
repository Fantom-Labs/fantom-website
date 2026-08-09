"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*"

interface TextScrambleProps {
  text: string
  className?: string
  onClick?: () => void
}

// cores diretas (branco/preto), não os tokens semânticos do shadcn
// (text-foreground, bg-primary, bg-border) — esses assumem um tema claro
// e ficariam quase invisíveis contra o fundo preto do lobby.
export function TextScramble({ text, className = "", onClick }: TextScrambleProps) {
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
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative inline-flex cursor-pointer flex-col appearance-none border-0 bg-transparent p-0 text-left select-none ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="relative flex items-center gap-2 font-mono text-lg tracking-widest uppercase">
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
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-white/80 transition-transform duration-300 ${
            isHovering ? "translate-y-0.5" : ""
          }`}
        />
      </span>

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
    </button>
  )
}
