"use client"

import * as React from "react"
import { Loader2, RotateCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { MindMapContent } from "@/types"

const NODE_W = 100
const NODE_H = 32
const LEVEL_GAP = 72
const SIBLING_GAP = 10

type UiMindMapNode = {
  label: string
  children: UiMindMapNode[]
}

type PositionedNode = {
  node: UiMindMapNode
  x: number
  y: number
  children: PositionedNode[]
}

function measureTree(node: UiMindMapNode, depth: number): { height: number; positioned: PositionedNode } {
  if (!node.children || node.children.length === 0) {
    return { height: NODE_H, positioned: { node, x: depth * (NODE_W + LEVEL_GAP), y: 0, children: [] } }
  }

  const measured = node.children.map((child) => measureTree(child, depth + 1))
  const totalChildHeight =
    measured.reduce((sum, m) => sum + m.height, 0) + (measured.length - 1) * SIBLING_GAP

  let cursor = 0
  const positionedChildren: PositionedNode[] = measured.map((m) => {
    const offsetY = cursor + m.height / 2
    cursor += m.height + SIBLING_GAP
    return { ...m.positioned, y: m.positioned.y + offsetY }
  })

  return {
    height: Math.max(totalChildHeight, NODE_H),
    positioned: {
      node,
      x: depth * (NODE_W + LEVEL_GAP),
      y: totalChildHeight / 2,
      children: positionedChildren,
    },
  }
}

type Edge = { x1: number; y1: number; x2: number; y2: number }

function collectEdges(node: PositionedNode, edges: Edge[] = []): Edge[] {
  for (const child of node.children) {
    edges.push({ x1: node.x + NODE_W, y1: node.y + NODE_H / 2, x2: child.x, y2: child.y + NODE_H / 2 })
    collectEdges(child, edges)
  }
  return edges
}

function collectNodes(node: PositionedNode, result: PositionedNode[] = []): PositionedNode[] {
  result.push(node)
  node.children.forEach((c) => collectNodes(c, result))
  return result
}

const DEPTH_COLORS = [
  "bg-primary text-primary-foreground",
  "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30",
  "bg-muted text-muted-foreground border border-border",
]

function MindMapSvg({ root }: { root: UiMindMapNode }) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const dragRef = React.useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  })
  const { height, positioned } = measureTree(root, 0)
  const allNodes = collectNodes(positioned)
  const maxX = Math.max(...allNodes.map((n) => n.x + NODE_W))
  const canvasPadding = 48
  const svgW = maxX + canvasPadding * 2
  const svgH = height + canvasPadding * 2

  function offset(n: PositionedNode, dy: number): PositionedNode {
    return { ...n, y: n.y + dy, children: n.children.map((c) => offset(c, dy)) }
  }
  const tree = offset(positioned, canvasPadding)
  const edges = collectEdges(tree)
  const nodes = collectNodes(tree)

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    dragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: scrollEl.scrollLeft,
      scrollTop: scrollEl.scrollTop,
    }
    scrollEl.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const scrollEl = scrollRef.current
    if (!scrollEl || !dragRef.current.active) return

    scrollEl.scrollLeft = dragRef.current.scrollLeft - (event.clientX - dragRef.current.startX)
    scrollEl.scrollTop = dragRef.current.scrollTop - (event.clientY - dragRef.current.startY)
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const scrollEl = scrollRef.current
    dragRef.current.active = false
    if (scrollEl?.hasPointerCapture(event.pointerId)) {
      scrollEl.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <div
      ref={scrollRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="h-full w-full cursor-grab select-none overflow-scroll overscroll-contain active:cursor-grabbing"
    >
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="block max-w-none"
        style={{ minWidth: svgW, minHeight: svgH }}
      >
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
        {nodes.map((n, idx) => {
          const depth = Math.round(n.x / (NODE_W + LEVEL_GAP))
          const colorClass = DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)]
          return (
            <foreignObject key={idx} x={n.x} y={n.y} width={NODE_W} height={NODE_H}>
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

interface MindMapTabProps {
  content: MindMapContent | undefined
  isLoading: boolean
  onGenerate: () => void
}

export function MindMapTab({ content, isLoading, onGenerate }: MindMapTabProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Generating mind map…</p>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">No mind map yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Generate a mind map from this note</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={onGenerate}>
          <Sparkles className="h-3.5 w-3.5" />
          Generate
        </Button>
      </div>
    )
  }

  const root: UiMindMapNode = { label: content.root, children: content.children }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Auto-generated from note content</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground"
          title="Regenerate"
          onClick={onGenerate}
        >
          <RotateCw className="h-3 w-3" />
        </Button>
      </div>
      <div className="h-[min(520px,calc(100vh-260px))] min-h-[360px] rounded-xl border bg-card p-3">
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
