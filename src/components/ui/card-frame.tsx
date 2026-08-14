import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

// moldura compartilhada entre os cards das sections 3 (o-que-fazemos) e 4
// (método) — mesmo fundo/borda/dimensões nos dois, só o conteúdo interno
// muda. Extraído daqui pra lá pra não duplicar a className longa (pedido
// explícito: "section 4 terá o mesmo background e o mesmo frame/card").
export function CardFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative z-10 flex h-auto w-[calc(100vw-40px)] flex-col rounded-[20px] border border-white/15 bg-white/[0.03] p-6 backdrop-blur-lg sm:h-[85vh] sm:w-[80vw] sm:p-8 lg:p-16",
        className
      )}
    >
      {children}
    </div>
  )
}
