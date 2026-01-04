"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react"

interface ResizablePanelProps {
  children: React.ReactNode
  side: "left" | "right"
  defaultWidth: number
  minWidth: number
  maxWidth?: number
  collapsedWidth?: number
  className?: string
  onWidthChange?: (width: number) => void
}

export function ResizablePanel({
  children,
  side,
  defaultWidth,
  minWidth,
  maxWidth = 500,
  collapsedWidth = 0,
  className,
  onWidthChange,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    dragStartX.current = e.clientX
    dragStartWidth.current = width
  }, [width])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const delta = side === "left" 
        ? e.clientX - dragStartX.current
        : dragStartX.current - e.clientX
      
      const newWidth = Math.max(minWidth, Math.min(maxWidth, dragStartWidth.current + delta))
      setWidth(newWidth)
      onWidthChange?.(newWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, side, minWidth, maxWidth, onWidthChange])

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed)
  }, [isCollapsed])

  const currentWidth = isCollapsed ? collapsedWidth : width

  return (
    <div
      ref={panelRef}
      className={cn(
        "relative flex-shrink-0 transition-[width] duration-200 ease-out",
        isDragging && "transition-none",
        className
      )}
      style={{ width: currentWidth }}
    >
      {/* Panel content */}
      <div 
        className={cn(
          "h-full overflow-hidden transition-opacity duration-200",
          isCollapsed && "opacity-0 pointer-events-none"
        )}
        style={{ width: isCollapsed ? 0 : width }}
      >
        {children}
      </div>

      {/* Resize handle */}
      <div
        className={cn(
          "absolute top-0 bottom-0 w-1 cursor-col-resize z-20 group",
          "hover:bg-primary/30 active:bg-primary/50",
          isDragging && "bg-primary/50",
          side === "left" ? "right-0" : "left-0"
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Visual grip indicator on hover */}
        <div className={cn(
          "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
          "bg-muted border border-border rounded-sm p-0.5",
          side === "left" ? "-right-2" : "-left-2"
        )}>
          <GripVertical className="w-3 h-3 text-muted-foreground" />
        </div>
      </div>

      {/* Collapse toggle button */}
      <button
        onClick={toggleCollapse}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 z-30",
          "w-5 h-10 flex items-center justify-center",
          "bg-card border border-border rounded-md shadow-sm",
          "hover:bg-accent transition-colors",
          side === "left" 
            ? (isCollapsed ? "left-0" : "-right-2.5") 
            : (isCollapsed ? "right-0" : "-left-2.5")
        )}
        title={isCollapsed ? "Expand panel" : "Collapse panel"}
      >
        {side === "left" ? (
          isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />
        ) : (
          isCollapsed ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
        )}
      </button>
    </div>
  )
}

