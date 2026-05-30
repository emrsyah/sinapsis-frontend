"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderPlus,
  Home,
  MoreHorizontal,
  NotebookPen,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TagSection } from "@/components/tag-section/tag-section"
import { SidebarAuth } from "@/components/ui/sidebar-auth"
import { useAuthStore } from "@/stores/authStore"
import { useFolders, useCreateFolder, useUpdateFolder, useDeleteFolder } from "@/queries/use-folders"
import { useNotes, useCreateNote, useDeleteNote } from "@/queries/use-notes"
import type { Folder as FolderType, Note } from "@/types"

// ---------------------------------------------------------------------------
// New Folder Dialog
// ---------------------------------------------------------------------------

function NewFolderDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = React.useState("")
  const { mutate: createFolder, isPending } = useCreateFolder()

  function handleSubmit() {
    if (!name.trim()) return
    createFolder({ name: name.trim() }, {
      onSuccess: () => { setName(""); onOpenChange(false) },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>New Folder</DialogTitle></DialogHeader>
        <div className="py-1">
          <Input
            placeholder="Folder name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={!name.trim() || isPending}>
            {isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Rename Folder Dialog
// ---------------------------------------------------------------------------

function RenameFolderDialog({
  folder, open, onOpenChange,
}: { folder: FolderType; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = React.useState(folder.name)
  const { mutate: updateFolder, isPending } = useUpdateFolder()

  function handleSubmit() {
    if (!name.trim()) return
    updateFolder({ id: folder.id, data: { name: name.trim() } }, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Rename Folder</DialogTitle></DialogHeader>
        <div className="py-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={!name.trim() || isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Folder Tree Item
// ---------------------------------------------------------------------------

function FolderItem({
  folder, activeFolderId, onSelect, depth,
}: { folder: FolderType; activeFolderId: string | null; onSelect: (id: string) => void; depth: number }) {
  const { mutate: deleteFolder } = useDeleteFolder()
  const [renameOpen, setRenameOpen] = React.useState(false)
  const [childrenOpen, setChildrenOpen] = React.useState(false)
  const isActive = activeFolderId === folder.id
  const hasChildren = folder.children.length > 0

  return (
    <>
      <RenameFolderDialog folder={folder} open={renameOpen} onOpenChange={setRenameOpen} />
      <div style={{ paddingLeft: depth * 12 }}>
        <div className={cn(
          "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        )}>
          {hasChildren ? (
            <button onClick={() => setChildrenOpen((v) => !v)} className="shrink-0">
              {childrenOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          ) : (
            <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          <button className="flex-1 truncate text-left" onClick={() => onSelect(folder.id)}>
            {folder.name}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden group-hover:flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-sidebar-accent hover:text-foreground">
                <MoreHorizontal className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-[#1C1C1C] border-[#2A2A2A]">
              <DropdownMenuItem onClick={() => setRenameOpen(true)} className="text-muted-foreground hover:text-white cursor-pointer">
                <Pencil className="mr-2 h-3.5 w-3.5" />Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteFolder(folder.id)} className="text-destructive hover:text-destructive cursor-pointer">
                <Trash2 className="mr-2 h-3.5 w-3.5" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {hasChildren && childrenOpen && (
          <div className="mt-0.5 flex flex-col gap-0.5">
            {folder.children.map((child) => (
              <FolderItem key={child.id} folder={child} activeFolderId={activeFolderId} onSelect={onSelect} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Sidebar 1
// ---------------------------------------------------------------------------

function Sidebar1({
  activeFolderId, isHome, isTrash, onFolderSelect,
}: { activeFolderId: string | null; isHome: boolean; isTrash: boolean; onFolderSelect: (id: string) => void }) {
  const router = useRouter()
  const [notesOpen, setNotesOpen] = React.useState(true)
  const [newFolderOpen, setNewFolderOpen] = React.useState(false)
  const { user } = useAuthStore()
  const { data: folders, isLoading: foldersLoading } = useFolders()
  const { data: trashNotes } = useNotes({ trash: true })

  const navItem = (label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      )}
    >
      {icon}{label}
    </button>
  )

  return (
    <>
      <NewFolderDialog open={newFolderOpen} onOpenChange={setNewFolderOpen} />
      <aside className="flex h-full w-56 flex-col border-r bg-sidebar">
        <div className="flex items-center gap-2 px-3 py-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <NotebookPen className="h-3.5 w-3.5" />
          </div>
          <span className="flex-1 text-sm font-semibold tracking-tight">Sinapsis</span>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
            <Settings className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Separator />

        <div className="flex flex-col gap-0.5 px-2 py-2">
          {navItem("Home", <Home className="h-4 w-4 shrink-0" />, isHome, () => router.push("/"))}
          {navItem("Search", <Search className="h-4 w-4 shrink-0" />, false, () => {})}
        </div>

        <Separator />

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className={cn("flex flex-col px-2 py-2", notesOpen ? "flex-1 overflow-hidden" : "shrink-0")}>
            <button
              onClick={() => setNotesOpen((v) => !v)}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors"
            >
              {notesOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
              <FileText className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">Notes</span>
              <span
                role="button"
                aria-label="New folder"
                onClick={(e) => { e.stopPropagation(); if (user) setNewFolderOpen(true) }}
                className="flex h-5 w-5 items-center justify-center rounded hover:bg-sidebar-accent"
              >
                <Plus className="h-3 w-3" />
              </span>
            </button>

            {notesOpen && (
              <div className="mt-0.5 flex flex-col gap-0.5 overflow-y-auto pl-2">
                {foldersLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-md" />)
                ) : folders?.length === 0 ? (
                  <button
                    onClick={() => setNewFolderOpen(true)}
                    className="flex items-center gap-2 px-2 py-2 text-[11px] italic text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />New folder
                  </button>
                ) : (
                  folders?.map((folder) => (
                    <FolderItem key={folder.id} folder={folder} activeFolderId={activeFolderId} onSelect={onFolderSelect} depth={0} />
                  ))
                )}
              </div>
            )}
          </div>

          <Separator />
          <TagSection />
        </div>

        <Separator />

        <div className="px-2 py-2">
          <button
            onClick={() => router.push("/trash")}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
              isTrash
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )}
          >
            <Trash2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Trash</span>
            {trashNotes && trashNotes.length > 0 && (
              <span className="text-[10px] text-muted-foreground/50">{trashNotes.length}</span>
            )}
          </button>
        </div>

        <Separator />
        <div className="p-2"><SidebarAuth /></div>
      </aside>
    </>
  )
}

// ---------------------------------------------------------------------------
// Sidebar 2 — Note List
// ---------------------------------------------------------------------------

function NoteListItem({ note, isActive, onClick }: { note: Note; isActive: boolean; onClick: () => void }) {
  const preview = note.content
    ? note.content.replace(/<[^>]+>/g, "").slice(0, 80)
    : ""
  const date = new Date(note.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-md px-3 py-2.5 text-left transition-colors",
        isActive ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-accent"
      )}
    >
      <div className="flex items-start gap-2">
        <FileText className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium leading-snug">{note.title || "Untitled"}</p>
          {preview && <p className="mt-0.5 truncate text-[11px] leading-snug text-muted-foreground">{preview}</p>}
          <p className="mt-1 text-[10px] text-muted-foreground/50">{date}</p>
        </div>
      </div>
    </button>
  )
}

function Sidebar2({
  label, folderId, isTrash, activeNoteId,
}: { label: string; folderId: string | null; isTrash: boolean; activeNoteId: string | null }) {
  const router = useRouter()
  const { data: notes, isLoading } = useNotes(isTrash ? { trash: true } : folderId ? { folderId } : {})
  const { mutate: createNote, isPending: creating } = useCreateNote()

  function handleCreateNote() {
    createNote(
      { title: "Untitled", folder_id: folderId ?? null },
      { onSuccess: (note) => router.push(`/notes/${note.id}`) }
    )
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="flex-1 text-sm font-semibold">{label || "Notes"}</span>
        {!isTrash && (
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={handleCreateNote} disabled={creating}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-1 p-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-md" />)}
          </div>
        ) : notes?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2">
            <FileText className="h-8 w-8 opacity-30" />
            <p className="text-xs">{isTrash ? "Trash is empty" : "No notes yet"}</p>
          </div>
        ) : (
          <div className="space-y-0.5 p-2">
            {notes?.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                isActive={activeNoteId === note.id}
                onClick={() => router.push(isTrash ? `/trash/${note.id}` : `/notes/${note.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <Separator />
      <p className="px-4 py-2 text-[11px] text-muted-foreground">
        {notes?.length ?? 0} {(notes?.length ?? 0) === 1 ? "note" : "notes"}
      </p>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: folders } = useFolders()

  const isHome = pathname === "/"
  const isTrash = pathname.startsWith("/trash")
  const isNote = pathname.startsWith("/notes/")

  const activeNoteId = isNote
    ? pathname.split("/notes/")[1]
    : isTrash
      ? pathname.split("/trash/")[1] ?? null
      : null

  // We'll read activeFolderId from query data instead of mock data
  // The note editor page will pass folder context up via URL in Phase 4
  // For now we derive it from the note detail query cache
  const [activeFolderId, setActiveFolderId] = React.useState<string | null>(null)

  function getFolderName(id: string | null): string {
    if (!id || !folders) return ""
    function findName(list: typeof folders): string {
      for (const f of list ?? []) {
        if (f.id === id) return f.name
        const found = findName(f.children)
        if (found) return found
      }
      return ""
    }
    return findName(folders)
  }

  const sidebar2Label = isTrash ? "Trash" : getFolderName(activeFolderId)

  function handleFolderSelect(folderId: string) {
    setActiveFolderId(folderId)
    router.push(`/notes?folder=${folderId}`)
  }

  const showSidebar2 = isNote || isTrash || pathname.startsWith("/notes")

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar1
        activeFolderId={activeFolderId}
        isHome={isHome}
        isTrash={isTrash}
        onFolderSelect={handleFolderSelect}
      />

      {showSidebar2 && (
        <Sidebar2
          label={sidebar2Label}
          folderId={activeFolderId}
          isTrash={isTrash}
          activeNoteId={activeNoteId}
        />
      )}

      <main className="flex flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
