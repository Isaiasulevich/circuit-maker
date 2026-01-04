"use client"

import type React from "react"
import { useRef, useState, useCallback } from "react"
import type { Component, Node, ComponentDefinition, TerminalPosition } from "@/types/circuit"
import { DEFAULT_COMPONENT_DEFINITIONS } from "@/lib/component-definitions"

import { CircuitComponent } from "@/components/circuit-component"
import { ComponentContextMenu } from "@/components/component-context-menu"
import { SwapComponentDialog } from "@/components/swap-component-dialog"

import type { CircuitCanvasProps, ContextMenuState, Position } from "./types"
import { useCanvasViewport, useComponentDrag, useConnections, useComponentActions } from "./hooks"
import {
  ZoomControls,
  GridPattern,
  EmptyState,
  ConnectionModeIndicator,
  ConnectionRenderer,
} from "./components"
import {
  initializeTerminalPositions,
  updateNodeWorldPositions,
  COMPONENT_WIDTH,
  COMPONENT_HEIGHT,
} from "./utils"

/**
 * Main circuit canvas component
 * Handles rendering of components, connections, and user interactions
 */
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
  const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 })
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [swapDialogOpen, setSwapDialogOpen] = useState(false)
  const [swappingComponentId, setSwappingComponentId] = useState<string | null>(null)

  // Combine all definitions for lookup
  const allDefinitions = [...DEFAULT_COMPONENT_DEFINITIONS, ...(customDefinitions || [])]

  const findDefinition = useCallback(
    (type: string): ComponentDefinition | undefined => {
      return allDefinitions.find((d) => d.type === type || d.id === type)
    },
    [allDefinitions]
  )

  // Canvas viewport (zoom and pan)
  const {
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
  } = useCanvasViewport({ canvasRef, components })

  // Component dragging
  const { draggingComponent, handleDragStart, handleDragMove, handleDragEnd } = useComponentDrag({
    canvasRef,
    components,
    setComponents,
    panOffset,
    zoom,
  })

  // Connections
  const {
    connectingFrom,
    editingConnection,
    hoveredConnection,
    handleStartConnection,
    handleEndConnection,
    handleNodeClick,
    handleDeleteConnection,
    handleCableSizeChange,
    setConnectingFrom,
    setEditingConnection,
    setHoveredConnection,
    getAllNodes,
  } = useConnections({
    components,
    setComponents,
    connections,
    setConnections,
    defaultCableUnit,
  })

  // Component actions (delete, duplicate, swap)
  const { handleDeleteComponent, handleDuplicateComponent, handleSwapComponent, handleUpdateNodes } =
    useComponentActions({
      components,
      setComponents,
      connections,
      setConnections,
      selectedComponentId,
      setSelectedComponentId,
      findDefinition,
    })

  // Handle dropping a new component onto the canvas
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

  // Handle updating nodes on a component (terminal positions, adding/removing)
  const handleUpdateNodesWithPositions = (componentId: string, nodes: Node[]) => {
    const component = components.find((c) => c.id === componentId)
    if (!component) return

    const updatedNodes = updateNodeWorldPositions(nodes, component.x, component.y)
    handleUpdateNodes(componentId, updatedNodes)
  }

  // Track mouse position for connection preview
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setMousePos({
        x: (e.clientX - rect.left - panOffset.x) / zoom,
        y: (e.clientY - rect.top - panOffset.y) / zoom,
      })

      handleDragMove(e)
      handlePanMove(e)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    handlePanStart(e)
  }

  const handleMouseUp = () => {
    handlePanEnd()
    handleDragEnd()
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || e.target === svgRef.current) {
      setConnectingFrom(null)
      setSelectedComponentId(null)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, componentId: string) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      componentId,
    })
  }

  const handleComponentClick = (componentId: string) => {
    setSelectedComponentId(componentId)
  }

  // Cursor style based on current interaction mode
  const getCursorStyle = () => {
    if (isPanning) return "grabbing"
    if (draggingComponent) return "grabbing"
    if (connectingFrom) return "crosshair"
    return "default"
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
      style={{ cursor: getCursorStyle() }}
    >
      {/* Grid Pattern */}
      <GridPattern zoom={zoom} panOffsetX={panOffset.x} panOffsetY={panOffset.y} />

      {/* Zoom Controls */}
      <ZoomControls
        zoom={zoom}
        hasComponents={components.length > 0}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        onCenterComponents={handleCenterComponents}
      />

      {/* Connection mode indicator */}
      {connectingFrom && <ConnectionModeIndicator />}

      {/* SVG Layer for Connections */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        <ConnectionRenderer
          connections={connections}
          components={components}
          connectingFrom={connectingFrom}
          mousePos={mousePos}
          hoveredConnection={hoveredConnection}
          editingConnection={editingConnection}
          defaultCableUnit={defaultCableUnit}
          onHoverConnection={setHoveredConnection}
          onEditConnection={setEditingConnection}
          onDeleteConnection={handleDeleteConnection}
          onCableSizeChange={handleCableSizeChange}
          getAllNodes={getAllNodes}
        />
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
            onDragStart={handleDragStart}
            onContextMenu={handleContextMenu}
            onUpdateNodes={handleUpdateNodesWithPositions}
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
      {components.length === 0 && <EmptyState />}
    </div>
  )
}

