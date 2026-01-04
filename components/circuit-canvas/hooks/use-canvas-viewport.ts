import { useState, useEffect, useCallback, type RefObject } from "react"
import type { Component } from "@/types/circuit"
import { ZOOM_CONSTRAINTS, type Position, type ViewportState } from "../types"

interface UseCanvasViewportOptions {
  canvasRef: RefObject<HTMLDivElement | null>
  components: Component[]
}

interface UseCanvasViewportReturn extends ViewportState {
  isPanning: boolean
  handleZoomIn: () => void
  handleZoomOut: () => void
  handleResetView: () => void
  handleCenterComponents: () => void
  handlePanStart: (e: React.MouseEvent) => void
  handlePanMove: (e: React.MouseEvent) => void
  handlePanEnd: () => void
}

/**
 * Hook for managing canvas viewport (zoom and pan)
 */
export function useCanvasViewport({
  canvasRef,
  components,
}: UseCanvasViewportOptions): UseCanvasViewportReturn {
  const [panOffset, setPanOffset] = useState<Position>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 })

  // Handle zoom with mouse wheel (Ctrl + Scroll)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setZoom((prev) =>
          Math.min(ZOOM_CONSTRAINTS.MAX, Math.max(ZOOM_CONSTRAINTS.MIN, prev + delta))
        )
      }
    }

    canvas.addEventListener("wheel", handleWheel, { passive: false })
    return () => canvas.removeEventListener("wheel", handleWheel)
  }, [canvasRef])

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(ZOOM_CONSTRAINTS.MAX, prev + ZOOM_CONSTRAINTS.STEP))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(ZOOM_CONSTRAINTS.MIN, prev - ZOOM_CONSTRAINTS.STEP))
  }, [])

  const handleResetView = useCallback(() => {
    setZoom(1)
    setPanOffset({ x: 0, y: 0 })
  }, [])

  const handleCenterComponents = useCallback(() => {
    if (components.length === 0) return

    const canvasRect = canvasRef.current?.getBoundingClientRect()
    if (!canvasRect) return

    const minX = Math.min(...components.map((c) => c.x))
    const maxX = Math.max(...components.map((c) => c.x))
    const minY = Math.min(...components.map((c) => c.y))
    const maxY = Math.max(...components.map((c) => c.y))

    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    setPanOffset({
      x: canvasRect.width / 2 - centerX * zoom,
      y: canvasRect.height / 2 - centerY * zoom,
    })
  }, [components, zoom, canvasRef])

  const handlePanStart = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }, [])

  const handlePanMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return

      const deltaX = e.clientX - panStart.x
      const deltaY = e.clientY - panStart.y
      setPanOffset((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }))
      setPanStart({ x: e.clientX, y: e.clientY })
    },
    [isPanning, panStart]
  )

  const handlePanEnd = useCallback(() => {
    setIsPanning(false)
  }, [])

  return {
    panOffset,
    zoom,
    isPanning,
    handleZoomIn,
    handleZoomOut,
    handleResetView,
    handleCenterComponents,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
  }
}

