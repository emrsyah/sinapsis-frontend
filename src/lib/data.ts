export type Note = {
  id: string
  title: string
  preview: string
  updatedAt: string
  folderId: string
  pinned?: boolean
}

export type FolderItem = {
  id: string
  label: string
}

export const FOLDERS: FolderItem[] = [
  { id: "work", label: "Work" },
  { id: "meetings", label: "Meetings" },
  { id: "projects", label: "Projects" },
  { id: "personal", label: "Personal" },
  { id: "journal", label: "Journal" },
  { id: "study", label: "Study" },
  { id: "cs", label: "Computer Science" },
]

export const NOTES: Note[] = [
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

export const TRASH_NOTES: Note[] = [
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
