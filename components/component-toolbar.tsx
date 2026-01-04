"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { COMPONENT_CATEGORIES, type ComponentCategory } from "@/types/circuit"
import type { ComponentDefinition } from "@/types/circuit"
import { DEFAULT_COMPONENT_DEFINITIONS, getIconByName, getDefinitionsByCategory, searchDefinitions } from "@/lib/component-definitions"
import { Search, Plus, ChevronDown, ChevronRight, CirclePlus, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ComponentToolbarProps {
  customDefinitions: ComponentDefinition[]
  onCreateComponent: () => void
}

export function ComponentToolbar({ customDefinitions, onCreateComponent }: ComponentToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<ComponentCategory>>(
    new Set(["power-source", "power-storage", "power-management"])
  )

  // Combine default and custom definitions
  const allDefinitions = useMemo(() => {
    return [...DEFAULT_COMPONENT_DEFINITIONS, ...(customDefinitions || [])]
  }, [customDefinitions])

  // Filter definitions based on search
  const filteredDefinitions = useMemo(() => {
    if (!searchQuery.trim()) return allDefinitions
    return searchDefinitions(allDefinitions, searchQuery)
  }, [allDefinitions, searchQuery])

  // Group by category
  const groupedDefinitions = useMemo(() => {
    const groups: Record<ComponentCategory, ComponentDefinition[]> = {} as Record<ComponentCategory, ComponentDefinition[]>
    
    COMPONENT_CATEGORIES.forEach((cat) => {
      groups[cat.id] = []
    })
    
    filteredDefinitions.forEach((def) => {
      if (groups[def.category]) {
        groups[def.category].push(def)
      }
    })
    
    return groups
  }, [filteredDefinitions])

  const toggleCategory = (category: ComponentCategory) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const handleDragStart = (e: React.DragEvent, componentDef: ComponentDefinition) => {
    // Serialize without the icon function
    const serializableDef = {
      ...componentDef,
      icon: undefined,
    }
    e.dataTransfer.setData("component", JSON.stringify(serializableDef))
    e.dataTransfer.effectAllowed = "copy"
  }

  const isSearching = searchQuery.trim().length > 0

  return (
    <aside className="w-full h-full border-r border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Components</h2>
        <p className="text-xs text-muted-foreground mt-1">Drag to canvas to add</p>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search components..."
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Create Custom Button */}
      <div className="p-3 border-b border-border">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 bg-primary/5 border-primary/20 hover:bg-primary/10"
          onClick={onCreateComponent}
        >
          <Plus className="w-4 h-4" />
          Create Custom Component
        </Button>
      </div>

      {/* Component List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {COMPONENT_CATEGORIES.map((category) => {
            const categoryDefs = groupedDefinitions[category.id] || []
            const isExpanded = expandedCategories.has(category.id) || isSearching
            const hasComponents = categoryDefs.length > 0

            if (!hasComponents && !isSearching) return null

            return (
              <div key={category.id} className="mb-1">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition-colors",
                    "hover:bg-accent/50",
                    !hasComponents && "opacity-50"
                  )}
                  disabled={!hasComponents}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm font-medium flex-1">{category.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {categoryDefs.length}
                  </span>
                </button>

                {/* Category Components */}
                {isExpanded && hasComponents && (
                  <div className="mt-1 ml-4 flex flex-col gap-1">
                    {categoryDefs.map((comp) => (
                      <ComponentItem
                        key={comp.id}
                        definition={comp}
                        onDragStart={handleDragStart}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* No Results */}
          {isSearching && filteredDefinitions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No components found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Legend */}
      <div className="p-4 border-t border-border">
        <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
          Node Types
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-positive" />
            <span className="text-xs text-muted-foreground">Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-negative" />
            <span className="text-xs text-muted-foreground">Negative</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-earth" />
            <span className="text-xs text-muted-foreground">Earth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#f97316" }} />
            <span className="text-xs text-muted-foreground">AC Live</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

/**
 * Individual component item in the toolbar
 */
interface ComponentItemProps {
  definition: ComponentDefinition
  onDragStart: (e: React.DragEvent, def: ComponentDefinition) => void
}

function ComponentItem({ definition, onDragStart }: ComponentItemProps) {
  const Icon = definition.icon || getIconByName(definition.iconName) || CirclePlus

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, definition)}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-grab active:cursor-grabbing",
        "bg-background/50 border border-transparent",
        "hover:bg-accent hover:border-border",
        "transition-all duration-150",
        definition.isCustom && "border-dashed border-primary/30"
      )}
      title={definition.description}
    >
      {/* Icon or Image */}
      {definition.imageUrl ? (
        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center overflow-hidden">
          <img
            src={definition.imageUrl}
            alt={definition.label}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div className="w-8 h-8 rounded bg-muted/50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-foreground/70" />
        </div>
      )}

      {/* Label and info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{definition.label}</p>
        {definition.isCustom && (
          <p className="text-xs text-muted-foreground">Custom</p>
        )}
      </div>

      {/* Node count indicator */}
      <div className="flex items-center gap-0.5">
        {definition.nodes.slice(0, 4).map((node, idx) => (
          <div
            key={idx}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor:
                node.type === "positive" ? "#ef4444" :
                node.type === "negative" ? "#1a1a1a" :
                node.type === "earth" ? "#22c55e" :
                node.type === "ac-live" ? "#f97316" :
                node.type === "ac-neutral" ? "#a855f7" :
                "#06b6d4"
            }}
          />
        ))}
        {definition.nodes.length > 4 && (
          <span className="text-xs text-muted-foreground ml-1">+{definition.nodes.length - 4}</span>
        )}
      </div>
    </div>
  )
}

// Re-export for backwards compatibility
export type { ComponentDefinition }
export { DEFAULT_COMPONENT_DEFINITIONS as COMPONENT_DEFINITIONS }
