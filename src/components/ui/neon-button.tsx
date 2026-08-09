import * as React from "react"
import { cn } from "@/lib/utils"
import { VariantProps, cva } from "class-variance-authority"

// cor de texto direta (text-white/90), não o token semântico
// text-foreground do shadcn — esse assume tema claro e ficaria quase
// invisível contra o fundo preto do lobby (mesmo ajuste feito em
// text-scramble.tsx). dark:via-blue-500 removido: o projeto não ativa
// .dark (ver globals.css), então essa variante nunca aplicaria mesmo.
const buttonVariants = cva(
  "relative group border text-white/90 mx-auto text-center rounded-full",
  {
    variants: {
      variant: {
        default: "bg-blue-500/5 hover:bg-blue-500/0 border-blue-500/20",
        solid:
          "bg-blue-500 hover:bg-blue-600 text-white border-transparent hover:border-white/50 transition-all duration-200",
        ghost: "border-transparent bg-transparent hover:border-white/30 hover:bg-white/10",
      },
      size: {
        default: "px-7 py-1.5 ",
        sm: "px-4 py-0.5 ",
        lg: "px-10 py-2.5 ",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  neon?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, neon = true, size, variant, children, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props}>
        <span
          className={cn(
            "absolute inset-x-0 inset-y-0 mx-auto h-px w-3/4 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-100 hidden",
            neon && "block"
          )}
        />
        {children}
        <span
          className={cn(
            "absolute inset-x-0 -bottom-px mx-auto h-px w-3/4 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-30 hidden",
            neon && "block"
          )}
        />
      </button>
    )
  }
)

Button.displayName = "NeonButton"

export { Button, buttonVariants }
