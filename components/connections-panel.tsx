"use client"

import type { Component, Connection, Node, NodeType } from "@/types/circuit"
import { COMMON_CABLE_SIZES, NODE_TYPES } from "@/types/circuit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Trash2, Cable, ChevronDown, Plus, GripVertical, Circle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

interface ConnectionsPanelProps {
  selectedComponentId: string
  components: Component[]
  connections: Connection[]
  setConnections: (connections: Connection[]) => void
  setComponents?: (components: Component[]) => void
  defaultCableUnit: string
  onClose: () => void
}

export function ConnectionsPanel({
  selectedComponentId,
  components,
  connections,
  setConnections,
  setComponents,
  defaultCableUnit,
  onClose,
}: ConnectionsPanelProps) {
  const [showQuickSelect, setShowQuickSelect] = useState<string | null>(null)
  const [showAddTerminal, setShowAddTerminal] = useState(false)
  const [newTerminalType, setNewTerminalType] = useState<NodeType>("positive")
  const [newTerminalLabel, setNewTerminalLabel] = useState("")
  
  const selectedComponent = components.find((c) => c.id === selectedComponentId)
  if (!selectedComponent) return null

  const getAllNodes = (): Node[] => {
    return components.flatMap((c) => c.nodes)
  }

  // Get all connections for this component
  const componentConnections = connections.filter((conn) => {
    const allNodes = getAllNodes()
    const fromNode = allNodes.find((n) => n.id === conn.fromNodeId)
    const toNode = allNodes.find((n) => n.id === conn.toNodeId)
    return fromNode?.componentId === selectedComponentId || toNode?.componentId === selectedComponentId
  })

  const getNodeInfo = (nodeId: string) => {
    const allNodes = getAllNodes()
    const node = allNodes.find((n) => n.id === nodeId)
    if (!node) return { label: "Unknown", type: "positive" as NodeType }

    const component = components.find((c) => c.id === node.componentId)
    return {
      label: `${component?.label || "Unknown"} (${node.label || node.type})`,
      type: node.type,
    }
  }

  const handleDeleteConnection = (connectionId: string) => {
    setConnections(connections.filter((c) => c.id !== connectionId))
  }

  const handleCableSizeChange = (connectionId: string, newSize: string) => {
    setConnections(connections.map((conn) => (conn.id === connectionId ? { ...conn, cableSize: newSize } : conn)))
  }

  const handleAddTerminal = () => {
    if (!setComponents) return
    
    const newNode: Node = {
      id: `${selectedComponent.id}-node-${Date.now()}`,
      type: newTerminalType,
      componentId: selectedComponent.id,
      label: newTerminalLabel || (newTerminalType === "positive" ? "+" : newTerminalType === "negative" ? "-" : ""),
      terminalPosition: { edge: "bottom", position: 50 },
      x: selectedComponent.x,
      y: selectedComponent.y + 50,
    }
    
    // Redistribute terminals on the bottom edge
    const bottomTerminals = selectedComponent.nodes.filter(n => 
      !n.terminalPosition || n.terminalPosition.edge === "bottom"
    )
    const allBottomTerminals = [...bottomTerminals, newNode]
    const spacing = 100 / (allBottomTerminals.length + 1)
    
    const updatedNodes = selectedComponent.nodes.map((node, i) => {
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
    
    newNode.terminalPosition = { edge: "bottom", position: spacing * allBottomTerminals.length }
    
    setComponents(
      components.map((c) =>
        c.id === selectedComponentId
          ? { ...c, nodes: [...updatedNodes, newNode] }
          : c
      )
    )
    
    setShowAddTerminal(false)
    setNewTerminalLabel("")
  }

  const handleDeleteTerminal = (nodeId: string) => {
    if (!setComponents) return
    if (selectedComponent.nodes.length <= 1) return
    
    // Remove connections to this terminal
    const nodeConnections = connections.filter(
      (conn) => conn.fromNodeId === nodeId || conn.toNodeId === nodeId
    )
    if (nodeConnections.length > 0) {
      setConnections(connections.filter((c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId))
    }
    
    setComponents(
      components.map((c) =>
        c.id === selectedComponentId
          ? { ...c, nodes: c.nodes.filter((n) => n.id !== nodeId) }
          : c
      )
    )
  }

  const getNodeTypeColor = (type: NodeType): string => {
    switch (type) {
      case "positive":
        return "text-red-500"
      case "negative":
        return "text-neutral-900"
      case "earth":
        return "text-green-500"
      case "ac-live":
        return "text-orange-500"
      case "ac-neutral":
        return "text-purple-500"
      case "signal":
        return "text-cyan-500"
      default:
        return "text-foreground"
    }
  }

  const getNodeDotColor = (type: NodeType): string => {
    switch (type) {
      case "positive":
        return "bg-red-500"
      case "negative":
        return "bg-neutral-900"
      case "earth":
        return "bg-green-500"
      case "ac-live":
        return "bg-orange-500"
      case "ac-neutral":
        return "bg-purple-500"
      case "signal":
        return "bg-cyan-500"
      default:
        return "bg-gray-500"
    }
  }

  const quickSizes = COMMON_CABLE_SIZES[defaultCableUnit as keyof typeof COMMON_CABLE_SIZES] || COMMON_CABLE_SIZES["mm²"]

  return (
    <div className="w-full h-full border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Cable className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Component Details</h2>
            <p className="text-xs text-muted-foreground">{selectedComponent.label}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {/* Terminals Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Terminals ({selectedComponent.nodes.length})
            </Label>
            {setComponents && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setShowAddTerminal(!showAddTerminal)}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            )}
          </div>

          {/* Add Terminal Form */}
          {showAddTerminal && (
            <div className="mb-3 p-3 rounded-lg bg-muted/50 flex flex-col gap-2">
              <div className="flex gap-2">
                <select
                  value={newTerminalType}
                  onChange={(e) => setNewTerminalType(e.target.value as NodeType)}
                  className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  {NODE_TYPES.map((nt) => (
                    <option key={nt.type} value={nt.type}>
                      {nt.label}
                    </option>
                  ))}
                </select>
                <Input
                  value={newTerminalLabel}
                  onChange={(e) => setNewTerminalLabel(e.target.value)}
                  placeholder="Label"
                  className="w-20 h-8 text-xs"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleAddTerminal}>
                  Add Terminal
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowAddTerminal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Terminal List */}
          <div className="flex flex-col gap-2">
            {selectedComponent.nodes.map((node) => {
              const nodeConnections = componentConnections.filter(
                (conn) => conn.fromNodeId === node.id || conn.toNodeId === node.id
              )
              
              return (
                <div
                  key={node.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  <div className={`w-3 h-3 rounded-full ${getNodeDotColor(node.type)} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">
                      {node.label || node.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {node.terminalPosition?.edge || "bottom"} edge • {nodeConnections.length} connection{nodeConnections.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {setComponents && selectedComponent.nodes.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      onClick={() => handleDeleteTerminal(node.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Terminal tip */}
          <p className="text-[10px] text-muted-foreground mt-3">
            Tip: Right-click and drag terminals on the component to reposition them around the edge.
          </p>
        </div>

        {/* Connections Section */}
        <div className="p-4">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">
            Connections
          </Label>

          {componentConnections.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-muted/50 flex items-center justify-center">
                <Cable className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">No connections yet</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Click terminals on the canvas to connect
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {componentConnections.map((conn) => {
                const fromInfo = getNodeInfo(conn.fromNodeId)
                const toInfo = getNodeInfo(conn.toNodeId)

                return (
                  <div key={conn.id} className="border border-border rounded-xl p-3 bg-background/50">
                    {/* Connection Path */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getNodeDotColor(fromInfo.type)}`} />
                          <span className="text-xs truncate">{fromInfo.label}</span>
                        </div>
                        <div className="ml-1 border-l-2 border-dashed border-border h-2" />
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getNodeDotColor(toInfo.type)}`} />
                          <span className="text-xs truncate">{toInfo.label}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteConnection(conn.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Cable Size */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[10px] text-muted-foreground">Cable Size</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type="text"
                            value={conn.cableSize || ""}
                            onChange={(e) => handleCableSizeChange(conn.id, e.target.value)}
                            placeholder={`e.g. 2.5${defaultCableUnit}`}
                            className="h-8 text-xs pr-7"
                          />
                          <button
                            onClick={() => setShowQuickSelect(showQuickSelect === conn.id ? null : conn.id)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Quick Select */}
                      {showQuickSelect === conn.id && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {quickSizes.slice(0, 8).map((size) => (
                            <button
                              key={size}
                              onClick={() => {
                                handleCableSizeChange(conn.id, `${size}${defaultCableUnit}`)
                                setShowQuickSelect(null)
                              }}
                              className="px-2 py-0.5 text-[10px] rounded bg-muted hover:bg-accent transition-colors"
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Summary */}
      <div className="p-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{selectedComponent.nodes.length} terminal{selectedComponent.nodes.length !== 1 ? "s" : ""}</span>
          <span>{componentConnections.length} connection{componentConnections.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  )
}
