import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useMentor, useUpdateMentor } from "@/hooks/useMentors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, User } from "lucide-react";
import { VoiceTextarea, VoiceInputField, VoiceTagInput } from "@/components/admin/VoiceInput";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ICON_OPTIONS = ["🎩", "👵", "⏰", "🎖️", "🎸", "🌍", "🇪🇸", "👨", "👩", "🧑", "👴", "🐕", "☕", "📚", "🎨"];
const COLOR_OPTIONS = ["amber", "rose", "slate", "blue", "purple", "teal", "orange", "sage", "green", "red", "pink"];

export default function MentorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: mentor, isLoading, error } = useMentor(id || "");
  const updateMentor = useUpdateMentor();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    bubbles_interpretation: "",
    topics: [] as string[],
    trigger_words: [] as string[],
    sample_questions: [] as string[],
    wisdom_style: "",
    background_story: "",
    relationship_to_bubbles: "",
    icon: "🧑",
    color: "sage",
    is_active: true,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (mentor) {
      setFormData({
        name: mentor.name || "",
        description: mentor.description || "",
        bubbles_interpretation: mentor.bubbles_interpretation || "",
        topics: mentor.topics || [],
        trigger_words: mentor.trigger_words || [],
        sample_questions: mentor.sample_questions || [],
        wisdom_style: mentor.wisdom_style || "",
        background_story: mentor.background_story || "",
        relationship_to_bubbles: mentor.relationship_to_bubbles || "",
        icon: mentor.icon || "🧑",
        color: mentor.color || "sage",
        is_active: mentor.is_active ?? true,
      });
      setHasChanges(false);
    }
  }, [mentor]);

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!id) return;
    updateMentor.mutate(
      { id, updates: formData },
      {
        onSuccess: () => setHasChanges(false),
      }
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !mentor) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => navigate("/admin/mentors")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Mentors
          </Button>
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">
                {error ? `Failed to load mentor: ${error.message}` : "Mentor not found"}
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/admin/mentors")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{formData.icon}</span>
              <div>
                <h1 className="text-2xl font-display font-bold">{formData.name}</h1>
                <p className="text-sm text-muted-foreground">Mentor ID: {id}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => updateField("is_active", checked)}
              />
              <Label>Active</Label>
            </div>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateMentor.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateMentor.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core identity and display settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <VoiceInputField
                label="Display Name"
                value={formData.name}
                onChange={(v) => updateField("name", v)}
                placeholder="Enter mentor name"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(v) => updateField("icon", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          <span className="text-xl">{icon}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Color Theme</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(v) => updateField("color", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <VoiceTextarea
                label="Description"
                value={formData.description}
                onChange={(v) => updateField("description", v)}
                placeholder="Brief description of this mentor"
                rows={3}
              />

              <VoiceTextarea
                label="Background Story"
                value={formData.background_story}
                onChange={(v) => updateField("background_story", v)}
                placeholder="The mentor's history and how they came into Bubbles' life"
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Bubbles Interpretation */}
          <Card>
            <CardHeader>
              <CardTitle>Bubbles' View</CardTitle>
              <CardDescription>How Bubbles perceives and interprets this mentor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <VoiceTextarea
                label="Bubbles' Interpretation"
                value={formData.bubbles_interpretation}
                onChange={(v) => updateField("bubbles_interpretation", v)}
                placeholder="How Bubbles (incorrectly) understands this mentor's wisdom"
                rows={4}
              />

              <VoiceTextarea
                label="Relationship to Bubbles"
                value={formData.relationship_to_bubbles}
                onChange={(v) => updateField("relationship_to_bubbles", v)}
                placeholder="The nature of their connection and influence"
                rows={3}
              />

              <VoiceTextarea
                label="Wisdom Style"
                value={formData.wisdom_style}
                onChange={(v) => updateField("wisdom_style", v)}
                placeholder="How this mentor delivers their wisdom (e.g., 'Pipe-smoke philosophy with trailing sentences')"
                rows={2}
              />
            </CardContent>
          </Card>

          {/* Topics & Triggers */}
          <Card>
            <CardHeader>
              <CardTitle>Topics & Triggers</CardTitle>
              <CardDescription>What subjects and words activate this mentor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <VoiceTagInput
                label="Topics"
                value={formData.topics}
                onChange={(v) => updateField("topics", v)}
                placeholder="Add topics this mentor covers"
              />

              <VoiceTagInput
                label="Trigger Words"
                value={formData.trigger_words}
                onChange={(v) => updateField("trigger_words", v)}
                placeholder="Words that activate this mentor's wisdom"
              />
            </CardContent>
          </Card>

          {/* Sample Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Sample Questions</CardTitle>
              <CardDescription>Example questions users can ask to channel this mentor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <VoiceTagInput
                label="Sample Questions"
                value={formData.sample_questions}
                onChange={(v) => updateField("sample_questions", v)}
                placeholder="Add sample questions"
              />
              <p className="text-xs text-muted-foreground">
                These questions will appear as suggestions when users want to channel this mentor.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
