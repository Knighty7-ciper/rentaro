import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, StickyNote, Pin, MapPin } from "lucide-react"
import Link from "next/link"

export default async function NotesPage() {
  const supabase = createClient()

  // Get all notes with property and tenant information
  const { data: notes, error } = await supabase
    .from("notes")
    .select(`
      *,
      properties (name, address),
      tenants (first_name, last_name)
    `)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching notes:", error)
  }

  const pinnedNotes = notes?.filter((note) => note.is_pinned) || []
  const regularNotes = notes?.filter((note) => !note.is_pinned) || []

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "important":
        return "bg-destructive text-destructive-foreground"
      case "reminder":
        return "bg-secondary text-secondary-foreground"
      case "general":
        return "bg-primary text-primary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const NoteCard = ({ note }: { note: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {note.is_pinned && <Pin className="h-4 w-4 text-secondary" />}
              {note.title || "Untitled Note"}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {note.properties && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {note.properties.name}
                </div>
              )}
              {note.tenants && (
                <div>
                  {note.tenants.first_name} {note.tenants.last_name}
                </div>
              )}
              <div>{formatDate(note.created_at)}</div>
            </div>
          </div>
          <Badge className={getCategoryColor(note.category || "general")}>{note.category || "general"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{note.content}</p>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            View Full Note
          </Button>
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notes</h1>
          <p className="text-muted-foreground">Keep track of important information and reminders</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/dashboard/notes/new">
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Link>
        </Button>
      </div>

      {/* Notes Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Notes</CardTitle>
            <StickyNote className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{notes?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pinned Notes</CardTitle>
            <Pin className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{pinnedNotes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Notes</CardTitle>
            <StickyNote className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {notes?.filter((note) => {
                const noteDate = new Date(note.created_at)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return noteDate > weekAgo
              }).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Pin className="h-5 w-5 text-secondary" />
            <h2 className="text-xl font-semibold text-foreground">Pinned Notes</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pinnedNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </div>
      )}

      {/* Regular Notes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">All Notes</h2>
        {regularNotes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regularNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <StickyNote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No notes created yet</p>
              <Button asChild>
                <Link href="/dashboard/notes/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Note
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
