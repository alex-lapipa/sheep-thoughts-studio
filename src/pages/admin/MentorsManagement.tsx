import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useMentors, useDeleteMentor, useCreateMentor } from "@/hooks/useMentors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, GripVertical, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const COLOR_MAP: Record<string, string> = {
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  rose: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  slate: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  teal: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  orange: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  sage: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export default function MentorsManagement() {
  const { data: mentors, isLoading, error } = useMentors();
  const deleteMentor = useDeleteMentor();
  const createMentor = useCreateMentor();
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newMentorId, setNewMentorId] = useState("");
  const [newMentorName, setNewMentorName] = useState("");

  const handleDelete = () => {
    if (deleteId) {
      deleteMentor.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleCreate = () => {
    if (newMentorId && newMentorName) {
      createMentor.mutate({
        id: newMentorId.toLowerCase().replace(/\s+/g, "-"),
        name: newMentorName,
        display_order: (mentors?.length || 0) + 1,
      });
      setShowCreateDialog(false);
      setNewMentorId("");
      setNewMentorName("");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Mentor Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure the humans who shaped Bubbles' unique worldview
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Mentor
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">Failed to load mentors: {error.message}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mentors?.map((mentor) => (
              <Card
                key={mentor.id}
                className={`relative group transition-all hover:shadow-lg ${
                  !mentor.is_active ? "opacity-60" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{mentor.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{mentor.name}</CardTitle>
                        <Badge
                          variant="secondary"
                          className={COLOR_MAP[mentor.color] || COLOR_MAP.sage}
                        >
                          {mentor.color}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-8 w-8"
                      >
                        <Link to={`/admin/mentors/${mentor.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(mentor.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {mentor.description || "No description yet"}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {mentor.topics?.slice(0, 3).map((topic, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {(mentor.topics?.length || 0) > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{mentor.topics!.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t">
                    <span className="text-xs text-muted-foreground">
                      {mentor.trigger_words?.length || 0} triggers
                    </span>
                    <Link
                      to={`/admin/mentors/${mentor.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      Edit details →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Mentor?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove this mentor from the system. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Create Mentor Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Mentor</DialogTitle>
              <DialogDescription>
                Create a new mentor character who influenced Bubbles' worldview.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="mentor-id">Mentor ID</Label>
                <Input
                  id="mentor-id"
                  placeholder="e.g., johnny"
                  value={newMentorId}
                  onChange={(e) => setNewMentorId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Lowercase identifier used in the system
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mentor-name">Display Name</Label>
                <Input
                  id="mentor-name"
                  placeholder="e.g., Johnny"
                  value={newMentorName}
                  onChange={(e) => setNewMentorName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!newMentorId || !newMentorName}>
                Create Mentor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
