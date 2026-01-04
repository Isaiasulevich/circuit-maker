"use client"

import type React from "react"
import { useRef, useState, useCallback, useEffect } from "react"
import { CircuitComponent, COMPONENT_WIDTH, COMPONENT_HEIGHT, getTerminalWorldPosition } from "@/components/circuit-component"
import { ComponentContextMenu } from "@/components/component-context-menu"
import { SwapComponentDialog } from "@/components/swap-component-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Component, Connection, Node, ComponentDefinition, NodeType, TerminalPosition } from "@/types/circuit"
import { DEFAULT_COMPONENT_DEFINITIONS } from "@/lib/component-definitions"
import { ZoomIn, ZoomOut, Maximize2, Move } from "lucide-react"

interface CircuitCanvasProps {
  components: Component[]
  setComponents: (components: Component[]) => void
  connections: Connection[]
  setConnections: (connections: Connection[]) => void
  selectedComponentId: string | null
  setSelectedComponentId: (id: string | null) => void
  defaultCableUnit: string
  customDefinitions: ComponentDefinition[]
}

export function CircuitCanvas({
  components,
  setComponents,
  connections,
  setConnections,
  selectedComponentId,
  setSelectedComponentId,
  defaultCableUnit,
  customDefinitions,
}: CircuitCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [connectingFrom, setConnectingFrom] = useState<Node | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [editingConnection, setEditingConnection] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; componentId: string } | null>(null)
  const [swapDialogOpen, setSwapDialogOpen] = useState(false)
  const [swappingComponentId, setSwappingComponentId] = useState<string | null>(null)

  const MIN_ZOOM = 0.25
  const MAX_ZOOM = 2

  // Handle ESC key to cancel connection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && connectingFrom) {
        setConnectingFrom(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [connectingFrom])

  // Combine all definitions for lookup
  const allDefinitions = [...DEFAULT_COMPONENT_DEFINITIONS, ...(customDefinitions || [])]

  const findDefinition = useCallback((type: string): ComponentDefinition | undefined => {
    return allDefinitions.find((d) => d.type === type || d.id === type)
  }, [allDefinitions])

  // Handle zoom with mouse wheel
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setZoom((prev) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta)))
      }
    }

    canvas.addEventListener("wheel", handleWheel, { passive: false })
    return () => canvas.removeEventListener("wheel", handleWheel)
  }, [])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(MAX_ZOOM, prev + 0.25))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(MIN_ZOOM, prev - 0.25))
  }

  const handleResetView = () => {
    setZoom(1)
    setPanOffset({ x: 0, y: 0 })
  }

  const handleCenterComponents = () => {
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
  }

  // Initialize terminal positions for new components
  const initializeTerminalPositions = (component: Component): Component => {
    const totalNodes = component.nodes.length
    if (totalNodes === 0) return component

    // Distribute terminals evenly on the bottom edge
    const spacing = 100 / (totalNodes + 1)
    
    const updatedNodes = component.nodes.map((node, index) => {
      if (!node.terminalPosition) {
        const position: TerminalPosition = {
          edge: "bottom",
          position: spacing * (index + 1),
        }
        const worldPos = getTerminalWorldPosition(
          { ...node, terminalPosition: position },
          component.x,
          component.y,
          COMPONENT_WIDTH,
          COMPONENT_HEIGHT
        )
        return {
          ...node,
          terminalPosition: position,
          x: worldPos.x,
          y: worldPos.y,
        }
      }
      return node
    })

    return { ...component, nodes: updatedNodes }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const componentData = e.dataTransfer.getData("component")
    if (!componentData) return

    const definition: ComponentDefinition = JSON.parse(componentData)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left - panOffset.x) / zoom
    const y = (e.clientY - rect.top - panOffset.y) / zoom

    let newComponent: Component = {
      id: `comp-${Date.now()}`,
      definitionId: definition.id,
      type: definition.type,
      label: definition.label,
      x,
      y,
      definition,
      nodes: [],
    }

    // Create nodes based on definition
    let nodeIndex = 0
    definition.nodes.forEach((nodeDef) => {
      newComponent.nodes.push({
        id: `${newComponent.id}-node-${nodeIndex}`,
        type: nodeDef.type,
        x: x,
        y: y + COMPONENT_HEIGHT / 2,
        componentId: newComponent.id,
        label: nodeDef.label,
      })
      nodeIndex++
    })

    // Initialize terminal positions
    newComponent = initializeTerminalPositions(newComponent)

    setComponents([...components, newComponent])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  // Handle starting a connection from a terminal
  const handleStartConnection = (node: Node, e: React.MouseEvent) => {
    setConnectingFrom(node)
  }

  // Handle ending a connection on a terminal
  const handleEndConnection = (node: Node) => {
    if (!connectingFrom) return
    
    if (connectingFrom.id !== node.id && connectingFrom.componentId !== node.componentId) {
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        fromNodeId: connectingFrom.id,
        toNodeId: node.id,
        cableSize: `2.5${defaultCableUnit}`,
      }
      setConnections([...connections, newConnection])
    }
    setConnectingFrom(null)
  }

  // Legacy node click handler for backwards compatibility
  const handleNodeClick = (node: Node) => {
    if (!connectingFrom) {
      setConnectingFrom(node)
    } else {
      handleEndConnection(node)
    }
  }

  // Handle updating nodes on a component (terminal positions, adding/removing)
  const handleUpdateNodes = (componentId: string, nodes: Node[]) => {
    setComponents(
      components.map((c) => {
        if (c.id === componentId) {
          // Update node world positions based on terminal positions
          const updatedNodes = nodes.map((node) => {
            if (node.terminalPosition) {
              const worldPos = getTerminalWorldPosition(
                node,
                c.x,
                c.y,
                COMPONENT_WIDTH,
                COMPONENT_HEIGHT
              )
              return { ...node, x: worldPos.x, y: worldPos.y }
            }
            return node
          })
          return { ...c, nodes: updatedNodes }
        }
        return c
      })
    )
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setMousePos({
        x: (e.clientX - rect.left - panOffset.x) / zoom,
        y: (e.clientY - rect.top - panOffset.y) / zoom,
      })

      if (draggingComponent) {
        const component = components.find((c) => c.id === draggingComponent)
        if (component) {
          const newX = (e.clientX - rect.left - panOffset.x) / zoom - dragOffset.x
          const newY = (e.clientY - rect.top - panOffset.y) / zoom - dragOffset.y
          const deltaX = newX - component.x
          const deltaY = newY - component.y

          setComponents(
            components.map((c) => {
              if (c.id === draggingComponent) {
                // Update component position and all terminal positions
                const updatedNodes = c.nodes.map((node) => {
                  if (node.terminalPosition) {
                    const worldPos = getTerminalWorldPosition(
                      node,
                      newX,
                      newY,
                      COMPONENT_WIDTH,
                      COMPONENT_HEIGHT
                    )
                    return { ...node, x: worldPos.x, y: worldPos.y }
                  }
                  return {
                    ...node,
                    x: node.x + deltaX,
                    y: node.y + deltaY,
                  }
                })
                return {
                  ...c,
                  x: newX,
                  y: newY,
                  nodes: updatedNodes,
                }
              }
              return c
            }),
          )
        }
      }

      if (isPanning) {
        const deltaX = e.clientX - panStart.x
        const deltaY = e.clientY - panStart.y
        setPanOffset({
          x: panOffset.x + deltaX,
          y: panOffset.y + deltaY,
        })
        setPanStart({ x: e.clientX, y: e.clientY })
      }
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
    setDraggingComponent(null)
    // Cancel connection if clicking on canvas
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || e.target === svgRef.current) {
      setConnectingFrom(null)
      setSelectedComponentId(null)
    }
  }

  const handleDeleteComponent = (id: string) => {
    setComponents(components.filter((c) => c.id !== id))
    setConnections(
      connections.filter((conn) => {
        const fromNode = getAllNodes().find((n) => n.id === conn.fromNodeId)
        const toNode = getAllNodes().find((n) => n.id === conn.toNodeId)
        return fromNode?.componentId !== id && toNode?.componentId !== id
      }),
    )
    if (selectedComponentId === id) {
      setSelectedComponentId(null)
    }
  }

  const handleDeleteConnection = (connectionId: string) => {
    setConnections(connections.filter((c) => c.id !== connectionId))
  }

  const handleComponentDragStart = (componentId: string, offsetX: number, offsetY: number) => {
    setDraggingComponent(componentId)
    setDragOffset({ x: offsetX, y: offsetY })
  }

  const handleComponentClick = (componentId: string) => {
    setSelectedComponentId(componentId)
  }

  const handleContextMenu = (e: React.MouseEvent, componentId: string) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      componentId,
    })
  }

  const handleDuplicateComponent = (componentId: string) => {
    const component = components.find((c) => c.id === componentId)
    if (!component) return

    const newId = `comp-${Date.now()}`
    let newComponent: Component = {
      ...component,
      id: newId,
      x: component.x + 60,
      y: component.y + 60,
      nodes: component.nodes.map((node, idx) => ({
        ...node,
        id: `${newId}-node-${idx}`,
        componentId: newId,
        x: node.x + 60,
        y: node.y + 60,
      })),
    }

    // Re-initialize terminal positions for duplicated component
    newComponent = initializeTerminalPositions(newComponent)

    setComponents([...components, newComponent])
  }

  const handleSwapComponent = (componentId: string, newType: string) => {
    const component = components.find((c) => c.id === componentId)
    if (!component) return

    const newDefinition = findDefinition(newType)
    if (!newDefinition) return

    const nodeIds = component.nodes.map((n) => n.id)
    setConnections(connections.filter((conn) => !nodeIds.includes(conn.fromNodeId) && !nodeIds.includes(conn.toNodeId)))

    const newNodes: Node[] = []
    let nodeIndex = 0

    newDefinition.nodes.forEach((nodeDef) => {
      newNodes.push({
        id: `${component.id}-node-${nodeIndex}`,
        type: nodeDef.type,
        x: component.x,
        y: component.y + COMPONENT_HEIGHT / 2,
        componentId: component.id,
        label: nodeDef.label,
      })
      nodeIndex++
    })

    let updatedComponent: Component = {
      ...component,
      type: newType,
      definitionId: newDefinition.id,
      label: newDefinition.label,
      definition: newDefinition,
      nodes: newNodes,
    }

    // Initialize terminal positions
    updatedComponent = initializeTerminalPositions(updatedComponent)

    setComponents(
      components.map((c) => c.id === componentId ? updatedComponent : c),
    )
  }

  const getAllNodes = (): Node[] => {
    return components.flatMap((c) => c.nodes)
  }

  const getNodeColor = (type: NodeType): string => {
    switch (type) {
      case "positive":
        return "#ef4444"
      case "negative":
        return "#3b82f6"
      case "earth":
        return "#22c55e"
      case "ac-live":
        return "#f97316"
      case "ac-neutral":
        return "#a855f7"
      case "signal":
        return "#06b6d4"
      default:
        return "#6b7280"
    }
  }

  // Get terminal position for connection drawing
  const getTerminalPosition = (node: Node, component: Component) => {
    if (node.terminalPosition) {
      return getTerminalWorldPosition(
        node,
        component.x,
        component.y,
        COMPONENT_WIDTH,
        COMPONENT_HEIGHT
      )
    }
    // Fallback to stored coordinates
    return { x: node.x, y: node.y }
  }

  const handleCableSizeChange = (connectionId: string, newSize: string) => {
    setConnections(connections.map((conn) => (conn.id === connectionId ? { ...conn, cableSize: newSize } : conn)))
    setEditingConnection(null)
  }

  // Generate a curved path between two points
  const generateConnectionPath = (fromPos: { x: number; y: number }, toPos: { x: number; y: number }, fromNode: Node, toNode: Node) => {
    const dx = toPos.x - fromPos.x
    const dy = toPos.y - fromPos.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    
    // Determine control point offsets based on terminal edges
    const getControlOffset = (node: Node, isFrom: boolean) => {
      const edge = node.terminalPosition?.edge || "bottom"
      const offset = Math.min(50, dist * 0.3)
      
      switch (edge) {
        case "top": return { x: 0, y: -offset }
        case "bottom": return { x: 0, y: offset }
        case "left": return { x: -offset, y: 0 }
        case "right": return { x: offset, y: 0 }
        default: return { x: 0, y: offset }
      }
    }

    const fromOffset = getControlOffset(fromNode, true)
    const toOffset = getControlOffset(toNode, false)

    const cp1x = fromPos.x + fromOffset.x
    const cp1y = fromPos.y + fromOffset.y
    const cp2x = toPos.x + toOffset.x
    const cp2y = toPos.y + toOffset.y

    return `M ${fromPos.x} ${fromPos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toPos.x} ${toPos.y}`
  }

  // Generate path for active connection line
  const generateActiveConnectionPath = (fromPos: { x: number; y: number }, toPos: { x: number; y: number }, fromNode: Node) => {
    const dx = toPos.x - fromPos.x
    const dy = toPos.y - fromPos.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    
    const getControlOffset = (node: Node) => {
      const edge = node.terminalPosition?.edge || "bottom"
      const offset = Math.min(50, dist * 0.3)
      
      switch (edge) {
        case "top": return { x: 0, y: -offset }
        case "bottom": return { x: 0, y: offset }
        case "left": return { x: -offset, y: 0 }
        case "right": return { x: offset, y: 0 }
        default: return { x: 0, y: offset }
      }
    }

    const fromOffset = getControlOffset(fromNode)
    const cp1x = fromPos.x + fromOffset.x
    const cp1y = fromPos.y + fromOffset.y

    return `M ${fromPos.x} ${fromPos.y} Q ${cp1x} ${cp1y}, ${toPos.x} ${toPos.y}`
  }

  return (
    <div
      ref={canvasRef}
      className="w-full h-full bg-canvas relative overflow-hidden"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      style={{ cursor: isPanning ? "grabbing" : draggingComponent ? "grabbing" : connectingFrom ? "crosshair" : "default" }}
    >
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
          color: "var(--foreground)",
        }}
      />

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          className="h-9 w-9 shadow-md"
          title="Zoom in (Ctrl + Scroll)"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          className="h-9 w-9 shadow-md"
          title="Zoom out (Ctrl + Scroll)"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleResetView}
          className="h-9 w-9 shadow-md"
          title="Reset view"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        {components.length > 0 && (
          <Button
            variant="secondary"
            size="icon"
            onClick={handleCenterComponents}
            className="h-9 w-9 shadow-md"
            title="Center on components"
          >
            <Move className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Zoom Indicator */}
      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur border border-border rounded-md px-3 py-1.5 text-xs font-medium z-10">
        {Math.round(zoom * 100)}%
      </div>

      {/* Connection mode indicator */}
      {connectingFrom && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg z-20 animate-pulse">
          Click another terminal to connect • ESC to cancel
        </div>
      )}

      {/* SVG Layer for Connections */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {/* Connection lines */}
        {connections.map((conn) => {
          const allNodes = getAllNodes()
          const fromNode = allNodes.find((n) => n.id === conn.fromNodeId)
          const toNode = allNodes.find((n) => n.id === conn.toNodeId)

          if (!fromNode || !toNode) return null

          const fromComponent = components.find((c) => c.id === fromNode.componentId)
          const toComponent = components.find((c) => c.id === toNode.componentId)

          if (!fromComponent || !toComponent) return null

          const fromPos = getTerminalPosition(fromNode, fromComponent)
          const toPos = getTerminalPosition(toNode, toComponent)

          const pathD = generateConnectionPath(fromPos, toPos, fromNode, toNode)
          const midX = (fromPos.x + toPos.x) / 2
          const midY = (fromPos.y + toPos.y) / 2

          return (
            <g key={conn.id}>
              {/* Connection path shadow */}
              <path
                d={pathD}
                stroke="rgba(0,0,0,0.2)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              {/* Connection path */}
              <path
                d={pathD}
                stroke={getNodeColor(fromNode.type)}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                className="pointer-events-auto cursor-pointer hover:stroke-[4] transition-all"
                onClick={() => handleDeleteConnection(conn.id)}
              />
              {/* Terminal dots */}
              <circle cx={fromPos.x} cy={fromPos.y} r="5" fill={getNodeColor(fromNode.type)} />
              <circle cx={toPos.x} cy={toPos.y} r="5" fill={getNodeColor(toNode.type)} />
              
              {/* Cable size label */}
              <foreignObject x={midX - 45} y={midY - 15} width="90" height="30" className="pointer-events-auto">
                <div className="flex items-center justify-center">
                  {editingConnection === conn.id ? (
                    <Input
                      type="text"
                      value={conn.cableSize || ""}
                      onChange={(e) => handleCableSizeChange(conn.id, e.target.value)}
                      onBlur={() => setEditingConnection(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setEditingConnection(null)
                      }}
                      className="h-6 text-xs px-2 w-20 bg-background/95 backdrop-blur"
                      autoFocus
                    />
                  ) : (
                    <div
                      className="bg-background/95 backdrop-blur border border-border rounded-md px-2 py-1 text-xs font-medium cursor-pointer hover:bg-accent transition-colors"
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        setEditingConnection(conn.id)
                      }}
                    >
                      {conn.cableSize || `2.5${defaultCableUnit}`}
                    </div>
                  )}
                </div>
              </foreignObject>
            </g>
          )
        })}

        {/* Active connection line while dragging */}
        {connectingFrom && (() => {
          const fromComponent = components.find((c) => c.id === connectingFrom.componentId)
          if (!fromComponent) return null

          const fromPos = getTerminalPosition(connectingFrom, fromComponent)
          const pathD = generateActiveConnectionPath(fromPos, mousePos, connectingFrom)

          return (
            <g>
              {/* Shadow */}
              <path
                d={pathD}
                stroke="rgba(0,0,0,0.2)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="8,4"
              />
              {/* Main line */}
              <path
                d={pathD}
                stroke={getNodeColor(connectingFrom.type)}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="8,4"
                opacity="0.8"
              />
              {/* Start point */}
              <circle cx={fromPos.x} cy={fromPos.y} r="6" fill={getNodeColor(connectingFrom.type)} />
              {/* End cursor */}
              <circle cx={mousePos.x} cy={mousePos.y} r="4" fill={getNodeColor(connectingFrom.type)} opacity="0.6" />
            </g>
          )
        })()}
      </svg>

      {/* Components Layer */}
      <div
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {components.map((component) => (
          <CircuitComponent
            key={component.id}
            component={component}
            onNodeClick={handleNodeClick}
            onStartConnection={handleStartConnection}
            onEndConnection={handleEndConnection}
            onDelete={handleDeleteComponent}
            onDragStart={handleComponentDragStart}
            onContextMenu={handleContextMenu}
            onUpdateNodes={handleUpdateNodes}
            connectingFrom={connectingFrom}
            isSelected={selectedComponentId === component.id}
            onClick={handleComponentClick}
            allDefinitions={allDefinitions}
          />
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ComponentContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDuplicate={() => {
            handleDuplicateComponent(contextMenu.componentId)
            setContextMenu(null)
          }}
          onDelete={() => {
            handleDeleteComponent(contextMenu.componentId)
            setContextMenu(null)
          }}
          onSwap={() => {
            setSwappingComponentId(contextMenu.componentId)
            setSwapDialogOpen(true)
            setContextMenu(null)
          }}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Swap Dialog */}
      {swappingComponentId && (
        <SwapComponentDialog
          open={swapDialogOpen}
          onClose={() => {
            setSwapDialogOpen(false)
            setSwappingComponentId(null)
          }}
          onSwap={(newType) => handleSwapComponent(swappingComponentId, newType)}
          currentType={components.find((c) => c.id === swappingComponentId)?.type || ""}
          definitions={allDefinitions}
        />
      )}

      {/* Empty State */}
      {components.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Move className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Start Your Circuit</h3>
            <p className="text-muted-foreground mb-4">
              Drag components from the sidebar to design your van's electrical system
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>• <strong>Click terminals</strong> to create connections</p>
              <p>• <strong>Right-click terminals</strong> to reposition them</p>
              <p>• <strong>Shift + Drag</strong> or <strong>Middle mouse</strong> to pan</p>
              <p>• <strong>Ctrl + Scroll</strong> to zoom</p>
              <p>• <strong>Right-click</strong> components for more options</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Re-export types for backwards compatibility
export type { Component, Connection, Node }
