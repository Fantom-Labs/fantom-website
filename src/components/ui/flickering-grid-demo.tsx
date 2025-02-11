
import { FlickeringGrid } from "@/components/ui/flickering-grid";

export function FlickeringGridDemo() {
  return (
    <div className="h-full w-full">
      <FlickeringGrid
        className="z-0 absolute inset-0 size-full"
        squareSize={4}
        gridGap={6}
        color="#6B7280"
        maxOpacity={0.5}
        flickerChance={0.1}
      />
    </div>
  );
}
