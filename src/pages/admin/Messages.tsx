import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  RefreshCw,
  Inbox,
  Reply,
  Archive,
  AlertTriangle,
  ChevronDown,
  Trash2,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  submitted_at: string;
  responded_at: string | null;
  responded_by: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  is_spam?: boolean;
  spam_score?: number;
  spam_reasons?: string[];
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  new: { label: "New", color: "bg-blue-500/10 text-blue-600 border-blue-500/30", icon: Inbox },
  in_progress: { label: "In Progress", color: "bg-amber-500/10 text-amber-600 border-amber-500/30", icon: Clock },
  responded: { label: "Responded", color: "bg-green-500/10 text-green-600 border-green-500/30", icon: CheckCircle2 },
  archived: { label: "Archived", color: "bg-gray-500/10 text-gray-600 border-gray-500/30", icon: Archive },
  spam: { label: "Spam", color: "bg-red-500/10 text-red-600 border-red-500/30", icon: XCircle },
};

export default function Messages() {
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [notes, setNotes] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionConfirm, setBulkActionConfirm] = useState<{ action: string; status?: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const { data: messages, isLoading, refetch } = useQuery({
    queryKey: ["contact-messages", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("contact_messages")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ContactMessage[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updates: Record<string, unknown> = { status };
      
      if (status === "responded") {
        updates.responded_at = new Date().toISOString();
      }
      
      if (notes !== undefined) {
        updates.notes = notes;
      }

      const { error } = await supabase
        .from("contact_messages")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
      toast.success("Message updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update message", { description: error.message });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const updates: Record<string, unknown> = { status };
      
      if (status === "responded") {
        updates.responded_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("contact_messages")
        .update(updates)
        .in("id", ids);

      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
      setSelectedIds(new Set());
      toast.success(`${count} message${count > 1 ? 's' : ''} updated successfully`);
    },
    onError: (error) => {
      toast.error("Failed to update messages", { description: error.message });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .in("id", ids);

      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
      setSelectedIds(new Set());
      setDeleteConfirm(false);
      setDeleteConfirmText("");
      toast.success(`${count} message${count > 1 ? 's' : ''} permanently deleted`);
    },
    onError: (error) => {
      toast.error("Failed to delete messages", { description: error.message });
    },
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleSaveNotes = () => {
    if (!selectedMessage) return;
    updateStatusMutation.mutate({
      id: selectedMessage.id,
      status: selectedMessage.status,
      notes,
    });
    setSelectedMessage({ ...selectedMessage, notes });
  };

  const handleBulkAction = (action: string, status?: string) => {
    if (selectedIds.size === 0) {
      toast.error("No messages selected");
      return;
    }
    setBulkActionConfirm({ action, status });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) {
      toast.error("No messages selected");
      return;
    }
    setDeleteConfirm(true);
  };

  const executeBulkDelete = () => {
    if (deleteConfirmText !== "DELETE") return;
    bulkDeleteMutation.mutate(Array.from(selectedIds));
  };

  // Export messages to CSV
  const exportToCSV = (messagesToExport: ContactMessage[]) => {
    if (messagesToExport.length === 0) {
      toast.error("No messages to export");
      return;
    }

    const headers = ["Name", "Email", "Subject", "Message", "Status", "Submitted At", "Is Spam", "Spam Score", "Spam Reasons"];
    
    const escapeCSV = (value: string | null | undefined): string => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = messagesToExport.map(msg => [
      escapeCSV(msg.name),
      escapeCSV(msg.email),
      escapeCSV(msg.subject),
      escapeCSV(msg.message),
      escapeCSV(msg.status),
      escapeCSV(msg.submitted_at),
      msg.is_spam ? "Yes" : "No",
      String(msg.spam_score || 0),
      escapeCSV(msg.spam_reasons?.join("; ") || ""),
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `contact-messages-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${messagesToExport.length} message(s)`);
  };

  const handleExportSelected = () => {
    if (!filteredMessages) return;
    const selected = filteredMessages.filter(m => selectedIds.has(m.id));
    exportToCSV(selected);
  };

  const handleExportAll = () => {
    if (!filteredMessages) return;
    exportToCSV(filteredMessages);
  };

  const executeBulkAction = () => {
    if (!bulkActionConfirm) return;
    
    const ids = Array.from(selectedIds);
    const status = bulkActionConfirm.status || bulkActionConfirm.action;
    
    bulkUpdateMutation.mutate({ ids, status });
    setBulkActionConfirm(null);
  };

  const toggleSelectAll = () => {
    if (!filteredMessages) return;
    
    if (selectedIds.size === filteredMessages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMessages.map(m => m.id)));
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

  const filteredMessages = messages?.filter((msg) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      msg.name.toLowerCase().includes(query) ||
      msg.email.toLowerCase().includes(query) ||
      msg.subject?.toLowerCase().includes(query) ||
      msg.message.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: messages?.length || 0,
    new: messages?.filter((m) => m.status === "new").length || 0,
    inProgress: messages?.filter((m) => m.status === "in_progress").length || 0,
    responded: messages?.filter((m) => m.status === "responded").length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Contact Messages</h1>
            <p className="text-muted-foreground">
              Manage and respond to customer inquiries
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportAll}>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Messages</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Inbox className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.new}</p>
                <p className="text-xs text-muted-foreground">New</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.responded}</p>
                <p className="text-xs text-muted-foreground">Responded</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Bulk Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Actions Bar */}
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                  <span className="text-sm font-medium">
                    {selectedIds.size} selected
                  </span>
                  <div className="flex-1" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Bulk Actions
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleBulkAction("archive", "archived")}>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction("spam", "spam")}>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Mark as Spam
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleBulkAction("status", "new")}>
                        <Inbox className="w-4 h-4 mr-2" />
                        Mark as New
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction("status", "in_progress")}>
                        <Clock className="w-4 h-4 mr-2" />
                        Mark In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction("status", "responded")}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark as Responded
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleExportSelected}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Selected as CSV
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleBulkDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Permanently
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportSelected}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Selected
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Messages Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading messages...
              </div>
            ) : filteredMessages?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No messages found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={filteredMessages?.length ? selectedIds.size === filteredMessages.length : false}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages?.map((message) => {
                    const status = statusConfig[message.status] || statusConfig.new;
                    const StatusIcon = status.icon;
                    const isSelected = selectedIds.has(message.id);
                    return (
                      <TableRow key={message.id} className={cn(isSelected && "bg-muted/50")}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("gap-1", status.color)}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </Badge>
                            {message.is_spam && (
                              <Badge variant="destructive" className="gap-1 text-xs">
                                <AlertTriangle className="w-3 h-3" />
                                Auto-flagged
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(message.id)}
                            aria-label={`Select message from ${message.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{message.name}</p>
                            <p className="text-xs text-muted-foreground">{message.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="truncate max-w-[200px]">
                            {message.subject || "No subject"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(message.submitted_at), "MMM d, yyyy")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(message.submitted_at), "h:mm a")}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedMessage(message);
                              setNotes(message.notes || "");
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Message Detail Dialog */}
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Message Details
              </DialogTitle>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-6">
                {/* Message Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">From</p>
                    <p className="font-medium">{selectedMessage.name}</p>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-primary hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Received</p>
                    <p className="font-medium">
                      {format(new Date(selectedMessage.submitted_at), "PPpp")}
                    </p>
                  </div>
                </div>

                {/* Subject */}
                {selectedMessage.subject && (
                  <div>
                    <p className="text-sm text-muted-foreground">Subject</p>
                    <p className="font-medium">{selectedMessage.subject}</p>
                  </div>
                )}

                {/* Message Body */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Message</p>
                  <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Spam Detection Info */}
                {selectedMessage.is_spam && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <p className="font-medium text-destructive">Auto-flagged as Spam</p>
                      <Badge variant="outline" className="ml-auto text-destructive border-destructive/30">
                        Score: {selectedMessage.spam_score || 0}%
                      </Badge>
                    </div>
                    {selectedMessage.spam_reasons && selectedMessage.spam_reasons.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium mb-1">Reasons:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedMessage.spam_reasons.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Change */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">Status</p>
                    <Select
                      value={selectedMessage.status}
                      onValueChange={(value) => {
                        handleStatusChange(selectedMessage.id, value);
                        setSelectedMessage({ ...selectedMessage, status: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="responded">Responded</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                        <SelectItem value="spam">Spam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">&nbsp;</p>
                    <Button
                      variant="outline"
                      onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || "Your inquiry"}`)}
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Reply via Email
                    </Button>
                  </div>
                </div>

                {/* Internal Notes */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Internal Notes</p>
                  <Textarea
                    placeholder="Add internal notes about this message..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={handleSaveNotes}
                    disabled={notes === selectedMessage.notes}
                  >
                    Save Notes
                  </Button>
                </div>

                {/* Response Info */}
                {selectedMessage.responded_at && (
                  <div className="text-sm text-muted-foreground border-t pt-4">
                    <p>
                      Marked as responded on{" "}
                      {format(new Date(selectedMessage.responded_at), "PPpp")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
        {/* Bulk Action Confirmation Dialog */}
        <AlertDialog open={!!bulkActionConfirm} onOpenChange={() => setBulkActionConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
              <AlertDialogDescription>
                {bulkActionConfirm?.status === "spam" 
                  ? `Are you sure you want to mark ${selectedIds.size} message${selectedIds.size > 1 ? 's' : ''} as spam?`
                  : bulkActionConfirm?.status === "archived"
                  ? `Are you sure you want to archive ${selectedIds.size} message${selectedIds.size > 1 ? 's' : ''}?`
                  : `Are you sure you want to change the status of ${selectedIds.size} message${selectedIds.size > 1 ? 's' : ''} to "${bulkActionConfirm?.status}"?`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={executeBulkAction}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Permanent Delete Confirmation Dialog */}
        <AlertDialog open={deleteConfirm} onOpenChange={(open) => {
          setDeleteConfirm(open);
          if (!open) setDeleteConfirmText("");
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Permanent Deletion Warning
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>
                  You are about to <strong>permanently delete {selectedIds.size} message{selectedIds.size > 1 ? 's' : ''}</strong>. 
                  This action cannot be undone.
                </p>
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                  <strong>Warning:</strong> Deleted messages cannot be recovered. Make sure you have exported any important data before proceeding.
                </div>
                <div>
                  <p className="text-sm mb-2">Type <strong>DELETE</strong> to confirm:</p>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="font-mono"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={executeBulkDelete}
                disabled={deleteConfirmText !== "DELETE" || bulkDeleteMutation.isPending}
              >
                {bulkDeleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
