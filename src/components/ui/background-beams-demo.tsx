"use client";
import React from "react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

function BackgroundBeamsDemo() {
  return (
    <>
      <div className="h-[40rem] w-full rounded-md bg-background relative flex flex-col items-center justify-center antialiased">
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 glass">
          <div className="flex items-center gap-4">
            <img src="/lovable-uploads/e7304a40-916b-49b5-9a92-2fa7927dfe98.png" alt="Fantom Logo" className="h-8" />
            <div className="hidden md:flex gap-6 ml-8">
              <a href="#" className="text-sm font-medium text-white/80 hover:text-blue-500 transition-colors">Home</a>
              <a href="#" className="text-sm font-medium text-white/80 hover:text-blue-500 transition-colors">Sobre</a>
              <a href="#" className="text-sm font-medium text-white/80 hover:text-blue-500 transition-colors">Serviços</a>
              <a href="#" className="text-sm font-medium text-white/80 hover:text-blue-500 transition-colors">Contato</a>
            </div>
          </div>
          <div className="flex justify-center">
            <Button className="bg-[#0033FF] hover:bg-[#0029CC] text-white px-6 rounded-full">
              Fale com a Fantom
            </Button>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto p-4">
          <div className="relative z-10 text-center">
            <div className="bg-white/10 text-white text-sm py-1 px-3 rounded-full inline-flex items-center mb-4">
              Fantom Web
            </div>
            <h1 className="text-4xl md:text-[56px] font-bold mb-4 leading-tight">
              <span className="bg-gradient-to-r from-[#0033FF] via-[#E9E9E9] to-[#0029FF] bg-clip-text text-transparent">Eleve seu negócio</span><br />
              <span className="bg-gradient-to-r from-[#0033FF] via-[#E9E9E9] to-[#0029FF] bg-clip-text text-transparent">e escale no digital</span>
            </h1>
            <p className="text-white/60 max-w-lg mx-auto my-4 text-sm md:text-base">
              Criamos experiências digitais que impulsionam negócios por meio de estratégia, design e tecnologia.
            </p>
            <div className="flex justify-center gap-4 items-center">
              <Button className="bg-[#0033FF] hover:bg-[#0029CC] text-white px-8 py-6 text-lg rounded-full">
                Fale com a Fantom
              </Button>
              <Button className="bg-[#0033FF] hover:bg-[#0029CC] text-white p-3 rounded-full">
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