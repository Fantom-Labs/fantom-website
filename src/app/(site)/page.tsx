import { Lobby, LobbyChrome } from "@/components/motion/lobby"
import { OQueFazemos } from "@/components/sections/o-que-fazemos"
import { Footer } from "@/components/sections/footer"
import { SectionNav } from "@/components/motion/section-nav"

export default function Home() {
  return (
    <>
      <Lobby />
      <OQueFazemos />
      <Footer />
      {/* fora do Lobby de propósito: precisa ficar acima do conteúdo em
          qualquer seção, não só dentro do container do lobby (ver
          comentário em LobbyChrome). */}
      <LobbyChrome />
      <SectionNav />
    </>
  )
}
