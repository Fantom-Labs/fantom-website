"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface BeamsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function BackgroundBeams({ className, children }: BeamsProps) {
  const [showBeams, setShowBeams] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setShowBeams(true);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {children}
      <div
        className={cn(
          "absolute h-full w-full inset-0 [mask-size:40px] [mask-repeat:no-repeat] flex items-center justify-center rotate-180 scale-x-[-1]",
          className,
        )}
      >
        <svg
          className="z-0 h-full w-full pointer-events-none absolute"
          width="100%"
          height="100%"
          viewBox="0 0 696 316"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 0H696V316H0V0Z" fill="url(#paint0_linear_1_2)" />
          <defs>
            <linearGradient id="paint0_linear_1_2" x1="0" y1="0" x2="696" y2="316" gradientUnits="userSpaceOnUse">
              <stop stopColor="rgba(255, 255, 255, 0.1)" />
              <stop offset="1" stopColor="rgba(255, 255, 255, 0)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
