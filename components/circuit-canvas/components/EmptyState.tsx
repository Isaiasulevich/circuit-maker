"use client"

import { Move } from "lucide-react"

/**
 * Empty state shown when no components are on the canvas
 */
export function EmptyState() {
  return (
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
          <p>
            • <strong>Click terminals</strong> to create connections
          </p>
          <p>
            • <strong>Right-click terminals</strong> to reposition them
          </p>
          <p>
            • <strong>Shift + Drag</strong> or <strong>Middle mouse</strong> to pan
          </p>
          <p>
            • <strong>Ctrl + Scroll</strong> to zoom
          </p>
          <p>
            • <strong>Right-click</strong> components for more options
          </p>
        </div>
      </div>
    </div>
  )
}

