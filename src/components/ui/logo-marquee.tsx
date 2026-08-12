"use client"

import { motion, useReducedMotion } from "motion/react"

// mesmo viewBox (189x51) nos 5 arquivos — todos já com fill="white",
// prontos pro fundo escuro sem ajuste de cor.
const CLIENT_LOGOS = [
  { src: "/clients/geoservice.svg", alt: "Geoservice" },
  { src: "/clients/drdeoclides.svg", alt: "Dr. Deoclides" },
  { src: "/clients/mycocina.svg", alt: "MyCocina" },
  { src: "/clients/kommuchat.svg", alt: "KOMMUchat" },
  { src: "/clients/medhandson.svg", alt: "Med HandsOn" },
]

const MARQUEE_DURATION_S = 22

// carrossel de logos com rolagem automática contínua: a trilha é o mesmo
// conjunto de logos duplicado lado a lado, animando de x:0% a x:-50% em
// loop linear — como a segunda metade é idêntica à primeira, o ponto de
// reinício (-50%) é visualmente idêntico ao início (0%), sem salto.
export function LogoMarquee({ className = "" }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion()
  const logos = [...CLIENT_LOGOS, ...CLIENT_LOGOS]

  return (
    <div
      // w-full + max-w-full: a trilha interna usa w-max (largura de
      // conteúdo, todas as logos numa linha só, de propósito, pra
      // rolagem contínua) — sem travar a LARGURA DESTE wrapper
      // explicitamente, esse max-content "vazava" pro cálculo de
      // shrink-to-fit do ancestral (a coluna da hero), estourando a
      // largura real dela bem além do que o layout previa. Invisível no
      // desktop (sobra espaço), quebrava o texto no mobile (a coluna
      // ficava mais larga que a própria tela).
      className={`w-full max-w-full overflow-hidden [mask-image:linear-gradient(to_right,black_0%,black_75%,transparent_100%)] ${className}`}
    >
      <motion.div
        className="flex w-max items-center gap-10"
        animate={prefersReducedMotion ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: MARQUEE_DURATION_S, ease: "linear", repeat: Infinity }}
      >
        {logos.map((logo, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={logo.src}
            alt={logo.alt}
            aria-hidden={i >= CLIENT_LOGOS.length}
            className="h-8 w-auto min-w-[40px] shrink-0 opacity-60 sm:h-9"
          />
        ))}
      </motion.div>
    </div>
  )
}
