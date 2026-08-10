import { Lobby, LobbyChrome } from "@/components/motion/lobby"
import { OQueFazemos } from "@/components/sections/o-que-fazemos"
import { SectionNav } from "@/components/motion/section-nav"

export default function Home() {
  return (
    <>
      <Lobby />
      <OQueFazemos />
      {/* fora do Lobby de propósito: precisa ficar acima do conteúdo em
          qualquer seção, não só dentro do container do lobby (ver
          comentário em LobbyChrome). */}
      <LobbyChrome />
      <SectionNav />
    </>
  )
}
