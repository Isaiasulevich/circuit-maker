"use client"
import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Trash2, Repeat } from "lucide-react"

interface ComponentContextMenuProps {
  x: number
  y: number
  onDuplicate: () => void
  onDelete: () => void
  onSwap: () => void
  onClose: () => void
}

export function ComponentContextMenu({ x, y, onDuplicate, onDelete, onSwap, onClose }: ComponentContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="fixed bg-popover border border-border rounded-lg shadow-lg py-1 z-50 min-w-[160px]"
      style={{ left: x, top: y }}
    >
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 px-3 py-2 h-auto font-normal"
        onClick={() => {
          onDuplicate()
          onClose()
        }}
      >
        <Copy className="w-4 h-4" />
        Duplicate
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 px-3 py-2 h-auto font-normal"
        onClick={() => {
          onSwap()
          onClose()
        }}
      >
        <Repeat className="w-4 h-4" />
        Swap Component
      </Button>
      <div className="h-px bg-border my-1" />
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 px-3 py-2 h-auto font-normal text-destructive hover:text-destructive"
        onClick={() => {
          onDelete()
          onClose()
        }}
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </Button>
    </div>
  )
}
