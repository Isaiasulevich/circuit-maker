"use client"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import type { Node, NodeType } from "@/types/circuit"
import { NODE_TYPES } from "@/types/circuit"
import { Trash2, MoveHorizontal, Palette } from "lucide-react"

interface TerminalContextMenuProps {
  x: number
  y: number
  node: Node
  canDelete: boolean
  onChangeType: (nodeId: string, newType: NodeType) => void
  onDelete: (nodeId: string) => void
  onStartReposition: () => void
  onClose: () => void
}

/**
 * Context menu for terminal right-click actions
 * Allows changing type, repositioning, and deleting terminals
 */
export function TerminalContextMenu({
  x,
  y,
  node,
  canDelete,
  onChangeType,
  onDelete,
  onStartReposition,
  onClose,
}: TerminalContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as globalThis.Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  // Position adjustment to keep menu in viewport
  const adjustedX = Math.min(x, (typeof window !== "undefined" ? window.innerWidth : 1000) - 200)
  const adjustedY = Math.min(y, (typeof window !== "undefined" ? window.innerHeight : 800) - 280)

  // Use portal to render at document body level (avoid CSS transform issues)
  const menuContent = (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-popover border border-border rounded-lg shadow-xl overflow-hidden min-w-[180px]"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {/* Header with current type */}
      <div className="px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getNodeTypeColor(node.type) }}
          />
          <span className="text-xs font-medium text-foreground">
            {node.label || getNodeTypeLabel(node.type)}
          </span>
        </div>
      </div>

      {/* Change Type Section */}
      <div className="p-1">
        <div className="px-2 py-1.5 flex items-center gap-2 text-xs text-muted-foreground">
          <Palette className="w-3 h-3" />
          <span>Change Type</span>
        </div>
        <div className="grid grid-cols-2 gap-1 px-1 pb-1">
          {NODE_TYPES.map((typeInfo) => (
            <button
              key={typeInfo.type}
              onClick={() => {
                onChangeType(node.id, typeInfo.type)
                onClose()
              }}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                node.type === typeInfo.type
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-accent text-foreground"
              }`}
            >
              <div 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: typeInfo.color }}
              />
              <span className="truncate">{typeInfo.label.replace(" (+)", "").replace(" (-)", "")}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Actions */}
      <div className="p-1">
        <button
          onClick={() => {
            onStartReposition()
            onClose()
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors text-foreground"
        >
          <MoveHorizontal className="w-4 h-4 text-muted-foreground" />
          <span>Reposition</span>
        </button>
        
        {canDelete && (
          <button
            onClick={() => {
              onDelete(node.id)
              onClose()
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-destructive/10 transition-colors text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Terminal</span>
          </button>
        )}
      </div>
    </div>
  )

  // Render using portal to escape CSS transform context
  if (typeof document !== "undefined") {
    return createPortal(menuContent, document.body)
  }
  
  return menuContent
}

// Helper functions
function getNodeTypeColor(type: NodeType): string {
  const typeInfo = NODE_TYPES.find((t) => t.type === type)
  return typeInfo?.color || "#6b7280"
}

function getNodeTypeLabel(type: NodeType): string {
  const typeInfo = NODE_TYPES.find((t) => t.type === type)
  return typeInfo?.label || type
}

