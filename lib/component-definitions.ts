import {
  Sun,
  Battery,
  Zap,
  CircleDot,
  Lightbulb,
  ToggleLeft,
  Droplet,
  Cable,
  Plug,
  Fan,
  Thermometer,
  Gauge,
  Shield,
  AlertTriangle,
  Radio,
  Usb,
  Monitor,
  Power,
  BatteryCharging,
  Waves,
  Snowflake,
  Flame,
  Car,
  SunDim,
  Activity,
  Box,
  CirclePlus,
} from "lucide-react"
import type { ComponentDefinition, ComponentCategory } from "@/types/circuit"
import type { LucideIcon } from "lucide-react"

/**
 * Icon mapping for serialization/deserialization
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  Sun,
  Battery,
  Zap,
  CircleDot,
  Lightbulb,
  ToggleLeft,
  Droplet,
  Cable,
  Plug,
  Fan,
  Thermometer,
  Gauge,
  Shield,
  AlertTriangle,
  Radio,
  Usb,
  Monitor,
  Power,
  BatteryCharging,
  Waves,
  Snowflake,
  Flame,
  Car,
  SunDim,
  Activity,
  Box,
  CirclePlus,
}

/**
 * Get icon component by name
 */
export function getIconByName(name: string | undefined): LucideIcon | undefined {
  if (!name) return undefined
  return ICON_MAP[name]
}

/**
 * Default van electrical component definitions
 * Organized by category for easy filtering
 */
export const DEFAULT_COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  // ============ POWER SOURCES ============
  {
    id: "solar-panel",
    type: "solar-panel",
    label: "Solar Panel",
    category: "power-source",
    icon: Sun,
    iconName: "Sun",
    description: "Photovoltaic solar panel for charging batteries",
    specs: { "Typical Power": "100W - 400W", "Voltage": "18-24V" },
    nodes: [{ type: "positive", label: "+" }, { type: "negative", label: "-" }],
    isDefault: true,
  },
  {
    id: "alternator-charger",
    type: "alternator-charger",
    label: "Alternator Charger",
    category: "power-source",
    icon: Car,
    iconName: "Car",
    description: "DC-DC charger connected to vehicle alternator",
    specs: { "Input": "12V/24V Vehicle", "Output": "12V/24V Battery" },
    nodes: [
      { type: "positive", label: "Vehicle +" },
      { type: "negative", label: "Vehicle -" },
      { type: "positive", label: "Battery +" },
      { type: "negative", label: "Battery -" },
    ],
    isDefault: true,
  },
  {
    id: "shore-power",
    type: "shore-power",
    label: "Shore Power Inlet",
    category: "power-source",
    icon: Plug,
    iconName: "Plug",
    description: "External AC power connection (campsite hookup)",
    specs: { "Voltage": "110V/230V AC", "Max Current": "16A/30A" },
    nodes: [
      { type: "ac-live", label: "Live" },
      { type: "ac-neutral", label: "Neutral" },
      { type: "earth", label: "Earth" },
    ],
    isDefault: true,
  },

  // ============ POWER STORAGE ============
  {
    id: "leisure-battery",
    type: "leisure-battery",
    label: "Leisure Battery",
    category: "power-storage",
    icon: Battery,
    iconName: "Battery",
    description: "Deep cycle battery for house power",
    specs: { "Types": "AGM, Gel, Lithium", "Capacity": "100Ah - 300Ah" },
    nodes: [{ type: "positive", label: "+" }, { type: "negative", label: "-" }],
    isDefault: true,
  },
  {
    id: "lithium-battery",
    type: "lithium-battery",
    label: "Lithium Battery (LiFePO4)",
    category: "power-storage",
    icon: BatteryCharging,
    iconName: "BatteryCharging",
    description: "Lithium Iron Phosphate battery with BMS",
    specs: { "Chemistry": "LiFePO4", "Voltage": "12.8V/25.6V", "Cycles": "3000+" },
    nodes: [{ type: "positive", label: "+" }, { type: "negative", label: "-" }],
    isDefault: true,
  },
  {
    id: "starter-battery",
    type: "starter-battery",
    label: "Starter Battery",
    category: "power-storage",
    icon: Battery,
    iconName: "Battery",
    description: "Vehicle starting battery",
    specs: { "Type": "Lead-acid", "Purpose": "Engine starting" },
    nodes: [{ type: "positive", label: "+" }, { type: "negative", label: "-" }],
    isDefault: true,
  },

  // ============ POWER MANAGEMENT ============
  {
    id: "mppt-charger",
    type: "mppt-charger",
    label: "MPPT Solar Charger",
    category: "power-management",
    icon: Zap,
    iconName: "Zap",
    description: "Maximum Power Point Tracking solar charge controller",
    specs: { "Efficiency": "98%+", "Input": "Solar panels", "Output": "Battery" },
    nodes: [
      { type: "positive", label: "Solar +" },
      { type: "negative", label: "Solar -" },
      { type: "positive", label: "Battery +" },
      { type: "negative", label: "Battery -" },
    ],
    isDefault: true,
  },
  {
    id: "pwm-charger",
    type: "pwm-charger",
    label: "PWM Solar Charger",
    category: "power-management",
    icon: SunDim,
    iconName: "SunDim",
    description: "Pulse Width Modulation solar charge controller",
    specs: { "Efficiency": "75-80%", "Cost": "Lower than MPPT" },
    nodes: [
      { type: "positive", label: "Solar +" },
      { type: "negative", label: "Solar -" },
      { type: "positive", label: "Battery +" },
      { type: "negative", label: "Battery -" },
    ],
    isDefault: true,
  },
  {
    id: "inverter",
    type: "inverter",
    label: "Inverter (DC to AC)",
    category: "power-management",
    icon: CircleDot,
    iconName: "CircleDot",
    description: "Converts DC battery power to AC mains power",
    specs: { "Input": "12V/24V DC", "Output": "110V/230V AC" },
    nodes: [
      { type: "positive", label: "DC +" },
      { type: "negative", label: "DC -" },
      { type: "ac-live", label: "AC Live" },
      { type: "ac-neutral", label: "AC Neutral" },
      { type: "earth", label: "Earth" },
    ],
    isDefault: true,
  },
  {
    id: "inverter-charger",
    type: "inverter-charger",
    label: "Inverter/Charger Combo",
    category: "power-management",
    icon: Power,
    iconName: "Power",
    description: "Combined inverter and battery charger",
    specs: { "Functions": "Invert + Charge + Transfer" },
    nodes: [
      { type: "positive", label: "Battery +" },
      { type: "negative", label: "Battery -" },
      { type: "ac-live", label: "AC In Live" },
      { type: "ac-neutral", label: "AC In Neutral" },
      { type: "ac-live", label: "AC Out Live" },
      { type: "ac-neutral", label: "AC Out Neutral" },
      { type: "earth", label: "Earth" },
    ],
    isDefault: true,
  },

  // ============ DISTRIBUTION ============
  {
    id: "fuse",
    type: "fuse",
    label: "Fuse",
    category: "distribution",
    icon: Cable,
    iconName: "Cable",
    description: "Overcurrent protection device",
    specs: { "Types": "Blade, ANL, MIDI" },
    nodes: [{ type: "positive", label: "In" }, { type: "positive", label: "Out" }],
    isDefault: true,
  },
  {
    id: "fuse-box",
    type: "fuse-box",
    label: "Fuse Box / Distribution Panel",
    category: "distribution",
    icon: Box,
    iconName: "Box",
    description: "Multiple circuit fuse distribution",
    specs: { "Circuits": "6-12 ways typical" },
    nodes: [
      { type: "positive", label: "Main +" },
      { type: "negative", label: "Main -" },
      { type: "positive", label: "Circuit 1" },
      { type: "positive", label: "Circuit 2" },
      { type: "positive", label: "Circuit 3" },
      { type: "positive", label: "Circuit 4" },
    ],
    isDefault: true,
  },
  {
    id: "bus-bar-positive",
    type: "bus-bar-positive",
    label: "Bus Bar (Positive)",
    category: "distribution",
    icon: Cable,
    iconName: "Cable",
    description: "Common connection point for positive wires",
    specs: { "Material": "Copper/Brass" },
    nodes: [
      { type: "positive", label: "1" },
      { type: "positive", label: "2" },
      { type: "positive", label: "3" },
      { type: "positive", label: "4" },
    ],
    isDefault: true,
  },
  {
    id: "bus-bar-negative",
    type: "bus-bar-negative",
    label: "Bus Bar (Negative)",
    category: "distribution",
    icon: Cable,
    iconName: "Cable",
    description: "Common connection point for negative wires",
    specs: { "Material": "Copper/Brass" },
    nodes: [
      { type: "negative", label: "1" },
      { type: "negative", label: "2" },
      { type: "negative", label: "3" },
      { type: "negative", label: "4" },
    ],
    isDefault: true,
  },
  {
    id: "switch",
    type: "switch",
    label: "Switch",
    category: "distribution",
    icon: ToggleLeft,
    iconName: "ToggleLeft",
    description: "Manual on/off switch",
    nodes: [{ type: "positive", label: "In" }, { type: "positive", label: "Out" }],
    isDefault: true,
  },
  {
    id: "battery-isolator",
    type: "battery-isolator",
    label: "Battery Isolator",
    category: "distribution",
    icon: Shield,
    iconName: "Shield",
    description: "Disconnect switch for battery",
    specs: { "Rating": "100A - 500A" },
    nodes: [{ type: "positive", label: "Battery" }, { type: "positive", label: "Load" }],
    isDefault: true,
  },
  {
    id: "circuit-breaker",
    type: "circuit-breaker",
    label: "Circuit Breaker",
    category: "distribution",
    icon: Shield,
    iconName: "Shield",
    description: "Resettable overcurrent protection",
    nodes: [{ type: "positive", label: "In" }, { type: "positive", label: "Out" }],
    isDefault: true,
  },

  // ============ LIGHTING ============
  {
    id: "led-light",
    type: "led-light",
    label: "LED Light",
    category: "lighting",
    icon: Lightbulb,
    iconName: "Lightbulb",
    description: "12V LED ceiling/wall light",
    specs: { "Voltage": "12V DC", "Power": "3W - 15W" },
    nodes: [{ type: "positive", label: "+" }, { type: "negative", label: "-" }],
    isDefault: true,
  },
  {
    id: "led-strip",
    type: "led-strip",
    label: "LED Strip",
    category: "lighting",
    icon: Lightbulb,
    iconName: "Lightbulb",
    description: "Flexible LED strip lighting",
    specs: { "Voltage": "12V DC", "Length": "Variable" },
    nodes: [{ type: "positive", label: "+" }, { type: "negative", label: "-" }],
    isDefault: true,
  },
  {
    id: "dimmer",
    type: "dimmer",
    label: "LED Dimmer",
    category: "lighting",
    icon: SunDim,
    iconName: "SunDim",
    description: "PWM dimmer for LED lights",
    nodes: [
      { type: "positive", label: "In +" },
      { type: "negative", label: "In -" },
      { type: "positive", label: "Out +" },
      { type: "negative", label: "Out -" },
    ],
    isDefault: true,
  },

  // ============ CLIMATE CONTROL ============
  {
    id: "vent-fan",
    type: "vent-fan",
    label: "Roof Vent Fan",
    category: "climate",
    icon: Fan,
    iconName: "Fan",
    description: "12V roof ventilation fan (MaxxFan, Fan-tastic)",
    specs: { "Voltage": "12V DC", "Power": "2A - 5A" },
    nodes: [{ type: "positive", label: "+" }, { type: "negative", label: "-" }],
    isDefault: true,
  },
  {
    id: "diesel-heater",
    type: "diesel-heater",
    label: "Diesel Heater",
    category: "climate",
    icon: Flame,
    iconName: "Flame",
    description: "Diesel-powered cabin heater",
    specs: { "Power": "2kW - 8kW", "12V Draw": "1A - 5A" },
    nodes: [{ type: "positive", label: "+" }, { type: "negative", label: "-" }],
    isDefault: true,
  },
  {
    id: "ac-unit",
    type: "ac-unit",
    label: "Air Conditioner",
    category: "climate",
    icon: Snowflake,
    iconName: "Snowflake",
    description: "12V or AC air conditioning unit",
    specs: { "Power": "High - requires shore/inverter" },
    nodes: [
      { type: "ac-live", label: "Live" },
      { type: "ac-neutral", label: "Neutral" },
      { type: "earth", label: "Earth" },
    ],
    isDefault: true,
  },

  // ============ WATER SYSTEM ============
  {
    id: "water-pump",
    type: "water-pump",
    label: "Water Pump",
    category: "water",
    icon: Droplet,
    iconName: "Droplet",
    description: "12V freshwater pressure pump",
    specs: { "Voltage": "12V DC", "Flow": "3-5 GPM" },
    nodes: [{ type: "positive", label: "+" }, { type: "negative", label: "-" }],
    isDefault: true,
  },
  {
    id: "water-heater",
    type: "water-heater",
    label: "Water Heater",
    category: "water",
    icon: Thermometer,
    iconName: "Thermometer",
    description: "Tankless or tank water heater",
    specs: { "Types": "12V, Gas, or AC" },
    nodes: [{ type: "positive", label: "+" }, { type: "negative", label: "-" }],
    isDefault: true,
  },
  {
    id: "tank-sensor",
    type: "tank-sensor",
    label: "Tank Level Sensor",
    category: "water",
    icon: Waves,
    iconName: "Waves",
    description: "Water tank level monitor",
    nodes: [{ type: "signal", label: "Signal" }, { type: "negative", label: "Ground" }],
    isDefault: true,
  },

  // ============ APPLIANCES ============
  {
    id: "fridge-12v",
    type: "fridge-12v",
    label: "12V Fridge/Freezer",
    category: "appliances",
    icon: Box,
    iconName: "Box",
    description: "Compressor fridge running on 12V",
    specs: { "Voltage": "12V DC", "Draw": "3A - 8A" },
    nodes: [{ type: "positive", label: "+" }, { type: "negative", label: "-" }],
    isDefault: true,
  },
  {
    id: "usb-outlet",
    type: "usb-outlet",
    label: "USB Outlet",
    category: "appliances",
    icon: Usb,
    iconName: "Usb",
    description: "12V to USB charging outlet",
    specs: { "Output": "5V USB-A, USB-C" },
    nodes: [{ type: "positive", label: "+" }, { type: "negative", label: "-" }],
    isDefault: true,
  },
  {
    id: "12v-outlet",
    type: "12v-outlet",
    label: "12V Cigarette Outlet",
    category: "appliances",
    icon: Plug,
    iconName: "Plug",
    description: "Standard 12V accessory outlet",
    nodes: [{ type: "positive", label: "+" }, { type: "negative", label: "-" }],
    isDefault: true,
  },
  {
    id: "ac-outlet",
    type: "ac-outlet",
    label: "AC Power Outlet",
    category: "appliances",
    icon: Plug,
    iconName: "Plug",
    description: "Mains AC outlet (from inverter)",
    nodes: [
      { type: "ac-live", label: "Live" },
      { type: "ac-neutral", label: "Neutral" },
      { type: "earth", label: "Earth" },
    ],
    isDefault: true,
  },

  // ============ SAFETY ============
  {
    id: "smoke-detector",
    type: "smoke-detector",
    label: "Smoke Detector",
    category: "safety",
    icon: AlertTriangle,
    iconName: "AlertTriangle",
    description: "12V smoke/fire alarm",
    nodes: [{ type: "positive", label: "+" }, { type: "negative", label: "-" }],
    isDefault: true,
  },
  {
    id: "co-detector",
    type: "co-detector",
    label: "CO Detector",
    category: "safety",
    icon: AlertTriangle,
    iconName: "AlertTriangle",
    description: "Carbon monoxide alarm",
    nodes: [{ type: "positive", label: "+" }, { type: "negative", label: "-" }],
    isDefault: true,
  },
  {
    id: "lpg-detector",
    type: "lpg-detector",
    label: "LPG/Propane Detector",
    category: "safety",
    icon: AlertTriangle,
    iconName: "AlertTriangle",
    description: "Gas leak detector",
    nodes: [{ type: "positive", label: "+" }, { type: "negative", label: "-" }],
    isDefault: true,
  },

  // ============ MONITORING ============
  {
    id: "battery-monitor",
    type: "battery-monitor",
    label: "Battery Monitor",
    category: "monitoring",
    icon: Gauge,
    iconName: "Gauge",
    description: "Battery state of charge monitor (Victron, etc)",
    specs: { "Measures": "Voltage, Current, SOC" },
    nodes: [
      { type: "positive", label: "Battery +" },
      { type: "negative", label: "Shunt In" },
      { type: "negative", label: "Shunt Out" },
    ],
    isDefault: true,
  },
  {
    id: "shunt",
    type: "shunt",
    label: "Current Shunt",
    category: "monitoring",
    icon: Activity,
    iconName: "Activity",
    description: "Current measurement shunt resistor",
    nodes: [{ type: "negative", label: "Battery -" }, { type: "negative", label: "Load -" }],
    isDefault: true,
  },
  {
    id: "display-panel",
    type: "display-panel",
    label: "Display Panel",
    category: "monitoring",
    icon: Monitor,
    iconName: "Monitor",
    description: "System monitoring display",
    nodes: [{ type: "positive", label: "+" }, { type: "negative", label: "-" }, { type: "signal", label: "Data" }],
    isDefault: true,
  },
]

/**
 * Get component definitions by category
 */
export function getDefinitionsByCategory(
  definitions: ComponentDefinition[],
  category: ComponentCategory
): ComponentDefinition[] {
  return definitions.filter((d) => d.category === category)
}

/**
 * Search component definitions
 */
export function searchDefinitions(
  definitions: ComponentDefinition[],
  query: string
): ComponentDefinition[] {
  const lowerQuery = query.toLowerCase()
  return definitions.filter(
    (d) =>
      d.label.toLowerCase().includes(lowerQuery) ||
      d.type.toLowerCase().includes(lowerQuery) ||
      d.description?.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Create a custom component definition
 */
export function createCustomDefinition(
  label: string,
  category: ComponentCategory,
  nodes: { type: "positive" | "negative" | "earth" | "ac-live" | "ac-neutral" | "signal"; label?: string }[],
  options?: {
    description?: string
    imageUrl?: string
    specs?: Record<string, string>
  }
): ComponentDefinition {
  const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  return {
    id,
    type: id,
    label,
    category,
    iconName: "CirclePlus",
    icon: CirclePlus,
    nodes,
    isCustom: true,
    isDefault: false,
    ...options,
  }
}


