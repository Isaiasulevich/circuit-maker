"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { COMPONENT_CATEGORIES, type ComponentCategory, type NodeType, NODE_TYPES } from "@/types/circuit"
import { createCustomDefinition } from "@/lib/component-definitions"
import type { ComponentDefinition } from "@/types/circuit"
import { Plus, Trash2, ImagePlus, X } from "lucide-react"

interface CreateComponentDialogProps {
  open: boolean
  onClose: () => void
  onSave: (definition: ComponentDefinition) => void
}

interface NodeConfig {
  id: string
  type: NodeType
  label: string
}

export function CreateComponentDialog({ open, onClose, onSave }: CreateComponentDialogProps) {
  const [label, setLabel] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ComponentCategory>("custom")
  const [imageUrl, setImageUrl] = useState<string>("")
  const [imagePreview, setImagePreview] = useState<string>("")
  const [nodes, setNodes] = useState<NodeConfig[]>([
    { id: "1", type: "positive", label: "+" },
    { id: "2", type: "negative", label: "-" },
  ])
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Validate file size (max 500KB for localStorage)
    if (file.size > 500 * 1024) {
      alert("Image must be smaller than 500KB")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setImageUrl(dataUrl)
      setImagePreview(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleAddNode = () => {
    setNodes([
      ...nodes,
      { id: Date.now().toString(), type: "positive", label: "" },
    ])
  }

  const handleRemoveNode = (id: string) => {
    if (nodes.length <= 1) return
    setNodes(nodes.filter((n) => n.id !== id))
  }

  const handleNodeChange = (id: string, field: "type" | "label", value: string) => {
    setNodes(
      nodes.map((n) =>
        n.id === id ? { ...n, [field]: field === "type" ? (value as NodeType) : value } : n
      )
    )
  }

  const handleSave = () => {
    if (!label.trim()) {
      alert("Please enter a component name")
      return
    }

    const definition = createCustomDefinition(
      label.trim(),
      category,
      nodes.map((n) => ({ type: n.type, label: n.label || undefined })),
      {
        description: description.trim() || undefined,
        imageUrl: imageUrl || undefined,
      }
    )

    onSave(definition)
    handleReset()
    onClose()
  }

  const handleReset = () => {
    setLabel("")
    setDescription("")
    setCategory("custom")
    setImageUrl("")
    setImagePreview("")
    setNodes([
      { id: "1", type: "positive", label: "+" },
      { id: "2", type: "negative", label: "-" },
    ])
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Custom Component</DialogTitle>
          <DialogDescription>
            Design your own electrical component for your van build
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="flex flex-col gap-6 py-4">
            {/* Component Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Component Name *</Label>
              <Input
                id="name"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Victron SmartShunt"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the component"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ComponentCategory)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {COMPONENT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div className="flex flex-col gap-2">
              <Label>Component Image (optional)</Label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative w-20 h-20 rounded-lg border border-border overflow-hidden bg-muted">
                    <img
                      src={imagePreview}
                      alt="Component preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      onClick={() => {
                        setImageUrl("")
                        setImagePreview("")
                      }}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <ImagePlus className="w-6 h-6" />
                    <span className="text-xs">Upload</span>
                  </button>
                )}
                <div className="flex-1 text-xs text-muted-foreground">
                  Upload an image of your component (max 500KB). Supports JPG, PNG, GIF, WebP.
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Nodes Configuration */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label>Connection Nodes</Label>
                <Button variant="outline" size="sm" onClick={handleAddNode}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Node
                </Button>
              </div>
              
              <div className="flex flex-col gap-2">
                {nodes.map((node, index) => (
                  <div key={node.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                    <select
                      value={node.type}
                      onChange={(e) => handleNodeChange(node.id, "type", e.target.value)}
                      className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      {NODE_TYPES.map((nt) => (
                        <option key={nt.type} value={nt.type}>
                          {nt.label}
                        </option>
                      ))}
                    </select>
                    <Input
                      value={node.label}
                      onChange={(e) => handleNodeChange(node.id, "label", e.target.value)}
                      placeholder="Label"
                      className="w-24 h-8 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveNode(node.id)}
                      disabled={nodes.length <= 1}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Node type legend */}
              <div className="flex flex-wrap gap-3 pt-2">
                {NODE_TYPES.slice(0, 4).map((nt) => (
                  <div key={nt.type} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: nt.color }}
                    />
                    <span className="text-xs text-muted-foreground">{nt.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!label.trim()}>
            Create Component
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


