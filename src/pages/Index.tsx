
import { SquaresDemo } from "@/components/ui/squares-demo";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10">
        <SquaresDemo />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
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
    </div>
  );
};

export default Index;
