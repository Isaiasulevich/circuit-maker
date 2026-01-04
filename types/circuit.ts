import type { LucideIcon } from "lucide-react"

/**
 * Component Categories for organizing electrical components
 * Designed for van/camper electrical systems
 */
export type ComponentCategory =
  | "power-source"
  | "power-storage"
  | "power-management"
  | "distribution"
  | "lighting"
  | "climate"
  | "water"
  | "appliances"
  | "safety"
  | "monitoring"
  | "custom"

export interface CategoryInfo {
  id: ComponentCategory
  label: string
  description: string
  color: string
}

export const COMPONENT_CATEGORIES: CategoryInfo[] = [
  { id: "power-source", label: "Power Sources", description: "Solar, alternator, shore power", color: "#f59e0b" },
  { id: "power-storage", label: "Power Storage", description: "Batteries and capacitors", color: "#10b981" },
  { id: "power-management", label: "Power Management", description: "Chargers, inverters, converters", color: "#3b82f6" },
  { id: "distribution", label: "Distribution", description: "Fuse boxes, bus bars, switches", color: "#8b5cf6" },
  { id: "lighting", label: "Lighting", description: "LED lights, dimmers, strips", color: "#eab308" },
  { id: "climate", label: "Climate Control", description: "Fans, heaters, AC units", color: "#06b6d4" },
  { id: "water", label: "Water System", description: "Pumps, heaters, tanks", color: "#0ea5e9" },
  { id: "appliances", label: "Appliances", description: "Fridges, outlets, USB ports", color: "#ec4899" },
  { id: "safety", label: "Safety", description: "Smoke detectors, CO monitors", color: "#ef4444" },
  { id: "monitoring", label: "Monitoring", description: "Battery monitors, displays", color: "#84cc16" },
  { id: "custom", label: "Custom", description: "Your custom components", color: "#6b7280" },
]

/**
 * Node types for electrical connections
 */
export type NodeType = "positive" | "negative" | "earth" | "ac-live" | "ac-neutral" | "signal"

export interface NodeTypeInfo {
  type: NodeType
  label: string
  color: string
  description: string
}

export const NODE_TYPES: NodeTypeInfo[] = [
  { type: "positive", label: "Positive (+)", color: "#ef4444", description: "DC positive terminal" },
  { type: "negative", label: "Negative (-)", color: "#1a1a1a", description: "DC negative terminal" },
  { type: "earth", label: "Ground/Earth", color: "#22c55e", description: "Earth/chassis ground" },
  { type: "ac-live", label: "AC Live", color: "#f97316", description: "AC live/hot wire" },
  { type: "ac-neutral", label: "AC Neutral", color: "#a855f7", description: "AC neutral wire" },
  { type: "signal", label: "Signal", color: "#06b6d4", description: "Data/signal connection" },
]

/**
 * Terminal position on component edge
 * angle: 0 = right, 90 = bottom, 180 = left, 270 = top
 */
export interface TerminalPosition {
  edge: "top" | "right" | "bottom" | "left"
  /** Position along the edge as percentage (0-100) */
  position: number
}

/**
 * Node/Terminal on a component for creating connections
 * Terminals can be positioned around the component edge for flexible wiring
 */
export interface Node {
  id: string
  type: NodeType
  x: number
  y: number
  componentId: string
  label?: string
  /** Terminal position on component edge */
  terminalPosition?: TerminalPosition
}

/**
 * Connection between two nodes
 */
export interface Connection {
  id: string
  fromNodeId: string
  toNodeId: string
  cableSize?: string
  cableColor?: string
  label?: string
}

/**
 * Component definition - the template for creating components
 */
export interface ComponentDefinition {
  id: string
  type: string
  label: string
  category: ComponentCategory
  icon?: LucideIcon
  iconName?: string
  imageUrl?: string
  description?: string
  specs?: Record<string, string>
  nodes: {
    type: NodeType
    label?: string
  }[]
  isCustom?: boolean
  isDefault?: boolean
}

/**
 * Placed component on the canvas
 */
export interface Component {
  id: string
  definitionId: string
  type: string
  label: string
  x: number
  y: number
  definition: ComponentDefinition
  nodes: Node[]
  notes?: string
  customData?: Record<string, unknown>
}

/**
 * Circuit project containing all data
 */
export interface CircuitProject {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  components: Component[]
  connections: Connection[]
  customDefinitions: ComponentDefinition[]
  settings: ProjectSettings
  version: string
}

/**
 * Project settings
 */
export interface ProjectSettings {
  defaultCableUnit: string
  gridSize: number
  snapToGrid: boolean
  showGrid: boolean
  autoSave: boolean
}

/**
 * Default project settings
 */
export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  defaultCableUnit: "mm²",
  gridSize: 20,
  snapToGrid: false,
  showGrid: true,
  autoSave: true,
}

/**
 * Cable size units
 */
export const CABLE_UNITS = [
  { value: "mm²", label: "mm² (Square Millimeters)" },
  { value: "AWG", label: "AWG (American Wire Gauge)" },
  { value: "kcmil", label: "kcmil (Thousand Circular Mils)" },
  { value: "SWG", label: "SWG (Standard Wire Gauge)" },
]

/**
 * Common cable sizes for quick selection
 */
export const COMMON_CABLE_SIZES = {
  "mm²": ["0.5", "0.75", "1.0", "1.5", "2.5", "4", "6", "10", "16", "25", "35", "50", "70", "95"],
  "AWG": ["22", "20", "18", "16", "14", "12", "10", "8", "6", "4", "2", "1", "1/0", "2/0", "4/0"],
}

