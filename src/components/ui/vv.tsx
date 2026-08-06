"use client"

// AsciiArtVV — "vv", made with the 21st ASCII editor and baked
// to its exact rendered output (looping video + poster). Zero dependencies:
// one <video> that fills its parent. Drop it behind or inside your content:
// <div className="relative h-96"><AsciiArtVV className="absolute inset-0" /></div>
// Remix the source recipe (styles, animation, palette) in the editor:
// https://21st.dev/community/ascii/editor?from=f7224bf0-ed78-449c-a38c-56cee2633792
export function AsciiArtVV({ className }: { className?: string }) {
  return (
    <video
      className={className}
      src={"https://assets.21st.dev/ascii-recipes/videos/user_33jvtfoPon3ReZ5KQ8SJ7n98z7V/11fdc76a-1559-4167-acb1-8fea6f7c8867.mp4"}
      poster={"https://assets.21st.dev/ascii-recipes/thumbnails/user_33jvtfoPon3ReZ5KQ8SJ7n98z7V/c97fd673-862b-49aa-8c9d-475822f58ee2.webp"}
      autoPlay
      loop
      muted
      playsInline
      aria-label={"vv — animated ASCII art"}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        // "contain", não "cover": precisa aparecer completo na tela da tv
        // (mascarada), sem cortar as bordas do vídeo.
        objectFit: "contain",
      }}
    />
  )
}
