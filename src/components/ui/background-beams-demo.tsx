"use client";
import React from "react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Menu } from "lucide-react";
import { TestimonialsSection } from "@/components/blocks/testimonials-with-marquee";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RevealImageList } from "@/components/ui/reveal-images";
import InteractiveBentoGallery from "@/components/blocks/interactive-bento-gallery";

const testimonials = [
  {
    author: {
      name: "Ana Silva",
      handle: "@anasilvadesign",
      avatar: "/placeholder.svg"
    },
    text: "A Fantom transformou completamente a presença digital da nossa empresa. O design é impecável e os resultados são extraordinários.",
  },
  {
    author: {
      name: "Ricardo Santos",
      handle: "@ricardoweb",
      avatar: "/placeholder.svg"
    },
    text: "Profissionalismo e criatividade em cada projeto. A equipe da Fantom entende exatamente o que precisamos.",
  },
  {
    author: {
      name: "Mariana Oliveira",
      handle: "@maridesigner",
      avatar: "/placeholder.svg"
    },
    text: "Melhor decisão que tomamos foi trabalhar com a Fantom. Nossa conversão aumentou 150% após o redesign do site.",
  }
];

const mediaItems = [
  {
    id: 1,
    type: "image",
    title: "Design Digital",
    desc: "Criação de interfaces modernas",
    url: "https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?w=200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
  },
  {
    id: 2,
    type: "image",
    title: "Desenvolvimento Web",
    desc: "Sites e aplicações web",
    url: "https://images.unsplash.com/photo-1587440871875-191322ee64b0?w=200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    span: "md:col-span-2 md:row-span-2 col-span-1 sm:col-span-2 sm:row-span-2",
  },
  {
    id: 3,
    type: "image",
    title: "Marketing Digital",
    desc: "Estratégias de crescimento",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    span: "md:col-span-1 md:row-span-3 sm:col-span-2 sm:row-span-2",
  },
  {
    id: 4,
    type: "image",
    title: "SEO",
    desc: "Otimização para buscadores",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    span: "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2",
  },
];

function BackgroundBeamsDemo() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <div className="h-[40rem] w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 glass">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img src="/lovable-uploads/1d056377-00cb-4002-9af8-d368246a5452.png" alt="Fantom Logo" className="h-8" />
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center flex-grow">
            <div className="flex gap-8">
              <a href="#" className="text-sm font-medium text-white/80 hover:text-blue-500 transition-colors">Home</a>
              <a href="#" className="text-sm font-medium text-white/80 hover:text-blue-500 transition-colors">Sobre</a>
              <a href="#" className="text-sm font-medium text-white/80 hover:text-blue-500 transition-colors">Serviços</a>
              <a href="#" className="text-sm font-medium text-white/80 hover:text-blue-500 transition-colors">Contato</a>
            </div>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button className="bg-[#4B3BFF] hover:bg-[#3F32D9] text-white px-6 rounded-full">
              Fale com a Fantom
            </Button>
            <Button className="bg-[#4B3BFF] hover:bg-[#3F32D9] text-white aspect-square w-10 h-10 p-0 rounded-full">
              <ArrowUpRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-neutral-950 border-neutral-800">
                <div className="flex flex-col gap-8 mt-8">
                  <div className="flex flex-col gap-4">
                    <a href="#" className="text-lg font-medium text-white/80 hover:text-blue-500 transition-colors">Home</a>
                    <a href="#" className="text-lg font-medium text-white/80 hover:text-blue-500 transition-colors">Sobre</a>
                    <a href="#" className="text-lg font-medium text-white/80 hover:text-blue-500 transition-colors">Serviços</a>
                    <a href="#" className="text-lg font-medium text-white/80 hover:text-blue-500 transition-colors">Contato</a>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Button className="bg-[#4B3BFF] hover:bg-[#3F32D9] text-white w-full rounded-full">
                      Fale com a Fantom
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto p-4">
          <div className="relative z-10 text-center">
            <div className="bg-[#020202]/10 backdrop-blur-[2px] text-white text-sm py-3 px-6 rounded-[127px] inline-flex items-center gap-2 mb-6 border border-[#3B3D41]">
              <div className="w-4 h-4 bg-white rounded-full"></div>
              Fantom Web
            </div>
            <h1 className="text-4xl md:text-[56px] font-bold mb-4 leading-tight">
              <span className="bg-gradient-to-r from-[#0033FF] via-[#E9E9E9] to-[#0029FF] bg-clip-text text-transparent">Eleve seu negócio</span><br />
              <span className="bg-gradient-to-r from-[#0033FF] via-[#E9E9E9] to-[#0029FF] bg-clip-text text-transparent">e escale no digital</span>
            </h1>
            <p className="text-white/60 max-w-lg mx-auto my-6 text-sm md:text-base">
              Criamos experiências digitais que impulsionam negócios por meio de estratégia, design e tecnologia.
            </p>
            <div className="flex justify-center items-center gap-4">
              <Button className="bg-[#4B3BFF] hover:bg-[#3F32D9] text-white px-8 py-6 text-lg rounded-full">
                Fale com a Fantom
              </Button>
              <Button className="bg-[#4B3BFF] hover:bg-[#3F32D9] text-white p-3 rounded-full">
                <ArrowUpRight className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
        <BackgroundBeams />
      </div>

      <div className="w-full relative">
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: "url('/lovable-uploads/b6feb9f9-dac0-4da7-96e4-8e6c80da9005.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="w-full glass border-y border-white/10 relative z-10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 py-20">
            <div className="text-center">
              <h3 className="text-5xl font-bold text-white mb-2">+5</h3>
              <p className="text-white/60 text-sm">Projetos em<br />mais de 5 países</p>
            </div>
            <div className="text-center">
              <h3 className="text-5xl font-bold text-white mb-2">10M</h3>
              <p className="text-white/60 text-sm">Faturados para<br />nossos clientes</p>
            </div>
            <div className="text-center">
              <h3 className="text-5xl font-bold text-white mb-2">+100</h3>
              <p className="text-white/60 text-sm">Projetos<br />desenvolvido</p>
            </div>
            <div className="text-center">
              <h3 className="text-5xl font-bold text-white mb-2">90%</h3>
              <p className="text-white/60 text-sm">mais eficiência<br />com IA</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full relative py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          <RevealImageList />
          <div className="w-full h-full">
            <InteractiveBentoGallery
              mediaItems={mediaItems}
              title="Nossos Projetos"
              description="Explore nossa galeria de cases de sucesso"
            />
          </div>
        </div>
      </div>

      <TestimonialsSection
        title="O que nossos clientes dizem"
        description="Conheça as histórias de sucesso de quem já transformou seu negócio com a Fantom"
        testimonials={testimonials}
      />
    </>
  );
}

export { BackgroundBeamsDemo };