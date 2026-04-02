import { redirect } from "next/navigation"
import { NOTES } from "@/lib/data"

export default function NotePage() {
  const first = NOTES[0]
  redirect(`/note/${first.id}`)
}
