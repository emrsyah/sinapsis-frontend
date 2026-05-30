"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  Home,
  MoreHorizontal,
  NotebookPen,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { FOLDERS, NOTES, TRASH_NOTES, type Note } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { TagSection } from "@/components/tag-section/tag-section"
import { SidebarAuth } from "@/components/ui/sidebar-auth"
import { useAuthStore } from "@/stores/authStore"

// ---------------------------------------------------------------------------
// Sidebar 1
// ---------------------------------------------------------------------------

function Sidebar1({
  activeFolderId,
  isHome,
  isSearch,
  isTrash,
}: {
  activeFolderId: string | null
  isHome: boolean
  isSearch: boolean
  isTrash: boolean
}) {
  const router = useRouter()
  const [notesOpen, setNotesOpen] = React.useState(true)
  const { user } = useAuthStore()

  function goHome() {
    router.push("/")
  }

  function goFolder(folderId: string) {
    const first = NOTES.find((n) => n.folderId === folderId)
    if (first) router.push(`/notes/${first.id}`)
  }

  function goTrash() {
    const first = TRASH_NOTES[0]
    if (first) router.push(`/trash/${first.id}`)
  }

  function handleAddNote(e: React.MouseEvent) {
    e.stopPropagation() // Biar pas diklik, foldernya ga ikut nutup/buka
    if (!user) {
      // Kalau belum login, tendang ke page auth
      router.push("/auth")
    } else {
      console.log("Klik nambah note baru")
    }
  }

  const navItem = (
    label: string,
    icon: React.ReactNode,
    isActive: boolean,
    onClick: () => void
  ) => (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-sidebar">
      {/* App header */}
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

      {/* Top nav */}
      <div className="flex flex-col gap-0.5 px-2 py-2">
        {navItem("Home", <Home className="h-4 w-4 shrink-0" />, isHome, goHome)}
        {navItem("Search", <Search className="h-4 w-4 shrink-0" />, isSearch, () => { })}
      </div>

      <Separator />

      {/* Notes + Tags shared area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Notes expandable */}
        <div className={cn("flex flex-col px-2 py-2", notesOpen ? "flex-1 overflow-hidden" : "shrink-0")}>
          <button
            onClick={() => setNotesOpen((v) => !v)}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors"
          >
            {notesOpen ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            )}
            <FileText className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Notes</span>
            <span
              role="button"
              className="flex h-5 w-5 items-center justify-center rounded hover:bg-sidebar-accent"
              onClick={(e) => e.stopPropagation()}
            >
              <Plus className="h-3 w-3" />
            </span>
          </button>

          {notesOpen && (
            <div className="mt-0.5 flex flex-col gap-0.5 overflow-y-auto pl-2">
              {FOLDERS.map((folder) => {
                const isActive = activeFolderId === folder.id
                const count = NOTES.filter((n) => n.folderId === folder.id).length
                return (
                  <button
                    key={folder.id}
                    onClick={() => goFolder(folder.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate text-left">{folder.label}</span>
                    <span className="text-[10px] text-muted-foreground/50">{count}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <Separator />

        {/* Tags */}
        <TagSection />
      </div>

      <Separator />

      {/* Trash */}
      <div className="px-2 py-2">
        <button
          onClick={goTrash}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
            isTrash
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          )}
        >
          <Trash2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1">Trash</span>
          <span className="text-[10px] text-muted-foreground/50">{TRASH_NOTES.length}</span>
        </button>
      </div>
      <Separator />
      
      <div className="p-2">
        <SidebarAuth />
      </div>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// Sidebar 2
// ---------------------------------------------------------------------------

function NoteItem({
  note,
  isActive,
  onClick,
}: {
  note: Note
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-md px-3 py-2.5 text-left transition-colors",
        isActive ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-accent"
      )}
    >
      <div className="flex items-start gap-2">
        <FileText
          className={cn(
            "mt-0.5 h-3.5 w-3.5 shrink-0",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium leading-snug">{note.title}</p>
          <p className="mt-0.5 truncate text-[11px] leading-snug text-muted-foreground">
            {note.preview}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground/50">{note.updatedAt}</p>
        </div>
      </div>
    </button>
  )
}

function Sidebar2({
  label,
  notes,
  activeNoteId,
  onSelect,
}: {
  label: string
  notes: Note[]
  activeNoteId: string | null
  onSelect: (note: Note) => void
}) {
  const pinned = notes.filter((n) => n.pinned)
  const rest = notes.filter((n) => !n.pinned)

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="flex-1 text-sm font-semibold">{label}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-muted-foreground">
            No notes here
          </p>
        ) : (
          <div className="space-y-0.5 p-2">
            {pinned.length > 0 && (
              <>
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Pinned
                </p>
                {pinned.map((note) => (
                  <NoteItem
                    key={note.id}
                    note={note}
                    isActive={activeNoteId === note.id}
                    onClick={() => onSelect(note)}
                  />
                ))}
                {rest.length > 0 && (
                  <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Notes
                  </p>
                )}
              </>
            )}
            {rest.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                isActive={activeNoteId === note.id}
                onClick={() => onSelect(note)}
              />
            ))}
          </div>
        )}
      </div>

      <Separator />
      <p className="px-4 py-2 text-[11px] text-muted-foreground">
        {notes.length} {notes.length === 1 ? "note" : "notes"}
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

  // Derive active state from URL
  const isHome = pathname === "/"
  const isTrash = pathname.startsWith("/trash/")
  const isNote = pathname.startsWith("/notes/")

  const activeNoteId = isNote
    ? pathname.split("/notes/")[1]
    : isTrash
      ? pathname.split("/trash/")[1]
      : null

  const activeNote = isNote
    ? NOTES.find((n) => n.id === activeNoteId) ?? null
    : null

  const activeFolderId = activeNote?.folderId ?? null

  // Sidebar 2 data
  const sidebar2Notes = isTrash
    ? TRASH_NOTES
    : activeFolderId
      ? NOTES.filter((n) => n.folderId === activeFolderId)
      : []

  const sidebar2Label = isTrash
    ? "Trash"
    : FOLDERS.find((f) => f.id === activeFolderId)?.label ?? ""

  function handleNoteSelect(note: Note) {
    const route = isTrash ? `/trash/${note.id}` : `/notes/${note.id}`
    router.push(route)
  }

  const showSidebar2 = isNote || isTrash

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar1
        activeFolderId={activeFolderId}
        isHome={isHome}
        isSearch={false}
        isTrash={isTrash}
      />

      {showSidebar2 && (
        <Sidebar2
          label={sidebar2Label}
          notes={sidebar2Notes}
          activeNoteId={activeNoteId}
          onSelect={handleNoteSelect}
        />
      )}

      <main className="flex flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
