import { useState, useCallback, useEffect } from "react"
import type { Component, Connection, Node, TerminalPosition } from "@/types/circuit"
import { calculateOptimalEdge, getTerminalWorldPosition, COMPONENT_WIDTH, COMPONENT_HEIGHT } from "../utils"

interface UseConnectionsOptions {
  components: Component[]
  setComponents: (components: Component[]) => void
  connections: Connection[]
  setConnections: (connections: Connection[]) => void
  defaultCableUnit: string
}

interface UseConnectionsReturn {
  connectingFrom: Node | null
  editingConnection: string | null
  hoveredConnection: string | null
  handleStartConnection: (node: Node, e: React.MouseEvent) => void
  handleEndConnection: (node: Node) => void
  handleNodeClick: (node: Node) => void
  handleDeleteConnection: (connectionId: string) => void
  handleCableSizeChange: (connectionId: string, newSize: string) => void
  setConnectingFrom: (node: Node | null) => void
  setEditingConnection: (id: string | null) => void
  setHoveredConnection: (id: string | null) => void
  getAllNodes: () => Node[]
}

/**
 * Hook for managing connections between components
 */
export function useConnections({
  components,
  setComponents,
  connections,
  setConnections,
  defaultCableUnit,
}: UseConnectionsOptions): UseConnectionsReturn {
  const [connectingFrom, setConnectingFrom] = useState<Node | null>(null)
  const [editingConnection, setEditingConnection] = useState<string | null>(null)
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null)

  // Handle ESC key to cancel connection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && connectingFrom) {
        setConnectingFrom(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [connectingFrom])

  const getAllNodes = useCallback((): Node[] => {
    return components.flatMap((c) => c.nodes)
  }, [components])

  const handleStartConnection = useCallback((node: Node) => {
    setConnectingFrom(node)
  }, [])

  const handleEndConnection = useCallback(
    (node: Node) => {
      if (!connectingFrom) return

      if (connectingFrom.id !== node.id && connectingFrom.componentId !== node.componentId) {
        const fromComponent = components.find((c) => c.id === connectingFrom.componentId)
        const toComponent = components.find((c) => c.id === node.componentId)

        if (fromComponent && toComponent) {
          // Calculate optimal edges for both terminals to face each other
          const fromOptimalEdge = calculateOptimalEdge(
            fromComponent.x,
            fromComponent.y,
            toComponent.x,
            toComponent.y
          )
          const toOptimalEdge = calculateOptimalEdge(
            toComponent.x,
            toComponent.y,
            fromComponent.x,
            fromComponent.y
          )

          // Update components with repositioned terminals
          const updatedComponents = components.map((c) => {
            if (c.id === fromComponent.id) {
              const updatedNodes = c.nodes.map((n) => {
                if (n.id === connectingFrom.id) {
                  const newPosition: TerminalPosition = {
                    edge: fromOptimalEdge,
                    position: n.terminalPosition?.position || 50,
                  }
                  const worldPos = getTerminalWorldPosition(
                    { ...n, terminalPosition: newPosition },
                    c.x,
                    c.y,
                    COMPONENT_WIDTH,
                    COMPONENT_HEIGHT
                  )
                  return { ...n, terminalPosition: newPosition, x: worldPos.x, y: worldPos.y }
                }
                return n
              })
              return { ...c, nodes: updatedNodes }
            }
            if (c.id === toComponent.id) {
              const updatedNodes = c.nodes.map((n) => {
                if (n.id === node.id) {
                  const newPosition: TerminalPosition = {
                    edge: toOptimalEdge,
                    position: n.terminalPosition?.position || 50,
                  }
                  const worldPos = getTerminalWorldPosition(
                    { ...n, terminalPosition: newPosition },
                    c.x,
                    c.y,
                    COMPONENT_WIDTH,
                    COMPONENT_HEIGHT
                  )
                  return { ...n, terminalPosition: newPosition, x: worldPos.x, y: worldPos.y }
                }
                return n
              })
              return { ...c, nodes: updatedNodes }
            }
            return c
          })

          setComponents(updatedComponents)
        }

        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          fromNodeId: connectingFrom.id,
          toNodeId: node.id,
          cableSize: `2.5${defaultCableUnit}`,
        }
        setConnections([...connections, newConnection])
      }
      setConnectingFrom(null)
    },
    [connectingFrom, components, connections, setComponents, setConnections, defaultCableUnit]
  )

  const handleNodeClick = useCallback(
    (node: Node) => {
      if (!connectingFrom) {
        setConnectingFrom(node)
      } else {
        handleEndConnection(node)
      }
    },
    [connectingFrom, handleEndConnection]
  )

  const handleDeleteConnection = useCallback(
    (connectionId: string) => {
      setConnections(connections.filter((c) => c.id !== connectionId))
    },
    [connections, setConnections]
  )

  const handleCableSizeChange = useCallback(
    (connectionId: string, newSize: string) => {
      setConnections(
        connections.map((conn) =>
          conn.id === connectionId ? { ...conn, cableSize: newSize } : conn
        )
      )
      setEditingConnection(null)
    },
    [connections, setConnections]
  )

  return {
    connectingFrom,
    editingConnection,
    hoveredConnection,
    handleStartConnection,
    handleEndConnection,
    handleNodeClick,
    handleDeleteConnection,
    handleCableSizeChange,
    setConnectingFrom,
    setEditingConnection,
    setHoveredConnection,
    getAllNodes,
  }
}

