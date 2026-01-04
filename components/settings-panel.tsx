"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { X, Download, Upload, Trash2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CABLE_UNITS, type ProjectSettings } from "@/types/circuit"
import type { ComponentDefinition } from "@/types/circuit"
import { useRef } from "react"

interface SettingsPanelProps {
  settings: ProjectSettings
  onSettingsChange: (settings: ProjectSettings) => void
  projectName: string
  onProjectNameChange: (name: string) => void
  customDefinitions: ComponentDefinition[]
  onDeleteCustomDefinition: (id: string) => void
  onExport: () => void
  onImport: (file: File) => void
  onClear: () => void
  onClose: () => void
}

export function SettingsPanel({
  settings,
  onSettingsChange,
  projectName,
  onProjectNameChange,
  customDefinitions,
  onDeleteCustomDefinition,
  onExport,
  onImport,
  onClear,
  onClose,
}: SettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImport(file)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full h-full border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Settings</h2>
          <p className="text-xs text-muted-foreground mt-1">Configure your project</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 flex flex-col gap-6">
          {/* Project Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name" className="text-sm font-medium">
              Project Name
            </Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              placeholder="My Van Electrical System"
            />
          </div>

          {/* Default Cable Unit */}
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-medium">Default Cable Size Unit</Label>
            <p className="text-xs text-muted-foreground">
              Used when creating new connections
            </p>
            <RadioGroup
              value={settings.defaultCableUnit}
              onValueChange={(value) => onSettingsChange({ ...settings, defaultCableUnit: value })}
              className="flex flex-col gap-2"
            >
              {CABLE_UNITS.map((unit) => (
                <div key={unit.value} className="flex items-center gap-2">
                  <RadioGroupItem value={unit.value} id={unit.value} />
                  <Label htmlFor={unit.value} className="text-sm font-normal cursor-pointer">
                    {unit.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Display Options */}
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-medium">Display Options</Label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showGrid}
                  onChange={(e) => onSettingsChange({ ...settings, showGrid: e.target.checked })}
                  className="rounded border-input"
                />
                <span className="text-sm">Show grid</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.snapToGrid}
                  onChange={(e) => onSettingsChange({ ...settings, snapToGrid: e.target.checked })}
                  className="rounded border-input"
                />
                <span className="text-sm">Snap to grid</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => onSettingsChange({ ...settings, autoSave: e.target.checked })}
                  className="rounded border-input"
                />
                <span className="text-sm">Auto-save to browser</span>
              </label>
            </div>
          </div>

          {/* Custom Components */}
          {customDefinitions.length > 0 && (
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-medium">Custom Components</Label>
              <div className="flex flex-col gap-2">
                {customDefinitions.map((def) => (
                  <div
                    key={def.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {def.imageUrl ? (
                        <div className="w-6 h-6 rounded bg-muted overflow-hidden">
                          <img src={def.imageUrl} alt={def.label} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded bg-muted" />
                      )}
                      <span className="text-sm truncate">{def.label}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onDeleteCustomDefinition(def.id)}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Import/Export */}
          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <Label className="text-sm font-medium">Project Data</Label>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start gap-2" onClick={onExport}>
                <Download className="w-4 h-4" />
                Export Project
              </Button>
              <Button variant="outline" className="justify-start gap-2" onClick={handleImportClick}>
                <Upload className="w-4 h-4" />
                Import Project
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <Label className="text-sm font-medium text-destructive">Danger Zone</Label>
            <Button
              variant="destructive"
              className="justify-start gap-2"
              onClick={onClear}
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
