"use client"

import type React from "react"
import { useState, useCallback } from "react"
import type { Component, Node, ComponentDefinition, NodeType, TerminalPosition } from "@/types/circuit"
import { getIconByName } from "@/lib/component-definitions"
import { cn } from "@/lib/utils"
import { CirclePlus, Plus, Trash2 } from "lucide-react"
import { Terminal, TerminalLabel, getTerminalWorldPosition } from "./terminal"

// Component dimensions - exported for use in canvas
export const COMPONENT_WIDTH = 180
export const COMPONENT_HEIGHT = 100

interface CircuitComponentProps {
  component: Component
  onNodeClick: (node: Node) => void
  onStartConnection: (node: Node, e: React.MouseEvent) => void
  onEndConnection: (node: Node) => void
  onDelete: (id: string) => void
  onDragStart: (componentId: string, offsetX: number, offsetY: number) => void
  onContextMenu: (e: React.MouseEvent, componentId: string) => void
  onUpdateNodes: (componentId: string, nodes: Node[]) => void
  connectingFrom: Node | null
  isSelected: boolean
  onClick: (componentId: string) => void
  allDefinitions: ComponentDefinition[]
  showTerminalEditor?: boolean
}

export function CircuitComponent({
  component,
  onNodeClick,
  onStartConnection,
  onEndConnection,
  onDelete,
  onDragStart,
  onContextMenu,
  onUpdateNodes,
  connectingFrom,
  isSelected,
  onClick,
  allDefinitions,
  showTerminalEditor = false,
}: CircuitComponentProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showTerminalControls, setShowTerminalControls] = useState(false)
  
  // Find the definition for this component
  const definition = component.definition || allDefinitions.find((d) => d.type === component.type || d.id === component.type)
  const Icon = definition?.icon || getIconByName(definition?.iconName) || CirclePlus

  // Handle terminal position changes
  const handleTerminalPositionChange = useCallback((nodeId: string, position: TerminalPosition) => {
    const updatedNodes = component.nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          terminalPosition: position,
          // Update absolute x/y based on new position
          ...getTerminalWorldPosition(
            { ...node, terminalPosition: position },
            component.x,
            component.y,
            COMPONENT_WIDTH,
            COMPONENT_HEIGHT
          )
        }
      }
      return node
    })
    onUpdateNodes(component.id, updatedNodes)
  }, [component, onUpdateNodes])

  // Add new terminal
  const handleAddTerminal = useCallback((type: NodeType) => {
    const newNode: Node = {
      id: `${component.id}-node-${Date.now()}`,
      type,
      componentId: component.id,
      label: type === "positive" ? "+" : type === "negative" ? "-" : "",
      terminalPosition: { edge: "bottom", position: 50 },
      x: component.x,
      y: component.y + COMPONENT_HEIGHT / 2,
    }
    
    // Redistribute terminals on the bottom edge
    const bottomTerminals = [...component.nodes.filter(n => 
      !n.terminalPosition || n.terminalPosition.edge === "bottom"
    ), newNode]
    
    const spacing = 100 / (bottomTerminals.length + 1)
    const updatedNodes = component.nodes.map((node, i) => {
      if (!node.terminalPosition || node.terminalPosition.edge === "bottom") {
        const idx = bottomTerminals.findIndex(n => n.id === node.id)
        if (idx !== -1) {
          return {
            ...node,
            terminalPosition: { edge: "bottom" as const, position: spacing * (idx + 1) }
          }
        }
      }
      return node
    })
    
    // Add new node with proper position
    newNode.terminalPosition = { edge: "bottom", position: spacing * bottomTerminals.length }
    
    onUpdateNodes(component.id, [...updatedNodes, newNode])
  }, [component, onUpdateNodes])

  // Remove terminal
  const handleRemoveTerminal = useCallback((nodeId: string) => {
    if (component.nodes.length <= 1) return
    onUpdateNodes(component.id, component.nodes.filter(n => n.id !== nodeId))
  }, [component, onUpdateNodes])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !e.shiftKey) {
      onClick(component.id)
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const offsetX = e.clientX - rect.left - rect.width / 2
      const offsetY = e.clientY - rect.top - rect.height / 2
      onDragStart(component.id, offsetX, offsetY)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    onContextMenu(e, component.id)
  }

  // Check if a terminal is compatible for connection
  const isCompatibleTarget = useCallback((node: Node) => {
    if (!connectingFrom) return false
    if (connectingFrom.componentId === component.id) return false
    // Allow any connection for now - could add type compatibility later
    return true
  }, [connectingFrom, component.id])

  return (
    <div
      className="absolute group"
      style={{
        left: component.x,
        top: component.y,
        transform: "translate(-50%, -50%)",
        width: COMPONENT_WIDTH,
        height: COMPONENT_HEIGHT,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Component card */}
      <div
        className={cn(
          "relative w-full h-full bg-component border-2 rounded-xl shadow-lg transition-all duration-150 cursor-move",
          isSelected 
            ? "border-primary ring-2 ring-primary/30 shadow-xl" 
            : "border-component-border hover:border-primary/50",
          definition?.isCustom && "border-dashed",
          isHovered && !isSelected && "shadow-xl"
        )}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
      >
        {/* Custom badge */}
        {definition?.isCustom && (
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded-full z-10">
            Custom
          </div>
        )}

        {/* Main content */}
        <div className="flex items-center gap-3 p-3 h-full">
          {/* Image or Icon */}
          {definition?.imageUrl ? (
            <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={definition.imageUrl}
                alt={component.label}
                className="w-full h-full object-contain"
                draggable={false}
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-component-foreground" />
            </div>
          )}
          
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <span className="text-sm font-semibold text-component-foreground block truncate leading-tight">
              {component.label}
            </span>
            {component.notes && (
              <span className="text-[11px] text-muted-foreground truncate block leading-tight">
                {component.notes}
              </span>
            )}
          </div>
        </div>

        {/* Terminal edit controls - shown when selected */}
        {isSelected && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background/95 backdrop-blur border border-border rounded-lg px-2 py-1 shadow-lg z-30">
            <button
              onClick={() => handleAddTerminal("positive")}
              className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors"
              title="Add positive terminal"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleAddTerminal("negative")}
              className="p-1 rounded hover:bg-blue-500/20 text-blue-500 transition-colors"
              title="Add negative terminal"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <span className="text-[10px] text-muted-foreground">Right-click terminals to move</span>
          </div>
        )}
      </div>

      {/* Terminals - positioned around the edge */}
      {component.nodes.map((node) => (
        <Terminal
          key={node.id}
          node={node}
          componentWidth={COMPONENT_WIDTH}
          componentHeight={COMPONENT_HEIGHT}
          isConnecting={!!connectingFrom}
          isConnectingFrom={connectingFrom?.id === node.id}
          isCompatibleTarget={isCompatibleTarget(node)}
          onStartConnection={onStartConnection}
          onEndConnection={onEndConnection}
          onPositionChange={handleTerminalPositionChange}
        />
      ))}

      {/* Terminal labels */}
      {component.nodes.map((node) => (
        <TerminalLabel
          key={`label-${node.id}`}
          node={node}
          componentWidth={COMPONENT_WIDTH}
          componentHeight={COMPONENT_HEIGHT}
        />
      ))}
    </div>
  )
}

// Re-export terminal position helper
export { getTerminalWorldPosition }
