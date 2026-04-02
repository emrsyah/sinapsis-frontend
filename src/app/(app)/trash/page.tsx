import { redirect } from "next/navigation"
import { TRASH_NOTES } from "@/lib/data"

export default function TrashPage() {
  const first = TRASH_NOTES[0]
  redirect(`/trash/${first.id}`)
}
