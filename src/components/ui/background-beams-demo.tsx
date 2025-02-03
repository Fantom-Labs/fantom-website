"use client";
import React from "react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Button } from "@/components/ui/button";

function BackgroundBeamsDemo() {
  return (
    <div className="h-[40rem] w-full rounded-md bg-background relative flex flex-col items-center justify-center antialiased">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 glass">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-blue-500 to-blue-700">Fantom</span>
          <div className="hidden md:flex gap-6 ml-8">
            <a href="#" className="text-sm font-medium hover:text-blue-500 transition-colors">Home</a>
            <a href="#" className="text-sm font-medium hover:text-blue-500 transition-colors">Sobre</a>
            <a href="#" className="text-sm font-medium hover:text-blue-500 transition-colors">Home</a>
            <a href="#" className="text-sm font-medium hover:text-blue-500 transition-colors">Home</a>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
          Fale com a Fantom
        </Button>
      </nav>

      <div className="max-w-2xl mx-auto p-4">
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-7xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-blue-500 to-blue-700">Eleve</span> seu negócio<br />
            e escale no digital
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto my-4 text-sm md:text-base">
            Criamos experiências digitais que impulsionam negócios por meio de estratégia, design e tecnologia.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg mt-6">
            Fale com a Fantom
          </Button>
        </div>
      </div>
      <BackgroundBeams />
    </div>
  );
}

export { BackgroundBeamsDemo };