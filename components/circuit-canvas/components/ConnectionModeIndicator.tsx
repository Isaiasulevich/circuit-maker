"use client"

/**
 * Indicator shown when user is in connection mode (dragging a wire)
 */
export function ConnectionModeIndicator() {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg z-20 animate-pulse">
      Click another terminal to connect • ESC to cancel
    </div>
  )
}

