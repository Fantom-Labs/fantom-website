
import { SquaresDemo } from "@/components/ui/squares-demo";
import InteractiveBentoGallery from "@/components/blocks/interactive-bento-gallery"
import { TestimonialsSection } from "@/components/blocks/testimonials-with-marquee"

const Index = () => {
  const testimonials = [
    {
      author: {
        name: "John Doe",
        handle: "CEO at TechCorp", // Changed title to handle as per TestimonialAuthor type
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1"
      },
      text: "Amazing work! Exceeded our expectations.",
      href: "#"
    },
    {
      author: {
        name: "Jane Smith",
        handle: "Designer at CreativeCo", // Changed title to handle
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2"
      },
      text: "Professional and creative team. Great results!",
      href: "#"
    },
    {
      author: {
        name: "Mike Johnson",
        handle: "Founder of StartupX", // Changed title to handle
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3"
      },
      text: "Fantastic experience working with them.",
      href: "#"
    }
  ];

  const mediaItems = [
    {
      id: 1, // Changed from string to number
      type: "image",
      title: "Nossa História",
      desc: "Uma jornada de inovação e sucesso",
      url: "/lovable-uploads/1d056377-00cb-4002-9af8-d368246a5452.png",
      span: "row-span-2 col-span-2"
    },
    {
      id: 2, // Changed from string to number
      type: "image",
      title: "Nosso Time",
      desc: "Uma equipe dedicada e talentosa",
      url: "/lovable-uploads/b6feb9f9-dac0-4da7-96e4-8e6c80da9005.png",
      span: "row-span-1"
    },
    {
      id: 3, // Changed from string to number
      type: "image",
      title: "Nossos Projetos",
      desc: "Soluções que transformam negócios",
      url: "/lovable-uploads/e7304a40-916b-49b5-9a92-2fa7927dfe98.png",
      span: "row-span-1"
    }
  ];

  return (
    <div className="relative">
      <div className="h-screen">
        <SquaresDemo />
      </div>
      
      <div className="relative z-10">
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
  );
};

export default Index;
