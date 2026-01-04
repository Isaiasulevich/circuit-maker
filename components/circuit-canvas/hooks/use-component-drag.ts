import { useState, useCallback, type RefObject } from "react"
import type { Component } from "@/types/circuit"
import type { Position } from "../types"
import { updateNodeWorldPositions } from "../utils"

interface UseComponentDragOptions {
  canvasRef: RefObject<HTMLDivElement | null>
  components: Component[]
  setComponents: (components: Component[]) => void
  panOffset: Position
  zoom: number
}

interface UseComponentDragReturn {
  draggingComponent: string | null
  handleDragStart: (componentId: string, offsetX: number, offsetY: number) => void
  handleDragMove: (e: React.MouseEvent) => void
  handleDragEnd: () => void
}

/**
 * Hook for managing component dragging on the canvas
 */
export function useComponentDrag({
  canvasRef,
  components,
  setComponents,
  panOffset,
  zoom,
}: UseComponentDragOptions): UseComponentDragReturn {
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })

  const handleDragStart = useCallback(
    (componentId: string, offsetX: number, offsetY: number) => {
      setDraggingComponent(componentId)
      setDragOffset({ x: offsetX, y: offsetY })
    },
    []
  )

  const handleDragMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingComponent) return

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const component = components.find((c) => c.id === draggingComponent)
      if (!component) return

      const newX = (e.clientX - rect.left - panOffset.x) / zoom - dragOffset.x
      const newY = (e.clientY - rect.top - panOffset.y) / zoom - dragOffset.y

      setComponents(
        components.map((c) => {
          if (c.id === draggingComponent) {
            return {
              ...c,
              x: newX,
              y: newY,
              nodes: updateNodeWorldPositions(c.nodes, newX, newY),
            }
          }
          return c
        })
      )
    },
    [draggingComponent, canvasRef, components, setComponents, panOffset, zoom, dragOffset]
  )

  const handleDragEnd = useCallback(() => {
    setDraggingComponent(null)
  }, [])

  return {
    draggingComponent,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  }
}

