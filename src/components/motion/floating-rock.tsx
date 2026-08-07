"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimate, useAnimationFrame, useMotionValue, useReducedMotion, useSpring } from "motion/react"

const ORBIT_POINTS = 48
// duração do trecho final até sair de tela quando a section 2 termina —
// rápida (fast-forward), mas ainda uma curva, nunca uma linha reta.
const EXIT_DURATION = 2.2
const EXIT_POINTS = 20

// raio (px) em volta da pedra onde o cursor passa a "empurrar" ela pra
// longe — e o deslocamento máximo (px) desse empurrão, bem no centro do
// raio. Raio generoso de propósito: precisa reagir só de chegar perto, não
// só quando o cursor está quase em cima. Força continua sutil (pedido:
// "não muito forte").
const GRAVITY_RADIUS = 380
const GRAVITY_STRENGTH = 32

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
// sentido — nada de ida e volta na mesma linha. o centro da elipse é o
// centro real da viewport (não um ponto no meio do caminho até entryX) e
// o raio horizontal cobre a distância inteira até o lado oposto — os dois
// vértices da elipse (ângulo 180° e 0°) ficam fora da tela, um de cada
// lado. É o que faz a pedra atravessar de uma borda até a outra a cada
// meia volta, em vez de encostar perto do centro da tela e voltar pro
// mesmo lado (o que acontecia quando o raio ia só até o meio do caminho).
//
// restrita à section 2: assim que `active` vira false a pedra NÃO some
// nem corta reto pro ponto de entrada (isso pareceria mudar de direção
// ainda visível em tela) — ela segue a mesma curva, em fast-forward, até
// o mais próximo dos três pontos fora da tela (t=0, t=0.5 ou t=1 — os dois
// vértices da elipse, um de cada lado), pra nunca precisar atravessar o
// trecho perto do centro da tela antes de sair.
//
// interatividade com o cursor: a órbita em si (acima) não muda — quem
// controla a posição (ref={scope}) é sempre ela. por cima, um elemento
// interno recebe um deslocamento extra (spring) empurrando pra longe do
// cursor sempre que ele chega perto (sutil, não muito forte) — soma-se à
// posição orbital, nunca a substitui.
//
// três camadas de transform SEPARADAS, de propósito (ver JSX no final):
// `scope` (posição, x/y da órbita) > wrapper de gravidade (x/y do cursor)
// > wrapper de rotação (o giro da órbita) > img. A rotação PRECISA estar
// isolada num wrapper à parte porque a máscara da tv (abaixo) é aplicada
// no `scope` — se estivesse num elemento que também gira, o RECORTE
// giraria junto com a pedra (o corte pixel a pixel é feito no espaço
// local do elemento, antes do transform de rotação ser aplicado), fazendo
// a borda do corte parecer horizontal, vertical, ou qualquer ângulo
// dependendo de onde a pedra está no giro — em vez de sempre alinhada com
// a borda real da tela.
//
// "entra na tv": fica visível normalmente enquanto atravessa por cima da
// tela da tv — ao cruzar a borda PRA FORA da máscara, de volta pro resto
// da viewport, some só a parte que já saiu, imediatamente (como se
// estivesse entrando na tv ali), não a pedra inteira de uma vez. Pra isso
// aplicamos no `scope` (não-rotacionado) o mesmo tv-mask.png (não
// invertido), com mask-size/mask-position em px explícitos que compensam
// a posição atual dele — o navegador faz o recorte pixel a pixel em tempo
// real, sem nenhum fade calculado (ver getTvMaskStyle em lobby.tsx). A
// máscara LIGA na transição de "toda dentro" (os 4 cantos do retângulo,
// não só o centro — perto de uma borda curva da tela o centro cruzaria
// bem antes do resto do corpo, cortando a entrada também) pra "não mais
// toda dentro" — é aí que ela começou a sair por algum lado — e só
// DESLIGA (trocando pro opacity:0 final) quando os 4 cantos já saíram por
// completo — nunca antes: enquanto sobrar qualquer canto dentro, ainda
// existe um pedacinho visível sendo recortado pela máscara, e cortar pro
// escondido antes disso faria esse resto sumir de repente, num pulo, em
// vez de continuar encolhendo suavemente até não sobrar nada. É
// direcional (importa se está entrando ou saindo), então precisa de
// estado por frame (useAnimationFrame) — não dá pra fazer só com CSS
// mask-image estático e nada mais. Uma vez escondida, só volta a
// aparecer quando a órbita chega de novo no ponto de entrada (fora da
// tela) — nunca reaparece flutuando no meio do caminho.
export function FloatingRock({
  src,
  className,
  active,
  entryX, // vw, com sinal: negativo = entra pela esquerda, positivo pela direita
  driftY = 18, // vh, raio vertical da órbita
  duration = 16,
  delay = 0,
  reverse = false,
  isInsideTvMask,
  getTvMaskStyle,
}: {
  src: string
  className?: string
  active: boolean
  entryX: number
  driftY?: number
  duration?: number
  delay?: number
  reverse?: boolean
  isInsideTvMask?: (x: number, y: number) => boolean
  getTvMaskStyle?: (rockLeft: number, rockTop: number) => Record<string, string> | null
}) {
  const prefersReducedMotion = useReducedMotion()
  const [scope, animate] = useAnimate()
  // wrapper só da rotação — separado do `scope` (posição) de propósito,
  // ver comentário acima da função.
  const rotateRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)
  // timestamp (ms) de quando a volta atual começou — usado só pra saber
  // em que ponto da elipse (fração t, 0 a 1) a pedra está quando precisa
  // sair, pra continuar dali em vez de cortar reto.
  const lapStartRef = useRef(0)

  const gravityX = useMotionValue(0)
  const gravityY = useMotionValue(0)
  const springX = useSpring(gravityX, { stiffness: 200, damping: 20, mass: 0.6 })
  const springY = useSpring(gravityY, { stiffness: 200, damping: 20, mass: 0.6 })

  // visibilidade em relação à tela da tv (ver comentário acima da função).
  // sem spring aqui: uma vez escondida deve ficar escondida (o corte em si
  // já é feito pixel a pixel pela máscara, em tempo real — não há nada
  // pra suavizar aqui, só o "interruptor final" quando termina de sair).
  const tvOpacity = useMotionValue(1)
  // "dentro" aqui significa TOTALMENTE dentro (os 4 cantos, não só o
  // centro) — perto de uma borda curva da tela, o centro pode cruzar pra
  // dentro bem antes do resto do corpo da pedra, e ligar a máscara nesse
  // momento cortaria a entrada também (que precisa ficar sempre inteira).
  const wasFullyInsideRef = useRef(false)
  // true enquanto o mask-image (recorte pixel a pixel) está aplicado na
  // pedra — só liga na transição de "toda dentro" pra "não mais toda
  // dentro" (começou a sair por algum lado) e desliga assim que o centro
  // também sai, aí sim escondendo de vez.
  const maskActiveRef = useRef(false)
  const hiddenByTvRef = useRef(false)

  useAnimationFrame(() => {
    if (!isInsideTvMask || !getTvMaskStyle || prefersReducedMotion) return
    // usa `scope` (só x/y, nunca rotaciona) — não o wrapper de rotação nem
    // a img — pra que o cálculo da máscara nunca seja distorcido pelo giro
    // atual da pedra (ver comentário acima da função).
    const el = scope.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const offscreen = cx < -rect.width || cx > window.innerWidth + rect.width

    if (offscreen) {
      // ponto de entrada: reseta, a pedra volta a poder ficar visível.
      maskActiveRef.current = false
      hiddenByTvRef.current = false
      wasFullyInsideRef.current = false
    } else {
      const nowFullyInside =
        isInsideTvMask(rect.left, rect.top) &&
        isInsideTvMask(rect.right, rect.top) &&
        isInsideTvMask(rect.left, rect.bottom) &&
        isInsideTvMask(rect.right, rect.bottom)
      // simétrico ao "toda dentro": só considera totalmente fora quando os
      // 4 cantos já cruzaram — enquanto sobrar QUALQUER canto dentro,
      // ainda existe um pedacinho visível sendo recortado pela máscara em
      // tempo real. Cortar pro opacity:0 antes disso faz o resto que ainda
      // estava visível sumir de repente, num pulo — em vez de continuar
      // encolhendo suavemente até não sobrar nada.
      const nowFullyOutside =
        !isInsideTvMask(rect.left, rect.top) &&
        !isInsideTvMask(rect.right, rect.top) &&
        !isInsideTvMask(rect.left, rect.bottom) &&
        !isInsideTvMask(rect.right, rect.bottom)

      if (wasFullyInsideRef.current && !nowFullyInside) {
        // começou a sair por algum lado (não está mais 100% dentro) —
        // liga a máscara, que a partir daqui recorta em tempo real só a
        // parte que já cruzou a borda.
        maskActiveRef.current = true
      }
      if (maskActiveRef.current && nowFullyOutside) {
        // os 4 cantos já saíram — a máscara já recortou tudo (0 pixels
        // visíveis); só agora desliga e finaliza escondida, sem pulo.
        maskActiveRef.current = false
        hiddenByTvRef.current = true
      }
      wasFullyInsideRef.current = nowFullyInside
    }

    if (maskActiveRef.current) {
      const maskStyle = getTvMaskStyle(rect.left, rect.top)
      if (maskStyle) Object.assign(el.style, maskStyle)
    } else if (el.style.maskImage !== "none") {
      Object.assign(el.style, { maskImage: "none", WebkitMaskImage: "none" })
    }

    tvOpacity.set(hiddenByTvRef.current ? 0 : 1)
  })

  useEffect(() => {
    if (prefersReducedMotion) return

    function handleMouseMove(e: MouseEvent) {
      const el = scope.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dx = e.clientX - centerX
      const dy = e.clientY - centerY
      const dist = Math.hypot(dx, dy)

      if (dist > 0 && dist < GRAVITY_RADIUS) {
        // sinal invertido (-dx/-dy): empurra pra longe do cursor, não puxa
        // pra ele.
        const push = (1 - dist / GRAVITY_RADIUS) * GRAVITY_STRENGTH
        gravityX.set((-dx / dist) * push)
        gravityY.set((-dy / dist) * push)
      } else {
        gravityX.set(0)
        gravityY.set(0)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [prefersReducedMotion, scope, gravityX, gravityY])

  useEffect(() => {
    if (prefersReducedMotion) {
      animate(scope.current, { x: active ? "0vw" : `${entryX}vw` }, { duration: 0.4 })
      return
    }

    let cancelled = false
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    // centro real da viewport (0), não um ponto a meio caminho até entryX
    // — assim os dois vértices da elipse ficam nas duas bordas opostas.
    const centerX = 0
    // sinal invertido de entryX (não abs()): garante que o ângulo 180°, o
    // ponto de partida, caia exatamente em entryX (fora da tela, do lado
    // de entrada dessa pedra) pros dois sinais de entryX.
    const radiusX = -entryX

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
        // ela estiver. posição (scope) e rotação (rotateRef) animam em
        // paralelo, em elementos separados (ver comentário acima da
        // função) — mas sincronizados, já que usam o mesmo path/duration.
        await Promise.all([
          animate(scope.current, { x: path.x, y: path.y }, { duration, ease: "linear", repeat: Infinity }),
          animate(
            rotateRef.current,
            { rotate: [0, reverse ? -360 : 360] },
            { duration, ease: "linear", repeat: Infinity }
          ),
        ])
      } else if (startedRef.current) {
        // fração da volta já percorrida (0 a 1). com a elipse cobrindo as
        // duas bordas, existem TRÊS pontos fora da tela por volta: t=0 e
        // t=1 (mesmo ponto físico, o vértice do lado de entrada) e t=0.5
        // (o vértice do lado oposto). Segue pro mais próximo dos três —
        // senão a pedra poderia precisar atravessar o trecho perto do
        // centro da tela antes de conseguir sair. Seguir até um ponto
        // "pra trás" é só reproduzir ao contrário o trecho que ela acabou
        // de percorrer, então continua parecendo uma curva natural, não um
        // corte reto nem uma inversão brusca.
        const elapsedMs = performance.now() - lapStartRef.current
        const tNow = (elapsedMs % (duration * 1000)) / (duration * 1000)
        const candidates = [0, 0.5, 1]
        const targetT = candidates.reduce((closest, t) =>
          Math.abs(t - tNow) < Math.abs(closest - tNow) ? t : closest
        )
        const path = buildArcPath(centerX, 0, radiusX, driftY, reverse, tNow, targetT, EXIT_POINTS)
        // trecho mais curto = saída mais rápida; nunca mais que meia volta
        // (a maior distância possível entre dois pontos consecutivos).
        const exitDuration = EXIT_DURATION * (Math.abs(targetT - tNow) / 0.5)

        await Promise.all([
          animate(
            scope.current,
            { x: path.x, y: path.y },
            { duration: Math.max(exitDuration, 0.3), ease: "easeOut" }
          ),
          animate(
            rotateRef.current,
            { rotate: path.rotate },
            { duration: Math.max(exitDuration, 0.3), ease: "easeOut" }
          ),
        ])
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [active, animate, delay, driftY, duration, entryX, prefersReducedMotion, reverse, scope])

  return (
    <div
      ref={scope as never}
      className={className}
      // posição estática de partida, fora da tela — evita que a pedra
      // apareça no centro por um instante antes do efeito acima rodar
      // (ex.: primeiro paint, ainda na section 1).
      style={{ transform: `translate(${entryX}vw, 0px)` }}
    >
      <motion.div style={{ x: springX, y: springY }}>
        <div ref={rotateRef}>
          <motion.img
            src={src}
            alt=""
            aria-hidden="true"
            // w-full + h-auto (não h-full): a div externa não tem altura
            // própria, ela nasce do conteúdo — precisa ser o inverso, a
            // altura dela vem da proporção intrínseca da imagem, não o
            // contrário.
            className="block h-auto w-full"
            style={{ opacity: tvOpacity }}
          />
        </div>
      </motion.div>
    </div>
  )
}
