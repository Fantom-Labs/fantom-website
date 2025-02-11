
import { BackgroundBeamsDemo } from "@/components/ui/background-beams-demo";
import InteractiveBentoGallery from "@/components/blocks/interactive-bento-gallery";

const Index = () => {
  const mediaItems = [
    {
      id: 1,
      type: "image",
      title: "Nature View",
      desc: "Beautiful landscape",
      url: "/placeholder.svg",
      span: "row-span-2 col-span-2"
    },
    {
      id: 2,
      type: "image",
      title: "City Life",
      desc: "Urban exploration",
      url: "/placeholder.svg",
      span: "row-span-1"
    },
    {
      id: 3,
      type: "image",
      title: "Architecture",
      desc: "Modern design",
      url: "/placeholder.svg",
      span: "row-span-1"
    }
  ];

  return (
    <div className="min-h-screen">
      <BackgroundBeamsDemo />
      <div className="relative">
        <InteractiveBentoGallery 
          mediaItems={mediaItems}
          title="Our Gallery"
          description="Explore our collection of amazing images"
        />
      </div>
    </div>
  );
};

export default Index;
