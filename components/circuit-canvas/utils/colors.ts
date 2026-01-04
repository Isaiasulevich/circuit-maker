import type { NodeType } from "@/types/circuit"

/**
 * Color mapping for different node/terminal types
 * Used for connection lines and terminal indicators
 */
const NODE_COLORS: Record<NodeType, string> = {
  positive: "#ef4444",
  negative: "#1a1a1a",
  earth: "#22c55e",
  "ac-live": "#f97316",
  "ac-neutral": "#a855f7",
  signal: "#06b6d4",
}

/**
 * Get the color for a specific node type
 */
export function getNodeColor(type: NodeType): string {
  return NODE_COLORS[type] ?? "#6b7280"
}

