import { useCallback } from "react"
import type { Component, Connection, Node, ComponentDefinition } from "@/types/circuit"
import { initializeTerminalPositions, COMPONENT_WIDTH, COMPONENT_HEIGHT } from "../utils"

interface UseComponentActionsOptions {
  components: Component[]
  setComponents: (components: Component[]) => void
  connections: Connection[]
  setConnections: (connections: Connection[]) => void
  selectedComponentId: string | null
  setSelectedComponentId: (id: string | null) => void
  findDefinition: (type: string) => ComponentDefinition | undefined
}

interface UseComponentActionsReturn {
  handleDeleteComponent: (id: string) => void
  handleDuplicateComponent: (componentId: string) => void
  handleSwapComponent: (componentId: string, newType: string) => void
  handleUpdateNodes: (componentId: string, nodes: Node[]) => void
  getAllNodes: () => Node[]
}

/**
 * Hook for component CRUD operations (delete, duplicate, swap, update nodes)
 */
export function useComponentActions({
  components,
  setComponents,
  connections,
  setConnections,
  selectedComponentId,
  setSelectedComponentId,
  findDefinition,
}: UseComponentActionsOptions): UseComponentActionsReturn {
  const getAllNodes = useCallback((): Node[] => {
    return components.flatMap((c) => c.nodes)
  }, [components])

  const handleDeleteComponent = useCallback(
    (id: string) => {
      const allNodes = getAllNodes()
      setComponents(components.filter((c) => c.id !== id))
      setConnections(
        connections.filter((conn) => {
          const fromNode = allNodes.find((n) => n.id === conn.fromNodeId)
          const toNode = allNodes.find((n) => n.id === conn.toNodeId)
          return fromNode?.componentId !== id && toNode?.componentId !== id
        })
      )
      if (selectedComponentId === id) {
        setSelectedComponentId(null)
      }
    },
    [components, connections, getAllNodes, setComponents, setConnections, selectedComponentId, setSelectedComponentId]
  )

  const handleDuplicateComponent = useCallback(
    (componentId: string) => {
      const component = components.find((c) => c.id === componentId)
      if (!component) return

      const newId = `comp-${Date.now()}`
      let newComponent: Component = {
        ...component,
        id: newId,
        x: component.x + 60,
        y: component.y + 60,
        nodes: component.nodes.map((node, idx) => ({
          ...node,
          id: `${newId}-node-${idx}`,
          componentId: newId,
          x: node.x + 60,
          y: node.y + 60,
        })),
      }

      // Re-initialize terminal positions for duplicated component
      newComponent = initializeTerminalPositions(newComponent)

      setComponents([...components, newComponent])
    },
    [components, setComponents]
  )

  const handleSwapComponent = useCallback(
    (componentId: string, newType: string) => {
      const component = components.find((c) => c.id === componentId)
      if (!component) return

      const newDefinition = findDefinition(newType)
      if (!newDefinition) return

      const nodeIds = component.nodes.map((n) => n.id)
      setConnections(
        connections.filter(
          (conn) => !nodeIds.includes(conn.fromNodeId) && !nodeIds.includes(conn.toNodeId)
        )
      )

      const newNodes: Node[] = []
      let nodeIndex = 0

      newDefinition.nodes.forEach((nodeDef) => {
        newNodes.push({
          id: `${component.id}-node-${nodeIndex}`,
          type: nodeDef.type,
          x: component.x,
          y: component.y + COMPONENT_HEIGHT / 2,
          componentId: component.id,
          label: nodeDef.label,
        })
        nodeIndex++
      })

      let updatedComponent: Component = {
        ...component,
        type: newType,
        definitionId: newDefinition.id,
        label: newDefinition.label,
        definition: newDefinition,
        nodes: newNodes,
      }

      // Initialize terminal positions
      updatedComponent = initializeTerminalPositions(updatedComponent)

      setComponents(components.map((c) => (c.id === componentId ? updatedComponent : c)))
    },
    [components, connections, setComponents, setConnections, findDefinition]
  )

  const handleUpdateNodes = useCallback(
    (componentId: string, nodes: Node[]) => {
      setComponents(
        components.map((c) => {
          if (c.id === componentId) {
            return { ...c, nodes }
          }
          return c
        })
      )
    },
    [components, setComponents]
  )

  return {
    handleDeleteComponent,
    handleDuplicateComponent,
    handleSwapComponent,
    handleUpdateNodes,
    getAllNodes,
  }
}

