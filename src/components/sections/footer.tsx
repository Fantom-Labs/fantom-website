"use client"

import { CTA_LABEL, MENU_SECTIONS, WHATSAPP_CTA_HREF, useNavigateToSection } from "@/components/motion/lobby"
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button"

// id="contato": a SectionNav já tinha um ponto "Contato" apontando pra
// `#contato` (ver SECTIONS em section-nav.tsx) sem nenhum elemento real com
// esse id ainda — o footer é o CTA final da home (project.md, seção 6, item
// 6), então assume esse id em vez de deixar o ponto do nav sem destino.
//
// Rodapé simples (pedido explícito: "adicione um footer"), sem a assinatura
// dos fundadores com foto que o project.md descrevia antes — removida de lá
// junto com esta seção (pedido explícito: "remova isso do project md"), já
// que as fotos ainda não existem (ver pendências). Reaproveita a MESMA
// navegação principal (MENU_SECTIONS/useNavigateToSection, ver lobby.tsx) e
// o MESMO botão de CTA único do site (LiquidMetalButton, mesmo componente
// usado na hero — pedido explícito: "use cta button no footer") em vez de
// duplicar texto ou lógica de scroll próprios, ou usar um botão secundário
// diferente do resto do site.
export function Footer() {
  const navigateToSection = useNavigateToSection()

  return (
    <footer id="contato" className="relative border-t border-white/10 bg-black px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <button type="button" onClick={() => navigateToSection("inicio")} aria-label="Voltar ao início" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-left.svg" alt="Fantom" className="max-w-[90px]" />
        </button>

        <nav aria-label="Navegação do rodapé" className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {MENU_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => navigateToSection(section.id)}
              className="text-sm text-white/60 transition-colors hover:text-white"
            >
              {section.label}
            </button>
          ))}
        </nav>

        <div className="shrink-0">
          <LiquidMetalButton label={CTA_LABEL} href={WHATSAPP_CTA_HREF} />
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-center text-xs text-white/40 sm:text-left">
        © {new Date().getFullYear()} Fantom. Todos os direitos reservados.
      </div>
    </footer>
  )
}
