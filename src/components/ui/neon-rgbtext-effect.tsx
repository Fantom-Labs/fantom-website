"use client"

import { useEffect, useRef } from "react"

interface NeonRGBTextProps {
  text: string
  as?: "h1" | "h2" | "p" | "span"
  className?: string
}

// separação de canais RGB via WebGL (3 passadas da MESMA textura de texto,
// cada uma deslocada + tingida de vermelho/verde/azul, somadas em modo
// aditivo) — a mesma técnica do componente original (21st.dev), só que
// adaptada de "demo em tela cheia com texto fixo" pra um primitivo
// reutilizável: mede a fonte REAL do heading por trás (inclui o clamp()
// responsivo já resolvido pelo browser, então acompanha qualquer tamanho
// de tela sem duplicar a lógica de breakpoint aqui), quebra linha pra
// caber na largura real do container, e redesenha via ResizeObserver (não
// só o resize da janela — o clamp() muda com a largura do container, que
// pode mudar por outros motivos, ex.: max-w progressivo).
//
// as TRÊS passadas (R/G/B) desenham a MESMA textura com um deslocamento
// pequeno — onde os três canais se sobrepõem (a maior parte de cada
// glifo), a soma aditiva dá branco sólido; só nas BORDAS, onde o
// deslocamento faz um canal "vazar" sem os outros dois, aparece a franja
// de cor. Por isso o texto de verdade (<h1>) é ESCONDIDO (opacity:0,
// só depois do primeiro desenho confirmado com sucesso) e o canvas vira a
// ÚNICA camada visível — tentar sobrepor um canvas "acento" a um <h1> real
// separado exige alinhar dois sistemas de desenho DIFERENTES (DOM vs
// canvas) pixel a pixel, e qualquer diferença de métrica de fonte
// (leading do line-height, hinting, antialiasing) aparecia como um texto
// fantasma duplicado (bug reportado, print mostrando texto sob o outro).
// Com uma única fonte de desenho não existe mais o que desalinhar.
//
// se WebGL não estiver disponível (gl é null) ou o desenho falhar, a
// função retorna cedo SEM esconder o <h1> — o texto normal (branco,
// sólido) fica como está, sem quebrar layout nem legibilidade.
//
// CHANNEL_OFFSET_PX pequeno (não uma opacidade translúcida) é o que dá o
// "efeito suave estético" pedido: uma franja de 1-2px lê como um leve
// brilho neon nas bordas, mantendo o corpo do texto sólido e legível —
// bem mais sutil que o offset generoso usado no componente original
// (pensado pra um texto grande em tela cheia, não pra um heading de
// hero). Sem loop de animação (redesenha só quando o tamanho muda): é um
// estilo estático, não conflita com prefers-reduced-motion.
const CHANNEL_OFFSET_PX = 1.5

export function NeonRGBText({ text, as: Tag = "h1", className }: NeonRGBTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const heading = headingRef.current
    const canvas = canvasRef.current
    if (!container || !heading || !canvas) return

    const gl = canvas.getContext("webgl")
    if (!gl) return

    let program: WebGLProgram | null = null
    let vertexShader: WebGLShader | null = null
    let fragmentShader: WebGLShader | null = null
    let buffer: WebGLBuffer | null = null
    let texture: WebGLTexture | null = null

    try {
      vertexShader = gl.createShader(gl.VERTEX_SHADER)!
      gl.shaderSource(
        vertexShader,
        `
          attribute vec2 position;
          varying vec2 vUv;
          void main() {
            vUv = vec2(position.x * 0.5 + 0.5, 1.0 - (position.y * 0.5 + 0.5));
            gl_Position = vec4(position, 0.0, 1.0);
          }
        `
      )
      gl.compileShader(vertexShader)

      fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
      gl.shaderSource(
        fragmentShader,
        `
          precision mediump float;
          uniform sampler2D uTexture;
          uniform vec2 uOffset;
          uniform vec3 uColor;
          varying vec2 vUv;
          void main() {
            vec2 distortedUv = vUv + vec2(uOffset.x, -uOffset.y);
            vec4 texel = texture2D(uTexture, distortedUv);
            gl_FragColor = vec4(uColor * texel.a, texel.a);
          }
        `
      )
      gl.compileShader(fragmentShader)

      program = gl.createProgram()!
      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)
      gl.useProgram(program)

      const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
      buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

      const positionLocation = gl.getAttribLocation(program, "position")
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

      const textureLocation = gl.getUniformLocation(program, "uTexture")
      const offsetLocation = gl.getUniformLocation(program, "uOffset")
      const colorLocation = gl.getUniformLocation(program, "uColor")

      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE)

      const textCanvas = document.createElement("canvas")
      const textCtx = textCanvas.getContext("2d")!

      const draw = () => {
        const rect = container.getBoundingClientRect()
        const width = Math.max(1, Math.ceil(rect.width))
        const height = Math.max(1, Math.ceil(rect.height))
        const dpr = Math.min(window.devicePixelRatio || 1, 2)

        canvas.width = width * dpr
        canvas.height = height * dpr
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)

        // fonte/alinhamento lidos do heading REAL — herdam o clamp()
        // responsivo (já resolvido pelo browser em px) e o text-align
        // (center no mobile, left no desktop), sem duplicar essa lógica.
        // Ler isso ANTES de escondê-lo (abaixo) continua funcionando: o
        // elemento fica com opacity:0, não sai do layout, getComputedStyle
        // e getClientRects() seguem retornando os valores reais.
        const computed = getComputedStyle(heading)
        const fontSize = parseFloat(computed.fontSize)
        const textAlign = computed.textAlign === "center" ? "center" : "left"

        textCanvas.width = canvas.width
        textCanvas.height = canvas.height
        textCtx.setTransform(1, 0, 0, 1, 0, 0)
        textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height)
        textCtx.scale(dpr, dpr)
        textCtx.font = `${computed.fontWeight} ${fontSize}px ${computed.fontFamily}`
        textCtx.fillStyle = "#ffffff"
        textCtx.textBaseline = "top"
        textCtx.textAlign = textAlign

        // quebra de linha simples por palavra, pra caber na largura real
        // do container — mesmo critério visual do <h1> por baixo (ambos
        // partem da mesma largura disponível).
        const words = text.split(" ")
        const lines: string[] = []
        let currentLine = ""
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word
          if (currentLine && textCtx.measureText(testLine).width > width) {
            lines.push(currentLine)
            currentLine = word
          } else {
            currentLine = testLine
          }
        }
        if (currentLine) lines.push(currentLine)

        // posição Y de cada linha: medida de VERDADE no heading real (via
        // Range.getClientRects(), um retângulo por linha visualmente
        // quebrada), não estimada a partir de line-height — mantém o
        // desenho fiel ao espaçamento real entre linhas do heading.
        const textRange = document.createRange()
        textRange.selectNodeContents(heading)
        const lineRects = Array.from(textRange.getClientRects())
        const firstLineTop = lineRects.length > 0 ? lineRects[0].top - rect.top : 0
        const measuredLineHeight =
          lineRects.length > 1 ? lineRects[1].top - lineRects[0].top : fontSize * 1.2

        const drawX = textAlign === "center" ? width / 2 : 0
        lines.forEach((line, i) => {
          textCtx.fillText(line, drawX, firstLineTop + i * measuredLineHeight)
        })

        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas)

        // offset em fração de UV equivalente a CHANNEL_OFFSET_PX, recalculado
        // aqui porque depende da largura real do canvas neste desenho.
        const offsetUv = CHANNEL_OFFSET_PX / width
        const channels: Array<{ color: [number, number, number]; offset: [number, number] }> = [
          { color: [1, 0, 0], offset: [offsetUv, 0] },
          { color: [0, 1, 0], offset: [0, 0] },
          { color: [0, 0, 1], offset: [-offsetUv, 0] },
        ]
        channels.forEach(({ color, offset }) => {
          gl.uniform2fv(offsetLocation, offset)
          gl.uniform3fv(colorLocation, color)
          gl.uniform1i(textureLocation, 0)
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        })

        // só esconde o <h1> real depois do PRIMEIRO desenho ter dado certo
        // — se algo falhar antes disso (ver catch abaixo), o texto normal
        // continua visível, nunca fica em branco.
        heading.style.opacity = "0"
      }

      draw()
      const ro = new ResizeObserver(draw)
      ro.observe(container)

      return () => {
        ro.disconnect()
        heading.style.opacity = ""
        gl.deleteProgram(program)
        gl.deleteShader(vertexShader)
        gl.deleteShader(fragmentShader)
        gl.deleteBuffer(buffer)
        gl.deleteTexture(texture)
      }
    } catch (error) {
      console.error("Failed to set up NeonRGBText shader:", error)
      gl.deleteProgram(program)
      if (vertexShader) gl.deleteShader(vertexShader)
      if (fragmentShader) gl.deleteShader(fragmentShader)
      if (buffer) gl.deleteBuffer(buffer)
      if (texture) gl.deleteTexture(texture)
    }
  }, [text])

  return (
    <div ref={containerRef} className="relative">
      <Tag ref={headingRef} className={className}>
        {text}
      </Tag>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </div>
  )
}
