"use client";
import React from "react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Button } from "@/components/ui/button";

function BackgroundBeamsDemo() {
  return (
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
          <h1 className="text-5xl md:text-[64px] font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-[#0033FF] via-[#FEFEFE] to-[#0029FF] bg-clip-text text-transparent">Eleve seu negócio</span><br />
            <span className="bg-gradient-to-r from-[#0033FF] via-[#FEFEFE] to-[#0029FF] bg-clip-text text-transparent">e escale no digital</span>
          </h1>
          <p className="text-white/60 max-w-lg mx-auto my-4 text-sm md:text-base">
            Criamos experiências digitais que impulsionam negócios por meio de estratégia, design e tecnologia.
          </p>
          <div className="flex justify-center">
            <Button className="bg-[#0033FF] hover:bg-[#0029CC] text-white px-8 py-6 text-lg mt-6 rounded-full">
              Fale com a Fantom
            </Button>
          </div>
        </div>
      </div>
      <BackgroundBeams />
    </div>
  );
}

export { BackgroundBeamsDemo };