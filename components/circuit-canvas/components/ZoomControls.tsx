"use client"

import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Maximize2, Move } from "lucide-react"

interface ZoomControlsProps {
  zoom: number
  hasComponents: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
  onCenterComponents: () => void
}

/**
 * Zoom and pan controls overlay for the canvas
 */
export function ZoomControls({
  zoom,
  hasComponents,
  onZoomIn,
  onZoomOut,
  onResetView,
  onCenterComponents,
}: ZoomControlsProps) {
  return (
    <>
      {/* Control buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <Button
          variant="secondary"
          size="icon"
          onClick={onZoomIn}
          className="h-9 w-9 shadow-md"
          title="Zoom in (Ctrl + Scroll)"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={onZoomOut}
          className="h-9 w-9 shadow-md"
          title="Zoom out (Ctrl + Scroll)"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={onResetView}
          className="h-9 w-9 shadow-md"
          title="Reset view"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        {hasComponents && (
          <Button
            variant="secondary"
            size="icon"
            onClick={onCenterComponents}
            className="h-9 w-9 shadow-md"
            title="Center on components"
          >
            <Move className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur border border-border rounded-md px-3 py-1.5 text-xs font-medium z-10">
        {Math.round(zoom * 100)}%
      </div>
    </>
  )
}

