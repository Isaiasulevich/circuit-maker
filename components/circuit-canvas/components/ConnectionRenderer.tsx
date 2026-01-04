"use client"

import type { Component, Connection, Node } from "@/types/circuit"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import { getNodeColor, generateConnectionPath, generateActiveConnectionPath, getTerminalPosition } from "../utils"
import type { Position } from "../types"

interface ConnectionRendererProps {
  connections: Connection[]
  components: Component[]
  connectingFrom: Node | null
  mousePos: Position
  hoveredConnection: string | null
  editingConnection: string | null
  defaultCableUnit: string
  onHoverConnection: (id: string | null) => void
  onEditConnection: (id: string | null) => void
  onDeleteConnection: (id: string) => void
  onCableSizeChange: (connectionId: string, newSize: string) => void
  getAllNodes: () => Node[]
}

/**
 * SVG layer for rendering all connection lines
 */
export function ConnectionRenderer({
  connections,
  components,
  connectingFrom,
  mousePos,
  hoveredConnection,
  editingConnection,
  defaultCableUnit,
  onHoverConnection,
  onEditConnection,
  onDeleteConnection,
  onCableSizeChange,
  getAllNodes,
}: ConnectionRendererProps) {
  return (
    <>
      {/* Existing connections */}
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

        const isHovered = hoveredConnection === conn.id

        return (
          <g
            key={conn.id}
            onMouseEnter={() => onHoverConnection(conn.id)}
            onMouseLeave={() => onHoverConnection(null)}
          >
            {/* Invisible wider path for easier hovering */}
            <path
              d={pathD}
              stroke="transparent"
              strokeWidth="12"
              fill="none"
              className="pointer-events-auto cursor-pointer"
            />
            {/* Connection path */}
            <path
              d={pathD}
              stroke={getNodeColor(fromNode.type)}
              strokeWidth={isHovered ? 3.5 : 2.5}
              fill="none"
              strokeLinejoin="round"
              className="pointer-events-none transition-all duration-150"
            />
            {/* Terminal dots */}
            <circle cx={fromPos.x} cy={fromPos.y} r="5" fill={getNodeColor(fromNode.type)} />
            <circle cx={toPos.x} cy={toPos.y} r="5" fill={getNodeColor(toNode.type)} />

            {/* Hover controls - show on hover */}
            {isHovered && (
              <foreignObject
                x={midX - 60}
                y={midY - 16}
                width="120"
                height="32"
                className="pointer-events-auto"
              >
                <div className="flex items-center justify-center gap-1">
                  {/* Cable size label */}
                  {editingConnection === conn.id ? (
                    <Input
                      type="text"
                      value={conn.cableSize || ""}
                      onChange={(e) => onCableSizeChange(conn.id, e.target.value)}
                      onBlur={() => onEditConnection(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onEditConnection(null)
                      }}
                      className="h-6 text-xs px-2 w-16 bg-background/95 backdrop-blur"
                      autoFocus
                    />
                  ) : (
                    <div
                      className="bg-background/95 backdrop-blur border border-border rounded-md px-2 py-1 text-xs font-medium cursor-pointer hover:bg-accent transition-colors"
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        onEditConnection(conn.id)
                      }}
                      title="Double-click to edit cable size"
                    >
                      {conn.cableSize || `2.5${defaultCableUnit}`}
                    </div>
                  )}
                  {/* Delete button */}
                  <button
                    className="h-6 w-6 flex items-center justify-center bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-md transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteConnection(conn.id)
                    }}
                    title="Delete connection"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </foreignObject>
            )}

            {/* Always show cable size when not hovered (smaller, less intrusive) */}
            {!isHovered && (
              <foreignObject
                x={midX - 35}
                y={midY - 10}
                width="70"
                height="20"
                className="pointer-events-none"
              >
                <div className="flex items-center justify-center">
                  <div className="bg-background/80 backdrop-blur border border-border/50 rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {conn.cableSize || `2.5${defaultCableUnit}`}
                  </div>
                </div>
              </foreignObject>
            )}
          </g>
        )
      })}

      {/* Active connection line while dragging */}
      {connectingFrom &&
        (() => {
          const fromComponent = components.find((c) => c.id === connectingFrom.componentId)
          if (!fromComponent) return null

          const fromPos = getTerminalPosition(connectingFrom, fromComponent)
          const pathD = generateActiveConnectionPath(fromPos, mousePos, connectingFrom)

          return (
            <g>
              {/* Main line - dashed to indicate in-progress */}
              <path
                d={pathD}
                stroke={getNodeColor(connectingFrom.type)}
                strokeWidth="2.5"
                fill="none"
                strokeLinejoin="round"
                strokeDasharray="6,4"
                opacity="0.85"
              />
              {/* Start point */}
              <circle cx={fromPos.x} cy={fromPos.y} r="6" fill={getNodeColor(connectingFrom.type)} />
              {/* End cursor */}
              <circle
                cx={mousePos.x}
                cy={mousePos.y}
                r="4"
                fill={getNodeColor(connectingFrom.type)}
                opacity="0.6"
              />
            </g>
          )
        })()}
    </>
  )
}

