
import { BackgroundBeamsDemo } from "@/components/ui/background-beams-demo";
import { RevealImageList } from "@/components/ui/reveal-images";

const Index = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-1">
        <BackgroundBeamsDemo />
      </div>
      <div className="relative z-10">
        <RevealImageList />
      </div>
    </div>
  );
};

export default Index;
