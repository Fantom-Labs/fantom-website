import { Lobby } from "@/components/motion/lobby"

// Hero placeholder: copy confirmada em fantom-website-home.md, layout
// definitivo ainda é pendência (project.md, seção 12). O texto precisa
// existir no HTML desde o carregamento inicial mesmo coberto pelo lobby,
// para não bloquear LCP nem indexação (project.md, seção 10).
export default function Home() {
  return (
    <>
      <Lobby />

      <section
        id="inicio"
        className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center"
      >
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
          Sócia estratégica de tecnologia e design por trás de negócios reais.
        </h1>
        <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
          Da primeira reunião ao produto gerando receita, cuidamos de cada
          detalhe do seu projeto.
        </p>
        <a
          href="#contato"
          className="rounded-full border border-foreground/20 px-6 py-3 text-sm uppercase tracking-[0.15em] transition-colors hover:bg-foreground/5"
        >
          Falar com a Fantom
        </a>
      </section>
    </>
  )
}