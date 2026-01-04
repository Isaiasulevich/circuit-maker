import type { Node, TerminalPosition } from "@/types/circuit"
import type { Position } from "../types"

/**
 * Stub length - how far the wire extends from terminal before turning
 */
const STUB_LENGTH = 25

/**
 * Get the direction vector for a terminal edge
 */
function getEdgeDirection(edge: TerminalPosition["edge"]): Position {
  switch (edge) {
    case "top":
      return { x: 0, y: -1 }
    case "bottom":
      return { x: 0, y: 1 }
    case "left":
      return { x: -1, y: 0 }
    case "right":
      return { x: 1, y: 0 }
    default:
      return { x: 0, y: 1 }
  }
}

/**
 * Generate an orthogonal (right-angled) path between two terminals
 * Creates professional-looking wire routing
 */
export function generateConnectionPath(
  fromPos: Position,
  toPos: Position,
  fromNode: Node,
  toNode: Node
): string {
  const fromEdge = fromNode.terminalPosition?.edge || "bottom"
  const toEdge = toNode.terminalPosition?.edge || "bottom"

  const fromDir = getEdgeDirection(fromEdge)
  const toDir = getEdgeDirection(toEdge)

  // First stub point (extends from source terminal)
  const stub1: Position = {
    x: fromPos.x + fromDir.x * STUB_LENGTH,
    y: fromPos.y + fromDir.y * STUB_LENGTH,
  }

  // Last stub point (extends from target terminal)
  const stub2: Position = {
    x: toPos.x + toDir.x * STUB_LENGTH,
    y: toPos.y + toDir.y * STUB_LENGTH,
  }

  // Calculate the midpoint for the connecting segments
  const midX = (stub1.x + stub2.x) / 2
  const midY = (stub1.y + stub2.y) / 2

  // Determine routing based on terminal orientations
  const pathPoints: Position[] = [fromPos, stub1]

  // If terminals are on horizontal edges (top/bottom)
  if (
    (fromEdge === "top" || fromEdge === "bottom") &&
    (toEdge === "top" || toEdge === "bottom")
  ) {
    // Route: vertical -> horizontal -> vertical
    pathPoints.push({ x: stub1.x, y: midY })
    pathPoints.push({ x: stub2.x, y: midY })
  }
  // If terminals are on vertical edges (left/right)
  else if (
    (fromEdge === "left" || fromEdge === "right") &&
    (toEdge === "left" || toEdge === "right")
  ) {
    // Route: horizontal -> vertical -> horizontal
    pathPoints.push({ x: midX, y: stub1.y })
    pathPoints.push({ x: midX, y: stub2.y })
  }
  // Mixed orientations
  else {
    // Connect with an L-shape or Z-shape depending on positions
    if (fromEdge === "top" || fromEdge === "bottom") {
      pathPoints.push({ x: stub1.x, y: stub2.y })
    } else {
      pathPoints.push({ x: stub2.x, y: stub1.y })
    }
  }

  pathPoints.push(stub2, toPos)

  // Build the SVG path
  let path = `M ${pathPoints[0].x} ${pathPoints[0].y}`
  for (let i = 1; i < pathPoints.length; i++) {
    path += ` L ${pathPoints[i].x} ${pathPoints[i].y}`
  }

  return path
}

/**
 * Generate path for active connection line (while dragging to mouse cursor)
 */
export function generateActiveConnectionPath(
  fromPos: Position,
  toPos: Position,
  fromNode: Node
): string {
  const fromEdge = fromNode.terminalPosition?.edge || "bottom"

  const fromDir = getEdgeDirection(fromEdge)
  const stub: Position = {
    x: fromPos.x + fromDir.x * STUB_LENGTH,
    y: fromPos.y + fromDir.y * STUB_LENGTH,
  }

  // Simple L-shape to cursor
  const midPoint =
    fromEdge === "top" || fromEdge === "bottom"
      ? { x: stub.x, y: toPos.y }
      : { x: toPos.x, y: stub.y }

  return `M ${fromPos.x} ${fromPos.y} L ${stub.x} ${stub.y} L ${midPoint.x} ${midPoint.y} L ${toPos.x} ${toPos.y}`
}

