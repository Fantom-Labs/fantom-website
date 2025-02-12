
import { TestimonialsSection } from "@/components/blocks/testimonials-with-marquee";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { useState } from "react";
import { HoverButton } from "@/components/ui/hover-button";

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
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Background do hero section */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url("/lovable-uploads/71e29b4a-32ac-4ba9-b4f3-317df46ef9f0.png")',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Barra de navegação fixa */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <nav className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8">
              <img 
                src="/lovable-uploads/6407fbb5-1dae-4ac0-b67c-c288ac7df83c.png" 
                alt="Fantom Logo" 
                className="h-full w-full object-contain" 
              />
            </div>
            <span className="font-clash font-light tracking-[0.1em]">Fantom</span>
          </div>
          
          {isMobile ? (
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-300 hover:text-white"
              >
                <Menu size={24} />
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-black/90 backdrop-blur-lg rounded-lg shadow-lg">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10">Home</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10">Sobre</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10">Serviços</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10">Portfolio</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10">
                    Fale com a Fantom
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-8">
              <a href="#" className="text-sm text-gray-300 hover:text-white">Home</a>
              <a href="#" className="text-sm text-gray-300 hover:text-white">Sobre</a>
              <a href="#" className="text-sm text-gray-300 hover:text-white">Serviços</a>
              <a href="#" className="text-sm text-gray-300 hover:text-white">Portfolio</a>
              <HoverButton>
                Fale com a Fantom
              </HoverButton>
            </div>
          )}
        </nav>
      </header>

      <div className="relative z-10">
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center pt-20">
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-8 text-sm border rounded-full border-white/20 gap-2 bg-white/5 backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Fantom Web
          </div>
          <h1 className="text-[48px] md:text-[56px] font-bold mb-6 bg-gradient-to-r from-[#0EA5E9] via-[#E9E9E9] to-[#7F92F3] bg-clip-text text-transparent bg-[size:200%_200%] animate-gradient leading-[120%] max-w-3xl mx-auto">
            Eleve seu negócio<br />
            e escale no digital
          </h1>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Criamos experiências digitais que impulsionam negócios<br />
            por meio de estratégia, design e tecnologia.
          </p>
          <HoverButton>
            Fale com a Fantom
          </HoverButton>
        </div>

        <div className="relative glass">
          <div className="relative py-24 container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-white mb-2">250+</div>
                <div className="text-gray-400">Projetos Entregues</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">95%</div>
                <div className="text-gray-400">Clientes Satisfeitos</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">10+</div>
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
