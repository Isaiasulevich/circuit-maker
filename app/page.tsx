"use client"

import { useState, useEffect, useCallback } from "react"
import { CircuitCanvas } from "@/components/circuit-canvas"
import { ComponentToolbar } from "@/components/component-toolbar"
import { ConnectionsPanel } from "@/components/connections-panel"
import { SettingsPanel } from "@/components/settings-panel"
import { CreateComponentDialog } from "@/components/create-component-dialog"
import { ResizablePanel } from "@/components/ui/resizable-panel"
import type { Component, Connection, ProjectSettings, ComponentDefinition, CircuitProject } from "@/types/circuit"
import { DEFAULT_PROJECT_SETTINGS } from "@/types/circuit"
import {
  saveCurrentProject,
  loadCurrentProject,
  createNewProject,
  exportProjectToFile,
  importProjectFromFile,
  loadCustomDefinitions,
  saveCustomDefinitions,
} from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Trash2, Settings, Plus, FileDown, Zap, Undo2, Redo2 } from "lucide-react"
import { useHistory } from "@/lib/use-history"

export default function CircuitMapperPage() {
  // Project state
  const [projectId, setProjectId] = useState<string>("")
  const [projectName, setProjectName] = useState("My Van Electrical System")
  const [settings, setSettings] = useState<ProjectSettings>(DEFAULT_PROJECT_SETTINGS)
  const [customDefinitions, setCustomDefinitions] = useState<ComponentDefinition[]>([])
  
  // Undo/redo history for components and connections
  const {
    components,
    connections,
    setComponents,
    setConnections,
    setBoth,
    undo,
    redo,
    canUndo,
    canRedo,
    replaceState,
    clearHistory,
  } = useHistory()
  
  // UI state
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showCreateComponent, setShowCreateComponent] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load project on mount
  useEffect(() => {
    const savedProject = loadCurrentProject()
    const savedCustomDefs = loadCustomDefinitions()
    
    if (savedProject) {
      setProjectId(savedProject.id)
      setProjectName(savedProject.name)
      replaceState(savedProject.components, savedProject.connections)
      setSettings(savedProject.settings)
    } else {
      const newProject = createNewProject()
      setProjectId(newProject.id)
    }
    
    setCustomDefinitions(savedCustomDefs)
    setIsLoaded(true)
  }, [])

  // Auto-save
  useEffect(() => {
    if (!isLoaded || !settings.autoSave) return

    const project: CircuitProject = {
      id: projectId,
      name: projectName,
      description: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      components,
      connections,
      customDefinitions,
      settings,
      version: "1.0.0",
    }

    const timeoutId = setTimeout(() => {
      saveCurrentProject(project)
      setLastSaved(new Date())
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [components, connections, settings, projectName, projectId, customDefinitions, isLoaded])

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the entire circuit? This cannot be undone.")) {
      setBoth([], [])
      clearHistory()
      setSelectedComponentId(null)
    }
  }

  const handleExport = () => {
    const project: CircuitProject = {
      id: projectId,
      name: projectName,
      description: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      components,
      connections,
      customDefinitions,
      settings,
      version: "1.0.0",
    }
    exportProjectToFile(project)
  }

  const handleImport = async (file: File) => {
    try {
      const project = await importProjectFromFile(file)
      setProjectId(project.id)
      setProjectName(project.name)
      replaceState(project.components, project.connections)
      setSettings(project.settings)
      setSelectedComponentId(null)
      
      // Reload custom definitions in case new ones were imported
      setCustomDefinitions(loadCustomDefinitions())
    } catch (error) {
      alert("Failed to import project. Please check the file format.")
    }
  }

  const handleSaveCustomDefinition = (definition: ComponentDefinition) => {
    const updated = [...customDefinitions, definition]
    setCustomDefinitions(updated)
    saveCustomDefinitions(updated)
  }

  const handleDeleteCustomDefinition = (id: string) => {
    if (confirm("Delete this custom component? It will be removed from your library.")) {
      const updated = customDefinitions.filter((d) => d.id !== id)
      setCustomDefinitions(updated)
      saveCustomDefinitions(updated)
    }
  }

  const handleNewProject = () => {
    if (components.length > 0) {
      if (!confirm("Start a new project? Make sure to export your current work first.")) {
        return
      }
    }
    const newProject = createNewProject()
    setProjectId(newProject.id)
    setProjectName(newProject.name)
    replaceState([], [])
    setSelectedComponentId(null)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      const isInputActive = document.activeElement?.tagName === "INPUT" || 
                           document.activeElement?.tagName === "TEXTAREA"
      
      // Undo: Cmd+Z / Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        if (!isInputActive) {
          e.preventDefault()
          undo()
        }
      }
      
      // Redo: Cmd+Shift+Z / Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        if (!isInputActive) {
          e.preventDefault()
          redo()
        }
      }
      
      // Delete selected component
      if ((e.key === "Delete" || e.key === "Backspace") && selectedComponentId) {
        if (!isInputActive) {
          e.preventDefault()
          const component = components.find((c) => c.id === selectedComponentId)
          if (!component) return
          const nodeIds = component.nodes.map((n) => n.id)
          const newComponents = components.filter((c) => c.id !== selectedComponentId)
          const newConnections = connections.filter((conn) => 
            !nodeIds.includes(conn.fromNodeId) && !nodeIds.includes(conn.toNodeId)
          )
          setBoth(newComponents, newConnections)
          setSelectedComponentId(null)
        }
      }
      
      // Escape to deselect
      if (e.key === "Escape") {
        setSelectedComponentId(null)
        setShowSettings(false)
      }

      // Ctrl+S to export
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        handleExport()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedComponentId, components, connections, undo, redo, setBoth])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading Circuit Mapper...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground leading-tight">Circuit Mapper</h1>
                <p className="text-xs text-muted-foreground">Van Electrical System Designer</p>
              </div>
            </div>
            
            {/* Project Name */}
            <div className="hidden md:block border-l border-border pl-4">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-transparent text-sm font-medium text-foreground border-none focus:outline-none focus:ring-0 w-48"
                placeholder="Project name..."
              />
              {lastSaved && settings.autoSave && (
                <p className="text-xs text-muted-foreground">
                  Saved {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Undo/Redo Controls */}
            <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                disabled={!canUndo}
                className="h-8 w-8"
                title="Undo (⌘Z)"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={redo}
                disabled={!canRedo}
                className="h-8 w-8"
                title="Redo (⌘⇧Z)"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleNewProject} className="hidden sm:flex">
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <FileDown className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClear}>
              <Trash2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Component Toolbar */}
        <ResizablePanel
          side="left"
          defaultWidth={288}
          minWidth={220}
          maxWidth={400}
          collapsedWidth={0}
        >
          <ComponentToolbar
            customDefinitions={customDefinitions}
            onCreateComponent={() => setShowCreateComponent(true)}
          />
        </ResizablePanel>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
          <CircuitCanvas
            components={components}
            setComponents={setComponents}
            connections={connections}
            setConnections={setConnections}
            selectedComponentId={selectedComponentId}
            setSelectedComponentId={setSelectedComponentId}
            defaultCableUnit={settings.defaultCableUnit}
            customDefinitions={customDefinitions}
          />
        </div>

        {/* Right Panel - Settings or Connections */}
        {showSettings && (
          <ResizablePanel
            side="right"
            defaultWidth={320}
            minWidth={280}
            maxWidth={450}
            collapsedWidth={0}
          >
            <SettingsPanel
              settings={settings}
              onSettingsChange={setSettings}
              projectName={projectName}
              onProjectNameChange={setProjectName}
              customDefinitions={customDefinitions}
              onDeleteCustomDefinition={handleDeleteCustomDefinition}
              onExport={handleExport}
              onImport={handleImport}
              onClear={handleClear}
              onClose={() => setShowSettings(false)}
            />
          </ResizablePanel>
        )}

        {selectedComponentId && !showSettings && (
          <ResizablePanel
            side="right"
            defaultWidth={320}
            minWidth={280}
            maxWidth={450}
            collapsedWidth={0}
          >
            <ConnectionsPanel
              selectedComponentId={selectedComponentId}
              components={components}
              connections={connections}
              setConnections={setConnections}
              setComponents={setComponents}
              defaultCableUnit={settings.defaultCableUnit}
              onClose={() => setSelectedComponentId(null)}
            />
          </ResizablePanel>
        )}
      </div>

      {/* Create Component Dialog */}
      <CreateComponentDialog
        open={showCreateComponent}
        onClose={() => setShowCreateComponent(false)}
        onSave={handleSaveCustomDefinition}
      />
    </div>
  )
}
