"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react"
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react"
import { useLenis } from "lenis/react"
import type Lenis from "lenis"
import { X } from "lucide-react"
import { AsciiArt } from "@/components/ui/mo-mosaic"
import { MouseResponsiveBackground } from "@/components/ui/mouse-responsive-background"
import { TextScramble } from "@/components/ui/text-scramble"
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button"
import { NeonRGBText } from "@/components/ui/neon-rgbtext-effect"
import { LogoMarquee } from "@/components/ui/logo-marquee"
import { FloatingRock } from "@/components/motion/floating-rock"

// mesmo poster usado pelo <AsciiArt> (agora local, ver mo-mosaic.tsx),
// servido como fallback estático quando o usuário prefere motion
// reduzido (project.md, seção 10).
const POSTER_SRC = "/images/mo-mosaic-poster.webp"

// copy da hero (project.md, seção 6) — mesmo texto usado nas duas versões
// do layout (coluna animada da section 2 e o fallback estático de motion
// reduzido), pra não divergir entre elas.
const EYEBROW_TEXT = "Websites · SaaS · Sistemas com IA"
const HEADLINE_TEXT = "Somos um time de tecnologia e design para negócios e startups"
const SUBHEAD_TEXT = "Da primeira reunião ao produto gerando receita, cuidamos de cada detalhe."
const CTA_LABEL = "Falar com a Fantom"
const CLIENTS_STAT_TEXT = "+ 50 negócios acelerados"
// wa.me: número sem "+"/espaços + texto pré-preenchido (url-encoded) — abre
// o WhatsApp já com a mensagem digitada, só falta o usuário mandar.
const WHATSAPP_CTA_HREF = `https://wa.me/5583991377388?text=${encodeURIComponent("Olá, quero começar meu projeto!")}`

// entrada em stagger do conteúdo da hero (coluna direita, section 2):
// eyebrow, H1, subhead e CTA entram na sequência, ~80ms entre cada,
// deslizando da direita (x positivo) pra sua posição final — mesmo
// gatilho (insideSection2) que já controla as pedras. Reversível: ao
// rolar de volta, o stagger desfaz sozinho (Motion anima de volta pro
// estado "hidden").
const HERO_STAGGER_CHILDREN_S = 0.08
const HERO_ITEM_DURATION_S = 0.5
const heroStaggerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: HERO_STAGGER_CHILDREN_S } },
}
const heroItemVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: HERO_ITEM_DURATION_S, ease: "easeOut" } },
}
// interruptor pra desligar as pedras flutuantes (ver bloco "pedras
// flutuantes" mais abaixo) sem remover o código — pedido explícito: "depois
// podemos adicionar de novo, então apenas desative". Reativar é só virar
// pra true de novo.
const FLOATING_ROCKS_ENABLED = false

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
// alvo (px de scroll) do "resting point" da section 2, já com zoom/shift
// completos — mesmo destino usado pelo clique em "EXPLORAR" e pelo loader
// de entrada (scrollToSection2 abaixo), e também pelo auto-scroll reverso
// da section 3 de volta pra section 2 (useLenis em o-que-fazemos.tsx) —
// exportado como fonte única pra não desalinhar os dois lugares.
export function getSection2ScrollTarget(): number {
  const maxScroll = (LOBBY_SCROLL_HEIGHT_VH / 100) * window.innerHeight - window.innerHeight
  return (SHIFT_RANGE[1] + 0.002) * maxScroll
}
// posição (px de scroll) onde a section 3 (#o-que-fazemos) começa de fato —
// ver comentário maior sobre "sectionThreeStart" no useLenis do auto-advance
// abaixo. Exportado pro mesmo motivo de getSection2ScrollTarget: usado pelos
// DOIS lados do salto (aqui e em o-que-fazemos.tsx).
export function getSectionThreeStart(): number {
  return (LOBBY_SCROLL_HEIGHT_VH / 100) * window.innerHeight
}
// duração (s) dos saltos automáticos entre section 2 e 3 — usada pros DOIS
// lados (section2->3 aqui embaixo, section3->2 em o-que-fazemos.tsx). FIXA
// (não recalculada a partir da distância de CADA salto): a descida sempre
// parte de ONDE o usuário parou de rolar dentro da section 2 (varia — pode
// parar logo no início do trecho ou bem mais adiante), enquanto a subida
// sempre parte do mesmo ponto fixo (a borda de cima da section 3, a
// distância cheia). Calcular a duração a partir da distância REAL de cada
// salto (tentativa anterior) até igualava a velocidade média (px/s) dos
// dois — mas uma descida mais curta então TERMINAVA MAIS RÁPIDO (menos
// tempo total) que a subida (sempre a distância cheia, sempre mais tempo),
// e isso ainda "lia" como a subida sendo mais rápida/dramática (bug
// reportado, persistente mesmo depois da 1a correção: "a subida continua
// visivelmente mais acelerada que a descida"). Duração FIXA (baseada na
// distância de REFERÊNCIA — o trecho todo, section2Target até
// sectionThreeStart — não na distância real de cada salto) garante o MESMO
// tempo total nos dois sentidos sempre, eliminando a diferença de verdade.
const AUTO_JUMP_SPEED_PX_PER_S = 950
// clamp só pra nunca ficar LITERALMENTE instantâneo nem arrastado demais em
// telas muito baixas/altas (a distância de referência muda com
// window.innerHeight).
const AUTO_JUMP_MIN_DURATION_S = 0.6
const AUTO_JUMP_MAX_DURATION_S = 2.2
export function getAutoJumpDuration(): number {
  const referenceDistance = Math.abs(getSectionThreeStart() - getSection2ScrollTarget())
  return Math.min(
    Math.max(referenceDistance / AUTO_JUMP_SPEED_PX_PER_S, AUTO_JUMP_MIN_DURATION_S),
    AUTO_JUMP_MAX_DURATION_S
  )
}
// tempo (ms) que o salto automático trava o scroll pra absorver o momentum
// residual do PRÓPRIO gesto que disparou o gatilho (ver comentário grande
// onde os dois saltos chamam isso: "lock: true — sem isso, o momentum
// residual..."). NÃO é a duração da animação inteira (getAutoJumpDuration,
// ~0.6-2.2s) — travar o scroll pelo tempo TODO do salto (`{ lock: true }`
// direto no scrollTo, versão anterior) bloqueava qualquer tentativa de
// scroll do usuário durante o salto inteiro, não só o instante inicial que
// precisava de proteção. Reportado como "trava": subir pra section 2
// (salto reverso, seu próprio lock de ~1.9s) e tentar descer rápido caía
// bem dentro dessa janela — usava a MESMA função nos dois saltos (forward e
// reverse), então o problema existia nos dois sentidos. Curto o bastante
// pra não ser perceptível como delay, longo o bastante pra cobrir os
// primeiros frames onde o momentum residual do wheel ainda chega.
const AUTO_JUMP_LOCK_GUARD_MS = 250
// dispara um scrollTo travado só durante o guard acima (não a animação
// inteira) — chamado pelos dois saltos automáticos (forward aqui em
// lobby.tsx, reverse em o-que-fazemos.tsx) pra manter o mesmo
// comportamento nos dois sentidos. `set isLocked` é `private` no .d.ts do
// Lenis (só `get` é público) — mas no JS compilado é um setter comum (não
// um `#private` de verdade, ver node_modules/lenis/dist/lenis.mjs), então
// o cast abaixo é seguro em runtime; sem ele não tem como fazer um lock
// CURTO (só `stop()`/`start()` são públicos, mas esses abortam a animação
// inteira via `reset()` — não servem aqui, ver comentário acima) nem
// passar `{ lock: true }` pro scrollTo (trava pela duração INTEIRA, o
// problema que este helper existe pra resolver).
type LenisWithLockSetter = Lenis & { isLocked: boolean }
export function autoJumpScrollTo(lenisInstance: Lenis, target: number) {
  const lockable = lenisInstance as LenisWithLockSetter
  // isLocked entra dentro de onStart, NÃO antes do scrollTo: o próprio
  // scrollTo despreza a chamada inteira se isLocked já for true na hora
  // (`if ((this.isStopped || this.isLocked) && !force) return`, ver
  // node_modules/lenis/dist/lenis.mjs) — travar ANTES fazia o salto
  // travar a si mesmo antes de sequer começar a animar (bug descoberto
  // testando este fix: o "salto" nunca saía do lugar, só o momentum
  // residual do tick que disparou o gatilho continuava rolando sozinho).
  // onStart roda depois que o scrollTo já aceitou iniciar a animação —
  // mesmo ponto onde a própria opção `lock` do Lenis faz isso internamente.
  lenisInstance.scrollTo(target, {
    duration: getAutoJumpDuration(),
    onStart: () => {
      lockable.isLocked = true
      setTimeout(() => {
        lockable.isLocked = false
      }, AUTO_JUMP_LOCK_GUARD_MS)
    },
  })
}
// desktop: em telas MUITO largas (ultrawide), a tv (cover-fit contra a
// viewport inteira) cobre uma faixa vertical menor da foto original — o
// topo da tv acaba rente à borda do viewport, parecendo cortado (pedido:
// "fica cortando em cima a imagem da tv"). 0.9 encolhe 10% na posição
// final, revelando margem preta ao redor (ver desktopFitScale).
const DESKTOP_FIT_SCALE_END = 1.0
// duração (em fração de scrollYProgress) do fade do "EXPLORE".
const EXPLORE_FADE_END = 0.15
// loader de entrada (desktop): mesma composição visual da section 1 (zoom
// cheio na tela do tv), só que com "CARREGANDO" + uma barra de progresso no
// lugar do "EXPLORAR" clicável — e sem poder rolar manualmente enquanto
// carrega (ver lenis.stop()/start() no efeito abaixo). Ao terminar, rola
// sozinho pra section 2 (mesmo destino de scrollToSection2) e a partir daí
// o site funciona exatamente como antes: subir pra section 1 e descer nunca
// mais mostra o loader de novo (loaderActive só desliga, nunca religa).
const LOADER_DURATION_S = 2.6
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
//
// mobile: "início" (o zoom de tela cheia) não existe visualmente — o site
// já começa direto na composição assentada (ver useMobileTvFit e o resto
// da lógica isMobileLayout mais abaixo). Com o limiar de "portfólio" igual
// ao do desktop (SHIFT_RANGE[1] = 0.5 de scrollYProgress), o usuário
// precisava rolar uma viewport inteira "no escuro" (nada muda na tela) só
// pra sair de "início" e entrar em "portfólio" no section-nav — e só
// DEPOIS disso a section 3 ficava alcançável, criando a fricção reportada
// ("pra sair da tela inicial tem fricção pra ir pra section 3", "no
// mobile a section 1 deve ser a section 2 também"). Limiar 0 no mobile:
// "início" e "portfólio" mostram a mesma tela desde sempre, então já
// nasce em "portfólio" — sem distância de rolagem extra pra percorrer.
export function getLobbySections(isMobileLayout: boolean) {
  return [
    { id: "inicio", label: "Início", progress: 0 },
    { id: "portfolio", label: "Portfólio", progress: isMobileLayout ? 0 : SHIFT_RANGE[1] },
  ] as const
}

// índice (em getLobbySections(isMobileLayout)) da seção ativa pra um dado
// scrollYProgress.
export function getActiveLobbySection(progress: number, isMobileLayout: boolean) {
  const sections = getLobbySections(isMobileLayout)
  let index = 0
  for (let i = 0; i < sections.length; i++) {
    if (progress >= sections[i].progress) index = i
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
// (0.4) que cabia justo dentro da tela do tv sem estourar. Aumentada de
// novo (pedido: "ta um pouco pequena"), ainda dentro da margem da tela.
const LOGO_ZOOM_END = 0.75

// mobile: object-fit/mask "cover" pra uma viewport retrato (estreita e
// alta) contra essa foto paisagem (2752x1536) usa a ALTURA INTEIRA da
// imagem (sh=naturalH sempre, já que imgRatio > boxRatio) — a tela do tv
// só ocupa ~49% dessa altura (SCREEN_FRAC_H), então o resto do quadro
// (topo do móvel/parede acima, base abaixo) fica visível junto, SEM
// máscara ali (só a tela tem o recorte do mosaico). Isso não é bug: é a
// FOTO INTEIRA do tv (moldura + tela), do mesmo jeito que o desktop já
// mostra em repouso (maskScale final = 1, igual aos dois). O que
// "vazava" era o shiftY/MOBILE_FIT_SCALE desencontrados (ver
// SHIFT_Y_TARGET_MOBILE) empurrando o conjunto quase inteiro pra fora da
// viewport, sobrando só uma tira desconectada — não a tela mascarada
// desalinhada da imagem, os dois sempre usam a mesma transform.

// mobile: a composição da tv (foto + vídeo mascarado + logo) ocupa a
// LARGURA INTEIRA da tela (pedido explícito: "deve ocupar toda a largura")
// e uma proporção FIXA (não mais medida via JS contra o espaço restante da
// viewport, ver useMobileTvFit — removida junto com o resto do scroll-
// jacking do mobile, pedido explícito: "rolagem do mobile deve ser o mais
// simples possível, sem os efeitos que temos no desktop"). Portrait (mais
// alta que larga) — aproxima a proporção que a medição antiga costumava
// produzir num celular típico (largura cheia, altura = o que sobra depois
// do conteúdo da hero, tipicamente perto de quadrado/levemente retrato).
const MOBILE_TV_ASPECT_RATIO = 4 / 5

// calcula, em tempo real, onde o centro da máscara (tv-mask.png) cai na
// CAIXA atual — replicando o mesmo algoritmo de object-fit: cover +
// object-position usado pelo fundo/máscara. Evita depender de uma
// porcentagem fixa (que quebra em proporções de tela diferentes, o mesmo
// problema que o chroma key já resolveu pro vídeo). Recalcula no resize
// e quando o TV_POSITION_X efetivo muda (troca de layout mobile/desktop).
// boxAspectRatio: no mobile a caixa NÃO é mais a viewport inteira (ver
// MOBILE_TV_ASPECT_RATIO — largura cheia, altura fixada por essa proporção)
// — sem isso, a logo calcularia a posição contra a altura ERRADA (viewport
// inteira) e ficaria fora do lugar dentro da tela da tv. undefined
// (desktop) usa window.innerHeight, igual a caixa real lá (wrapper
// inset-0). Proporção (não um px medido via ref/JS): a caixa do mobile tem
// tamanho FIXO em CSS agora (aspect-ratio), então a altura sempre deriva
// direto da largura — não precisa medir nada em tempo de execução.
function useScreenAnchor(tvPositionX: number, tvPositionY: number, boxAspectRatio?: number) {
  const [anchor, setAnchor] = useState({ xPct: 50, yPct: 50 })

  useEffect(() => {
    const img = new Image()
    img.src = "/images/tv-mask.png"

    const compute = () => {
      const naturalW = img.naturalWidth
      const naturalH = img.naturalHeight
      const boxW = window.innerWidth
      const boxH = boxAspectRatio ? boxW / boxAspectRatio : window.innerHeight
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
  }, [tvPositionX, tvPositionY, boxAspectRatio])

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
      // tv-mask-alpha.png (não tv-mask.png), sem mask-mode: veja o
      // comentário grande na video-mask-layer mais abaixo — mesmo motivo.
      maskImage: "url(/images/tv-mask-alpha.png)",
      WebkitMaskImage: "url(/images/tv-mask-alpha.png)",
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
// useLayoutEffect (não useEffect) de propósito: roda ANTES do browser
// pintar o primeiro frame, não depois. Sem isso, celulares reais chegavam
// a mostrar um frame com o layout de DESKTOP (zoom cheio, "section 1")
// antes do media query resolver e trocar pro layout empilhado — um flash
// perceptível (bug reportado: "site iniciando na section 1"). No servidor
// (SSR) useLayoutEffect não roda (só client), então o fallback SSR
// continua sendo isMobile=false — sem mismatch de hidratação, só o timing
// no cliente muda.
export function useIsMobileLayout() {
  const [isMobile, setIsMobile] = useState(false)

  useLayoutEffect(() => {
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

// seções do menu — lista curta e fixa (pedido explícito: reduzir pra 4
// itens), não é mais a lista completa de seções da home (essa continua no
// SectionNav, os pontinhos). "soluções" mapeia pra a seção real "o que
// fazemos" (única que fala de serviços hoje); "sobre" ainda não tem seção
// própria (fica clicável mas sem navegar — mesmo placeholder que
// método/faq/contato já tinham antes, ver handleNavigate).
const MENU_SECTIONS = [
  { id: "inicio", label: "Início" },
  { id: "solucoes", label: "Soluções" },
  { id: "cases", label: "Cases" },
  { id: "sobre", label: "Sobre" },
] as const

// elementos fixos que não participam do zoom: logo-left e o menu (ícone +
// painel de navegação). Exportado e renderizado uma vez em page.tsx (fora
// do Lobby): nested dentro do container "overflow-hidden" do lobby, um
// `position: fixed` ainda fica CLIPADO quando esse ancestral sai da tela
// pelo scroll normal da página (overflow:hidden recorta o conteúdo do
// descendente mesmo ele sendo fixed) — sumia ao entrar na section 3. Fora
// do lobby, sempre acima do conteúdo, em qualquer seção.
export function LobbyChrome() {
  const isMobileLayout = useIsMobileLayout()
  const lenis = useLenis()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // fecha clicando fora do painel ou com Escape — comportamento padrão
  // esperado de um menu dropdown. Só escuta enquanto está aberto.
  useEffect(() => {
    if (!isMenuOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false)
    }
    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isMenuOpen])

  // desktop: "início"/"cases" não são elementos reais no DOM (o lobby ocupa
  // o topo da página sozinho, com scroll-jacking) — precisam do alvo
  // calculado (topo da página / resting point da section 2, mesma fonte que
  // scrollToSection2 usa), não de um id pra resolver.
  // mobile: a section 2 já é um elemento real no DOM (id="portfolio", sem
  // scroll-jacking, ver o branch isMobileLayout em Lobby()) e mostra a
  // MESMA tela que "início" — os dois viram scroll pro topo (0), sem
  // resting point separado (esse conceito só existe no bloco de 300vh do
  // desktop, que o mobile não tem mais).
  // "soluções" mapeia pro id real de "o que fazemos" nos dois. "sobre" (e
  // qualquer id futuro sem seção própria ainda) cai no fallback `#id`:
  // lenis.scrollTo avisa "Target not found" no console e não faz nada — sem
  // quebrar o clique, só sem navegar até a seção existir.
  const handleNavigate = useCallback(
    (id: string) => {
      setIsMenuOpen(false)
      const elementId = id === "solucoes" ? "o-que-fazemos" : id
      const isTopTarget = id === "inicio" || (isMobileLayout && id === "cases")
      const target = isTopTarget ? 0 : id === "cases" ? getSection2ScrollTarget() : `#${elementId}`
      if (lenis) lenis.scrollTo(target, { duration: 1.2 })
      else if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" })
      else document.getElementById(elementId)?.scrollIntoView({ behavior: "smooth" })
    },
    [lenis, isMobileLayout]
  )

  return (
    <>
      {/* left-[30px]/sm:left-[42px] (não left-5/sm:left-8, 20px/32px): o
          botão do menu (w-11 centralizando um ícone h-6, ver abaixo) tem
          10px de padding invisível entre a borda do botão e o ícone
          visível — a logo (sem esse padding, a imagem já encosta na borda
          do wrapper) precisava dos mesmos +10px pra alinhar com a margem
          VISÍVEL do ícone, não só com a margem do container (pedido
          explícito: "margem de logo-left igual a do menu icon"). */}
      <div className="fixed left-[30px] top-0 z-30 flex h-11 items-center sm:left-[42px] sm:top-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-left.svg" alt="Fantom" className="max-w-[80px]" />
      </div>

      <div ref={menuRef} className="fixed right-5 top-0 z-30 sm:right-8 sm:top-3">
        <button
          type="button"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center"
        >
          {isMenuOpen ? (
            <X aria-hidden="true" className="h-6 w-6 text-white" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/icon-menu.svg" alt="" className="h-6 w-6" />
          )}
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            // sem card/modal por trás — só os textos flutuando sobre o
            // fundo, sem seta nem linha (showAffordances={false}, essas
            // affordances foram pensadas pro "EXPLORAR" sozinho na tela, não
            // pra uma lista repetida) e em 16px (textSizeClassName, o padrão
            // de TextScramble é text-sm/14px).
            <motion.nav
              aria-label="Menu de navegação"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute top-full right-0 mt-4 flex flex-col items-end gap-3"
            >
              {MENU_SECTIONS.map((section) => (
                <TextScramble
                  key={section.id}
                  text={section.label}
                  onClick={() => handleNavigate(section.id)}
                  showAffordances={false}
                  textSizeClassName="text-xs"
                  className="items-end text-right"
                />
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export function Lobby() {
  const prefersReducedMotion = useReducedMotion()
  const isMobileLayout = useIsMobileLayout()
  // isMobileLayout só existe no CLIENTE, depois de montar — o HTML gerado
  // pelo servidor (e o primeiro frame antes da hidratação) sempre assume
  // "false" (não tem como o servidor saber a largura da tela). Nesse
  // intervalo (que pode ser bem maior que um frame, em conexão/aparelho
  // lento — é ISSO que o bug reportado "site iniciando na section 1"
  // descreve), o mobile via o zoom cheio de desktop por um instante. Como
  // JS não consegue interceptar o que o servidor já mandou, a correção é
  // puramente CSS: `mounted` (useMounted, já existente) também nasce
  // "false" no servidor E no primeiro render do cliente (sem mismatch de
  // hidratação), então dá pra escopar regras em globals.css só pra esse
  // intervalo (".not-hydrated" + media query mobile) que aproximam a
  // composição final sem depender de JS ter rodado — ver classes
  // lobby-tv-wrapper/lobby-tv-img/lobby-tv-mask/lobby-explore abaixo.
  const mounted = useMounted()
  const containerRef = useRef<HTMLDivElement>(null)
  const tvPositionX = isMobileLayout ? TV_POSITION_X_MOBILE : TV_POSITION_X
  const tvPosition = `${tvPositionX}% ${TV_POSITION_Y}%`
  // mobile: a caixa real da tv não é mais a viewport inteira, é uma
  // proporção fixa (MOBILE_TV_ASPECT_RATIO) — passa pra âncora da logo
  // calcular a posição contra a caixa certa (ver useScreenAnchor).
  const screenAnchor = useScreenAnchor(tvPositionX, TV_POSITION_Y, isMobileLayout ? MOBILE_TV_ASPECT_RATIO : undefined)
  const { isInsideTvMask, getTvMaskStyle } = useTvScreenMask()
  const lenis = useLenis()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // mobile: o site "começa" direto na composição assentada (tv+mascara já
  // alinhadas, sem o zoom-in vindo de uma section 1 em tela cheia — essa
  // fase inicial não existe no mobile). Em vez de ramificar o JSX inteiro,
  // cada useTransform abaixo colapsa pro MESMO valor nas duas pontas do
  // range quando isMobileLayout — a interpolação fica uma constante, então
  // o valor já nasce no estado final e nunca muda com o scroll. Desktop
  // sem alteração nenhuma (ranges originais, intactos).
  const maskScale = useTransform(scrollYProgress, ZOOM_RANGE, [isMobileLayout ? 1 : ZOOM_START, 1])
  // cancela o zoom do wrapper no conteúdo do vídeo: a "janela" da máscara
  // precisa encolher, mas o enquadramento do vídeo em si não deveria
  // começar ampliado — ele só devia diminuir de tamanho, não de zoom.
  const videoCounterScale = useTransform(maskScale, (s) => 1 / s)
  const logoScale = useTransform(scrollYProgress, ZOOM_RANGE, [isMobileLayout ? LOGO_ZOOM_END : 1, LOGO_ZOOM_END])
  // a logo começa no centro puro da viewport (onde o vídeo está em tela
  // cheia) e termina no centro real da tela do tv (calculado por
  // useScreenAnchor), acompanhando o scroll — não é uma posição fixa.
  // mobile: já nasce na posição final (sem o "centro puro" de largada).
  const logoLeft = useTransform(
    scrollYProgress,
    ZOOM_RANGE,
    [isMobileLayout ? `${screenAnchor.xPct}%` : "50%", `${screenAnchor.xPct}%`]
  )
  const logoTop = useTransform(
    scrollYProgress,
    ZOOM_RANGE,
    [isMobileLayout ? `${screenAnchor.yPct}%` : "50%", `${screenAnchor.yPct}%`]
  )
  // desloca o conjunto (fundo + vídeo mascarado + logo) pra ESQUERDA
  // depois do zoom completo, só no desktop (shiftX) — libera a coluna
  // direita pro conteúdo. Mobile não desloca mais nada: a posição vertical
  // da tv agora vem de redimensionar a própria caixa do wrapper
  // (useMobileTvFit/top+height em px, ver JSX), não de um shift por
  // transform — por isso "0vh" sempre no mobile.
  const shiftX = useTransform(scrollYProgress, SHIFT_RANGE, ["0vw", isMobileLayout ? "0vw" : SHIFT_X_TARGET])
  const shiftY = useTransform(scrollYProgress, SHIFT_RANGE, ["0vh", "0vh"])
  // desktop: na posição final, o grupo inteiro (tv + vídeo + logo) encolhe
  // mais um pouco a partir do centro do viewport — ver DESKTOP_FIT_SCALE_END.
  // Aplicado no MESMO wrapper que já envolve os três juntos, então encolhem
  // coesos sem precisar recalcular a âncora da logo pra esse fator extra
  // (mesma lógica que já era usada pro mobile, ver useMobileTvFit). 1 (sem
  // efeito) no mobile, que tem seu próprio mecanismo de tamanho.
  const desktopFitScale = useTransform(scrollYProgress, SHIFT_RANGE, [1, isMobileLayout ? 1 : DESKTOP_FIT_SCALE_END])
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
  // arredondamento residual. SHIFT_RANGE[1] direto (não
  // getLobbySections(isMobileLayout)[1].progress): o "EXPLORAR" só existe
  // no desktop (ver JSX mais abaixo, escondido no mobile), então o limiar
  // aqui é sempre o do desktop.
  const scrollToSection2 = useCallback(() => {
    const target = getSection2ScrollTarget()
    if (lenis) lenis.scrollTo(target, { duration: 1.2 })
    else window.scrollTo({ top: target, behavior: "smooth" })
  }, [lenis])
  // loader de entrada (desktop, ver LOADER_DURATION_S acima). true por
  // padrão (mesmo valor no servidor e no primeiro render do cliente — sem
  // mismatch de hidratação) e só desliga uma vez, quando a barra termina;
  // nunca mais liga de novo depois disso, mesmo subindo/descendo entre
  // section 1 e 2 (não é um estado derivado do scroll, é "já aconteceu?").
  const [loaderActive, setLoaderActive] = useState(true)
  const loaderCompletedRef = useRef(false)
  // se a página recarrega (F5) já rolada (o navegador restaura a posição
  // de scroll sozinho, ex.: usuário na section 2 aperta F5) o loader
  // nascia "true" do mesmo jeito — e, diferente do "EXPLORAR" normal, ele
  // não tem um fade ligado ao scroll (exploreOpacity), então aparecia por
  // cima do conteúdo em tela cheia + travava o scroll (lenis.stop()) até a
  // barra terminar, mesmo o usuário já estando na section 2 (bug
  // reportado). useLayoutEffect (não useEffect): mede ANTES do primeiro
  // paint, então desliga o loader antes dele sequer chegar a ficar visível
  // nesse caso — sem flash.
  useLayoutEffect(() => {
    const checkInitialScroll = () => {
      if (window.scrollY > 0) {
        loaderCompletedRef.current = true
        setLoaderActive(false)
      }
    }
    checkInitialScroll()
  }, [])
  // trava o scroll (roda/toque/trackpad) enquanto o loader roda — sem isso
  // o usuário podia pular a section 2 manualmente antes da barra terminar.
  // No mobile isMobileLayout vira true e este efeito nunca chega a rodar
  // (o loader não existe lá, ver JSX abaixo), então nunca trava o scroll
  // do mobile por engano. prefersReducedMotion também exclui: esses
  // usuários caem no fallback estático (return antecipado mais abaixo, SEM
  // a barra de progresso) — sem o onAnimationComplete que chama
  // handleLoaderComplete, o stop() nunca seria desfeito, travando o scroll
  // pra sempre.
  useEffect(() => {
    if (isMobileLayout || !loaderActive || !lenis || prefersReducedMotion) return
    lenis.stop()
    return () => {
      lenis.start()
    }
  }, [isMobileLayout, loaderActive, lenis, prefersReducedMotion])
  // chamado quando a barra de progresso termina de encher: desliga o
  // loader (de vez, ver loaderCompletedRef) e rola sozinho pra section 2 —
  // mesmo destino de clicar em "EXPLORAR" hoje. lenis.start() EXPLÍCITO
  // aqui (não só via cleanup do efeito acima): scrollToSection2 chama
  // scrollTo sem { force: true }, que a lib ignora enquanto stop() ainda
  // está em vigor — e o cleanup do efeito (disparado por setLoaderActive)
  // só roda depois de um novo ciclo de render, tarde demais pro scrollTo
  // síncrono logo abaixo.
  const handleLoaderComplete = useCallback(() => {
    if (loaderCompletedRef.current) return
    loaderCompletedRef.current = true
    setLoaderActive(false)
    lenis?.start()
    scrollToSection2()
  }, [scrollToSection2, lenis])
  // seção ativa (índice em LOBBY_SECTIONS), derivada do progresso do
  // scroll — única leitura de scrollYProgress pra decidir isso; o efeito
  // abaixo (pedras) só deriva um booleano dela, nunca recalcula limiar por
  // conta própria. NÃO usar SHIFT_RANGE[0] direto pra isso: agora que o
  // deslocamento corre junto com o zoom, esse limiar é 0 — usaria como
  // "ativo" desde o topo da página.
  const [activeSection, setActiveSection] = useState(0)
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActiveSection(getActiveLobbySection(v, isMobileLayout))
  })
  // mobile: sem isso, activeSection só atualiza no PRIMEIRO evento de
  // scroll (useMotionValueEvent só dispara em mudança) — se o usuário
  // ainda não rolou nada, ficava preso no valor inicial (0, "início")
  // mesmo isMobileLayout já sabendo que é mobile, onde "início" nem
  // deveria existir como estado distinto (ver getLobbySections). Sincroniza
  // assim que isMobileLayout é confirmado, sem esperar scroll nenhum.
  useEffect(() => {
    const syncMobileActiveSection = () => {
      if (isMobileLayout) setActiveSection(1)
    }
    syncMobileActiveSection()
  }, [isMobileLayout])
  // pedras flutuantes: a entrada NÃO é scrubada continuamente pelo scroll —
  // é autônoma (anima sozinha assim que dispara), só a saída reage ao
  // scroll voltando pro início. o gatilho é o booleano abaixo (cruza o
  // limiar da section 2 em qualquer direção), não um valor contínuo.
  // mobile: sempre "dentro" da section 2 — o site já começa nela, não tem
  // scroll pra cruzar limiar nenhum (conteúdo aparece de cara, com o
  // stagger de entrada rodando uma vez no mount).
  const insideSection2 = isMobileLayout || activeSection >= 1
  const rockOrbit = useRockOrbit()

  // transição section 2 -> section 3: NÃO é mais automática por tempo — só
  // completa o resto do trecho do lobby até o início da section 3
  // (#o-que-fazemos) quando o usuário efetivamente PAUSAR e então continuar
  // rolando pra baixo. Sem isso o usuário precisaria rolar manualmente por
  // um trecho grande e "morto" do lobby (zoom e deslocamento já terminaram
  // em SHIFT_RANGE[1], mas o bloco de 300vh só acaba bem depois) — então,
  // depois de uma pausa real, a rolada seguinte pra baixo é sequestrada e
  // vira o salto completo até a section 3.
  //
  // Por que precisa da pausa (e não só "cruzou o alvo rolando pra baixo"):
  // o salto trava o scroll por um instante (AUTO_JUMP_LOCK_GUARD_MS, ver
  // autoJumpScrollTo). Disparar isso na MESMA rolada contínua que trouxe o
  // usuário até aqui (sem pausa nenhuma) faz a section 2 nem chegar a
  // "segurar" — o usuário sente que rolou uma vez e o scroll travou/pulou
  // direto pra section 3, sem nunca ter conseguido parar ali (bug
  // reportado: "continua travando o scroll, e ao tirar o delay começou a
  // descer da section 2 pra 3 direto. só piorou").
  //
  // Por que NÃO usar isScrolling===false pra detectar a pausa (tentativa
  // anterior): o wheel handler do Lenis reinicia a MESMA animação
  // (duration:1.2s, LenisProvider) a cada tick — numa rolada contínua
  // (sem soltar o trackpad/mouse), isScrolling nunca volta a false NO MEIO
  // do gesto, só ~1.2s depois do ÚLTIMO tick. Detectar a pausa direto do
  // INPUT bruto (wheel/touchmove nativos, ver lastWheelOrTouchAtRef abaixo)
  // em vez de um estado derivado do Lenis resolve isso: reflete quando o
  // usuário genuinamente parou de mandar input, não quando a animação de
  // easing (que pode continuar rodando por mais tempo) termina de vez.
  const autoAdvancedRef = useRef(false)
  const lastWheelOrTouchAtRef = useRef(0)
  useEffect(() => {
    const markInput = () => {
      lastWheelOrTouchAtRef.current = Date.now()
    }
    window.addEventListener("wheel", markInput, { passive: true })
    window.addEventListener("touchmove", markInput, { passive: true })
    return () => {
      window.removeEventListener("wheel", markInput)
      window.removeEventListener("touchmove", markInput)
    }
  }, [])
  // gap mínimo (ms) sem nenhum input bruto pra considerar que o usuário
  // "pausou" — curto o bastante pra não parecer uma espera de verdade
  // (pedido explícito, ver comentário grande acima: nenhum delay
  // perceptível), longo o bastante pra nunca ser preenchido por ticks
  // consecutivos de uma rolada contínua de trackpad/mouse (que chegam bem
  // mais rápido que isso).
  const SECTION2_PAUSE_GAP_MS = 150
  // rastreia se o scroll já passou do início da section 3 nesta "visita" —
  // sem isso, voltar da section 3 pra section 2 e descer de novo não
  // disparava o auto-advance uma segunda vez (bug reportado: "só ocorre uma
  // vez"). Qualquer volta de além do limiar da section 3 pra aquém dele
  // conta como nova visita e rearma o gatilho (mobile nem chega aqui, ver
  // isMobileLayout logo abaixo — isso é 100% desktop agora).
  const wasBeyondSectionThreeRef = useRef(false)
  useLenis(
    (lenisInstance) => {
      if (prefersReducedMotion) return
      // mobile não tem mais o bloco de 300vh/sticky pra pular (ver o
      // branch isMobileLayout no JSX acima) — nada pra este gatilho fazer
      // lá, o scroll já é 100% nativo/simples.
      if (isMobileLayout) return
      // altura TOTAL do bloco do lobby (não o "lobbyMaxScroll" usado em
      // scrollToSection2/section-nav, que é só onde o sticky SOLTA — a
      // partir dali o conteúdo do lobby ainda ocupa a tela inteira,
      // rolando normalmente, até completar os 300vh). #o-que-fazemos só
      // começa de fato depois desse bloco inteiro.
      const sectionThreeStart = (LOBBY_SCROLL_HEIGHT_VH / 100) * window.innerHeight
      if (lenisInstance.scroll >= sectionThreeStart) {
        wasBeyondSectionThreeRef.current = true
        return
      }
      if (wasBeyondSectionThreeRef.current) {
        wasBeyondSectionThreeRef.current = false
        autoAdvancedRef.current = false
      }
      // só passa daqui depois que o scroll realmente chegou perto do
      // "resting point" da section 2 (mesmo alvo do salto reverso,
      // getSection2ScrollTarget) — NÃO usar activeSection (versão
      // anterior): no MOBILE activeSection já nasce >=1 desde scroll=0
      // (início/portfólio mostram a mesma tela, ver
      // getLobbySections/insideSection2 acima), então checar
      // "activeSection < 1" nunca segurava nada lá. Checar a posição real
      // do scroll (não um estado derivado com semântica diferente por
      // plataforma) funciona igual nos dois — no desktop os dois limiares
      // já coincidiam (SHIFT_RANGE[1] é a mesma base dos dois cálculos).
      if (lenisInstance.scroll < getSection2ScrollTarget()) {
        autoAdvancedRef.current = false
        return
      }
      if (autoAdvancedRef.current) return
      if (lenisInstance.direction <= 0) return
      // ainda dentro de uma rolada contínua (o último input bruto foi há
      // menos de SECTION2_PAUSE_GAP_MS) — não conta como "pausou e decidiu
      // continuar", deixa essa rolada só avançar o pouquinho normal dela.
      if (Date.now() - lastWheelOrTouchAtRef.current < SECTION2_PAUSE_GAP_MS) return
      autoAdvancedRef.current = true
      autoJumpScrollTo(lenisInstance, sectionThreeStart)
    },
    [prefersReducedMotion, isMobileLayout]
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
            <div className="mt-4">
              <NeonRGBText
                text={HEADLINE_TEXT}
                className="text-2xl leading-tight font-medium text-white sm:text-3xl"
              />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">{SUBHEAD_TEXT}</p>
            <div className="mt-8">
              <LiquidMetalButton label={CTA_LABEL} href={WHATSAPP_CTA_HREF} />
            </div>

            <p className="mt-10 text-xs text-white/50 uppercase tracking-[0.15em]">{CLIENTS_STAT_TEXT}</p>
            <LogoMarquee className="mt-4 text-left" />
          </div>
        </div>
      </div>
    )
  }

  // mobile: sem scroll-jacking (nada de 300vh/sticky) — a rolagem do
  // mobile deve ser a mais simples possível, sem os efeitos do desktop
  // (pedido explícito). Hero + composição da tv em fluxo normal, empilhados
  // um abaixo do outro, do tamanho real do próprio conteúdo — sem "zona
  // morta" pra rolar manualmente nem saltos automáticos (removidos, ver
  // isMobileLayout no forward auto-advance abaixo e no salto reverso em
  // o-que-fazemos.tsx). id="portfolio": elemento real no DOM agora — o
  // SectionNav observa via IntersectionObserver, igual às demais seções
  // (antes precisava de uma tabela de progresso de scroll simulada, ver
  // getLobbySections — só necessária pro desktop, que ainda não tem uma
  // section 2 real no DOM).
  if (isMobileLayout) {
    return (
      <div id="portfolio" className="relative bg-black">
        {/* pt-[104px] (não pt-14/56px): pedido explícito pra descer o
            conteúdo mais 48px (56+48). */}
        <motion.div
          className="relative z-20 mx-auto w-[86%] pt-[104px] text-center"
          initial="hidden"
          animate="visible"
          variants={heroStaggerVariants}
        >
          <motion.p variants={heroItemVariants} className="text-xs tracking-[0.2em] text-white/60 uppercase">
            {EYEBROW_TEXT}
          </motion.p>

          <motion.div variants={heroItemVariants} className="mt-2">
            <NeonRGBText text={HEADLINE_TEXT} className="text-2xl leading-tight font-medium text-white" />
          </motion.div>

          <motion.p variants={heroItemVariants} className="mt-3 text-sm leading-relaxed text-white/70">
            {SUBHEAD_TEXT}
          </motion.p>

          <motion.div variants={heroItemVariants} className="mt-5">
            <LiquidMetalButton label={CTA_LABEL} href={WHATSAPP_CTA_HREF} />
          </motion.div>
        </motion.div>

        {/* composição da tv: mesma máscara/logo do desktop — maskScale/
            logoScale/etc. já são constantes no mobile (as duas pontas do
            range coincidem, ver os useTransform mais acima) — só que numa
            caixa de proporção FIXA (MOBILE_TV_ASPECT_RATIO) em fluxo
            normal, não mais posicionada contra um wrapper sticky. */}
        <div
          className="lobby-tv-wrapper relative mt-2 w-full overflow-hidden"
          style={{ aspectRatio: MOBILE_TV_ASPECT_RATIO }}
        >
          <motion.img
            src="/images/tv-img.jpeg"
            alt=""
            aria-hidden="true"
            style={{ scale: maskScale, x: shiftX, y: shiftY, objectPosition: tvPosition }}
            className="lobby-tv-img absolute inset-0 h-full w-full object-cover"
          />

          <motion.div
            style={{
              scale: maskScale,
              x: shiftX,
              y: shiftY,
              maskImage: "url(/images/tv-mask-alpha.png)",
              WebkitMaskImage: "url(/images/tv-mask-alpha.png)",
              maskSize: "cover",
              WebkitMaskSize: "cover",
              maskPosition: tvPosition,
              WebkitMaskPosition: tvPosition,
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
            }}
            className="lobby-tv-mask absolute inset-0 z-10 overflow-hidden"
          >
            <motion.div style={{ scale: videoCounterScale }} className="absolute inset-0">
              <MouseResponsiveBackground className="absolute left-0 top-0 h-[110%] w-[110%]">
                <AsciiArt className="h-full w-full" />
              </MouseResponsiveBackground>
            </motion.div>
          </motion.div>

          <motion.div
            style={{ scale: logoScale, left: logoLeft, top: logoTop, x: logoX, y: logoY }}
            className="pointer-events-none absolute z-20"
          >
            <MouseResponsiveBackground>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-centralized.svg" alt="Fantom" className="w-[240px]" />
            </MouseResponsiveBackground>
          </motion.div>
        </div>

        {/* logos de clientes: abaixo da composição da tv (pedido explícito
            — antes ficava junto do resto do conteúdo da hero, acima). */}
        <div className="relative z-20 mx-auto w-[86%] pt-4 pb-10 text-center">
          <p className="text-xs text-white/50 uppercase tracking-[0.15em]">{CLIENTS_STAT_TEXT}</p>
          <LogoMarquee className="mt-3" />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${mounted ? "" : "not-hydrated"}`}
      style={{ height: SCROLL_HEIGHT }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        {/* wrapper da cena da tv (desktop-only, ver isMobileLayout mais
            acima): inset-0 (viewport inteira) + desktopFitScale (encolhe
            10% na posição final, ver DESKTOP_FIT_SCALE_END). Os filhos (tv,
            vídeo mascarado, logo) continuam "absolute inset-0" entre si,
            então herdam essa caixa e o object-fit/mask-size: cover de cada
            um recalcula o recorte contra ela nativamente. lobby-tv-wrapper:
            seletor estável pro fallback CSS pré-hidratação (".not-hydrated",
            ver globals.css). */}
        <motion.div className="lobby-tv-wrapper absolute inset-0" style={{ scale: desktopFitScale }}>
          {/* cena da tv: escala junto com a máscara (mesmo valor, mesma
              origem no centro), então as duas sempre se movem coladas uma
              na outra, começando ampliada e desamplia até o tamanho normal. */}
          <motion.img
            src="/images/tv-img.jpeg"
            alt=""
            aria-hidden="true"
            style={{ scale: maskScale, x: shiftX, y: shiftY, objectPosition: tvPosition }}
            className="lobby-tv-img absolute inset-0 h-full w-full object-cover"
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
              // tv-mask-alpha.png, NÃO tv-mask.png: a máscara original é
              // preto/branco no RGB (o brilho é o que importa), só que o
              // canal alpha dela não representa o recorte (~157-255 em
              // TODO lugar, quase opaco tanto dentro quanto fora da tela) —
              // por isso o código usava mask-mode: luminance, pra forçar o
              // navegador a ler o RGB em vez do alpha. Safari não suporta
              // mask-mode: luminance de forma confiável (nem -webkit-mask-
              // mode): ele sempre lê o alpha, viu "quase opaco em todo
              // lugar" e mostrou o vídeo por cima da composição inteira,
              // sem recorte nenhum (bug reportado: "imagem da tv não
              // aparece no Safari do celular" — na real a máscara é que
              // não recortava). tv-mask-alpha.png tem o brilho JÁ copiado
              // pro canal alpha (RGB sólido branco) — daí a máscara padrão
              // baseada em alpha (sem mask-mode nenhum) funciona igual em
              // qualquer navegador. Pra regenerar se tv-mask.png mudar:
              // desenhar a imagem original num canvas, e pra cada pixel
              // setar alpha = valor do R (RGB vira branco sólido) — o
              // brilho vira opacidade. tv-mask.png original continua
              // existindo pra o sampling de brilho via canvas
              // (useScreenAnchor/useTvScreenMask), que lê o RGB, não o
              // alpha — só a máscara CSS troca de arquivo.
              maskImage: "url(/images/tv-mask-alpha.png)",
              WebkitMaskImage: "url(/images/tv-mask-alpha.png)",
              maskSize: "cover",
              WebkitMaskSize: "cover",
              maskPosition: tvPosition,
              WebkitMaskPosition: tvPosition,
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
            }}
            className="lobby-tv-mask absolute inset-0 z-10 overflow-hidden"
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
              <img src="/images/logo-centralized.svg" alt="Fantom" className="w-[416px]" />
            </MouseResponsiveBackground>
          </motion.div>
        </motion.div>

        {/* "EXPLORE"/loader (desktop-only, ver isMobileLayout mais acima: o
            mobile já começa direto na composição assentada, não existe a
            tela cheia inicial que esse convite faz sentido pra sair de).
            FORA do wrapper da logo de propósito — aquele já escala e se
            move sozinho desde o início do scroll (logoScale/logoLeft/
            logoTop), o que faria o texto encolher e viajar junto pra dentro
            da tv em vez de simplesmente sumir no lugar. Fica parado, só a
            opacidade muda — só existe na tela inicial (posição fixa em
            relação à viewport, não à logo).
            loaderActive: primeira entrada no site mostra "CARREGANDO" +
            barra de progresso (não clicável, scroll travado — ver efeito
            lenis.stop() acima) em vez do "EXPLORAR" de sempre. Ao terminar
            a barra, rola sozinho pra section 2 e desliga o loader de vez —
            daí em diante volta a ser o "EXPLORAR" clicável de sempre, subir
            e descer entre as sections não traz o loader de volta. */}
        {loaderActive ? (
          <div className="lobby-explore absolute top-[calc(50%+150px)] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3">
            <TextScramble text="CARREGANDO" autoScramble />
            <div className="h-px w-48 overflow-hidden bg-white/20">
              <motion.div
                className="h-full origin-left bg-white"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: LOADER_DURATION_S, ease: "linear" }}
                onAnimationComplete={handleLoaderComplete}
              />
            </div>
          </div>
        ) : (
          <motion.div
            style={{ opacity: exploreOpacity, pointerEvents: explorePointerEvents }}
            className="lobby-explore absolute top-[calc(50%+150px)] left-1/2 z-20 -translate-x-1/2"
          >
            <TextScramble text="EXPLORAR" onClick={scrollToSection2} />
          </motion.div>
        )}

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

            Desktop-only (ver isMobileLayout mais acima): a órbita e a
            máscara "entra na tv" das pedras dependem de SHIFT_X_TARGET
            (deslocamento horizontal, só desktop) e da viewport inteira como
            caixa da tv — nenhum dos dois vale no mobile, que tem seu
            próprio branch de render.

            FLOATING_ROCKS_ENABLED: interruptor temporário (ver constante no
            topo do arquivo) — desligado a pedido, sem remover o código. */}
        {FLOATING_ROCKS_ENABLED && (
          <div className="lobby-rocks pointer-events-none absolute inset-0 z-10">
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

        {/* conteúdo da hero (project.md, seção 6): coluna à direita,
            liberada pelo deslocamento lateral da tv (shiftX). Entra em
            stagger assim que chega na section 2 (mesmo gatilho das pedras)
            — ver heroStaggerVariants/heroItemVariants. Desktop-only: mobile
            tem seu próprio branch de render (ver isMobileLayout acima),
            este bloco só roda com sm+ de largura real (>=640px). */}
        {/* max-w e fontes em clamp() (não mais saltos fixos por breakpoint:
            sm/xl/2xl/min-[1920px]) — o salto reto pra um tier "ultrawide"
            já pegava telas de 1920px (full HD comum, não exatamente
            ultrawide) e deixava tudo grande demais ali (pedido: "ficou
            muito grande em telas 1920px"). clamp(mín, valor fluido em vw,
            máx) cresce continuamente com a largura da tela em vez de pular
            entre tamanhos fixos — 1920px fica num meio-termo real, só as
            telas MUITO largas (~2200px+) chegam no teto. */}
        <motion.div
          className="lobby-hero-content pointer-events-none absolute top-1/2 right-[8%] z-20 max-w-[clamp(420px,32vw,640px)] -translate-y-[calc(50%+20px)] text-left"
          initial="hidden"
          animate={insideSection2 ? "visible" : "hidden"}
          variants={heroStaggerVariants}
        >
          <motion.p
            variants={heroItemVariants}
            className="text-[clamp(0.8rem,0.75rem+0.13vw,1rem)] tracking-[0.2em] text-white/60 uppercase"
          >
            {EYEBROW_TEXT}
          </motion.p>

          <motion.div variants={heroItemVariants} className="mt-4">
            <NeonRGBText
              text={HEADLINE_TEXT}
              className="text-[clamp(1.875rem,1.4rem+1.15vw,3rem)] leading-tight font-medium text-white"
            />
          </motion.div>

          <motion.p
            variants={heroItemVariants}
            className="mt-4 text-[clamp(1rem,0.95rem+0.13vw,1.125rem)] leading-relaxed text-white/70"
          >
            {SUBHEAD_TEXT}
          </motion.p>

          {/* scale-* (não clamp): transform: scale() só aceita número puro,
              sem unidade — não dá pra misturar um número com vw dentro de
              clamp()/calc() (tipos incompatíveis, CSS inválido). Dois
              degraus fixos (base/2xl) do próprio Tailwind bastam aqui: o
              botão não precisa da mesma curva fluida do texto, só não
              ficar pequeno demais perto de um headline bem maior em telas
              largas. origin-left: cresce a partir da borda esquerda (texto
              alinhado à esquerda). */}
          <motion.div variants={heroItemVariants} className="pointer-events-auto mt-8 origin-left scale-100 2xl:scale-110">
            <LiquidMetalButton label={CTA_LABEL} href={WHATSAPP_CTA_HREF} />
          </motion.div>

          <motion.div variants={heroItemVariants} className="mt-10">
            <p className="text-[clamp(0.75rem,0.7rem+0.1vw,0.875rem)] text-white/50 uppercase tracking-[0.15em]">
              {CLIENTS_STAT_TEXT}
            </p>
            <LogoMarquee className="mt-4" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
