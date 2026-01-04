import type { CircuitProject, ComponentDefinition, Component, Connection, ProjectSettings } from "@/types/circuit"
import { DEFAULT_PROJECT_SETTINGS } from "@/types/circuit"
import { DEFAULT_COMPONENT_DEFINITIONS } from "@/lib/component-definitions"

const STORAGE_KEYS = {
  CURRENT_PROJECT: "circuit-mapper-current-project",
  CUSTOM_DEFINITIONS: "circuit-mapper-custom-definitions",
  SETTINGS: "circuit-mapper-settings",
  PROJECTS_LIST: "circuit-mapper-projects-list",
}

/**
 * Generate a unique project ID
 */
function generateProjectId(): string {
  return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create a new empty project
 */
export function createNewProject(name = "Untitled Circuit"): CircuitProject {
  return {
    id: generateProjectId(),
    name,
    description: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    components: [],
    connections: [],
    customDefinitions: [],
    settings: { ...DEFAULT_PROJECT_SETTINGS },
    version: "1.0.0",
  }
}

/**
 * Save current project to localStorage
 */
export function saveCurrentProject(project: CircuitProject): void {
  try {
    const updatedProject = {
      ...project,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, JSON.stringify(updatedProject))
    
    // Also update projects list
    const projectsList = getProjectsList()
    const existingIndex = projectsList.findIndex((p) => p.id === project.id)
    const projectMeta = {
      id: updatedProject.id,
      name: updatedProject.name,
      updatedAt: updatedProject.updatedAt,
      componentCount: updatedProject.components.length,
    }
    
    if (existingIndex >= 0) {
      projectsList[existingIndex] = projectMeta
    } else {
      projectsList.push(projectMeta)
    }
    
    localStorage.setItem(STORAGE_KEYS.PROJECTS_LIST, JSON.stringify(projectsList))
  } catch (error) {
    console.error("Failed to save project:", error)
  }
}

/**
 * Load current project from localStorage
 */
export function loadCurrentProject(): CircuitProject | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT)
    if (!stored) return null
    return JSON.parse(stored) as CircuitProject
  } catch (error) {
    console.error("Failed to load project:", error)
    return null
  }
}

/**
 * Get list of saved projects
 */
export function getProjectsList(): { id: string; name: string; updatedAt: string; componentCount: number }[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS_LIST)
    if (!stored) return []
    return JSON.parse(stored)
  } catch (error) {
    console.error("Failed to load projects list:", error)
    return []
  }
}

/**
 * Save custom component definitions
 */
export function saveCustomDefinitions(definitions: ComponentDefinition[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_DEFINITIONS, JSON.stringify(definitions))
  } catch (error) {
    console.error("Failed to save custom definitions:", error)
  }
}

/**
 * Load custom component definitions
 */
export function loadCustomDefinitions(): ComponentDefinition[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_DEFINITIONS)
    if (!stored) return []
    return JSON.parse(stored) as ComponentDefinition[]
  } catch (error) {
    console.error("Failed to load custom definitions:", error)
    return []
  }
}

/**
 * Get all component definitions (default + custom)
 */
export function getAllDefinitions(): ComponentDefinition[] {
  const custom = loadCustomDefinitions()
  return [...DEFAULT_COMPONENT_DEFINITIONS, ...custom]
}

/**
 * Save settings
 */
export function saveSettings(settings: ProjectSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  } catch (error) {
    console.error("Failed to save settings:", error)
  }
}

/**
 * Load settings
 */
export function loadSettings(): ProjectSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    if (!stored) return DEFAULT_PROJECT_SETTINGS
    return { ...DEFAULT_PROJECT_SETTINGS, ...JSON.parse(stored) }
  } catch (error) {
    console.error("Failed to load settings:", error)
    return DEFAULT_PROJECT_SETTINGS
  }
}

/**
 * Export project to JSON file
 */
export function exportProjectToFile(project: CircuitProject): void {
  const projectData = {
    ...project,
    exportedAt: new Date().toISOString(),
    customDefinitions: loadCustomDefinitions(),
  }
  
  const dataStr = JSON.stringify(projectData, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Import project from JSON file
 */
export function importProjectFromFile(file: File): Promise<CircuitProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)
        
        // Validate basic structure
        if (!data.components || !data.connections) {
          throw new Error("Invalid project file format")
        }
        
        // Create project from imported data
        const project: CircuitProject = {
          id: generateProjectId(),
          name: data.name || "Imported Circuit",
          description: data.description || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          components: data.components as Component[],
          connections: data.connections as Connection[],
          customDefinitions: data.customDefinitions || [],
          settings: { ...DEFAULT_PROJECT_SETTINGS, ...data.settings },
          version: data.version || "1.0.0",
        }
        
        // Merge custom definitions if present
        if (data.customDefinitions && Array.isArray(data.customDefinitions)) {
          const existingCustom = loadCustomDefinitions()
          const newCustom = data.customDefinitions.filter(
            (d: ComponentDefinition) => !existingCustom.some((e) => e.id === d.id)
          )
          if (newCustom.length > 0) {
            saveCustomDefinitions([...existingCustom, ...newCustom])
          }
        }
        
        resolve(project)
      } catch (error) {
        reject(new Error("Failed to parse project file"))
      }
    }
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }
    
    reader.readAsText(file)
  })
}

/**
 * Clear all stored data
 */
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })
}


