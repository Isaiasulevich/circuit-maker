import type { Node, Component, TerminalPosition } from "@/types/circuit"
import type { Position } from "../types"
import { getTerminalWorldPosition, COMPONENT_WIDTH, COMPONENT_HEIGHT } from "@/components/circuit-component"

/**
 * Calculate the optimal edge for a terminal based on the position of another component
 * Used to automatically orient terminals to face each other when creating connections
 */
export function calculateOptimalEdge(
  componentX: number,
  componentY: number,
  otherX: number,
  otherY: number
): TerminalPosition["edge"] {
  const dx = otherX - componentX
  const dy = otherY - componentY

  // Determine which direction the other component is
  // Prioritize horizontal/vertical alignment
  if (Math.abs(dx) > Math.abs(dy)) {
    // Other component is more to the left or right
    return dx > 0 ? "right" : "left"
  } else {
    // Other component is more above or below
    return dy > 0 ? "bottom" : "top"
  }
}

/**
 * Get terminal position for connection drawing
 */
export function getTerminalPosition(node: Node, component: Component): Position {
  if (node.terminalPosition) {
    return getTerminalWorldPosition(
      node,
      component.x,
      component.y,
      COMPONENT_WIDTH,
      COMPONENT_HEIGHT
    )
  }
  // Fallback to stored coordinates
  return { x: node.x, y: node.y }
}

/**
 * Initialize terminal positions for a component
 * Distributes terminals evenly on the bottom edge by default
 */
export function initializeTerminalPositions(component: Component): Component {
  const totalNodes = component.nodes.length
  if (totalNodes === 0) return component

  // Distribute terminals evenly on the bottom edge
  const spacing = 100 / (totalNodes + 1)

  const updatedNodes = component.nodes.map((node, index) => {
    if (!node.terminalPosition) {
      const position: TerminalPosition = {
        edge: "bottom",
        position: spacing * (index + 1),
      }
      const worldPos = getTerminalWorldPosition(
        { ...node, terminalPosition: position },
        component.x,
        component.y,
        COMPONENT_WIDTH,
        COMPONENT_HEIGHT
      )
      return {
        ...node,
        terminalPosition: position,
        x: worldPos.x,
        y: worldPos.y,
      }
    }
    return node
  })

  return { ...component, nodes: updatedNodes }
}

/**
 * Update node world positions based on component position
 */
export function updateNodeWorldPositions(
  nodes: Node[],
  componentX: number,
  componentY: number
): Node[] {
  return nodes.map((node) => {
    if (node.terminalPosition) {
      const worldPos = getTerminalWorldPosition(
        node,
        componentX,
        componentY,
        COMPONENT_WIDTH,
        COMPONENT_HEIGHT
      )
      return { ...node, x: worldPos.x, y: worldPos.y }
    }
    return node
  })
}

// Re-export for convenience
export { getTerminalWorldPosition, COMPONENT_WIDTH, COMPONENT_HEIGHT }

