import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Plus, X, User, Tag, Sparkles } from "lucide-react";

interface MentorMetadata {
  mentor_name?: string;
  wisdom_domain?: string;
  trigger_topics?: string[];
  [key: string]: string | string[] | undefined;
}

interface MentorEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  metadata: MentorMetadata;
}
export default function MentorTriggerEditor() {
  const queryClient = useQueryClient();
  const [selectedMentor, setSelectedMentor] = useState<MentorEntry | null>(null);
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [triggerTopics, setTriggerTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState("");

  // Fetch mentor entries from knowledge base
  const { data: mentors, isLoading } = useQuery({
    queryKey: ["mentor-knowledge"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bubbles_knowledge")
        .select("*")
        .ilike("title", "%Mentor:%")
        .order("title");

      if (error) throw error;
      return data as MentorEntry[];
    },
  });

  // Update mentor mutation
  const updateMentor = useMutation({
    mutationFn: async (mentor: MentorEntry) => {
      const { error } = await supabase
        .from("bubbles_knowledge")
        .update({
          tags: mentor.tags,
          metadata: mentor.metadata as Json,
          updated_at: new Date().toISOString(),
        })
        .eq("id", mentor.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-knowledge"] });
      toast.success("Mentor triggers updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  // Load selected mentor data into edit state
  useEffect(() => {
    if (selectedMentor) {
      setEditedTags(selectedMentor.tags || []);
      setTriggerTopics(selectedMentor.metadata?.trigger_topics || []);
    }
  }, [selectedMentor]);

  const handleAddTag = () => {
    if (newTag.trim() && !editedTags.includes(newTag.trim().toLowerCase())) {
      setEditedTags([...editedTags, newTag.trim().toLowerCase()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEditedTags(editedTags.filter((t) => t !== tag));
  };

  const handleAddTopic = () => {
    if (newTopic.trim() && !triggerTopics.includes(newTopic.trim().toLowerCase())) {
      setTriggerTopics([...triggerTopics, newTopic.trim().toLowerCase()]);
      setNewTopic("");
    }
  };

  const handleRemoveTopic = (topic: string) => {
    setTriggerTopics(triggerTopics.filter((t) => t !== topic));
  };

  const handleSave = () => {
    if (!selectedMentor) return;

    updateMentor.mutate({
      ...selectedMentor,
      tags: editedTags,
      metadata: {
        ...selectedMentor.metadata,
        trigger_topics: triggerTopics,
      },
    });
  };

  const getMentorEmoji = (name: string) => {
    const emojiMap: Record<string, string> = {
      anthony: "🍺",
      jimmy: "📋",
      peggy: "🥧",
      carmel: "⏰",
      seamus: "✈️",
      aidan: "🐕",
      alex: "🇪🇸",
    };
    return emojiMap[name.toLowerCase()] || "🐑";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentor Trigger Editor</h1>
          <p className="text-muted-foreground">
            Edit trigger words and topics for each mentor persona
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Mentor List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Mentors
              </CardTitle>
              <CardDescription>Select a mentor to edit their triggers</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {mentors?.map((mentor) => {
                    const mentorName = mentor.metadata?.mentor_name || 
                      mentor.title.replace("Mentor: ", "").split(" - ")[0];
                    return (
                      <button
                        key={mentor.id}
                        onClick={() => setSelectedMentor(mentor)}
                        className={`w-full p-3 rounded-lg border text-left transition-colors ${
                          selectedMentor?.id === mentor.id
                            ? "bg-accent border-accent-foreground/20"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getMentorEmoji(mentorName)}</span>
                          <div>
                            <p className="font-medium">{mentorName}</p>
                            <p className="text-xs text-muted-foreground">
                              {mentor.metadata?.wisdom_domain || "General wisdom"}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {mentors?.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No mentor entries found
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Editor Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {selectedMentor
                  ? `Editing: ${selectedMentor.metadata?.mentor_name || "Mentor"}`
                  : "Select a Mentor"}
              </CardTitle>
              <CardDescription>
                {selectedMentor
                  ? "Modify tags and trigger topics for this mentor"
                  : "Choose a mentor from the list to edit their trigger configuration"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedMentor ? (
                <div className="space-y-6">
                  {/* Tags Section */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Search Tags
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Tags used for semantic search and categorization
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {editedTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add new tag..."
                        onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                      />
                      <Button onClick={handleAddTag} size="icon" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Trigger Topics Section */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Trigger Topics
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Topics that activate this mentor's wisdom during conversations
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {triggerTopics.map((topic) => (
                        <Badge key={topic} variant="default" className="gap-1">
                          {topic}
                          <button
                            onClick={() => handleRemoveTopic(topic)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {triggerTopics.length === 0 && (
                        <span className="text-sm text-muted-foreground italic">
                          No trigger topics defined
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        placeholder="Add trigger topic..."
                        onKeyDown={(e) => e.key === "Enter" && handleAddTopic()}
                      />
                      <Button onClick={handleAddTopic} size="icon" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="space-y-2">
                    <Label>Content Preview</Label>
                    <Textarea
                      value={selectedMentor.content.slice(0, 500) + "..."}
                      readOnly
                      className="h-32 text-sm font-mono"
                    />
                  </div>

                  {/* Save Button */}
                  <Button
                    onClick={handleSave}
                    disabled={updateMentor.isPending}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateMentor.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Select a mentor to edit their trigger configuration</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
