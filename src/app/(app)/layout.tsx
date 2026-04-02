"use client"

import * as React from "react"
import {
  ChevronDown,
  ChevronRight,
  Clock,
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

// ---------------------------------------------------------------------------
// Types & dummy data
// ---------------------------------------------------------------------------

type Note = {
  id: string
  title: string
  preview: string
  updatedAt: string
  folderId: string
  pinned?: boolean
}

type FolderItem = {
  id: string
  label: string
}

const FOLDERS: FolderItem[] = [
  { id: "work", label: "Work" },
  { id: "meetings", label: "Meetings" },
  { id: "projects", label: "Projects" },
  { id: "personal", label: "Personal" },
  { id: "journal", label: "Journal" },
  { id: "study", label: "Study" },
  { id: "cs", label: "Computer Science" },
]

const NOTES: Note[] = [
  {
    id: "n1",
    folderId: "work",
    title: "Sprint retrospective",
    preview: "What went well: deployment pipeline improved significantly this cycle.",
    updatedAt: "Today, 9:41 AM",
    pinned: true,
  },
  {
    id: "n2",
    folderId: "work",
    title: "API contract v2 draft",
    preview: "POST /api/notes – body: { title, content, folderId }",
    updatedAt: "Today, 8:05 AM",
  },
  {
    id: "n3",
    folderId: "work",
    title: "Onboarding checklist",
    preview: "Set up VPN, configure local env, request repo access.",
    updatedAt: "Yesterday, 3:12 PM",
  },
  {
    id: "n4",
    folderId: "meetings",
    title: "Q2 planning kickoff",
    preview: "Attendees: product, design, engineering leads.",
    updatedAt: "Apr 2, 2026",
    pinned: true,
  },
  {
    id: "n5",
    folderId: "meetings",
    title: "Design review – dashboard",
    preview: "Feedback: chart colours need more contrast.",
    updatedAt: "Mar 31, 2026",
  },
  {
    id: "n6",
    folderId: "projects",
    title: "Sinapsis – feature spec",
    preview: "Users can create nested folders, tag notes, full-text search.",
    updatedAt: "Mar 30, 2026",
    pinned: true,
  },
  {
    id: "n7",
    folderId: "projects",
    title: "Auth service migration plan",
    preview: "Move from session cookies to JWT with refresh token rotation.",
    updatedAt: "Mar 27, 2026",
  },
  {
    id: "n8",
    folderId: "projects",
    title: "CI/CD pipeline notes",
    preview: "GitHub Actions → build → test → deploy to Vercel preview.",
    updatedAt: "Mar 22, 2026",
  },
  {
    id: "n9",
    folderId: "personal",
    title: "Vacation planning – Bali",
    preview: "Flights: mid-July. Hotels in Ubud or Seminyak?",
    updatedAt: "Mar 31, 2026",
  },
  {
    id: "n10",
    folderId: "personal",
    title: "Grocery list",
    preview: "Eggs, oat milk, sourdough, spinach, cherry tomatoes.",
    updatedAt: "Apr 1, 2026",
  },
  {
    id: "n11",
    folderId: "journal",
    title: "March recap",
    preview: "Finished two side projects, read three books, started running.",
    updatedAt: "Mar 31, 2026",
    pinned: true,
  },
  {
    id: "n12",
    folderId: "journal",
    title: "Goals for April",
    preview: "Ship Sinapsis v1, exercise 4× a week, call family more.",
    updatedAt: "Apr 1, 2026",
  },
  {
    id: "n13",
    folderId: "study",
    title: "Next.js App Router – key concepts",
    preview: "Server Components vs Client Components, layouts, streaming.",
    updatedAt: "Mar 29, 2026",
    pinned: true,
  },
  {
    id: "n14",
    folderId: "study",
    title: "TypeScript generics cheatsheet",
    preview: "Conditional types, infer keyword, mapped types.",
    updatedAt: "Mar 22, 2026",
  },
  {
    id: "n15",
    folderId: "cs",
    title: "Database indexing notes",
    preview: "B-Tree vs Hash index, covering index, partial index.",
    updatedAt: "Mar 27, 2026",
    pinned: true,
  },
  {
    id: "n16",
    folderId: "cs",
    title: "CAP theorem explained",
    preview: "Consistency, Availability, Partition tolerance – pick two.",
    updatedAt: "Mar 20, 2026",
  },
]

const TRASH_NOTES: Note[] = [
  {
    id: "t1",
    folderId: "trash",
    title: "Old project ideas",
    preview: "A weather app, a habit tracker, a recipe finder.",
    updatedAt: "Feb 10, 2026",
  },
  {
    id: "t2",
    folderId: "trash",
    title: "Draft – blog post",
    preview: "Never finished this one. Started writing about burnout.",
    updatedAt: "Jan 22, 2026",
  },
]

// ---------------------------------------------------------------------------
// Home view – note cards
// ---------------------------------------------------------------------------

function NoteCard({ note }: { note: Note }) {
  const folder = FOLDERS.find((f) => f.id === note.folderId)
  return (
    <div className="group flex flex-col gap-2 rounded-lg border bg-card p-4 hover:border-border/80 hover:shadow-sm transition-all cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{folder?.label}</span>
        </div>
        {note.pinned && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
      </div>
      <div>
        <p className="text-sm font-semibold leading-snug line-clamp-2">{note.title}</p>
        <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed line-clamp-3">
          {note.preview}
        </p>
      </div>
      <div className="flex items-center gap-1 mt-auto pt-1">
        <Clock className="h-3 w-3 text-muted-foreground/50" />
        <span className="text-[10px] text-muted-foreground/50">{note.updatedAt}</span>
      </div>
    </div>
  )
}

function HomeView() {
  const recent = [...NOTES].slice(0, 6)
  const pinned = NOTES.filter((n) => n.pinned)

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Good morning</h1>
      <p className="text-sm text-muted-foreground mb-8">
        You have {NOTES.length} notes across {FOLDERS.length} folders.
      </p>

      {pinned.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <h2 className="text-sm font-semibold">Pinned</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pinned.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Recent</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sidebar 1 – navigation
// ---------------------------------------------------------------------------

type ActiveView = "home" | "search" | "folder" | "trash"

function Sidebar1({
  activeView,
  activeFolderId,
  onHome,
  onSearch,
  onFolder,
  onTrash,
}: {
  activeView: ActiveView
  activeFolderId: string | null
  onHome: () => void
  onSearch: () => void
  onFolder: (id: string) => void
  onTrash: () => void
}) {
  const [notesOpen, setNotesOpen] = React.useState(true)

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

      {/* Nav items */}
      <div className="flex flex-col gap-0.5 px-2 py-2">
        {navItem(
          "Home",
          <Home className="h-4 w-4 shrink-0" />,
          activeView === "home",
          onHome
        )}
        {navItem(
          "Search",
          <Search className="h-4 w-4 shrink-0" />,
          activeView === "search",
          onSearch
        )}
      </div>

      <Separator />

      {/* Notes expandable section */}
      <div className="flex flex-col px-2 py-2 flex-1 overflow-hidden">
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
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <span>
              <Plus className="h-3 w-3" />
            </span>
          </Button>
        </button>

        {notesOpen && (
          <div className="mt-0.5 flex flex-col gap-0.5 overflow-y-auto pl-2">
            {FOLDERS.map((folder) => {
              const isActive =
                activeView === "folder" && activeFolderId === folder.id
              return (
                <button
                  key={folder.id}
                  onClick={() => onFolder(folder.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-left">{folder.label}</span>
                  <span className="text-[10px] text-muted-foreground/50">
                    {NOTES.filter((n) => n.folderId === folder.id).length}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <Separator />

      {/* Trash */}
      <div className="px-2 py-2">
        <button
          onClick={onTrash}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
            activeView === "trash"
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          )}
        >
          <Trash2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1">Trash</span>
          <span className="text-[10px] text-muted-foreground/50">{TRASH_NOTES.length}</span>
        </button>
      </div>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// Sidebar 2 – note list
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
        isActive
          ? "bg-primary/10 ring-1 ring-primary/20"
          : "hover:bg-accent"
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
  onSelect: (id: string) => void
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
                    onClick={() => onSelect(note.id)}
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
                onClick={() => onSelect(note.id)}
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
  const [activeView, setActiveView] = React.useState<ActiveView>("home")
  const [activeFolderId, setActiveFolderId] = React.useState<string | null>(null)
  const [activeNoteId, setActiveNoteId] = React.useState<string | null>(null)

  function handleFolder(id: string) {
    setActiveView("folder")
    setActiveFolderId(id)
    const first = NOTES.find((n) => n.folderId === id)
    setActiveNoteId(first?.id ?? null)
  }

  function handleTrash() {
    setActiveView("trash")
    setActiveFolderId(null)
    setActiveNoteId(TRASH_NOTES[0]?.id ?? null)
  }

  const showSidebar2 = activeView === "folder" || activeView === "trash"

  const sidebar2Notes =
    activeView === "trash"
      ? TRASH_NOTES
      : NOTES.filter((n) => n.folderId === activeFolderId)

  const sidebar2Label =
    activeView === "trash"
      ? "Trash"
      : FOLDERS.find((f) => f.id === activeFolderId)?.label ?? ""

  const showHomeView = activeView === "home" || activeView === "search"

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar 1 */}
      <Sidebar1
        activeView={activeView}
        activeFolderId={activeFolderId}
        onHome={() => setActiveView("home")}
        onSearch={() => setActiveView("search")}
        onFolder={handleFolder}
        onTrash={handleTrash}
      />

      {/* Sidebar 2 – only for folder / trash views */}
      {showSidebar2 && (
        <Sidebar2
          label={sidebar2Label}
          notes={sidebar2Notes}
          activeNoteId={activeNoteId}
          onSelect={setActiveNoteId}
        />
      )}

      {/* Main area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {showHomeView ? <HomeView /> : children}
      </main>
    </div>
  )
}
