"use client"

interface GridPatternProps {
  zoom: number
  panOffsetX: number
  panOffsetY: number
}

/**
 * Dot grid background pattern for the canvas
 */
export function GridPattern({ zoom, panOffsetX, panOffsetY }: GridPatternProps) {
  return (
    <div
      className="absolute inset-0 opacity-20 pointer-events-none"
      style={{
        backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        backgroundPosition: `${panOffsetX}px ${panOffsetY}px`,
        color: "var(--foreground)",
      }}
    />
  )
}

