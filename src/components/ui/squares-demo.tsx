
import { Squares } from "@/components/ui/squares-background"

export function SquaresDemo() {
  return (
    <div className="space-y-8">
      <div className="absolute inset-0 bg-[#060606]">
        <Squares 
          direction="diagonal"
          speed={0.5}
          squareSize={40}
          borderColor="#333" 
          hoverFillColor="#222"
        />
      </div>
    </div>
  )
}
