"use client"

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react"
import { useLenis } from "lenis/react"
import { AsciiArt } from "@/components/ui/mo-mosaic"
import { MouseResponsiveBackground } from "@/components/ui/mouse-responsive-background"
import { TextScramble } from "@/components/ui/text-scramble"
import { Button } from "@/components/ui/neon-button"
import { LogoMarquee } from "@/components/ui/logo-marquee"
import { FloatingRock } from "@/components/motion/floating-rock"

// mesmo poster usado pelo <AsciiArt>, servido como fallback estático
// quando o usuário prefere motion reduzido (project.md, seção 10).
const POSTER_SRC =
  "https://assets.21st.dev/ascii-recipes/thumbnails/user_39AUrstSGWJUKmRU9spgBJgd1hs/95b377f8-e226-434d-be5c-2c7159b3e244.webp"

// copy da hero (project.md, seção 6) — mesmo texto usado nas duas versões
// do layout (coluna animada da section 2 e o fallback estático de motion
// reduzido), pra não divergir entre elas.
const EYEBROW_TEXT = "Websites · SaaS · Sistemas com IA"
const HEADLINE_TEXT = "Sócia estratégica de tecnologia e design por trás de negócios reais."
const SUBHEAD_TEXT = "Da primeira reunião ao produto gerando receita, cuidamos de cada detalhe do seu projeto."
const CTA_LABEL = "Falar com a Fantom"
const CLIENTS_STAT_TEXT = "+ 50 negócios acelerados"

// entrada em stagger do conteúdo da hero (coluna direita, section 2):
// eyebrow, H1, subhead e CTA entram na sequência, ~80ms entre cada,
// deslizando da direita (x positivo) pra sua posição final — mesmo
// gatilho (insideSection2) que já controla as pedras. Reversível: ao
// rolar de volta, o stagger desfaz sozinho (Motion anima de volta pro
// estado "hidden").
const heroStaggerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const heroItemVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

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
// mobile: em vez de deslocar a cena da tv pra ESQUERDA (liberando uma
// coluna à direita, que não existe numa tela estreita), desloca pra
// BAIXO — o conteúdo da hero fica fixo no topo (ver className responsivo
// da coluna de conteúdo) e a tv assentada ocupa a metade de baixo.
const SHIFT_Y_TARGET_MOBILE = "60vh"
// duração (em fração de scrollYProgress) do fade do "EXPLORE".
const EXPLORE_FADE_END = 0.15
// --- seções da home simuladas pelo scroll do lobby -------------------------
// Enquanto não existem seções reais no DOM pra observar (o lobby ocupa o
// topo da página sozinho — ver EXPERIMENTAL acima), simulamos "em que
// seção estamos" a partir do progresso do próprio scroll do lobby
// (scrollYProgress, 0 a 1). Esta tabela é a ÚNICA fonte de verdade desses
// limiares: tanto o Lobby (troca do vídeo da tv, aparição das pedras,
// logo) quanto o SectionNav (qual barra fica acesa) leem dela — nunca
// declare um limiar solto em outro lugar, ou os dois vão dessincronizar.
// Quando as seções reais existirem como elementos no DOM, o
// IntersectionObserver do SectionNav assume e esta tabela deixa de ser
// necessária.
//
// cada `progress` é o limiar MÍNIMO de scrollYProgress pra essa seção
// contar como "a atual" — a seção ativa é sempre a de maior limiar que a
// posição do scroll já ultrapassou (ver getActiveLobbySection abaixo).
export const LOBBY_SECTIONS = [
  { id: "inicio", label: "Início", progress: 0 },
  // fim do zoom + deslocamento pra esquerda da cena da tv (SHIFT_RANGE[1]).
  { id: "portfolio", label: "Portfólio", progress: SHIFT_RANGE[1] },
] as const

// índice (em LOBBY_SECTIONS) da seção ativa pra um dado scrollYProgress.
export function getActiveLobbySection(progress: number) {
  let index = 0
  for (let i = 0; i < LOBBY_SECTIONS.length; i++) {
    if (progress >= LOBBY_SECTIONS[i].progress) index = i
  }
  return index
}
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
// mobile: 58% foi calibrado pro deslocamento lateral do desktop (empurra
// o foco pra compensar o shiftX) — sem esse deslocamento (shiftX=0 no
// mobile), o mesmo valor deixa a tela/máscara visivelmente fora do
// centro. Centralizado (50%) no mobile.
const TV_POSITION_X_MOBILE = 50

// escala final da logo na section 2 — 1.5x maior que o valor original
// (0.4) que cabia justo dentro da tela do tv sem estourar.
const LOGO_ZOOM_END = 0.6

// mobile: depois do zoom completo, o conjunto inteiro (tv + vídeo + logo
// — já posicionados/deslocados corretamente entre si) encolhe mais um
// pouco a partir do centro da viewport, revelando fundo preto ao redor —
// sem isso, object-cover sempre preenche 100% da tela, então a "tv" nunca
// parece "caber" dentro do celular, só sangra pelas bordas. Aplicado como
// wrapper por fora dos três elementos: como eles já se movem/escalam
// certo entre si, escalar o grupo inteiro junto encolhe tudo mantendo a
// logo grudada na tela da tv, sem precisar recalcular a âncora (screenAnchor)
// pra um fator de escala extra.
const MOBILE_FIT_SCALE = 0.62

// calcula, em tempo real, onde o centro da máscara (tv-mask.png) cai na
// viewport atual — replicando o mesmo algoritmo de object-fit: cover +
// object-position usado pelo fundo/máscara. Evita depender de uma
// porcentagem fixa (que quebra em proporções de tela diferentes, o mesmo
// problema que o chroma key já resolveu pro vídeo). Recalcula no resize
// e quando o TV_POSITION_X efetivo muda (troca de layout mobile/desktop).
function useScreenAnchor(tvPositionX: number, tvPositionY: number) {
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
      const sx = (naturalW - sw) * (tvPositionX / 100)
      const sy = (naturalH - sh) * (tvPositionY / 100)

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
  }, [tvPositionX, tvPositionY])

  return anchor
}

// duas coisas relacionadas à máscara da tv (tv-mask.png), usadas pelas
// pedras flutuantes pra "entrar na tv" (ver FloatingRock e o comentário no
// bloco das pedras abaixo):
//
// 1) isInsideTvMask(x,y): esse ponto da viewport cai na área clara (a
//    tela)? Desenha a máscara UMA VEZ num canvas do tamanho da viewport
//    (mesmo cover-fit + TV_POSITION do vídeo) e cacheia os pixels num
//    array tipado — a leitura por ponto (chamada a cada frame) é só
//    indexação de array.
//
// 2) getTvMaskStyle(rockLeft, rockTop): devolve o mask-image (CSS, direto,
//    não invertido) que, aplicado à PRÓPRIA pedra, recorta o pixel a pixel
//    dela pra só mostrar a parte que cai sobre a tela — é o que cria o
//    efeito de "sumir só a parte que sai da máscara, imediatamente" (o
//    recorte é feito pelo navegador em tempo real, não por um fade
//    calculado). mask-size/mask-position não são relativos à viewport,
//    são relativos à CAIXA DO PRÓPRIO ELEMENTO — por isso o cálculo usa
//    coordenadas explícitas em px (não "cover"/porcentagem) compensando a
//    posição atual da pedra, fazendo a máscara "grudar" numa posição fixa
//    da tela por trás dela, como se fosse uma janela fixa vista por um
//    buraco que se move.
//
// Como as pedras só ficam ativas na section 2+ (zoom e deslocamento já
// assentados, scale=1), os dois usam a posição final fixa — só precisam
// desfazer o deslocamento horizontal (SHIFT_X_TARGET).
function useTvScreenMask() {
  const dataRef = useRef<{ data: Uint8ClampedArray; width: number; height: number } | null>(null)
  const geoRef = useRef<{ coverW: number; coverH: number; originX: number; originY: number } | null>(null)

  useEffect(() => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()
    img.src = "/images/tv-mask.png"

    const draw = () => {
      const naturalW = img.naturalWidth
      const naturalH = img.naturalHeight
      const boxW = window.innerWidth
      const boxH = window.innerHeight
      if (!naturalW || !naturalH || !boxW || !boxH || !ctx) return

      // recorte pro sampling por pixel (isInsideTvMask): mesmo cálculo de
      // antes, cover-fit encolhendo a imagem NATURAL pro tamanho da caixa.
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

      canvas.width = boxW
      canvas.height = boxH
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, boxW, boxH)
      dataRef.current = { data: ctx.getImageData(0, 0, boxW, boxH).data, width: boxW, height: boxH }

      // geometria pro mask-image direto na pedra (getTvMaskStyle): o
      // inverso — cover-fit AMPLIANDO a imagem natural pra cobrir a caixa
      // (viewport). coverW/coverH é o tamanho renderizado da imagem
      // inteira; originX/Y é onde o canto dela cai relativo à viewport.
      const scale = Math.max(boxW / naturalW, boxH / naturalH)
      const coverW = naturalW * scale
      const coverH = naturalH * scale
      const originX = (boxW - coverW) * (TV_POSITION_X / 100)
      const originY = (boxH - coverH) * (TV_POSITION_Y / 100)
      geoRef.current = { coverW, coverH, originX, originY }
    }

    img.onload = draw
    if (img.complete) draw()
    window.addEventListener("resize", draw)
    return () => window.removeEventListener("resize", draw)
  }, [])

  const isInsideTvMask = useCallback((vx: number, vy: number) => {
    const cache = dataRef.current
    if (!cache) return false
    const shiftPx = (parseFloat(SHIFT_X_TARGET) / 100) * cache.width
    const ux = Math.round(vx - shiftPx)
    const uy = Math.round(vy)
    if (ux < 0 || ux >= cache.width || uy < 0 || uy >= cache.height) return false
    const idx = (uy * cache.width + ux) * 4
    return cache.data[idx] > 128
  }, [])

  const getTvMaskStyle = useCallback((rockLeft: number, rockTop: number) => {
    const geo = geoRef.current
    if (!geo) return null
    const shiftPx = (parseFloat(SHIFT_X_TARGET) / 100) * window.innerWidth
    const posX = geo.originX + shiftPx - rockLeft
    const posY = geo.originY - rockTop
    return {
      maskImage: "url(/images/tv-mask.png)",
      WebkitMaskImage: "url(/images/tv-mask.png)",
      maskMode: "luminance",
      WebkitMaskMode: "luminance" as const,
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
      maskSize: `${geo.coverW}px ${geo.coverH}px`,
      WebkitMaskSize: `${geo.coverW}px ${geo.coverH}px`,
      maskPosition: `${posX}px ${posY}px`,
      WebkitMaskPosition: `${posX}px ${posY}px`,
    }
  }, [])

  return { isInsideTvMask, getTvMaskStyle }
}

// breakpoint "sm" do Tailwind (640px) — abaixo disso, section 2 troca pra
// composição empilhada (conteúdo em cima, tv embaixo, ambos centralizados)
// em vez do deslocamento lateral usado no desktop.
const MOBILE_BREAKPOINT_QUERY = "(max-width: 639px)"
function useIsMobileLayout() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT_QUERY)
    const update = () => setIsMobile(mql.matches)
    update()
    mql.addEventListener("change", update)
    return () => mql.removeEventListener("change", update)
  }, [])

  return isMobile
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
// Exportado e renderizado uma vez em page.tsx (fora do Lobby): nested
// dentro do container "overflow-hidden" do lobby, um `position: fixed`
// ainda fica CLIPADO quando esse ancestral sai da tela pelo scroll normal
// da página (overflow:hidden recorta o conteúdo do descendente mesmo ele
// sendo fixed) — sumia ao entrar na section 3. Fora do lobby, sempre
// acima do conteúdo, em qualquer seção.
export function LobbyChrome() {
  return (
    <>
      {/* left-10px (sem colchetes) não é uma classe Tailwind válida —
          silenciosamente não aplicava NENHUM offset esquerdo no mobile,
          grudando a logo na borda da tela sem margem. */}
      <div className="fixed left-5 top-0 z-30 flex h-11 items-center sm:left-8 sm:top-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-left.svg" alt="Fantom" className="max-w-[80px]" />
      </div>

      {/* TODO: sem funcionalidade ainda, só o visual do botão (menu real vem depois). */}
      <button
        type="button"
        aria-label="Abrir menu"
        className="fixed right-5 top-0 z-30 flex h-11 w-11 items-center justify-center sm:right-8 sm:top-3"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-menu.svg" alt="" className="h-6 w-6" />
      </button>
    </>
  )
}

export function Lobby() {
  const prefersReducedMotion = useReducedMotion()
  const isMobileLayout = useIsMobileLayout()
  const containerRef = useRef<HTMLDivElement>(null)
  const tvPositionX = isMobileLayout ? TV_POSITION_X_MOBILE : TV_POSITION_X
  const tvPosition = `${tvPositionX}% ${TV_POSITION_Y}%`
  const screenAnchor = useScreenAnchor(tvPositionX, TV_POSITION_Y)
  const { isInsideTvMask, getTvMaskStyle } = useTvScreenMask()
  const lenis = useLenis()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const maskScale = useTransform(scrollYProgress, ZOOM_RANGE, [ZOOM_START, 1])
  // mobile: encolhe o grupo inteiro (tv+vídeo+logo) um pouco mais depois
  // do zoom, revelando fundo preto ao redor — ver comentário em
  // MOBILE_FIT_SCALE. 1 (sem efeito) no desktop.
  const mobileFitScale = useTransform(scrollYProgress, SHIFT_RANGE, [1, isMobileLayout ? MOBILE_FIT_SCALE : 1])
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
  // (fundo + vídeo mascarado + logo) suavemente — no desktop, pra
  // esquerda (shiftX), liberando a coluna direita pro conteúdo; no
  // mobile, pra BAIXO (shiftY), já que o conteúdo fica fixo no topo (ver
  // className responsivo da coluna de conteúdo mais abaixo) e não há
  // coluna lateral numa tela estreita. Mesmo valor aplicado aos três
  // (fundo + vídeo + logo), então se movem colados.
  const shiftX = useTransform(scrollYProgress, SHIFT_RANGE, ["0vw", isMobileLayout ? "0vw" : SHIFT_X_TARGET])
  const shiftY = useTransform(scrollYProgress, SHIFT_RANGE, ["0vh", isMobileLayout ? SHIFT_Y_TARGET_MOBILE : "0vh"])
  // combina o deslocamento com a centralização própria da logo (-50%).
  const logoX = useTransform(shiftX, (v) => `calc(-50% + ${v})`)
  const logoY = useTransform(shiftY, (v) => `calc(-50% + ${v})`)
  // "EXPLORE": some GRADUALMENTE conforme o scroll acontece (não num
  // pulo quase instantâneo) — por isso uma janela bem maior que a de
  // outros elementos que só precisavam sumir rápido no início. Existe só
  // na tela inicial: pointer-events some ANTES da opacidade terminar de
  // cair, pra não ficar clicável "fantasma" por cima do conteúdo depois
  // que o usuário já rolou a página.
  const exploreOpacity = useTransform(scrollYProgress, (v) => 1 - Math.min(Math.max(v / EXPLORE_FADE_END, 0), 1))
  const explorePointerEvents = useTransform(scrollYProgress, (v) => (v > 0.05 ? "none" : "auto"))
  // clique no "EXPLORE": rola suavemente até o início da section 2 (mesmo
  // limiar que já ativa insideSection2/getActiveLobbySection). Usa
  // lenis.scrollTo (não window.scrollTo) — com o Lenis ativo, os dois
  // mecanismos de scroll suave competem entre si, e o nativo às vezes
  // parava um pouco ANTES do alvo exato (então insideSection2 não
  // ativava, precisando de mais um scroll manual pra passar do limiar).
  // +0.002 de margem: garante que passa do limiar mesmo com qualquer
  // arredondamento residual.
  const scrollToSection2 = useCallback(() => {
    const maxScroll = (LOBBY_SCROLL_HEIGHT_VH / 100) * window.innerHeight - window.innerHeight
    const target = (LOBBY_SECTIONS[1].progress + 0.002) * maxScroll
    if (lenis) lenis.scrollTo(target, { duration: 1.2 })
    else window.scrollTo({ top: target, behavior: "smooth" })
  }, [lenis])
  // seção ativa (índice em LOBBY_SECTIONS), derivada do progresso do
  // scroll — única leitura de scrollYProgress pra decidir isso; o efeito
  // abaixo (pedras) só deriva um booleano dela, nunca recalcula limiar por
  // conta própria. NÃO usar SHIFT_RANGE[0] direto pra isso: agora que o
  // deslocamento corre junto com o zoom, esse limiar é 0 — usaria como
  // "ativo" desde o topo da página.
  const [activeSection, setActiveSection] = useState(0)
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActiveSection(getActiveLobbySection(v))
  })
  // pedras flutuantes: a entrada NÃO é scrubada continuamente pelo scroll —
  // é autônoma (anima sozinha assim que dispara), só a saída reage ao
  // scroll voltando pro início. o gatilho é o booleano abaixo (cruza o
  // limiar da section 2 em qualquer direção), não um valor contínuo.
  const insideSection2 = activeSection >= 1
  const rockOrbit = useRockOrbit()

  // transição section 2 -> section 3 automática: assim que o movimento de
  // scroll que trouxe o usuário pra section 2 (portfolio) ACOMODA (para
  // de vez, mesmo que só por causa da própria inércia/easing do Lenis),
  // completa sozinho o resto do trecho do lobby até o início da section 3
  // (#o-que-fazemos) — não precisa rolar manualmente até sair do lobby
  // inteiro. Chegar na section 2 já implica ter rolado pra baixo até
  // aqui, então não precisa checar direção de novo — só esperar acomodar.
  //
  // Por que esperar "acomodar" (isScrolling voltar a false) em vez de
  // disparar direto ao cruzar o limiar da section 2: o Lenis global tem
  // duration:1.2s (LenisProvider), então o PRÓPRIO scroll de entrada
  // ainda está em andamento no exato frame em que cruza o limiar —
  // disparar ali saltava pra section 3 na mesma rolada, sem o conteúdo da
  // section 2 (hero, pedras) chegar a aparecer (bug reportado). Esperar o
  // acomodar de verdade garante que a section 2 apareceu primeiro.
  //
  // Dispara uma vez por "visita" à section 2: o ref rearma quando o
  // usuário volta pra section 1 (scroll de volta pra cima), então
  // funciona de novo se ele descer outra vez depois.
  const autoAdvancedRef = useRef(false)
  useLenis(
    (lenisInstance) => {
      if (prefersReducedMotion) return
      if (activeSection < 1) {
        autoAdvancedRef.current = false
        return
      }
      if (autoAdvancedRef.current || lenisInstance.isScrolling !== false) return
      // altura TOTAL do bloco do lobby (não o "lobbyMaxScroll" usado em
      // scrollToSection2/section-nav, que é só onde o sticky SOLTA — a
      // partir dali o conteúdo do lobby ainda ocupa a tela inteira,
      // rolando normalmente, até completar os 300vh). #o-que-fazemos só
      // começa de fato depois desse bloco inteiro.
      const sectionThreeStart = (LOBBY_SCROLL_HEIGHT_VH / 100) * window.innerHeight
      if (lenisInstance.scroll >= sectionThreeStart) return
      autoAdvancedRef.current = true
      // lock: true — sem isso, o momentum residual do próprio wheel que
      // disparou o gatilho continuava sendo processado pelo Lenis no(s)
      // frame(s) seguinte(s) e brigava com o alvo do scrollTo, fazendo o
      // scroll "acomodar" bem antes do destino. Travado, nenhum input
      // durante a animação consegue desviar do destino.
      lenisInstance.scrollTo(sectionThreeStart, { duration: 1.2, lock: true })
    },
    [activeSection, prefersReducedMotion]
  )

  // fallback estático: sem scroll-zoom, sem parallax, uma tela só (project.md, seção 10).
  // conteúdo da hero também aparece aqui (sem stagger, só presente) — é
  // conteúdo real da página (headline, CTA), não decoração, então precisa
  // estar disponível mesmo com motion reduzido.
  if (prefersReducedMotion) {
    return (
      <div className="relative h-screen bg-black">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={POSTER_SRC} alt="" className="h-full w-full object-cover" />
        </div>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-8 px-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-centralized.svg" alt="Fantom" className="w-[220px] sm:w-[280px]" />

          {/* w-full, não só max-w-lg: eixo cruzado (largura) de um item
              flex NÃO esticado (items-center, flex-col) não faz
              shrink-to-fit — sem largura explícita, ele ignora o espaço
              disponível no container e vira do tamanho do próprio
              conteúdo (texto sem quebra) até o teto do max-width,
              estourando a tela em vez de respeitar o px-6 do pai. */}
          <div className="w-full max-w-lg">
            <p className="text-xs tracking-[0.2em] text-white/60 uppercase sm:text-sm">{EYEBROW_TEXT}</p>
            <h1 className="mt-4 text-2xl leading-tight font-medium text-white sm:text-3xl">{HEADLINE_TEXT}</h1>
            <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">{SUBHEAD_TEXT}</p>
            <Button size="lg" className="mt-8 uppercase tracking-wide">
              {CTA_LABEL}
            </Button>

            <p className="mt-10 text-xs text-white/50 uppercase tracking-[0.15em]">{CLIENTS_STAT_TEXT}</p>
            <LogoMarquee className="mt-4 text-left" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative" style={{ height: SCROLL_HEIGHT }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        {/* wrapper do encolhimento extra do mobile (MOBILE_FIT_SCALE) —
            os três filhos (tv, vídeo mascarado, logo) já se posicionam
            certo entre si; escalar o grupo INTEIRO a partir do centro da
            viewport encolhe tudo junto sem precisar recalcular a âncora
            da logo pra um fator extra. scale:1 (sem efeito) no desktop. */}
        <motion.div style={{ scale: mobileFitScale }} className="absolute inset-0">
          {/* cena da tv: escala junto com a máscara (mesmo valor, mesma
              origem no centro), então as duas sempre se movem coladas uma
              na outra, começando ampliada e desamplia até o tamanho normal. */}
          <motion.img
            src="/images/tv-img.jpeg"
            alt=""
            aria-hidden="true"
            style={{ scale: maskScale, x: shiftX, y: shiftY, objectPosition: tvPosition }}
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
              y: shiftY,
              maskImage: "url(/images/tv-mask.png)",
              WebkitMaskImage: "url(/images/tv-mask.png)",
              // máscara dedicada (preto e branco, gerada por limiar de
              // brilho): foca só no núcleo claro da tela, sem o bezel branco
              // do tv vazando vídeo junto. mask-mode: luminance porque a
              // imagem não tem canal alpha.
              maskMode: "luminance",
              maskSize: "cover",
              WebkitMaskSize: "cover",
              maskPosition: tvPosition,
              WebkitMaskPosition: tvPosition,
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
              y: logoY,
            }}
            className="pointer-events-none absolute z-20"
          >
            <MouseResponsiveBackground>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-centralized.svg"
                alt="Fantom"
                className="w-[240px] sm:w-[416px]"
              />
            </MouseResponsiveBackground>
          </motion.div>
        </motion.div>

        {/* "EXPLORE": FORA do wrapper da logo de propósito — aquele já
            escala e se move sozinho desde o início do scroll (logoScale/
            logoLeft/logoTop), o que faria o texto encolher e viajar junto
            pra dentro da tv em vez de simplesmente sumir no lugar. Fica
            parado, só a opacidade muda — só existe na tela inicial
            (posição fixa em relação à viewport, não à logo). Clique rola
            suavemente até a section 2. */}
        <motion.div
          style={{ opacity: exploreOpacity, pointerEvents: explorePointerEvents }}
          className="absolute top-[calc(50%+150px)] left-1/2 z-20 -translate-x-1/2"
        >
          <TextScramble text="EXPLORAR" onClick={scrollToSection2} />
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
            carregamento de página.

            "entra na tv": a pedra fica visível normalmente enquanto
            atravessa por cima da tela da tv (isInsideTvMask) — só some no
            instante em que CRUZA A BORDA PRA FORA da máscara, de volta pro
            resto da viewport (como se tivesse ido pra dentro da tv ali).
            É direcional (importa se está entrando ou saindo da máscara),
            então precisa de estado por frame (useAnimationFrame dentro do
            FloatingRock), não dá pra fazer só com CSS mask-image estático.
            Uma vez escondida, só volta a aparecer quando a órbita chega de
            novo no ponto de entrada (fora da tela inteira) — nunca
            reaparece flutuando no meio do caminho.

            Desativadas no mobile: a órbita e a máscara "entra na tv" das
            pedras dependem de SHIFT_X_TARGET (deslocamento horizontal),
            que no mobile vira 0 (o deslocamento agora é vertical, ver
            shiftY) — tornar as pedras responsivas fica pra uma próxima
            passada; por ora, é um floreio de desktop que não muda o
            conteúdo, então desligar é seguro. */}
        {!isMobileLayout && (
          <div className="pointer-events-none absolute inset-0 z-10">
            <div
              style={{ top: `${rockOrbit.topPct1}%` }}
              className="absolute left-1/2 w-32 -translate-x-1/2 -translate-y-1/2 sm:w-[179.2px]"
            >
              <FloatingRock
                src="/images/rock1-img.svg"
                active={insideSection2}
                entryX={-100}
                duration={110}
                reverse={false}
                className="w-full"
                isInsideTvMask={isInsideTvMask}
                getTvMaskStyle={getTvMaskStyle}
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
                duration={132}
                delay={1.2}
                reverse={true}
                className="w-full"
                isInsideTvMask={isInsideTvMask}
                getTvMaskStyle={getTvMaskStyle}
              />
            </div>
          </div>
        )}

        {/* conteúdo da hero (project.md, seção 6). Desktop (sm+): coluna à
            direita, liberada pelo deslocamento lateral da tv (shiftX).
            Mobile: fixo no TOPO, centralizado — a tv desce (shiftY) pra
            metade de baixo em vez de ir pro lado, então não sobra uma
            "coluna direita" pra ancorar o conteúdo numa tela estreita.
            Entra em stagger assim que chega na section 2 (mesmo gatilho
            das pedras) — ver heroStaggerVariants/heroItemVariants. */}
        <motion.div
          className="pointer-events-none absolute top-[8%] left-1/2 z-20 w-[86%] -translate-x-1/2 text-center sm:top-1/2 sm:right-[8%] sm:left-auto sm:w-auto sm:max-w-[420px] sm:-translate-x-0 sm:-translate-y-1/2 sm:text-left"
          initial="hidden"
          animate={insideSection2 ? "visible" : "hidden"}
          variants={heroStaggerVariants}
        >
          <motion.p
            variants={heroItemVariants}
            className="text-xs tracking-[0.2em] text-white/60 uppercase sm:text-sm"
          >
            {EYEBROW_TEXT}
          </motion.p>

          <motion.h1
            variants={heroItemVariants}
            className="mt-4 text-2xl leading-tight font-medium text-white sm:text-3xl lg:text-4xl"
          >
            {HEADLINE_TEXT}
          </motion.h1>

          <motion.p
            variants={heroItemVariants}
            className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base"
          >
            {SUBHEAD_TEXT}
          </motion.p>

          <motion.div variants={heroItemVariants} className="pointer-events-auto mt-8">
            <Button size="lg" className="uppercase tracking-wide">
              {CTA_LABEL}
            </Button>
          </motion.div>

          <motion.div variants={heroItemVariants} className="mt-10">
            <p className="text-xs text-white/50 uppercase tracking-[0.15em]">{CLIENTS_STAT_TEXT}</p>
            <LogoMarquee className="mt-4" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
