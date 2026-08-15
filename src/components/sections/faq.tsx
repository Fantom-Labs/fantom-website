"use client"

import { useState } from "react"
import { CalendarCheck2, ChevronDown } from "lucide-react"
import { CardFrame } from "@/components/ui/card-frame"

// mesmo link/número da hero (ver WHATSAPP_CTA_HREF em lobby.tsx), só com a
// mensagem pré-preenchida trocada pro contexto de agendamento — pedido
// explícito: "mesmo WhatsApp da hero".
const SCHEDULE_CALL_HREF = `https://wa.me/5583991377388?text=${encodeURIComponent("Olá, quero agendar uma call de 20 minutos!")}`

// copy fornecida pelo usuário — 4 das 7 objeções principais originais,
// selecionadas pra cobrir um leque de temas sem redundância (modelo de
// negócio, prazo, seletividade, alcance geográfico) — pedido explícito:
// "escolha 4 perguntas apenas" (project.md, seção 6: "#faq — objeções
// principais, faz o trabalho da triagem que foi tirada da navegação").
const FAQS = [
  {
    question: "Vocês atuam como sócios ou fazem projetos pagos?",
    answer:
      "As duas coisas. Em alguns projetos entramos como sócios, dividindo risco e resultado, como na KOMMUchat. Em outros, como parceria técnica de um negócio que já existe. O formato certo se decide na etapa de Mapear, depois de entender o seu cenário.",
  },
  {
    question: "Quanto tempo leva do briefing ao lançamento?",
    answer:
      "Depende do escopo, e a gente não trabalha com prazo de vitrine. O prazo real é definido na etapa de Arquitetar, junto com o roadmap e a proposta, depois que o cenário está mapeado. A partir daí, você sabe exatamente o que esperar e quando.",
  },
  {
    question: "Vocês aceitam qualquer projeto?",
    answer:
      "Não. Entramos onde tecnologia e design bem feitos resolvem um problema real de negócio. É por isso que conseguimos cuidar de cada detalhe: escolhemos poucos projetos e nos dedicamos de verdade a cada um.",
  },
  {
    question: "Trabalham só no Brasil?",
    answer:
      "Não. Construímos para onde o negócio estiver. Já entregamos de clínicas em Recife a um restaurante em Augsburg, na Alemanha.",
  },
]

// conteúdo puro (sem consciência de scroll/motion) — mesmo padrão de
// metodo.tsx: reaproveitado no branch pinado do desktop (dentro do slide
// horizontal de o-que-fazemos.tsx), no fallback empilhado mobile e no
// reduced-motion. Sem versão mobile própria (diferente de MetodoCard): o
// Figma fornecido é só desktop, então o grid de 2 colunas colapsa pra 1 via
// CSS (mesmo padrão que o ServiceCard já usa hoje), sem inventar um layout
// mobile não especificado.
export function FaqCard() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <CardFrame>
      {/* duas colunas (mesmo padrão do ServiceCard, em o-que-fazemos.tsx):
          texto (badge/heading/parágrafo) alinhado à esquerda numa coluna
          mais estreita, o accordion de perguntas na outra, mais larga
          (0.85fr/1.15fr, mesma proporção do ServiceCard) — design de
          referência: Figma node 1452:138. */}
      <div className="grid gap-8 sm:min-h-0 sm:flex-1 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 shrink-0 bg-[#3448ff]" aria-hidden="true" />
            <span className="text-sm tracking-[0.2em] text-white/70 uppercase">FAQ</span>
          </div>

          <h2 className="mt-4 text-3xl font-medium text-white sm:mt-6 sm:text-4xl">
            Perguntas frequentes
          </h2>

          <p className="mt-4 text-white/70">
            Tire suas dúvidas sobre nossos serviços.
          </p>

          {/* card de agendamento — mesmo número de WhatsApp da hero
              (WHATSAPP_CTA_HREF em lobby.tsx), só com a mensagem
              pré-preenchida trocada pro contexto de agendamento. */}
          <div className="mt-6 max-w-[400px] rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-lg text-white/90">
              Fale com um de nossos especialistas em uma call de{" "}
              <span className="text-[#5699ff]">20 minutos</span>
            </p>

            <a
              href={SCHEDULE_CALL_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#3448ff] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2b3bdb]"
            >
              Agende uma reunião
              <span className="h-4 w-px bg-white/30" aria-hidden="true" />
              <CalendarCheck2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* accordion: mesma técnica de expand/collapse do ServiceCard
            (grid-template-rows 0fr/1fr, sem altura fixa/max-height) — só um
            item aberto por vez (clicar em outro fecha o anterior), primeiro
            item aberto por padrão (mesmo padrão do ServiceCard). */}
        <ul className="flex flex-col justify-center sm:min-h-0 sm:overflow-y-auto">
          {FAQS.map(({ question, answer }, index) => {
            const isOpen = index === openIndex
            return (
              <li key={question} className="border-t border-white/10 first:border-t-0">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 py-4 text-left"
                >
                  <span className="flex-1 text-white">{question}</span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 text-white/60 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "pb-4 grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <p className="overflow-hidden text-sm leading-relaxed text-white/70">
                    {answer}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </CardFrame>
  )
}
