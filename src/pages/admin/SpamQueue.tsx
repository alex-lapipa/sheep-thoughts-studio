import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Shield,
  ShieldCheck,
  ShieldX,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Mail,
  MessageSquare,
  Clock,
  Ban,
  Brain,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trainSpamFilter, getSpamFilterStats } from "@/lib/spamFilter";

interface FlaggedItem {
  id: string;
  type: "contact" | "question";
  name?: string;
  email?: string;
  subject?: string;
  content: string;
  spam_score: number;
  spam_reasons: string[];
  is_spam: boolean;
  status: string;
  submitted_at: string;
}

export default function SpamQueue() {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<FlaggedItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"pending" | "spam" | "cleared">("pending");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [filterStats, setFilterStats] = useState<{
    totalPatterns: number;
    activePatterns: number;
    learnedPatterns: number;
    trainingDecisions: number;
    avgAccuracy: number;
  } | null>(null);

  // Fetch filter stats
  useEffect(() => {
    getSpamFilterStats().then(setFilterStats);
  }, []);

  // Fetch flagged contact messages
  const { data: contactMessages, isLoading: loadingContacts, refetch: refetchContacts } = useQuery({
    queryKey: ["spam-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .or("is_spam.eq.true,spam_score.gt.0.3")
        .order("submitted_at", { ascending: false });
      
      if (error) throw error;
      return (data || []).map(item => ({
        id: item.id,
        type: "contact" as const,
        name: item.name,
        email: item.email,
        subject: item.subject,
        content: item.message,
        spam_score: item.spam_score || 0,
        spam_reasons: item.spam_reasons || [],
        is_spam: item.is_spam || false,
        status: item.status,
        submitted_at: item.submitted_at,
      }));
    },
  });

  // Fetch flagged questions
  const { data: questions, isLoading: loadingQuestions, refetch: refetchQuestions } = useQuery({
    queryKey: ["spam-questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submitted_questions")
        .select("*")
        .or("is_spam.eq.true,spam_score.gt.0.3")
        .order("submitted_at", { ascending: false });
      
      if (error) throw error;
      return (data || []).map(item => ({
        id: item.id,
        type: "question" as const,
        content: item.question,
        spam_score: item.spam_score || 0,
        spam_reasons: item.spam_reasons || [],
        is_spam: item.is_spam || false,
        status: item.status,
        submitted_at: item.submitted_at,
      }));
    },
  });

  const refetchAll = () => {
    refetchContacts();
    refetchQuestions();
  };

  // Combine all flagged items
  const allItems: FlaggedItem[] = [
    ...(contactMessages || []),
    ...(questions || []),
  ].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

  // Filter by tab
  const filteredItems = allItems.filter(item => {
    if (activeTab === "pending") {
      return item.spam_score > 0.3 && !item.is_spam && item.status !== "spam";
    }
    if (activeTab === "spam") {
      return item.is_spam || item.status === "spam";
    }
    if (activeTab === "cleared") {
      return item.spam_score > 0 && item.spam_score <= 0.3 && !item.is_spam;
    }
    return true;
  });

  // Stats
  const stats = {
    pending: allItems.filter(i => i.spam_score > 0.3 && !i.is_spam && i.status !== "spam").length,
    spam: allItems.filter(i => i.is_spam || i.status === "spam").length,
    cleared: allItems.filter(i => i.spam_score > 0 && i.spam_score <= 0.3 && !i.is_spam).length,
    highRisk: allItems.filter(i => i.spam_score >= 0.7).length,
  };

  // Mark as spam mutation with learning
  const markAsSpamMutation = useMutation({
    mutationFn: async ({ items, markAsSpam }: { items: FlaggedItem[]; markAsSpam: boolean }) => {
      const contacts = items.filter(i => i.type === "contact");
      const questionsToUpdate = items.filter(i => i.type === "question");

      // Train the spam filter with each decision
      for (const item of items) {
        await trainSpamFilter({
          sourceTable: item.type === "contact" ? "contact_messages" : "submitted_questions",
          sourceId: item.id,
          decision: markAsSpam ? "spam" : "not_spam",
          originalScore: item.spam_score,
          content: {
            name: item.name,
            email: item.email,
            subject: item.subject,
            message: item.content,
          },
        });
      }

      if (contacts.length > 0) {
        const { error } = await supabase
          .from("contact_messages")
          .update({ 
            is_spam: markAsSpam, 
            status: markAsSpam ? "spam" : "new" 
          })
          .in("id", contacts.map(c => c.id));
        if (error) throw error;
      }

      if (questionsToUpdate.length > 0) {
        const { error } = await supabase
          .from("submitted_questions")
          .update({ 
            is_spam: markAsSpam,
            status: markAsSpam ? "spam" : "pending"
          })
          .in("id", questionsToUpdate.map(q => q.id));
        if (error) throw error;
      }

      return items.length;
    },
    onSuccess: (count, { markAsSpam }) => {
      queryClient.invalidateQueries({ queryKey: ["spam-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["spam-questions"] });
      setSelectedIds(new Set());
      // Refresh filter stats
      getSpamFilterStats().then(setFilterStats);
      toast.success(
        markAsSpam 
          ? `${count} item(s) marked as spam — filter learning from decision` 
          : `${count} item(s) marked as legitimate — filter adjusted`
      );
    },
    onError: (error) => {
      toast.error("Failed to update items", { description: error.message });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (items: FlaggedItem[]) => {
      const contacts = items.filter(i => i.type === "contact");
      const questionsToDelete = items.filter(i => i.type === "question");

      if (contacts.length > 0) {
        const { error } = await supabase
          .from("contact_messages")
          .delete()
          .in("id", contacts.map(c => c.id));
        if (error) throw error;
      }

      if (questionsToDelete.length > 0) {
        const { error } = await supabase
          .from("submitted_questions")
          .delete()
          .in("id", questionsToDelete.map(q => q.id));
        if (error) throw error;
      }

      return items.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["spam-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["spam-questions"] });
      setSelectedIds(new Set());
      setDeleteConfirm(false);
      toast.success(`${count} item(s) permanently deleted`);
    },
    onError: (error) => {
      toast.error("Failed to delete items", { description: error.message });
    },
  });

  const handleMarkSpam = (markAsSpam: boolean) => {
    const items = filteredItems.filter(i => selectedIds.has(i.id));
    if (items.length === 0) {
      toast.error("No items selected");
      return;
    }
    markAsSpamMutation.mutate({ items, markAsSpam });
  };

  const handleDelete = () => {
    const items = filteredItems.filter(i => selectedIds.has(i.id));
    if (items.length === 0) {
      toast.error("No items selected");
      return;
    }
    deleteMutation.mutate(items);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const getSpamScoreColor = (score: number) => {
    if (score >= 0.7) return "text-destructive bg-destructive/10 border-destructive/30";
    if (score >= 0.4) return "text-amber-600 bg-amber-500/10 border-amber-500/30";
    return "text-green-600 bg-green-500/10 border-green-500/30";
  };

  const getSpamScoreLabel = (score: number) => {
    if (score >= 0.7) return "High Risk";
    if (score >= 0.4) return "Medium Risk";
    return "Low Risk";
  };

  const isLoading = loadingContacts || loadingQuestions;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Spam Queue
            </h1>
            <p className="text-muted-foreground">
              Review and process flagged messages and questions
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refetchAll} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <ShieldX className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.spam}</p>
                <p className="text-xs text-muted-foreground">Confirmed Spam</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.cleared}</p>
                <p className="text-xs text-muted-foreground">Cleared</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.highRisk}</p>
                <p className="text-xs text-muted-foreground">High Risk</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{filterStats?.learnedPatterns || 0}</p>
                  {filterStats && filterStats.trainingDecisions > 0 && (
                    <Badge variant="secondary" className="text-[10px] gap-0.5">
                      <Sparkles className="w-3 h-3" />
                      Learning
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Patterns Learned
                  {filterStats && filterStats.avgAccuracy > 0 && (
                    <span className="ml-1 text-primary">({filterStats.avgAccuracy}% accuracy)</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs & Content */}
        <Card>
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as typeof activeTab); setSelectedIds(new Set()); }}>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="pending" className="gap-2">
                    <Clock className="w-4 h-4" />
                    Pending
                    {stats.pending > 0 && (
                      <Badge variant="secondary" className="ml-1">{stats.pending}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="spam" className="gap-2">
                    <Ban className="w-4 h-4" />
                    Spam
                    {stats.spam > 0 && (
                      <Badge variant="destructive" className="ml-1">{stats.spam}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="cleared" className="gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Cleared
                  </TabsTrigger>
                </TabsList>

                {/* Bulk Actions */}
                {selectedIds.size > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedIds.size} selected
                    </span>
                    {activeTab !== "spam" && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleMarkSpam(true)}
                      >
                        <ShieldX className="w-4 h-4 mr-2" />
                        Mark Spam
                      </Button>
                    )}
                    {activeTab !== "cleared" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleMarkSpam(false)}
                      >
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Not Spam
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteConfirm(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No items in this queue</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
                              onCheckedChange={toggleSelectAll}
                            />
                          </TableHead>
                          <TableHead className="w-20">Type</TableHead>
                          <TableHead>Content Preview</TableHead>
                          <TableHead className="w-32">Spam Score</TableHead>
                          <TableHead className="w-40">Reasons</TableHead>
                          <TableHead className="w-32">Submitted</TableHead>
                          <TableHead className="w-16"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map((item) => (
                          <TableRow key={item.id} className={cn(selectedIds.has(item.id) && "bg-muted/50")}>
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.has(item.id)}
                                onCheckedChange={() => toggleSelect(item.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="gap-1">
                                {item.type === "contact" ? (
                                  <>
                                    <Mail className="w-3 h-3" />
                                    Contact
                                  </>
                                ) : (
                                  <>
                                    <MessageSquare className="w-3 h-3" />
                                    Question
                                  </>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-md">
                              <div className="space-y-1">
                                {item.email && (
                                  <p className="text-xs text-muted-foreground">{item.email}</p>
                                )}
                                <p className="text-sm truncate">{item.content}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge className={cn("text-xs", getSpamScoreColor(item.spam_score))}>
                                  {getSpamScoreLabel(item.spam_score)}
                                </Badge>
                                <Progress 
                                  value={item.spam_score * 100} 
                                  className="h-1.5"
                                />
                                <span className="text-xs text-muted-foreground">
                                  {(item.spam_score * 100).toFixed(0)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {item.spam_reasons.slice(0, 2).map((reason, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {reason}
                                  </Badge>
                                ))}
                                {item.spam_reasons.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{item.spam_reasons.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(item.submitted_at), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedItem(item)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem?.type === "contact" ? (
                <Mail className="w-5 h-5" />
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
              {selectedItem?.type === "contact" ? "Contact Message" : "Submitted Question"}
            </DialogTitle>
            <DialogDescription>
              Submitted {selectedItem && format(new Date(selectedItem.submitted_at), "PPpp")}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              {/* Spam Score */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Spam Score</span>
                    <Badge className={cn(getSpamScoreColor(selectedItem.spam_score))}>
                      {getSpamScoreLabel(selectedItem.spam_score)}
                    </Badge>
                  </div>
                  <Progress value={selectedItem.spam_score * 100} className="h-2" />
                  <span className="text-xs text-muted-foreground">
                    {(selectedItem.spam_score * 100).toFixed(1)}% confidence
                  </span>
                </div>
              </div>

              {/* Spam Reasons */}
              {selectedItem.spam_reasons.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Detection Reasons</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.spam_reasons.map((reason, i) => (
                      <Badge key={i} variant="outline" className="gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {selectedItem.type === "contact" && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border">
                  <div>
                    <span className="text-xs text-muted-foreground">Name</span>
                    <p className="font-medium">{selectedItem.name || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Email</span>
                    <p className="font-medium">{selectedItem.email || "—"}</p>
                  </div>
                  {selectedItem.subject && (
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground">Subject</span>
                      <p className="font-medium">{selectedItem.subject}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div>
                <h4 className="text-sm font-medium mb-2">
                  {selectedItem.type === "contact" ? "Message" : "Question"}
                </h4>
                <div className="p-4 rounded-lg bg-secondary/50 text-sm whitespace-pre-wrap">
                  {selectedItem.content}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    markAsSpamMutation.mutate({ items: [selectedItem], markAsSpam: false });
                    setSelectedItem(null);
                  }}
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Not Spam
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    markAsSpamMutation.mutate({ items: [selectedItem], markAsSpam: true });
                    setSelectedItem(null);
                  }}
                >
                  <ShieldX className="w-4 h-4 mr-2" />
                  Confirm Spam
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} item(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. These items will be permanently removed from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
