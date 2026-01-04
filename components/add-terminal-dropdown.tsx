"use client"

import { useState, useRef, useEffect } from "react"
import type { NodeType } from "@/types/circuit"
import { NODE_TYPES } from "@/types/circuit"
import { Plus, ChevronDown } from "lucide-react"

interface AddTerminalDropdownProps {
  onAddTerminal: (type: NodeType) => void
}

/**
 * Dropdown button for adding terminals with type selection
 * Shows "Add" with plus icon and chevron, opens dropdown to select terminal type
 */
export function AddTerminalDropdown({ onAddTerminal }: AddTerminalDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as globalThis.Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  const handleSelect = (type: NodeType) => {
    onAddTerminal(type)
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-xl overflow-hidden min-w-[160px] z-50">
          <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
            Terminal Type
          </div>
          <div className="p-1">
            {NODE_TYPES.map((typeInfo) => (
              <button
                key={typeInfo.type}
                onClick={() => handleSelect(typeInfo.type)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-accent transition-colors text-left"
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: typeInfo.color }}
                />
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{typeInfo.label}</span>
                  <span className="text-[10px] text-muted-foreground">{typeInfo.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

