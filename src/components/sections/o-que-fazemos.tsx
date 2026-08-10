"use client"

import { useState } from "react"

type ServiceItem = {
  title: string
  description: string
  // imagem de exemplo do serviço: anexada depois, case a caso (por ora,
  // undefined em alguns — o painel à direita cai no placeholder).
  image?: string
}

// project.md, seção 4 ("O que entregamos") — mesmo texto usado no
// accordion desta seção (design de referência: Figma node 1353:3014,
// card "01 - Tech").
const SERVICES: ServiceItem[] = [
  {
    title: "Websites",
    description:
      "Sites institucionais e plataformas com identidade própria, focados em conversão.",
    image: "/images/section-3/websites-s3.png",
  },
  {
    title: "SaaS",
    description: "Produtos digitais completos, do zero ao produto rodando.",
    image: "/images/section-3/saas-s3.png",
  },
  {
    title: "Sistemas powered by AI",
    description:
      "Automações e ferramentas com IA que resolvem um problema real de negócio.",
  },
  {
    title: "Design",
    description:
      "Interfaces e identidade visual sob medida, alinhadas ao produto e à marca.",
  },
]

export function OQueFazemos() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeService = SERVICES[activeIndex]

  return (
    <section
      id="o-que-fazemos"
      className="relative flex min-h-screen items-center justify-center bg-black py-12"
    >
      <div className="flex h-[80vh] w-[80vw] flex-col rounded-[20px] border border-white/15 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8 lg:p-10">
        <div className="mb-3 flex items-center gap-3 sm:mb-4">
          <span className="h-3 w-3 shrink-0 bg-[#3448ff]" aria-hidden="true" />
          <span className="text-sm tracking-[0.2em] text-white/70 uppercase">
            O que fazemos
          </span>
        </div>

        <h2 className="mb-4 text-3xl font-medium text-white sm:mb-6 sm:text-4xl">
          Tecnologia e Design
        </h2>

        <div className="grid min-h-0 flex-1 gap-8 lg:grid-cols-2 lg:gap-16">
          <ul className="flex min-h-0 flex-col justify-center overflow-y-auto pr-2">
            {SERVICES.map((service, index) => {
              const isActive = index === activeIndex
              return (
                <li
                  key={service.title}
                  className="border-t border-white/15 first:border-t-0"
                >
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-expanded={isActive}
                    className="w-full cursor-[inherit] py-3 text-left lg:py-4"
                  >
                    <span
                      className={`block text-lg font-medium tracking-[0.01em] transition-colors duration-300 sm:text-xl ${
                        isActive ? "text-white" : "text-white/50"
                      }`}
                    >
                      {service.title}
                    </span>

                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        isActive ? "mt-2 grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <p className="overflow-hidden text-sm leading-relaxed text-white/60">
                        {service.description}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="flex h-full min-h-0 min-w-0 items-center justify-center">
            {/* proporção fixa em 577/580 (mesma geometria do painel no
                design de referência, Figma node 1353:3213): o frame nunca
                estica pra fora da proporção da imagem, só encolhe pra
                caber no espaço disponível (largura e altura), como um
                object-fit: contain aplicado ao frame inteiro. */}
            <div className="relative aspect-[577/580] max-h-full max-w-full overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02]">
              {activeService.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeService.image}
                  alt={activeService.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-white/30">
                  Imagem em breve
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
