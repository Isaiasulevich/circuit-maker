import type { Component, Connection, Node, ComponentDefinition } from "@/types/circuit"

/**
 * Props for the main CircuitCanvas component
 */
export interface CircuitCanvasProps {
  components: Component[]
  setComponents: (components: Component[]) => void
  connections: Connection[]
  setConnections: (connections: Connection[]) => void
  selectedComponentId: string | null
  setSelectedComponentId: (id: string | null) => void
  defaultCableUnit: string
  customDefinitions: ComponentDefinition[]
}

/**
 * Context menu state for component right-click menu
 */
export interface ContextMenuState {
  x: number
  y: number
  componentId: string
}

/**
 * Position coordinates
 */
export interface Position {
  x: number
  y: number
}

/**
 * Canvas viewport state
 */
export interface ViewportState {
  panOffset: Position
  zoom: number
}

/**
 * Canvas zoom constraints
 */
export const ZOOM_CONSTRAINTS = {
  MIN: 0.25,
  MAX: 2,
  STEP: 0.25,
} as const

