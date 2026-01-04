"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import type { Node, NodeType, TerminalPosition } from "@/types/circuit"
import { cn } from "@/lib/utils"

interface TerminalProps {
  node: Node
  componentWidth: number
  componentHeight: number
  isConnecting: boolean
  isConnectingFrom: boolean
  isCompatibleTarget: boolean
  onStartConnection: (node: Node, e: React.MouseEvent) => void
  onEndConnection: (node: Node) => void
  onPositionChange?: (nodeId: string, position: TerminalPosition) => void
  disabled?: boolean
}

/**
 * Terminal Component - Figma-style connection point
 * 
 * Features:
 * - Positioned on component edge
 * - Draggable around the edge
 * - Visual feedback for connection states
 * - Hover highlighting
 */
export function Terminal({
  node,
  componentWidth,
  componentHeight,
  isConnecting,
  isConnectingFrom,
  isCompatibleTarget,
  onStartConnection,
  onEndConnection,
  onPositionChange,
  disabled = false,
}: TerminalProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)

  // Get terminal colors based on type
  const getTerminalColors = (type: NodeType) => {
    const colors: Record<NodeType, { bg: string; border: string; glow: string }> = {
      positive: { 
        bg: "bg-red-500", 
        border: "border-red-400", 
        glow: "shadow-[0_0_12px_rgba(239,68,68,0.6)]" 
      },
      negative: { 
        bg: "bg-blue-500", 
        border: "border-blue-400", 
        glow: "shadow-[0_0_12px_rgba(59,130,246,0.6)]" 
      },
      earth: { 
        bg: "bg-green-500", 
        border: "border-green-400", 
        glow: "shadow-[0_0_12px_rgba(34,197,94,0.6)]" 
      },
      "ac-live": { 
        bg: "bg-orange-500", 
        border: "border-orange-400", 
        glow: "shadow-[0_0_12px_rgba(249,115,22,0.6)]" 
      },
      "ac-neutral": { 
        bg: "bg-purple-500", 
        border: "border-purple-400", 
        glow: "shadow-[0_0_12px_rgba(168,85,247,0.6)]" 
      },
      signal: { 
        bg: "bg-cyan-500", 
        border: "border-cyan-400", 
        glow: "shadow-[0_0_12px_rgba(6,182,212,0.6)]" 
      },
    }
    return colors[type] || colors.positive
  }

  // Calculate position on component edge
  const getTerminalStyle = useCallback(() => {
    const pos = node.terminalPosition || { edge: "bottom", position: 50 }
    const offset = (pos.position / 100)
    
    // Terminal size
    const size = 14
    const halfSize = size / 2

    let style: React.CSSProperties = {
      position: "absolute",
      width: size,
      height: size,
      zIndex: 20,
    }

    switch (pos.edge) {
      case "top":
        style.top = -halfSize
        style.left = `calc(${offset * 100}% - ${halfSize}px)`
        break
      case "bottom":
        style.bottom = -halfSize
        style.left = `calc(${offset * 100}% - ${halfSize}px)`
        break
      case "left":
        style.left = -halfSize
        style.top = `calc(${offset * 100}% - ${halfSize}px)`
        break
      case "right":
        style.right = -halfSize
        style.top = `calc(${offset * 100}% - ${halfSize}px)`
        break
    }

    return style
  }, [node.terminalPosition])

  // Handle dragging terminal around edge
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (disabled || !onPositionChange) return
    e.stopPropagation()
    e.preventDefault()
    setIsDragging(true)
  }, [disabled, onPositionChange])

  useEffect(() => {
    if (!isDragging || !onPositionChange) return

    const handleMouseMove = (e: MouseEvent) => {
      const terminalEl = terminalRef.current
      if (!terminalEl) return

      const parent = terminalEl.parentElement
      if (!parent) return

      const rect = parent.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Determine which edge is closest
      const distToTop = mouseY
      const distToBottom = rect.height - mouseY
      const distToLeft = mouseX
      const distToRight = rect.width - mouseX

      const minDist = Math.min(distToTop, distToBottom, distToLeft, distToRight)

      let edge: TerminalPosition["edge"]
      let position: number

      if (minDist === distToTop) {
        edge = "top"
        position = Math.max(10, Math.min(90, (mouseX / rect.width) * 100))
      } else if (minDist === distToBottom) {
        edge = "bottom"
        position = Math.max(10, Math.min(90, (mouseX / rect.width) * 100))
      } else if (minDist === distToLeft) {
        edge = "left"
        position = Math.max(10, Math.min(90, (mouseY / rect.height) * 100))
      } else {
        edge = "right"
        position = Math.max(10, Math.min(90, (mouseY / rect.height) * 100))
      }

      onPositionChange(node.id, { edge, position })
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
  }, [isDragging, node.id, onPositionChange])

  // Handle connection interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    
    // Right-click for dragging position
    if (e.button === 2 && onPositionChange) {
      handleDragStart(e)
      return
    }

    // Left-click for connections
    if (e.button === 0) {
      e.stopPropagation()
      if (isConnecting && isCompatibleTarget) {
        onEndConnection(node)
      } else if (!isConnecting) {
        onStartConnection(node, e)
      }
    }
  }

  const handleMouseEnter = () => {
    if (!disabled) setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const colors = getTerminalColors(node.type)
  const isActive = isConnectingFrom || isDragging
  const showGlow = isHovered || isActive || (isConnecting && isCompatibleTarget)

  return (
    <div
      ref={terminalRef}
      className={cn(
        // Base styles
        "rounded-full cursor-pointer transition-all duration-150",
        "border-2 border-background",
        "flex items-center justify-center",
        colors.bg,
        
        // Hover/Active states
        showGlow && colors.glow,
        isHovered && "scale-125 z-30",
        isActive && "scale-130 z-30",
        
        // Connection target state
        isConnecting && isCompatibleTarget && "ring-2 ring-white/50 animate-pulse",
        isConnecting && !isCompatibleTarget && !isConnectingFrom && "opacity-40",
        
        // Dragging state
        isDragging && "cursor-grabbing scale-130",
        
        // Disabled state
        disabled && "opacity-50 cursor-not-allowed"
      )}
      style={getTerminalStyle()}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={(e) => e.preventDefault()}
      title={`${node.label || node.type}${onPositionChange ? " (Right-click drag to reposition)" : ""}`}
    >
      {/* Label for single char labels */}
      {node.label && node.label.length === 1 && (
        <span className="text-[8px] font-bold text-white drop-shadow-sm select-none">
          {node.label}
        </span>
      )}
      
      {/* Connection indicator when dragging a wire */}
      {isConnecting && isCompatibleTarget && isHovered && (
        <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
      )}
    </div>
  )
}

/**
 * Terminal Label - Shows label below/beside the terminal
 */
interface TerminalLabelProps {
  node: Node
  componentWidth: number
  componentHeight: number
}

export function TerminalLabel({ node, componentWidth, componentHeight }: TerminalLabelProps) {
  if (!node.label || node.label.length <= 1) return null

  const pos = node.terminalPosition || { edge: "bottom", position: 50 }
  const offset = (pos.position / 100)

  let style: React.CSSProperties = {
    position: "absolute",
    fontSize: "9px",
    whiteSpace: "nowrap",
    pointerEvents: "none",
    zIndex: 10,
  }

  // Position label based on edge
  switch (pos.edge) {
    case "top":
      style.top = -22
      style.left = `calc(${offset * 100}%)`
      style.transform = "translateX(-50%)"
      break
    case "bottom":
      style.bottom = -20
      style.left = `calc(${offset * 100}%)`
      style.transform = "translateX(-50%)"
      break
    case "left":
      style.left = -8
      style.top = `calc(${offset * 100}%)`
      style.transform = "translate(-100%, -50%)"
      break
    case "right":
      style.right = -8
      style.top = `calc(${offset * 100}%)`
      style.transform = "translate(100%, -50%)"
      break
  }

  return (
    <span className="text-muted-foreground" style={style}>
      {node.label}
    </span>
  )
}

/**
 * Calculate terminal world position for connection drawing
 */
export function getTerminalWorldPosition(
  node: Node,
  componentX: number,
  componentY: number,
  componentWidth: number,
  componentHeight: number
): { x: number; y: number } {
  const pos = node.terminalPosition || { edge: "bottom", position: 50 }
  const offset = pos.position / 100

  // Component bounds (center-based positioning)
  const halfWidth = componentWidth / 2
  const halfHeight = componentHeight / 2

  switch (pos.edge) {
    case "top":
      return {
        x: componentX - halfWidth + (componentWidth * offset),
        y: componentY - halfHeight,
      }
    case "bottom":
      return {
        x: componentX - halfWidth + (componentWidth * offset),
        y: componentY + halfHeight,
      }
    case "left":
      return {
        x: componentX - halfWidth,
        y: componentY - halfHeight + (componentHeight * offset),
      }
    case "right":
      return {
        x: componentX + halfWidth,
        y: componentY - halfHeight + (componentHeight * offset),
      }
    default:
      return { x: componentX, y: componentY + halfHeight }
  }
}

