"use client"

import { useEffect, useRef } from "react"
import { useAnimate, useReducedMotion } from "motion/react"

const ORBIT_POINTS = 32
// duração do trecho final até sair de tela quando a section 2 termina —
// rápida (fast-forward), mas ainda uma curva, nunca uma linha reta.
const EXIT_DURATION = 2.2
const EXIT_POINTS = 20

// gera os keyframes de um trecho da elipse (de fromT a toT, 0 a 1 = uma
// volta completa), começando no ângulo 180° em t=0 — o ponto mais à
// esquerda do centro da órbita, onde fica o "ponto de entrada", fora da
// tela. sentido horário ou anti-horário conforme `reverse`, pra cada
// pedra orbitar num sentido oposto à outra.
function buildArcPath(
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  reverse: boolean,
  fromT: number,
  toT: number,
  points: number
) {
  const x: string[] = []
  const y: string[] = []
  const rotate: number[] = []
  for (let i = 0; i <= points; i++) {
    const t = fromT + ((toT - fromT) * i) / points
    const angle = Math.PI + t * Math.PI * 2 * (reverse ? -1 : 1)
    x.push(`${(centerX + Math.cos(angle) * radiusX).toFixed(2)}vw`)
    y.push(`${(centerY + Math.sin(angle) * radiusY).toFixed(2)}vh`)
    rotate.push(t * 360 * (reverse ? -1 : 1))
  }
  return { x, y, rotate }
}

// pedra que orbita como um elétron ao redor do núcleo (a tela inteira do
// dispositivo): uma volta de elipse contínua e fechada, sempre no mesmo
// sentido — nada de ida e volta na mesma linha. a órbita de cada pedra
// nunca cruza pro outro lado do centro (raio = metade de |entryX|), então
// a borda mais próxima é sempre a sua própria entryX — não precisa
// escolher entre as duas.
//
// restrita à section 2: assim que `active` vira false a pedra NÃO some
// nem corta reto pro ponto de entrada (isso pareceria mudar de direção
// ainda visível em tela) — ela segue a mesma curva, em fast-forward, até
// o mais próximo dos dois pontos fora da tela (t=0 ou t=1, os dois lados
// do ângulo 180°), pra nunca precisar atravessar o trecho perto do centro
// da tela antes de sair.
export function FloatingRock({
  src,
  className,
  active,
  entryX, // vw, com sinal: negativo = entra pela esquerda, positivo pela direita
  driftY = 18, // vh, raio vertical da órbita
  duration = 16,
  delay = 0,
  reverse = false,
}: {
  src: string
  className?: string
  active: boolean
  entryX: number
  driftY?: number
  duration?: number
  delay?: number
  reverse?: boolean
}) {
  const prefersReducedMotion = useReducedMotion()
  const [scope, animate] = useAnimate()
  const startedRef = useRef(false)
  // timestamp (ms) de quando a volta atual começou — usado só pra saber
  // em que ponto da elipse (fração t, 0 a 1) a pedra está quando precisa
  // sair, pra continuar dali em vez de cortar reto.
  const lapStartRef = useRef(0)

  useEffect(() => {
    if (prefersReducedMotion) {
      animate(scope.current, { x: active ? "0vw" : `${entryX}vw` }, { duration: 0.4 })
      return
    }

    let cancelled = false
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    const centerX = entryX / 2
    // sinal invertido (não Math.abs): garante que o ângulo 180°, o ponto
    // de partida da órbita, caia exatamente em entryX (fora da tela) pros
    // dois sinais de entryX — com abs() isso só valia pro lado negativo, e
    // a pedra que entra pela direita nascia já perto do centro em vez de
    // vir de fora.
    const radiusX = -centerX

    async function run() {
      if (active) {
        if (!startedRef.current && delay > 0) {
          await wait(delay * 1000)
          if (cancelled) return
        }
        startedRef.current = true

        const path = buildArcPath(centerX, 0, radiusX, driftY, reverse, 0, 1, ORBIT_POINTS)
        lapStartRef.current = performance.now()

        // órbita contínua (repete infinitamente); quando `active` virar
        // false o efeito reroda e essa chamada é interrompida pelo
        // Motion — a próxima animação (abaixo) parte suavemente de onde
        // ela estiver.
        await animate(
          scope.current,
          { x: path.x, y: path.y, rotate: [0, reverse ? -360 : 360] },
          { duration, ease: "linear", repeat: Infinity }
        )
      } else if (startedRef.current) {
        // fração da volta já percorrida (0 a 1). t=0 e t=1 são o mesmo
        // ponto físico (ângulo 180°, fora da tela) — só que por lados
        // opostos da elipse. Segue pro mais próximo dos dois: se ainda não
        // passou da metade (< 0.5), volta (retrocede) até t=0 em vez de
        // continuar até t=1 — senão a pedra precisaria atravessar o ponto
        // mais perto do centro da tela antes de conseguir sair. Retroceder
        // é só reproduzir ao contrário o trecho que ela acabou de
        // percorrer, então continua parecendo uma curva natural, não um
        // corte reto nem uma inversão brusca.
        const elapsedMs = performance.now() - lapStartRef.current
        const tNow = (elapsedMs % (duration * 1000)) / (duration * 1000)
        const goBackward = tNow <= 0.5
        const targetT = goBackward ? 0 : 1
        const path = buildArcPath(centerX, 0, radiusX, driftY, reverse, tNow, targetT, EXIT_POINTS)
        // trecho mais curto = saída mais rápida; nunca mais que meia volta.
        const exitDuration = EXIT_DURATION * (Math.abs(targetT - tNow) / 0.5)

        await animate(
          scope.current,
          { x: path.x, y: path.y, rotate: path.rotate },
          { duration: Math.max(exitDuration, 0.3), ease: "easeOut" }
        )
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [active, animate, delay, driftY, duration, entryX, prefersReducedMotion, reverse, scope])

  return (
    <img
      ref={scope as never}
      src={src}
      alt=""
      aria-hidden="true"
      className={className}
      // posição estática de partida, fora da tela — evita que a pedra
      // apareça no centro por um instante antes do efeito acima rodar
      // (ex.: primeiro paint, ainda na section 1).
      style={{ transform: `translate(${entryX}vw, 0px)` }}
    />
  )
}
