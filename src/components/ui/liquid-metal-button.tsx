"use client"

import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders"
import { Sparkles } from "lucide-react"
import type React from "react"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"

interface LiquidMetalButtonProps {
  label?: string
  onClick?: () => void
  viewMode?: "text" | "icon"
  // quando passado, renderiza um <a> (não <button>) — certo pra links de
  // verdade (abre em aba nova, funciona sem JS, "abrir em nova aba" do
  // botão direito, indexável) em vez de simular navegação via onClick.
  href?: string
}

// padding horizontal interno (cada lado) do modo "text" — o conteúdo
// (texto + ícone do whatsapp) tem largura variável, então a largura do
// botão é medida em tempo real (ver contentRef abaixo) em vez de fixa,
// pra caber qualquer label com respiro nas laterais.
const TEXT_PADDING_X = 24
const TEXT_MIN_WIDTH = 142
// u_scale de referência (ver loadShader) foi calibrado pro widget original
// (label "Get Started", ~142px de largura) — nesse tamanho o brilho
// metálico envolve o botão inteiro. Como agora a largura muda com o texto
// (até 600px+ em telas largas, ver CTA_LABEL/max-w em lobby.tsx), o mesmo
// u_scale fixo faz o padrão "esticar": o brilho concentra de um lado e
// esvai antes de chegar no outro (bug reportado: "cortando o stroke na
// direita"). u_scale escala proporcional à largura real, então a
// densidade do padrão fica visualmente igual em qualquer tamanho de botão.
const SHADER_REFERENCE_WIDTH = 142
const SHADER_REFERENCE_U_SCALE = 8

export function LiquidMetalButton({
  label = "Get Started",
  onClick,
  viewMode = "text",
  href,
}: LiquidMetalButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const shaderRef = useRef<HTMLDivElement>(null)
  const shaderMount = useRef<ShaderMount | null>(null)
  const buttonRef = useRef<HTMLButtonElement & HTMLAnchorElement>(null)
  const contentRef = useRef<HTMLSpanElement>(null)
  const rippleId = useRef(0)

  // largura natural do conteúdo (texto + ícone), medida no elemento SEM
  // largura fixa (contentRef) — não dá pra medir a camada de fora
  // (já tem width:Npx aplicado, sempre devolveria o mesmo valor).
  const [contentWidth, setContentWidth] = useState<number | null>(null)
  useLayoutEffect(() => {
    if (viewMode !== "text" || !contentRef.current) return
    const measure = () => setContentWidth(contentRef.current?.getBoundingClientRect().width ?? null)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(contentRef.current)
    return () => ro.disconnect()
  }, [viewMode, label])

  const dimensions = useMemo(() => {
    if (viewMode === "icon") {
      return {
        width: 46,
        height: 46,
        innerWidth: 42,
        innerHeight: 42,
        shaderWidth: 46,
        shaderHeight: 46,
      }
    } else {
      const width = Math.max(TEXT_MIN_WIDTH, Math.ceil(contentWidth ?? 0) + TEXT_PADDING_X * 2)
      return {
        width,
        height: 46,
        innerWidth: width - 4,
        innerHeight: 42,
        shaderWidth: width,
        shaderHeight: 46,
      }
    }
  }, [viewMode, contentWidth])

  useEffect(() => {
    const styleId = "shader-canvas-style-exploded"
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style")
      style.id = styleId
      style.textContent = `
        .shader-container-exploded canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: 100px !important;
        }
        @keyframes ripple-animation {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  // recria o shader sempre que a largura muda (medição inicial do texto
  // chega depois do primeiro mount, ver contentWidth acima) — u_scale
  // proporcional à largura real (ver SHADER_REFERENCE_*), senão o padrão
  // metálico fica calibrado só pro primeiro valor de largura e nunca
  // acompanha o texto real do botão.
  useEffect(() => {
    const loadShader = async () => {
      try {
        if (shaderRef.current) {
          // dispose(), não destroy() — ShaderMount não tem método
          // "destroy" (a lib usa "dispose"); com o nome errado esse
          // cleanup nunca rodava, vazando o contexto WebGL antigo a cada
          // remount.
          shaderMount.current?.dispose()

          const uScale = (dimensions.width / SHADER_REFERENCE_WIDTH) * SHADER_REFERENCE_U_SCALE

          shaderMount.current = new ShaderMount(
            shaderRef.current,
            liquidMetalFragmentShader,
            {
              u_repetition: 4,
              u_softness: 0.5,
              u_shiftRed: 0.3,
              u_shiftBlue: 0.3,
              u_distortion: 0,
              u_contour: 0,
              u_angle: 45,
              u_scale: uScale,
              u_shape: 1,
              u_offsetX: 0.1,
              u_offsetY: -0.1,
            },
            undefined,
            0.6
          )
        }
      } catch (error) {
        console.error("[v0] Failed to load shader:", error)
      }
    }

    loadShader()

    return () => {
      shaderMount.current?.dispose()
      shaderMount.current = null
    }
  }, [dimensions.width])

  const handleMouseEnter = () => {
    setIsHovered(true)
    shaderMount.current?.setSpeed?.(1)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setIsPressed(false)
    shaderMount.current?.setSpeed?.(0.6)
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (shaderMount.current?.setSpeed) {
      shaderMount.current.setSpeed(2.4)
      setTimeout(() => {
        if (isHovered) {
          shaderMount.current?.setSpeed?.(1)
        } else {
          shaderMount.current?.setSpeed?.(0.6)
        }
      }, 300)
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const ripple = { x, y, id: rippleId.current++ }

      setRipples((prev) => [...prev, ripple])
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
      }, 600)
    }

    onClick?.()
  }

  const InteractiveTag = href ? "a" : "button"

  return (
    <div className="relative inline-block">
      <div
        style={{
          perspective: "1000px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          style={{
            position: "relative",
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            transformStyle: "preserve-3d",
            transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
            transform: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transformStyle: "preserve-3d",
              transition:
                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, gap 0.4s ease",
              transform: "translateZ(20px)",
              zIndex: 30,
              pointerEvents: "none",
            }}
          >
            {viewMode === "icon" && (
              <Sparkles
                size={16}
                style={{
                  color: "#ffffff",
                  filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.5))",
                  transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: "scale(1)",
                }}
              />
            )}
            {viewMode === "text" && (
              // contentRef: sem largura própria (shrink-to-fit natural),
              // é o que dá o tamanho real do conteúdo pra medir em
              // dimensions acima — o pai (este flex) já tem largura fixa,
              // medir nele sempre devolveria o valor já aplicado.
              <span ref={contentRef} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#ffffff",
                    fontWeight: 400,
                    textShadow: "0px 1px 2px rgba(0, 0, 0, 0.5)",
                    transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transform: "scale(1)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
                <WhatsAppIcon
                  size={16}
                  style={{
                    color: "#ffffff",
                    flexShrink: 0,
                    filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.5))",
                  }}
                />
              </span>
            )}
          </div>

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              transformStyle: "preserve-3d",
              transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
              transform: `translateZ(10px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: `${dimensions.innerWidth}px`,
                height: `${dimensions.innerHeight}px`,
                margin: "2px",
                borderRadius: "100px",
                background: "linear-gradient(180deg, #202020 0%, #000000 100%)",
                boxShadow: isPressed
                  ? "inset 0px 2px 4px rgba(0, 0, 0, 0.4), inset 0px 1px 2px rgba(0, 0, 0, 0.3)"
                  : "none",
                transition:
                  "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              transformStyle: "preserve-3d",
              transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
              transform: `translateZ(0px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
              zIndex: 10,
            }}
          >
            <div
              style={{
                height: `${dimensions.height}px`,
                width: `${dimensions.width}px`,
                borderRadius: "100px",
                boxShadow: isPressed
                  ? "0px 0px 0px 1px rgba(0, 0, 0, 0.5), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)"
                  : isHovered
                    ? "0px 0px 0px 1px rgba(0, 0, 0, 0.4), 0px 12px 6px 0px rgba(0, 0, 0, 0.05), 0px 8px 5px 0px rgba(0, 0, 0, 0.1), 0px 4px 4px 0px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.2)"
                    : "0px 0px 0px 1px rgba(0, 0, 0, 0.3), 0px 36px 14px 0px rgba(0, 0, 0, 0.02), 0px 20px 12px 0px rgba(0, 0, 0, 0.08), 0px 9px 9px 0px rgba(0, 0, 0, 0.12), 0px 2px 5px 0px rgba(0, 0, 0, 0.15)",
                transition:
                  "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                background: "rgb(0 0 0 / 0)",
              }}
            >
              <div
                ref={shaderRef}
                className="shader-container-exploded"
                style={{
                  borderRadius: "100px",
                  overflow: "hidden",
                  position: "relative",
                  width: `${dimensions.shaderWidth}px`,
                  maxWidth: `${dimensions.shaderWidth}px`,
                  height: `${dimensions.shaderHeight}px`,
                  transition: "width 0.4s ease, height 0.4s ease",
                }}
              />
            </div>
          </div>

          {/* <a> quando href é passado (link de verdade — whatsapp etc.),
              <button> caso contrário. target/rel só entram com href: nova
              aba + noopener/noreferrer (não expõe window.opener pro site
              de destino, prática padrão pra link externo). */}
          <InteractiveTag
            ref={buttonRef}
            {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              outline: "none",
              zIndex: 40,
              transformStyle: "preserve-3d",
              transform: "translateZ(25px)",
              transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
              overflow: "hidden",
              borderRadius: "100px",
              display: "block",
            }}
            aria-label={label}
          >
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                style={{
                  position: "absolute",
                  left: `${ripple.x}px`,
                  top: `${ripple.y}px`,
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)",
                  pointerEvents: "none",
                  animation: "ripple-animation 0.6s ease-out",
                }}
              />
            ))}
          </InteractiveTag>
        </div>
      </div>
    </div>
  )
}

