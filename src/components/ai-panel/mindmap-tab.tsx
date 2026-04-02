"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { MindMapNode } from "./types"

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const NODE_W = 100
const NODE_H = 32
const LEVEL_GAP = 72   // horizontal gap between levels
const SIBLING_GAP = 10  // vertical gap between siblings

// ---------------------------------------------------------------------------
// Tree layout — assign x/y positions top-down
// ---------------------------------------------------------------------------

type PositionedNode = {
  node: MindMapNode
  x: number
  y: number
  children: PositionedNode[]
}

function measureTree(node: MindMapNode, depth: number): { height: number; positioned: PositionedNode } {
  if (!node.children || node.children.length === 0) {
    const positioned: PositionedNode = { node, x: depth * (NODE_W + LEVEL_GAP), y: 0, children: [] }
    return { height: NODE_H, positioned }
  }

  const measured = node.children.map((child) => measureTree(child, depth + 1))
  const totalChildHeight =
    measured.reduce((sum, m) => sum + m.height, 0) +
    (measured.length - 1) * SIBLING_GAP

  // Stack children vertically
  let cursor = 0
  const positionedChildren: PositionedNode[] = measured.map((m) => {
    const offsetY = cursor + m.height / 2
    cursor += m.height + SIBLING_GAP
    return { ...m.positioned, y: m.positioned.y + offsetY }
  })

  const centerY = totalChildHeight / 2
  const positioned: PositionedNode = {
    node,
    x: depth * (NODE_W + LEVEL_GAP),
    y: centerY,
    children: positionedChildren,
  }

  return { height: Math.max(totalChildHeight, NODE_H), positioned }
}

// ---------------------------------------------------------------------------
// Collect all edges
// ---------------------------------------------------------------------------

type Edge = { x1: number; y1: number; x2: number; y2: number }

function collectEdges(node: PositionedNode, edges: Edge[] = []): Edge[] {
  for (const child of node.children) {
    edges.push({
      x1: node.x + NODE_W,
      y1: node.y + NODE_H / 2,
      x2: child.x,
      y2: child.y + NODE_H / 2,
    })
    collectEdges(child, edges)
  }
  return edges
}

// ---------------------------------------------------------------------------
// Collect all nodes flat
// ---------------------------------------------------------------------------

function collectNodes(node: PositionedNode, result: PositionedNode[] = []): PositionedNode[] {
  result.push(node)
  node.children.forEach((c) => collectNodes(c, result))
  return result
}

// ---------------------------------------------------------------------------
// SVG Mind Map
// ---------------------------------------------------------------------------

const DEPTH_COLORS = [
  "bg-primary text-primary-foreground",
  "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30",
  "bg-muted text-muted-foreground border border-border",
]

function MindMapSvg({ root }: { root: MindMapNode }) {
  const { height, positioned } = measureTree(root, 0)

  // Compute bounding box
  const allNodes = collectNodes(positioned)
  const maxX = Math.max(...allNodes.map((n) => n.x + NODE_W))
  const totalHeight = height
  const svgW = maxX + 8
  const svgH = totalHeight + 8

  // Center root vertically
  function offset(n: PositionedNode, dy: number): PositionedNode {
    return {
      ...n,
      y: n.y + dy,
      children: n.children.map((c) => offset(c, dy)),
    }
  }
  const dy = (svgH - totalHeight) / 2
  const tree = offset(positioned, dy)

  const edges = collectEdges(tree)
  const nodes = collectNodes(tree)

  return (
    <div className="overflow-auto">
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="block"
      >
        {/* Edges */}
        {edges.map((e, i) => {
          const mx = (e.x1 + e.x2) / 2
          return (
            <path
              key={i}
              d={`M ${e.x1} ${e.y1} C ${mx} ${e.y1}, ${mx} ${e.y2}, ${e.x2} ${e.y2}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="text-border"
              strokeLinecap="round"
            />
          )
        })}

        {/* Nodes as foreignObject so we can use Tailwind */}
        {nodes.map((n) => {
          const depth = Math.round(n.x / (NODE_W + LEVEL_GAP))
          const colorClass = DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)]
          return (
            <foreignObject
              key={n.node.id}
              x={n.x}
              y={n.y}
              width={NODE_W}
              height={NODE_H}
            >
              <div
                className={cn(
                  "flex h-full w-full items-center justify-center rounded-lg px-2 text-center text-[10px] font-medium leading-tight",
                  colorClass
                )}
              >
                {n.node.label}
              </div>
            </foreignObject>
          )
        })}
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

interface MindMapTabProps {
  root: MindMapNode
}

export function MindMapTab({ root }: MindMapTabProps) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-xs text-muted-foreground">
        Auto-generated from note content
      </p>
      <div className="rounded-xl border bg-card p-3">
        <MindMapSvg root={root} />
      </div>
      <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" /> Root
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500/20 border border-blue-500/30" /> Topics
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-muted border border-border" /> Details
        </span>
      </div>
    </div>
  )
}
