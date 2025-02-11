
import { SquaresDemo } from "@/components/ui/squares-demo";
import { TestimonialsSection } from "@/components/blocks/testimonials-with-marquee";

const testimonials = [
  {
    author: {
      name: "João Silva",
      handle: "@joaosilva",
      avatar: "/placeholder.svg"
    },
    text: "Fantástico trabalho! A equipe da Fantom Web foi extremamente profissional e entregou além das expectativas."
  },
  {
    author: {
      name: "Maria Santos",
      handle: "@mariasantos",
      avatar: "/placeholder.svg"
    },
    text: "Transformaram completamente nossa presença digital. Resultados impressionantes!"
  },
  {
    author: {
      name: "Pedro Oliveira",
      handle: "@pedrooliveira",
      avatar: "/placeholder.svg"
    },
    text: "Melhor investimento que fizemos para nossa empresa. Profissionais altamente qualificados."
  }
];

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10">
        <SquaresDemo />
      </div>
      <div className="relative z-10">
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-8 text-sm border rounded-full border-white/20 gap-2 bg-white/5 backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Fantom Web
          </div>
          <h1 className="text-6xl font-bold mb-6">
            <span className="text-blue-500">Eleve</span> seu negócio<br />
            e escale no <span className="text-blue-500">digital</span>
          </h1>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl">
            Criamos experiências digitais que impulsionam negócios<br />
            por meio de estratégia, design e tecnologia.
          </p>
          <button className="inline-flex items-center px-6 py-3 text-sm font-medium text-white transition-colors bg-blue-600 rounded-full hover:bg-blue-700">
            Fale com a Fantom
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        <div className="bg-black/50 backdrop-blur-sm py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-500 mb-2">250+</div>
                <div className="text-gray-400">Projetos Entregues</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-500 mb-2">95%</div>
                <div className="text-gray-400">Clientes Satisfeitos</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-500 mb-2">10+</div>
                <div className="text-gray-400">Anos de Experiência</div>
              </div>
            </div>
          </div>
        </div>

        <TestimonialsSection
          title="O que nossos clientes dizem"
          description="Depoimentos de clientes que transformaram seus negócios com a Fantom Web"
          testimonials={testimonials}
          className="bg-black/50 backdrop-blur-sm"
        />
      </div>
    </div>
  );
};

export default Index;
