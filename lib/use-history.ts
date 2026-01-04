"use client"

import { useState, useCallback, useRef } from "react"
import type { Component, Connection } from "@/types/circuit"

/**
 * State snapshot for undo/redo functionality
 * Contains all circuit data that should be tracked in history
 */
interface HistoryState {
  components: Component[]
  connections: Connection[]
}

/**
 * Hook return type with history management functions
 */
interface UseHistoryReturn {
  /** Current components state */
  components: Component[]
  /** Current connections state */
  connections: Connection[]
  /** Update components - automatically records to history */
  setComponents: (components: Component[]) => void
  /** Update connections - automatically records to history */
  setConnections: (connections: Connection[]) => void
  /** Batch update both components and connections as a single history entry */
  setBoth: (components: Component[], connections: Connection[]) => void
  /** Undo the last action */
  undo: () => void
  /** Redo the previously undone action */
  redo: () => void
  /** Whether undo is available */
  canUndo: boolean
  /** Whether redo is available */
  canRedo: boolean
  /** Replace state without recording to history (for loading projects) */
  replaceState: (components: Component[], connections: Connection[]) => void
  /** Clear all history */
  clearHistory: () => void
}

const MAX_HISTORY_SIZE = 50

/**
 * Custom hook for managing undo/redo history of circuit state
 * 
 * @param initialComponents - Initial components array
 * @param initialConnections - Initial connections array
 * @returns History management functions and current state
 */
export function useHistory(
  initialComponents: Component[] = [],
  initialConnections: Connection[] = []
): UseHistoryReturn {
  // History stacks
  const [past, setPast] = useState<HistoryState[]>([])
  const [present, setPresent] = useState<HistoryState>({
    components: initialComponents,
    connections: initialConnections,
  })
  const [future, setFuture] = useState<HistoryState[]>([])

  // Debounce timer ref to batch rapid changes
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const pendingState = useRef<HistoryState | null>(null)

  // Save to history with debouncing
  const saveToHistory = useCallback((newState: HistoryState, immediate = false) => {
    if (immediate) {
      // Immediate save - push current state to past
      setPast((prev) => {
        const newPast = [...prev, present]
        // Limit history size
        if (newPast.length > MAX_HISTORY_SIZE) {
          return newPast.slice(-MAX_HISTORY_SIZE)
        }
        return newPast
      })
      setPresent(newState)
      setFuture([]) // Clear redo stack on new action
    } else {
      // Debounced save - wait for rapid changes to settle
      pendingState.current = newState

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }

      debounceTimer.current = setTimeout(() => {
        if (pendingState.current) {
          setPast((prev) => {
            const newPast = [...prev, present]
            if (newPast.length > MAX_HISTORY_SIZE) {
              return newPast.slice(-MAX_HISTORY_SIZE)
            }
            return newPast
          })
          setPresent(pendingState.current)
          setFuture([])
          pendingState.current = null
        }
      }, 300)

      // Update present immediately for responsive UI
      setPresent(newState)
    }
  }, [present])

  // Set components with history tracking
  const setComponents = useCallback((components: Component[]) => {
    saveToHistory({ components, connections: present.connections }, true)
  }, [saveToHistory, present.connections])

  // Set connections with history tracking
  const setConnections = useCallback((connections: Connection[]) => {
    saveToHistory({ components: present.components, connections }, true)
  }, [saveToHistory, present.components])

  // Set both as a single history entry
  const setBoth = useCallback((components: Component[], connections: Connection[]) => {
    saveToHistory({ components, connections }, true)
  }, [saveToHistory])

  // Undo action
  const undo = useCallback(() => {
    if (past.length === 0) return

    const previous = past[past.length - 1]
    const newPast = past.slice(0, -1)

    setPast(newPast)
    setPresent(previous)
    setFuture([present, ...future])
  }, [past, present, future])

  // Redo action
  const redo = useCallback(() => {
    if (future.length === 0) return

    const next = future[0]
    const newFuture = future.slice(1)

    setPast([...past, present])
    setPresent(next)
    setFuture(newFuture)
  }, [past, present, future])

  // Replace state without history (for loading projects)
  const replaceState = useCallback((components: Component[], connections: Connection[]) => {
    setPresent({ components, connections })
    setPast([])
    setFuture([])
  }, [])

  // Clear all history
  const clearHistory = useCallback(() => {
    setPast([])
    setFuture([])
  }, [])

  return {
    components: present.components,
    connections: present.connections,
    setComponents,
    setConnections,
    setBoth,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    replaceState,
    clearHistory,
  }
}

