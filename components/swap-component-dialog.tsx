"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { COMPONENT_CATEGORIES, type ComponentCategory } from "@/types/circuit"
import type { ComponentDefinition } from "@/types/circuit"
import { getIconByName } from "@/lib/component-definitions"
import { Search, CirclePlus } from "lucide-react"

interface SwapComponentDialogProps {
  open: boolean
  onClose: () => void
  onSwap: (newType: string) => void
  currentType: string
  definitions: ComponentDefinition[]
}

export function SwapComponentDialog({ open, onClose, onSwap, currentType, definitions }: SwapComponentDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | "all">("all")

  const filteredDefinitions = useMemo(() => {
    let filtered = definitions

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((d) => d.category === selectedCategory)
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (d) =>
          d.label.toLowerCase().includes(query) ||
          d.type.toLowerCase().includes(query) ||
          d.description?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [definitions, selectedCategory, searchQuery])

  const handleSwap = (type: string) => {
    onSwap(type)
    setSearchQuery("")
    setSelectedCategory("all")
  }

  const handleClose = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Swap Component</DialogTitle>
          <DialogDescription>Select a new component type to replace the current one</DialogDescription>
        </DialogHeader>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components..."
              className="pl-9"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as ComponentCategory | "all")}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All Categories</option>
            {COMPONENT_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Component Grid */}
        <ScrollArea className="flex-1 mt-4">
          <div className="grid grid-cols-2 gap-2 pr-4">
            {filteredDefinitions.map((comp) => {
              const Icon = comp.icon || getIconByName(comp.iconName) || CirclePlus
              const isCurrent = comp.type === currentType || comp.id === currentType

              return (
                <Button
                  key={comp.id}
                  variant={isCurrent ? "secondary" : "outline"}
                  className="justify-start gap-3 h-auto py-3 px-4"
                  onClick={() => {
                    if (!isCurrent) {
                      handleSwap(comp.type)
                    }
                  }}
                  disabled={isCurrent}
                >
                  {comp.imageUrl ? (
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img src={comp.imageUrl} alt={comp.label} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <Icon className="w-5 h-5 flex-shrink-0" />
                  )}
                  <div className="flex flex-col items-start text-left min-w-0">
                    <span className="text-sm font-medium truncate w-full">{comp.label}</span>
                    {comp.isCustom && <span className="text-xs text-muted-foreground">Custom</span>}
                  </div>
                </Button>
              )
            })}

            {filteredDefinitions.length === 0 && (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                <p>No components found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
