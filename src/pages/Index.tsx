
import { SquaresDemo } from "@/components/ui/squares-demo";
import { BackgroundBeamsDemo } from "@/components/ui/background-beams-demo";
import InteractiveBentoGallery from "@/components/blocks/interactive-bento-gallery";
import { TestimonialsSection } from "@/components/blocks/testimonials-with-marquee";

const Index = () => {
  const mediaItems = [
    {
      id: 1,
      type: "image",
      title: "Nossa História",
      desc: "Uma jornada de inovação e sucesso",
      url: "/lovable-uploads/1d056377-00cb-4002-9af8-d368246a5452.png",
      span: "row-span-2 col-span-2"
    },
    {
      id: 2,
      type: "image",
      title: "Nosso Time",
      desc: "Uma equipe dedicada e talentosa",
      url: "/lovable-uploads/b6feb9f9-dac0-4da7-96e4-8e6c80da9005.png",
      span: "row-span-1"
    },
    {
      id: 3,
      type: "image",
      title: "Nossos Projetos",
      desc: "Soluções que transformam negócios",
      url: "/lovable-uploads/e7304a40-916b-49b5-9a92-2fa7927dfe98.png",
      span: "row-span-1"
    }
  ];

  const testimonials = [
    {
      author: {
        name: "John Doe",
        handle: "@johndoe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1"
      },
      text: "Amazing work! Exceeded our expectations.",
      href: "#"
    },
    {
      author: {
        name: "Jane Smith",
        handle: "@janesmith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2"
      },
      text: "Professional and creative team. Great results!",
      href: "#"
    },
    {
      author: {
        name: "Mike Johnson",
        handle: "@mikej",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3"
      },
      text: "Fantastic experience working with them.",
      href: "#"
    }
  ];

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10">
        <SquaresDemo />
      </div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-24">
          <InteractiveBentoGallery
            mediaItems={mediaItems}
            title="Inspirando inovação e transformação digital"
            description="Explore nossa jornada através de projetos inspiradores e histórias de sucesso"
          />
          
          <TestimonialsSection
            title="O que nossos clientes dizem"
            description="Feedback de quem já trabalhou conosco"
            testimonials={testimonials}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
