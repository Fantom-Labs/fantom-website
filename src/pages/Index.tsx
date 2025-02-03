import { BackgroundBeamsDemo } from "@/components/ui/background-beams-demo";
import { ThemeToggle } from "@/components/theme-toggle";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <BackgroundBeamsDemo />
    </div>
  );
};

export default Index;