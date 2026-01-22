import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skull, Send, Loader2, Plus, X, Sparkles, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Economics", "Personal", "Technology", "Science", "Culture", "Politics", "Philosophy", "Other"];

const submissionSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(100, "Title must be under 100 characters"),
  question: z.string().trim().min(10, "Question must be at least 10 characters").max(300, "Question must be under 300 characters"),
  challenge: z.string().trim().min(10, "Challenge must be at least 10 characters").max(300, "Challenge must be under 300 characters"),
  nuclearResponse: z.string().trim().min(100, "Nuclear response must be at least 100 characters").max(2000, "Nuclear response must be under 2000 characters"),
  innerThought: z.string().trim().max(200, "Inner thought must be under 200 characters").optional(),
  category: z.string().min(1, "Please select a category"),
  submitterName: z.string().trim().max(100, "Name must be under 100 characters").optional(),
  submitterEmail: z.string().trim().email("Please enter a valid email").max(255, "Email too long").optional().or(z.literal("")),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

export function HallOfFameSubmission() {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      title: "",
      question: "",
      challenge: "",
      nuclearResponse: "",
      innerThought: "",
      category: "",
      submitterName: "",
      submitterEmail: "",
    },
  });

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit = async (data: SubmissionFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("hall_of_fame_submissions").insert({
        title: data.title,
        question: data.question,
        challenge: data.challenge,
        nuclear_response: data.nuclearResponse,
        inner_thought: data.innerThought || null,
        category: data.category,
        tags: tags.length > 0 ? tags : null,
        submitter_name: data.submitterName || null,
        submitter_email: data.submitterEmail || null,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Your nuclear moment has been submitted!");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit. Even Bubbles is confused.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setTags([]);
    setIsSubmitted(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-mode-nuclear to-mode-savage hover:from-mode-savage hover:to-mode-nuclear text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Skull className="mr-2 h-5 w-5" />
          Submit Your Meltdown
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isSubmitted ? (
          <div className="py-12 text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-bold">Meltdown Received!</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your nuclear moment has been submitted for review. If it's chaotic enough, 
                it might just make it to the Hall of Fame.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={resetForm}>
                Submit Another
              </Button>
              <Button onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Skull className="h-6 w-6 text-mode-nuclear" />
                Submit Your Nuclear Moment
              </DialogTitle>
              <DialogDescription>
                Share your own experience triggering Bubbles into nuclear meltdown mode. 
                The best submissions will be featured in the Hall of Fame!
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Meltdown Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., The Great Wool Robbery"
                  {...form.register("title")}
                  className={cn(form.formState.errors.title && "border-destructive")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select onValueChange={(value) => form.setValue("category", value)}>
                  <SelectTrigger className={cn(form.formState.errors.category && "border-destructive")}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
                )}
              </div>

              {/* Question */}
              <div className="space-y-2">
                <Label htmlFor="question">The Innocent Question *</Label>
                <Textarea
                  id="question"
                  placeholder="What seemingly innocent question started this chaos?"
                  rows={2}
                  {...form.register("question")}
                  className={cn(form.formState.errors.question && "border-destructive")}
                />
                {form.formState.errors.question && (
                  <p className="text-sm text-destructive">{form.formState.errors.question.message}</p>
                )}
              </div>

              {/* Challenge */}
              <div className="space-y-2">
                <Label htmlFor="challenge">The Challenge That Broke Bubbles *</Label>
                <Textarea
                  id="challenge"
                  placeholder="What fact or challenge pushed Bubbles over the edge?"
                  rows={2}
                  {...form.register("challenge")}
                  className={cn(form.formState.errors.challenge && "border-destructive")}
                />
                {form.formState.errors.challenge && (
                  <p className="text-sm text-destructive">{form.formState.errors.challenge.message}</p>
                )}
              </div>

              {/* Nuclear Response */}
              <Card className="border-mode-nuclear/30 bg-mode-nuclear/5">
                <CardContent className="pt-4 space-y-2">
                  <Label htmlFor="nuclearResponse" className="flex items-center gap-2">
                    <Skull className="h-4 w-4 text-mode-nuclear" />
                    The Nuclear Meltdown *
                  </Label>
                  <Textarea
                    id="nuclearResponse"
                    placeholder="Unleash the chaos! Write Bubbles' full nuclear response..."
                    rows={6}
                    {...form.register("nuclearResponse")}
                    className={cn(
                      "resize-none",
                      form.formState.errors.nuclearResponse && "border-destructive"
                    )}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{form.formState.errors.nuclearResponse?.message}</span>
                    <span>{form.watch("nuclearResponse")?.length || 0}/2000</span>
                  </div>
                </CardContent>
              </Card>

              {/* Inner Thought */}
              <div className="space-y-2">
                <Label htmlFor="innerThought">Inner Thought (Optional)</Label>
                <Input
                  id="innerThought"
                  placeholder="e.g., They mentioned economics. Suspicious."
                  {...form.register("innerThought")}
                />
                <p className="text-xs text-muted-foreground">
                  The paranoid internal monologue before the explosion
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={30}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Up to 5 tags</p>
              </div>

              {/* Submitter Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="submitterName">Your Name (Optional)</Label>
                  <Input
                    id="submitterName"
                    placeholder="Anonymous Sheep Fan"
                    {...form.register("submitterName")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="submitterEmail">Email (Optional)</Label>
                  <Input
                    id="submitterEmail"
                    type="email"
                    placeholder="for@notifications.baa"
                    {...form.register("submitterEmail")}
                  />
                  {form.formState.errors.submitterEmail && (
                    <p className="text-sm text-destructive">{form.formState.errors.submitterEmail.message}</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                By submitting, you agree that your meltdown may be featured publicly. 
                We reserve the right to edit for clarity (but not for sanity).
              </p>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-mode-nuclear to-mode-savage"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Meltdown
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
