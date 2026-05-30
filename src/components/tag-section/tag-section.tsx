"use client"

import * as React from "react"
import { ChevronDown, ChevronRight, Pencil, Plus, Tag, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from "@/queries/use-tags"
import type { Tag as TagType } from "@/types"

const TAG_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6",
  "#f97316", "#84cc16",
]

function ColorPicker({ selected, onChange }: { selected: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TAG_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className="size-6 rounded-full transition-transform hover:scale-110 focus:outline-none"
          style={{
            backgroundColor: color,
            outline: selected === color ? `2px solid ${color}` : "2px solid transparent",
            outlineOffset: "2px",
          }}
        />
      ))}
    </div>
  )
}

function AddTagDialogContent({ onClose }: { onClose: () => void }) {
  const [name, setName] = React.useState("")
  const [color, setColor] = React.useState(TAG_COLORS[0])
  const { mutate: createTag, isPending } = useCreateTag()

  function handleSubmit() {
    if (!name.trim()) return
    createTag({ name: name.trim(), color }, { onSuccess: onClose })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Tambah Tag Baru</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-1">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Nama Tag</label>
          <Input
            placeholder="Contoh: Bisnis, Pribadi, dll..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Warna</label>
          <ColorPicker selected={color} onChange={setColor} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
          Batal
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={!name.trim() || isPending}>
          {isPending ? "Menambah..." : "Tambah"}
        </Button>
      </DialogFooter>
    </>
  )
}

function EditTagDialogContent({ tag, onClose }: { tag: TagType; onClose: () => void }) {
  const [name, setName] = React.useState(tag.name)
  const [color, setColor] = React.useState(tag.color ?? TAG_COLORS[0])
  const { mutate: updateTag, isPending } = useUpdateTag()

  function handleSubmit() {
    if (!name.trim()) return
    updateTag({ id: tag.id, data: { name: name.trim(), color } }, { onSuccess: onClose })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Tag</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-1">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Nama Tag</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Warna</label>
          <ColorPicker selected={color} onChange={setColor} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
          Batal
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={!name.trim() || isPending}>
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
    </>
  )
}

function TagItem({ tag }: { tag: TagType }) {
  const { mutate: deleteTag } = useDeleteTag()
  const [editOpen, setEditOpen] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)

  return (
    <>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm">
          <EditTagDialogContent tag={tag} onClose={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>

      <button
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span
          className="size-3.5 shrink-0 rounded-full"
          style={{ backgroundColor: tag.color ?? "#6366f1" }}
        />
        <span className="flex-1 truncate text-left">{tag.name}</span>
        {hovered ? (
          <div className="flex items-center gap-0.5">
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); setEditOpen(true) }}
              className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
            >
              <Pencil className="size-3" />
            </span>
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); deleteTag(tag.id) }}
              className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="size-3" />
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground/50">0</span>
        )}
      </button>
    </>
  )
}

export function TagSection() {
  const { data: tags, isLoading } = useTags()
  const [open, setOpen] = React.useState(true)
  const [addOpen, setAddOpen] = React.useState(false)

  return (
    <>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <AddTagDialogContent onClose={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className={cn("flex flex-col px-2 py-2", open ? "flex-1 overflow-hidden" : "shrink-0")}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors"
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          )}
          <Tag className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Tags</span>
          <span
            role="button"
            aria-label="Tambah tag"
            onClick={(e) => { e.stopPropagation(); setAddOpen(true) }}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-sidebar-accent"
          >
            <Plus className="h-3 w-3" />
          </span>
        </button>

        {open && (
          <div className="mt-0.5 flex flex-col gap-0.5 overflow-y-auto pl-2">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md" />
              ))
            ) : tags?.length === 0 ? (
              <p className="px-2 py-2 text-[11px] italic text-muted-foreground/50">
                Belum ada tag. Klik + untuk tambah.
              </p>
            ) : (
              tags?.map((tag) => <TagItem key={tag.id} tag={tag} />)
            )}
          </div>
        )}
      </div>
    </>
  )
}
