"use client"
// AsciiArt — "Mo Mosaic", made with the 21st.dev ASCII editor and baked
// to its exact rendered output (looping video + poster). Zero dependencies:
// one <video> that fills its parent. Drop it behind or inside your content:
// <div className="relative h-96"><AsciiArt className="absolute inset-0" /></div>
// Remix the source recipe (styles, animation, palette) in the editor:
// https://21st.dev/community/ascii/editor?from=11c565ed-8034-4db8-a4ef-d50690c915b6

import { useEffect, useRef, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { motion, type MotionValue } from "motion/react"

const emptySubscribe = () => () => {}
// detecta se já estamos no cliente sem usar effect+setState (evita o
// cascading render que o hook lint aponta) — snapshot do servidor é
// sempre false, do cliente é sempre true, então isso só "liga" o portal
// depois da hidratação, sem causar mismatch.
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

export function AsciiArt({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // iOS Safari real (não o engine WebKit do Playwright) às vezes ignora o
  // autoplay HTML mesmo com muted+playsInline presentes — mostra o botão
  // de play nativo por cima do vídeo em vez de tocar sozinho (bug
  // reportado, print do celular). muted como ATRIBUTO HTML nem sempre
  // vira a PROPRIEDADE do elemento a tempo do autoplay ser avaliado
  // (mismatch conhecido do React com elementos de mídia) — setar a
  // propriedade explicitamente + chamar play() na mão é o reforço
  // recomendado. .catch() silencioso: se MESMO ASSIM for bloqueado (ex.:
  // modo de baixa energia do iOS, que restringe autoplay de vídeo), o
  // poster fica como fallback estático em vez de estourar um erro no
  // console — não tem como forçar autoplay contra uma restrição do SO.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.play().catch(() => {})
  }, [])

  return (
    <video
      ref={videoRef}
      className={className}
      // servido localmente (era o CDN assets.21st.dev): a section 2 no
      // lobby mostra esse vídeo recortado pela máscara da tv assim que o
      // scroll começa — buscar de outra origem (DNS+TLS próprios) atrasava
      // o primeiro frame o suficiente pra aparecer a máscara "vazia" (sem
      // o mosaico ainda) no início da rolagem no mobile. preload="auto"
      // pede pro browser priorizar o carregamento desde o mount.
      src={"/images/mo-mosaic.mp4"}
      poster={"/images/mo-mosaic-poster.webp"}
      preload="auto"
      autoPlay
      loop
      muted
      playsInline
      aria-label={"Mo Mosaic — animated ASCII art"}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  )
}

const FRAME_MARGIN = 16 // px

// Moldura decorativa (bg-frame.svg) que acompanha o mo-mosaic: 16px de
// margem da tela (esquerda, direita, topo). Renderizada via portal pro
// <body> — assim ela sempre fica presa ao viewport de verdade, mesmo
// quando o <AsciiArt> está dentro de um wrapper com transform/scale (como
// no zoom pra dentro da tela de TV do lobby), que senão a arrastaria junto.
export function AsciiArtFrame({
  opacity = 1,
}: {
  opacity?: number | MotionValue<number>
}) {
  const mounted = useMounted()
  if (!mounted) return null

  return createPortal(
    <motion.img
      src="/bg-frame.svg"
      alt=""
      aria-hidden="true"
      className="pointer-events-none fixed z-20 h-auto"
      style={{
        opacity,
        left: FRAME_MARGIN,
        right: FRAME_MARGIN,
        top: FRAME_MARGIN,
        width: `calc(100vw - ${FRAME_MARGIN * 2}px)`,
      }}
    />,
    document.body
  )
}
