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

const testimonials = [
  {
    author: {
      name: "Emma Thompson",
      handle: "@emmaai",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
    },
    text: "Using this AI platform has transformed how we handle data analysis. The speed and accuracy are unprecedented.",
    href: "https://twitter.com/emmaai"
  },
  {
    author: {
      name: "David Park",
      handle: "@davidtech",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    text: "The API integration is flawless. We've reduced our development time by 60% since implementing this solution.",
    href: "https://twitter.com/davidtech"
  },
  {
    author: {
      name: "Sofia Rodriguez",
      handle: "@sofiaml",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    },
    text: "Finally, an AI tool that actually understands context! The accuracy in natural language processing is impressive."
  }
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
            <div className="bg-black/30 backdrop-blur-md text-white text-sm py-2 px-4 rounded-full inline-flex items-center mb-6">
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

      <div className="w-full bg-gradient-to-b from-[#000B2F] to-[#000614] py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
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

      <TestimonialsSection
        title="Trusted by developers worldwide"
        description="Join thousands of developers who are already building the future with our AI platform"
        testimonials={testimonials}
      />
    </>
  );
}

export { BackgroundBeamsDemo };
