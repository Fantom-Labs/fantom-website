"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react"
import { AsciiArt, AsciiArtFrame } from "@/components/ui/mo-mosaic"
import { MouseResponsiveBackground } from "@/components/ui/mouse-responsive-background"
import { FloatingRock } from "@/components/motion/floating-rock"

// mesmo poster usado pelo <AsciiArt>, servido como fallback estático
// quando o usuário prefere motion reduzido (project.md, seção 10).
const POSTER_SRC =
  "https://assets.21st.dev/ascii-recipes/thumbnails/user_39AUrstSGWJUKmRU9spgBJgd1hs/95b377f8-e226-434d-be5c-2c7159b3e244.webp"

// EXPERIMENTAL — protótipo da ideia "zoom pra dentro da tela de TV" (ainda
// não documentado no project.md, é uma direção em avaliação). A saída do
// lobby agora é o próprio scroll.
//
// mecânica: em vez de calcular a posição da tela em pixels (o que quebra
// em proporções de tela diferentes, já que o object-fit: cover corta a
// imagem de um jeito que depende do aspect ratio do viewport), o vídeo é
// recortado com a própria foto do tv como máscara CSS (chroma/luma key):
// os pixels claros da tela ficam visíveis, os escuros ocultam o vídeo. A
// máscara usa mask-size: cover, o mesmo algoritmo do object-fit: cover da
// imagem de fundo — os dois ficam sempre alinhados, em qualquer tela.
//
// pra simular o zoom, a camada mascarada inteira (vídeo + máscara) escala
// a partir do centro: ZOOM_START faz a área clara da máscara preencher o
// viewport inteiro (vídeo em tela cheia), e desamplia até 1 (escala
// normal, exatamente do tamanho da tela do tv na foto).
//
// SCREEN_FRAC_* foram medidos varrendo o brilho dos pixels da imagem
// original (2752x1536, sem nenhum corte de viewport) — são frações fixas,
// intrínsecas à imagem, então funcionam em qualquer proporção de tela.
// Reajustar se a imagem trocar.
// altura do scroll do lobby em vh (número, não string) — exportada pra
// SectionNav conseguir calcular quando o lobby termina sem precisar de
// uma ref cruzada entre os dois componentes.
export const LOBBY_SCROLL_HEIGHT_VH = 300
const SCROLL_HEIGHT = `${LOBBY_SCROLL_HEIGHT_VH}vh`
// fases do scroll (frações de scrollYProgress): zoom pra dentro da tela e,
// dentro da mesma janela, o conjunto (tv + vídeo + logo) já desloca pra
// esquerda — os dois acontecem juntos, então o deslocamento lateral fica
// quase imperceptível (dissolvido no próprio movimento do zoom, não uma
// segunda animação separada) — seguido de uma pausa antes do sticky
// soltar. Ajustar os limiares se o "feel" do scroll não convencer.
const ZOOM_RANGE: [number, number] = [0, 0.5]
const SHIFT_RANGE: [number, number] = ZOOM_RANGE
const SHIFT_X_TARGET = "-18vw"
// progresso em que consideramos "chegamos na section 2" (Portfólio) —
// mesmo ponto em que o zoom e o deslocamento pra esquerda terminam juntos.
// Exportado pra SectionNav usar enquanto não existem seções reais no DOM
// pra observar.
export const LOBBY_SECTION_2_PROGRESS = SHIFT_RANGE[1]
const SCREEN_FRAC_LEFT = 980 / 2752
const SCREEN_FRAC_RIGHT = 1782 / 2752
const SCREEN_FRAC_TOP = 234 / 1536
const SCREEN_FRAC_BOTTOM = 988 / 1536
const SCREEN_FRAC_W = SCREEN_FRAC_RIGHT - SCREEN_FRAC_LEFT
const SCREEN_FRAC_H = SCREEN_FRAC_BOTTOM - SCREEN_FRAC_TOP
const ZOOM_START = Math.max(1 / SCREEN_FRAC_W, 1 / SCREEN_FRAC_H)

// empurra a cena do tv mais pra baixo e um pouco mais pra esquerda no
// quadro (pedidos: "a imagem da tv tem que estar mais abaixo", depois "um
// pouco mais pra esquerda"). Ajustar visualmente se necessário.
const TV_POSITION_X = 58
const TV_POSITION_Y = 52
const TV_POSITION = `${TV_POSITION_X}% ${TV_POSITION_Y}%`

// escala final da logo — menor o suficiente pra caber dentro da tela do
// tv sem estourar (ajustado a olho).
const LOGO_ZOOM_END = 0.4

// calcula, em tempo real, onde o centro da máscara (tv-mask.png) cai na
// viewport atual — replicando o mesmo algoritmo de object-fit: cover +
// object-position usado pelo fundo/máscara. Evita depender de uma
// porcentagem fixa (que quebra em proporções de tela diferentes, o mesmo
// problema que o chroma key já resolveu pro vídeo). Recalcula no resize.
function useScreenAnchor() {
  const [anchor, setAnchor] = useState({ xPct: 50, yPct: 50 })

  useEffect(() => {
    const img = new Image()
    img.src = "/images/tv-mask.png"

    const compute = () => {
      const naturalW = img.naturalWidth
      const naturalH = img.naturalHeight
      const boxW = window.innerWidth
      const boxH = window.innerHeight
      if (!naturalW || !naturalH || !boxW || !boxH) return

      const boxRatio = boxW / boxH
      const imgRatio = naturalW / naturalH
      let sw: number, sh: number
      if (imgRatio > boxRatio) {
        sh = naturalH
        sw = sh * boxRatio
      } else {
        sw = naturalW
        sh = sw / boxRatio
      }
      const sx = (naturalW - sw) * (TV_POSITION_X / 100)
      const sy = (naturalH - sh) * (TV_POSITION_Y / 100)

      const canvas = document.createElement("canvas")
      canvas.width = boxW
      canvas.height = boxH
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, boxW, boxH)

      const step = 4
      let sumX = 0
      let sumY = 0
      let count = 0
      const data = ctx.getImageData(0, 0, boxW, boxH).data
      for (let y = 0; y < boxH; y += step) {
        for (let x = 0; x < boxW; x += step) {
          const brightness = data[(y * boxW + x) * 4]
          if (brightness > 128) {
            sumX += x
            sumY += y
            count++
          }
        }
      }
      if (count > 0) {
        setAnchor({ xPct: (sumX / count / boxW) * 100, yPct: (sumY / count / boxH) * 100 })
      }
    }

    img.onload = compute
    if (img.complete) compute()

    window.addEventListener("resize", compute)
    return () => window.removeEventListener("resize", compute)
  }, [])

  return anchor
}

const emptySubscribe = () => () => {}
// true só depois de montar no cliente — usado pra liberar valores
// sorteados com Math.random() sem quebrar a hidratação (o servidor e o
// primeiro render do cliente sempre concordam em "false").
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

// sorteia, uma vez por carregamento de página, a posição vertical inicial
// das pedras (o sentido da órbita em si já é fixo e oposto entre as duas,
// via a prop reverse). antes de montar, usa valores fixos razoáveis (o
// resultado visual muda sozinho assim que monta).
function useRockOrbit() {
  const mounted = useMounted()
  const [randomOrbit] = useState(() => ({
    topPct1: 15 + Math.random() * 30, // banda superior
    topPct2: 50 + Math.random() * 30, // banda inferior
  }))

  return mounted ? randomOrbit : { topPct1: 28, topPct2: 58 }
}

// elementos fixos que não participam do zoom: logo-left e ícone de menu.
function LobbyChrome() {
  return (
    <>
      <div className="fixed left-10px top-5 z-30 flex h-11 items-center sm:left-8 sm:top-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-left.svg" alt="Fantom" className="max-w-[80px]" />
      </div>

      {/* TODO: sem funcionalidade ainda, só o visual do botão (menu real vem depois). */}
      <button
        type="button"
        aria-label="Abrir menu"
        className="fixed right-5 top-5 z-30 flex h-11 w-11 items-center justify-center sm:right-8 sm:top-8"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-menu.svg" alt="" className="h-6 w-6" />
      </button>
    </>
  )
}

export function Lobby() {
  const prefersReducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const screenAnchor = useScreenAnchor()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })
  // scroll bruto da página (px), não o progresso relativo ao container —
  // usado só pra moldura, que precisa reagir ao topo absoluto do site.
  const { scrollY } = useScroll()

  const maskScale = useTransform(scrollYProgress, ZOOM_RANGE, [ZOOM_START, 1])
  // cancela o zoom do wrapper no conteúdo do vídeo: a "janela" da máscara
  // precisa encolher, mas o enquadramento do vídeo em si não deveria
  // começar ampliado — ele só devia diminuir de tamanho, não de zoom.
  const videoCounterScale = useTransform(maskScale, (s) => 1 / s)
  const logoScale = useTransform(scrollYProgress, ZOOM_RANGE, [1, LOGO_ZOOM_END])
  // a logo começa no centro puro da viewport (onde o vídeo está em tela
  // cheia) e termina no centro real da tela do tv (calculado por
  // useScreenAnchor), acompanhando o scroll — não é uma posição fixa.
  const logoLeft = useTransform(scrollYProgress, ZOOM_RANGE, ["50%", `${screenAnchor.xPct}%`])
  const logoTop = useTransform(scrollYProgress, ZOOM_RANGE, ["50%", `${screenAnchor.yPct}%`])
  // depois do zoom completo (com uma pausa), desloca o conjunto inteiro
  // (fundo + vídeo mascarado + logo) suavemente pra esquerda, liberando a
  // coluna direita pra conteúdo. mesmo valor aplicado aos três, então se
  // movem colados.
  const shiftX = useTransform(scrollYProgress, SHIFT_RANGE, ["0vw", SHIFT_X_TARGET])
  // combina o deslocamento com a centralização própria da logo (-50%).
  const logoX = useTransform(shiftX, (v) => `calc(-50% + ${v})`)
  // só aparece no topo absoluto do site: some nos primeiros 50px de scroll
  // e volta assim que a página retorna ao topo (baseado no scroll real da
  // página, não no progresso da animação da tv).
  const frameOpacity = useTransform(scrollY, [0, 50], [1, 0])
  // pedras flutuantes: a entrada NÃO é scrubada continuamente pelo scroll
  // — é autônoma (anima sozinha assim que dispara), só a saída reage ao
  // scroll voltando pro início. o gatilho é um booleano (cruza
  // LOBBY_SECTION_2_PROGRESS, o fim do zoom+deslocamento, em qualquer
  // direção), não um valor contínuo. NÃO usar SHIFT_RANGE[0]: agora que o
  // deslocamento corre junto com o zoom, esse limiar é 0 — usaria a pedra
  // como ativa desde o topo da página.
  const [insideSection2, setInsideSection2] = useState(false)
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setInsideSection2(v >= LOBBY_SECTION_2_PROGRESS)
  })
  const rockOrbit = useRockOrbit()

  // fallback estático: sem scroll-zoom, sem parallax, uma tela só (project.md, seção 10).
  if (prefersReducedMotion) {
    return (
      <div className="relative h-screen bg-black">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={POSTER_SRC} alt="" className="h-full w-full object-cover" />
        </div>

        <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-centralized.svg"
            alt="Fantom"
            className="w-[416px] sm:w-[416px]"
          />
        </div>

        <AsciiArtFrame />

        <LobbyChrome />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative" style={{ height: SCROLL_HEIGHT }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        {/* cena da tv: escala junto com a máscara (mesmo valor, mesma
            origem no centro), então as duas sempre se movem coladas uma
            na outra, começando ampliada e desamplia até o tamanho normal. */}
        <motion.img
          src="/images/tv-img.jpeg"
          alt=""
          aria-hidden="true"
          style={{ scale: maskScale, x: shiftX, objectPosition: TV_POSITION }}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* vídeo recortado pela própria foto do tv (chroma/luma key): só
            aparece onde a imagem é clara (a tela). escala a partir do
            centro, de "tela cheia" (ZOOM_START) até o tamanho exato da
            tela do tv na foto (1). */}
        <motion.div
          style={{
            scale: maskScale,
            x: shiftX,
            maskImage: "url(/images/tv-mask.png)",
            WebkitMaskImage: "url(/images/tv-mask.png)",
            // máscara dedicada (preto e branco, gerada por limiar de
            // brilho): foca só no núcleo claro da tela, sem o bezel branco
            // do tv vazando vídeo junto. mask-mode: luminance porque a
            // imagem não tem canal alpha.
            maskMode: "luminance",
            maskSize: "cover",
            WebkitMaskSize: "cover",
            maskPosition: TV_POSITION,
            WebkitMaskPosition: TV_POSITION,
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
          }}
          className="absolute inset-0 z-10 overflow-hidden"
        >
          <motion.div style={{ scale: videoCounterScale }} className="absolute inset-0">
            <MouseResponsiveBackground className="absolute left-0 top-0 h-[110%] w-[110%]">
              <AsciiArt className="h-full w-full" />
            </MouseResponsiveBackground>
          </motion.div>
        </motion.div>

        {/* logo central: não é mascarada (precisa ficar inteira, sem
            recorte). começa no centro da viewport (vídeo em tela cheia) e
            termina no centro real da tela do tv (useScreenAnchor), junto
            com o scroll — nunca fica numa posição fixa. */}
        <motion.div
          style={{
            scale: logoScale,
            left: logoLeft,
            top: logoTop,
            x: logoX,
            y: "-50%",
          }}
          className="pointer-events-none absolute z-20"
        >
          <MouseResponsiveBackground>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-centralized.svg"
              alt="Fantom"
              className="w-[416px] sm:w-[416px]"
            />
          </MouseResponsiveBackground>
        </motion.div>

        {/* pedras flutuantes: órbita elíptica contínua (tipo elétron ao
            redor do núcleo — a própria tela cheia do dispositivo, não a
            tela da tv), sempre no mesmo sentido, sem ida-e-volta na mesma
            linha. por isso as âncoras horizontais das duas são o centro
            real da viewport (left-1/2), independente de shiftX/posição da
            tv — senão a órbita fica presa à composição da tv em vez da
            tela inteira. o ponto de entrada (fora da tela) é o próprio
            ângulo 180° da elipse, então já nasce orbitando dali (ver
            FloatingRock) — sem opacidade: escondidas por saírem da área
            visível (overflow-hidden do container pai). sentido oposto
            entre as duas (reverse), posição vertical sorteada por
            carregamento de página. */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <div
            style={{ top: `${rockOrbit.topPct1}%` }}
            className="absolute left-1/2 w-32 -translate-x-1/2 -translate-y-1/2 sm:w-[179.2px]"
          >
            <FloatingRock
              src="/images/rock1-img.svg"
              active={insideSection2}
              entryX={-100}
              duration={55}
              reverse={false}
              className="w-full"
            />
          </div>

          <div
            style={{ top: `${rockOrbit.topPct2}%` }}
            className="absolute left-1/2 w-[89.6px] -translate-x-1/2 -translate-y-1/2 sm:w-32"
          >
            <FloatingRock
              src="/images/rock2-img.svg"
              active={insideSection2}
              entryX={100}
              duration={66}
              delay={1.2}
              reverse={true}
              className="w-full"
            />
          </div>
        </div>

        {/* moldura decorativa: some conforme a cena encolhe, volta se rolar de volta */}
        <AsciiArtFrame opacity={frameOpacity} />

        <LobbyChrome />
      </div>
    </div>
  )
}
