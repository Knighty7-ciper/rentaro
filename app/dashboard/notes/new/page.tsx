import { NoteForm } from "@/components/note-form"

export default function NewNotePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create New Note</h1>
        <p className="text-muted-foreground">Add a new note or reminder</p>
      </div>

      <NoteForm />
    </div>
  )
}
