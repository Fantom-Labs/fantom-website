
import { Squares } from "@/components/ui/squares-background"

export function SquaresDemo() {
  return (
    <div className="h-full w-full">
      <Squares 
        direction="diagonal"
        speed={0.5}
        squareSize={40}
        borderColor="#333" 
        hoverFillColor="#222"
        className="h-full w-full"
      />
    </div>
  );
}
